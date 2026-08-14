import { useAuth } from '../contexts/AuthContext'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'

export type CloudIdentitySource = 'supabase' | 'firebase' | null

export interface CloudIdentity {
  loading: boolean
  configured: boolean
  isAuthenticated: boolean
  isOfflineMode: boolean
  source: CloudIdentitySource
  uid: string | null
  displayName: string | null
  friendCode: string | null
}

/**
 * Prefers Supabase Auth when signed in; Firebase remains as fallback.
 * Local productivity does not depend on this hook.
 */
export function useCloudIdentity(): CloudIdentity {
  const firebase = useAuth()
  const supabase = useSupabaseAuth()

  const loading = firebase.loading || supabase.loading
  const configured = firebase.configured || supabase.configured

  if (supabase.isAuthenticated && supabase.user) {
    return {
      loading,
      configured,
      isAuthenticated: true,
      isOfflineMode: false,
      source: 'supabase',
      uid: supabase.user.id,
      displayName: supabase.profile?.display_name ?? supabase.user.email ?? null,
      friendCode: supabase.profile?.friend_code ?? null,
    }
  }

  if (firebase.isAuthenticated && firebase.profile) {
    return {
      loading,
      configured,
      isAuthenticated: true,
      isOfflineMode: false,
      source: 'firebase',
      uid: firebase.profile.uid,
      displayName: firebase.profile.displayName,
      friendCode: firebase.profile.friendCode,
    }
  }

  return {
    loading,
    configured,
    isAuthenticated: false,
    isOfflineMode: firebase.isOfflineMode,
    source: null,
    uid: null,
    displayName: null,
    friendCode: null,
  }
}
