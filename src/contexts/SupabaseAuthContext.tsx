import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseOrNull, isSupabaseConfigured } from '../lib/supabase'
import { fetchMyProfile } from '../services/supabase/profiles'
import { getAuthRedirectUrl, isNativeAuthCallback, isNativePlatform } from '../lib/authRedirect'
import { useAppStore } from '../store/useAppStore'
import type { Profile } from '../types/database'

interface SupabaseAuthContextValue {
  configured: boolean
  loading: boolean
  session: Session | null
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  signInWithGoogle: (mode?: 'login' | 'signup') => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<{ needsEmailConfirm: boolean }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const setUserName = useAppStore((s) => s.setUserName)

  const supabase = getSupabaseOrNull()

  const loadProfile = useCallback(
    async (userId: string) => {
      try {
        const next = await fetchMyProfile(userId)
        setProfile(next)
        if (next?.display_name) setUserName(next.display_name)
      } catch {
        setProfile(null)
      }
    },
    [setUserName],
  )

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setSession(data.session)
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => {
          if (!cancelled) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        loadProfile(nextSession.user.id).finally(() => setLoading(false))
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase, loadProfile])

  // Native OAuth: Google opens in system browser, returns via deep link.
  useEffect(() => {
    if (!supabase || !isNativePlatform()) return

    let removed = false
    let removeListener: (() => void) | undefined

    void (async () => {
      const { App } = await import('@capacitor/app')
      const { Browser } = await import('@capacitor/browser')
      const handle = await App.addListener('appUrlOpen', async ({ url }) => {
        if (!isNativeAuthCallback(url)) return
        try {
          await Browser.close()
        } catch {
          /* browser may already be closed */
        }
        const { error } = await supabase.auth.exchangeCodeForSession(url)
        if (error) {
          console.error('OAuth callback failed:', error.message)
        }
      })
      if (removed) {
        await handle.remove()
      } else {
        removeListener = () => {
          void handle.remove()
        }
      }
    })()

    return () => {
      removed = true
      removeListener?.()
    }
  }, [supabase])

  const signInWithGoogle = useCallback(
    async (_mode: 'login' | 'signup' = 'login') => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      const redirectTo = getAuthRedirectUrl()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
          },
        },
      })
      if (error) throw error
      if (!data.url) throw new Error('Google sign-in did not return a redirect URL')

      if (isNativePlatform()) {
        const { Browser } = await import('@capacitor/browser')
        await Browser.open({ url: data.url })
        return
      }

      // Web: probe before navigating so a disabled provider stays on /login instead of a JSON page.
      const probe = await fetch(data.url, { method: 'GET', redirect: 'manual', credentials: 'omit' })
      const probeBlocked =
        probe.status === 400 || (probe.type !== 'opaqueredirect' && probe.status >= 400)
      let probeMsg: string | null = null
      if (probeBlocked) {
        try {
          const body = (await probe.json()) as { msg?: string }
          probeMsg = body.msg ?? null
        } catch {
          probeMsg = null
        }
      }
      if (probeBlocked) {
        throw new Error(
          probeMsg?.includes('not enabled')
            ? 'Google is not enabled in this Supabase project. Open Authentication → Providers, enable Google, and paste your Google Cloud OAuth client ID and secret.'
            : probeMsg ?? 'Google sign-in is not available on this project.',
        )
      }
      window.location.assign(data.url)
    },
    [supabase],
  )

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!supabase) throw new Error('Supabase is not configured')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    [supabase],
  )

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!supabase) throw new Error('Supabase is not configured')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: getAuthRedirectUrl() },
      })
      if (error) throw error
      return { needsEmailConfirm: !data.session }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return
    await loadProfile(session.user.id)
  }, [session?.user, loadProfile])

  return (
    <SupabaseAuthContext.Provider
      value={{
        configured: isSupabaseConfigured,
        loading,
        session,
        user: session?.user ?? null,
        profile,
        isAuthenticated: Boolean(session?.user),
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseAuthContext)
  if (!ctx) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider')
  }
  return ctx
}

export function useSupabaseAuthOptional() {
  return useContext(SupabaseAuthContext)
}
