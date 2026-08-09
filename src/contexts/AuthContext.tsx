import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { isFirebaseConfigured, getFirebaseAuth } from '../lib/firebase'
import {
  signInWithGoogle,
  signOutCloud,
  upsertUserProfile,
  type CloudUserProfile,
} from '../services/cloud'
import { useAppStore } from '../store/useAppStore'

interface AuthContextValue {
  configured: boolean
  loading: boolean
  firebaseUser: FirebaseUser | null
  profile: CloudUserProfile | null
  isAuthenticated: boolean
  isOfflineMode: boolean
  signInGoogle: () => Promise<void>
  signOut: () => Promise<void>
  continueOffline: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<CloudUserProfile | null>(null)
  const [offlineMode, setOfflineMode] = useState(false)
  const setUserName = useAppStore((s) => s.setUserName)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      setFirebaseUser(user)
      if (user) {
        const p = await upsertUserProfile(user)
        setProfile(p)
        setUserName(p.displayName)
        setOfflineMode(false)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return unsub
  }, [setUserName])

  const signInGoogle = useCallback(async () => {
    const p = await signInWithGoogle()
    setProfile(p)
    setUserName(p.displayName)
    setOfflineMode(false)
  }, [setUserName])

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured && firebaseUser) {
      await signOutCloud()
    }
    setProfile(null)
    setFirebaseUser(null)
    setOfflineMode(false)
  }, [firebaseUser])

  const continueOffline = useCallback(() => {
    setOfflineMode(true)
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        configured: isFirebaseConfigured,
        loading,
        firebaseUser,
        profile,
        isAuthenticated: Boolean(firebaseUser && profile),
        isOfflineMode: offlineMode || !isFirebaseConfigured,
        signInGoogle,
        signOut,
        continueOffline,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
