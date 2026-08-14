-- North local-first cloud schema.
-- Social identity + leaderboard aggregates only.
-- Does NOT store tasks, goals, history, notes, or other private productivity data.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Utilities
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_friend_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  suffix text := '';
  i integer;
  code text;
  done boolean := false;
BEGIN
  WHILE NOT done LOOP
    suffix := '';
    FOR i IN 1..6 LOOP
      suffix := suffix || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    code := 'N-' || suffix;
    done := NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE friend_code = code
    );
  END LOOP;
  RETURN code;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text NOT NULL,
  email text,
  avatar_url text,
  friend_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_email_idx ON public.profiles (email);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.protect_profile_identity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.friend_code IS DISTINCT FROM OLD.friend_code THEN
    RAISE EXCEPTION 'Cannot change profile id or friend_code';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_protect_identity
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_identity();

-- ---------------------------------------------------------------------------
-- friendships (two rows per accepted pair: A→B and B→A)
-- ---------------------------------------------------------------------------
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, friend_id),
  CHECK (user_id <> friend_id)
);

CREATE INDEX friendships_user_id_idx ON public.friendships (user_id);
CREATE INDEX friendships_friend_id_idx ON public.friendships (friend_id);

-- ---------------------------------------------------------------------------
-- daily_progress (self-reported aggregates for the friends leaderboard)
-- ---------------------------------------------------------------------------
CREATE TABLE public.daily_progress (
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  progress_date date NOT NULL,
  completed integer NOT NULL DEFAULT 0 CHECK (completed >= 0),
  total integer NOT NULL DEFAULT 0 CHECK (total >= 0),
  rate numeric(5, 4) NOT NULL DEFAULT 0 CHECK (rate >= 0 AND rate <= 1),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, progress_date)
);

CREATE INDEX daily_progress_date_idx ON public.daily_progress (progress_date);

CREATE TRIGGER daily_progress_set_updated_at
  BEFORE UPDATE ON public.daily_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth trigger: profile + friend code on signup
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, avatar_url, friend_code)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(COALESCE(NEW.email, 'user'), '@', 1),
      'User'
    ),
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture'
    ),
    public.generate_friend_code()
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_profile_by_friend_code(lookup_code text)
RETURNS TABLE (
  id uuid,
  display_name text,
  friend_code text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.friend_code, p.avatar_url
  FROM public.profiles p
  WHERE p.friend_code = upper(trim(lookup_code))
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.add_friend_by_code(lookup_code text)
RETURNS TABLE (
  id uuid,
  display_name text,
  friend_code text,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
  friend public.profiles%ROWTYPE;
BEGIN
  IF me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO friend
  FROM public.profiles p
  WHERE p.friend_code = upper(trim(lookup_code))
  LIMIT 1;

  IF friend.id IS NULL THEN
    RAISE EXCEPTION 'No user found with that ID';
  END IF;

  IF friend.id = me THEN
    RAISE EXCEPTION 'You cannot add yourself';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.user_id = me AND f.friend_id = friend.id
  ) THEN
    RAISE EXCEPTION 'Already friends';
  END IF;

  INSERT INTO public.friendships (user_id, friend_id) VALUES (me, friend.id);
  INSERT INTO public.friendships (user_id, friend_id) VALUES (friend.id, me);

  RETURN QUERY
  SELECT friend.id, friend.display_name, friend.friend_code, friend.avatar_url;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_friend(target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
BEGIN
  IF me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF target_id = me THEN
    RAISE EXCEPTION 'Invalid friend';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE (f.user_id = me AND f.friend_id = target_id)
       OR (f.user_id = target_id AND f.friend_id = me)
  ) THEN
    RAISE EXCEPTION 'Not friends';
  END IF;

  DELETE FROM public.friendships f
  WHERE (f.user_id = me AND f.friend_id = target_id)
     OR (f.user_id = target_id AND f.friend_id = me);
END;
$$;

REVOKE ALL ON FUNCTION public.get_profile_by_friend_code(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.add_friend_by_code(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.remove_friend(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_profile_by_friend_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_friend_by_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_friend(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- profiles: own row + accepted friends (public fields only via SELECT *)
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_select_friends ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.friendships f
      WHERE f.user_id = auth.uid()
        AND f.friend_id = profiles.id
    )
  );

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- friendships: read own edges; mutations only via RPCs (no INSERT/UPDATE/DELETE policies)
CREATE POLICY friendships_select_own ON public.friendships
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- daily_progress: write own aggregates; read own + accepted friends
CREATE POLICY daily_progress_select_own_or_friends ON public.daily_progress
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
      FROM public.friendships f
      WHERE f.user_id = auth.uid()
        AND f.friend_id = daily_progress.user_id
    )
  );

CREATE POLICY daily_progress_insert_own ON public.daily_progress
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY daily_progress_update_own ON public.daily_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY daily_progress_delete_own ON public.daily_progress
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.friendships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_progress TO authenticated;
