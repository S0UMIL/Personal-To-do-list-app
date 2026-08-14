import { getSupabase } from '../../lib/supabase'
import { normalizeFriendCode } from '../../lib/friendCode'
import type { PublicProfile } from '../../types/database'

export interface SupabaseFriend {
  id: string
  display_name: string
  friend_code: string
  avatar_url: string | null
}

export async function lookupProfileByFriendCode(
  code: string,
): Promise<PublicProfile | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('get_profile_by_friend_code', {
    lookup_code: normalizeFriendCode(code),
  })

  if (error) throw new Error(error.message)
  return data?.[0] ?? null
}

export async function listMyFriends(userId: string): Promise<SupabaseFriend[]> {
  const supabase = getSupabase()

  const { data: links, error: linksError } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId)

  if (linksError) throw new Error(linksError.message)
  if (!links?.length) return []

  const friendIds = links.map((l) => l.friend_id)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, friend_code, avatar_url')
    .in('id', friendIds)

  if (profilesError) throw new Error(profilesError.message)

  return (profiles ?? []).map((p) => ({
    id: p.id,
    display_name: p.display_name,
    friend_code: p.friend_code,
    avatar_url: p.avatar_url,
  }))
}

export async function addFriendByCode(friendCode: string): Promise<SupabaseFriend> {
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('add_friend_by_code', {
    lookup_code: normalizeFriendCode(friendCode),
  })

  if (error) throw new Error(error.message)
  const row = data?.[0]
  if (!row) throw new Error('Could not add friend')

  return {
    id: row.id,
    display_name: row.display_name,
    friend_code: row.friend_code,
    avatar_url: row.avatar_url,
  }
}

export async function removeFriend(friendId: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.rpc('remove_friend', {
    target_id: friendId,
  })
  if (error) throw new Error(error.message)
}
