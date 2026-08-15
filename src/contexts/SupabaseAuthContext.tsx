import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseOrNull, isSupabaseConfigured } from '../lib/supabase'
import { fetchMyProfile } from '../services/supabase/profiles'
import {
  getAuthRedirectUrl,
  isNativeAuthCallback,
  isNativePlatform,
  parseNativeOAuthCallback,
} from '../lib/authRedirect'
import { useAppStore } from '../store/useAppStore'
import type { Profile } from '../types/database'

interface SupabaseAuthContextValue {
  configured: boolean
  loading: boolean
  session: Session | null
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  oauthInProgress: boolean
  nativeOAuthError: string | null
  clearNativeOAuthError: () => void
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
  const [oauthInProgress, setOauthInProgress] = useState(false)
  const [nativeOAuthError, setNativeOAuthError] = useState<string | null>(null)
  const pendingPkceFlowIdRef = useRef<string | null>(null)
  const handlingCallbackRef = useRef(false)
  const setUserName = useAppStore((s) => s.setUserName)

  const supabase = getSupabaseOrNull()

  const clearNativeOAuthError = useCallback(() => {
    setNativeOAuthError(null)
  }, [])

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
        setOauthInProgress(false)
        setNativeOAuthError(null)
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

  const handleNativeOAuthCallback = useCallback(
    async (url: string) => {
      if (!supabase || !isNativeAuthCallback(url)) return
      if (handlingCallbackRef.current) return
      handlingCallbackRef.current = true

      const params = parseNativeOAuthCallback(url)

      if (import.meta.env.DEV) {
        console.info('[OAuth] native callback', {
          urlHost: (() => {
            try {
              return new URL(url).host
            } catch {
              return 'invalid'
            }
          })(),
          hasCode: Boolean(params.code),
          hasFlowId: Boolean(params.flowId ?? pendingPkceFlowIdRef.current),
          hasError: Boolean(params.error),
          error: params.error,
          errorDescription: params.errorDescription,
        })
      }

      try {
        try {
          await Browser.close()
        } catch {
          /* browser may already be closed */
        }

        if (params.error || params.errorDescription) {
          setNativeOAuthError(params.errorDescription ?? params.error ?? 'Google sign-in failed')
          setOauthInProgress(false)
          pendingPkceFlowIdRef.current = null
          return
        }

        if (!params.code) {
          setNativeOAuthError('Google sign-in did not return an authorization code.')
          setOauthInProgress(false)
          pendingPkceFlowIdRef.current = null
          return
        }

        const flowId = params.flowId ?? pendingPkceFlowIdRef.current ?? undefined
        const { error } = await supabase.auth.exchangeCodeForSession(
          params.code,
          flowId ? { flowId } : undefined,
        )
        pendingPkceFlowIdRef.current = null

        if (error) {
          console.error('[OAuth] code exchange failed:', error.message)
          setNativeOAuthError(error.message)
          setOauthInProgress(false)
        }
      } finally {
        handlingCallbackRef.current = false
      }
    },
    [supabase],
  )

  // Native OAuth: Google opens in system browser, returns via deep link.
  useEffect(() => {
    if (!supabase || !isNativePlatform()) return

    let cancelled = false
    let removeListener: (() => void) | undefined

    void (async () => {
      const handle = await App.addListener('appUrlOpen', ({ url }) => {
        void handleNativeOAuthCallback(url)
      })

      if (cancelled) {
        await handle.remove()
        return
      }

      removeListener = () => {
        void handle.remove()
      }

      const launch = await App.getLaunchUrl()
      if (!cancelled && launch?.url) {
        void handleNativeOAuthCallback(launch.url)
      }
    })()

    return () => {
      cancelled = true
      removeListener?.()
    }
  }, [supabase, handleNativeOAuthCallback])

  const signInWithGoogle = useCallback(
    async (_mode: 'login' | 'signup' = 'login') => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      setNativeOAuthError(null)
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
        pendingPkceFlowIdRef.current = data.flowId ?? null
        setOauthInProgress(true)
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
    setOauthInProgress(false)
    pendingPkceFlowIdRef.current = null
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
        oauthInProgress,
        nativeOAuthError,
        clearNativeOAuthError,
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
