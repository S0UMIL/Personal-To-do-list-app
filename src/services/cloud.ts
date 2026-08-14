import {
  GoogleAuthProvider,
  signInWithPopup,
  reauthenticateWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { getFirebaseAuth, getFirestoreDb } from '../lib/firebase'
import { generateFriendCode, normalizeFriendCode } from '../lib/friendCode'

export interface CloudUserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  friendCode: string
  createdAt?: Timestamp
}

export interface CloudFriend {
  uid: string
  displayName: string
  friendCode: string
  photoURL?: string
}

export interface CloudDailyProgress {
  completed: number
  total: number
  rate: number
  updatedAt?: Timestamp
}

async function ensureUniqueFriendCode(): Promise<string> {
  const db = getFirestoreDb()
  for (let attempt = 0; attempt < 16; attempt++) {
    const code = generateFriendCode()
    const snap = await getDocs(
      query(collection(db, 'users'), where('friendCode', '==', code)),
    )
    if (snap.empty) return code
  }
  return generateFriendCode() + 'X'
}

export async function signInWithGoogle(): Promise<CloudUserProfile> {
  const auth = getFirebaseAuth()
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  return upsertUserProfile(result.user)
}

export async function signOutCloud(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth())
}

function googleTasksProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider()
  provider.addScope('https://www.googleapis.com/auth/tasks')
  return provider
}

function accessTokenFromResult(
  result: Awaited<ReturnType<typeof signInWithPopup>>,
): string {
  const credential = GoogleAuthProvider.credentialFromResult(result)
  if (!credential?.accessToken) {
    throw new Error('Google Tasks permission was not granted')
  }
  return credential.accessToken
}

/** Request Google Tasks scope and return a short-lived OAuth access token */
export async function connectGoogleTasksApi(): Promise<string> {
  const auth = getFirebaseAuth()
  const provider = googleTasksProvider()
  const current = auth.currentUser

  if (current) {
    const result = await reauthenticateWithPopup(current, provider)
    return accessTokenFromResult(result)
  }

  const result = await signInWithPopup(auth, provider)
  await upsertUserProfile(result.user)
  return accessTokenFromResult(result)
}

export async function upsertUserProfile(fbUser: FirebaseUser): Promise<CloudUserProfile> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users', fbUser.uid)
  const existing = await getDoc(ref)

  if (existing.exists()) {
    const data = existing.data() as CloudUserProfile
    await setDoc(
      ref,
      {
        displayName: fbUser.displayName ?? data.displayName,
        photoURL: fbUser.photoURL ?? data.photoURL,
        email: fbUser.email ?? data.email,
      },
      { merge: true },
    )
    return { ...data, displayName: fbUser.displayName ?? data.displayName }
  }

  const friendCode = await ensureUniqueFriendCode()
  const profile: CloudUserProfile = {
    uid: fbUser.uid,
    email: fbUser.email ?? '',
    displayName: fbUser.displayName ?? 'User',
    photoURL: fbUser.photoURL ?? undefined,
    friendCode,
    createdAt: serverTimestamp() as Timestamp,
  }
  await setDoc(ref, profile)
  return profile
}

export async function getUserByFriendCode(code: string): Promise<CloudUserProfile | null> {
  const normalized = normalizeFriendCode(code)
  const db = getFirestoreDb()
  const snap = await getDocs(
    query(collection(db, 'users'), where('friendCode', '==', normalized)),
  )
  if (snap.empty) return null
  const data = snap.docs[0].data() as CloudUserProfile
  return { ...data, uid: snap.docs[0].id }
}

export async function addFriendByCode(
  myUid: string,
  friendCode: string,
): Promise<CloudFriend> {
  const friend = await getUserByFriendCode(friendCode)
  if (!friend) throw new Error('No user found with that ID')
  if (friend.uid === myUid) throw new Error('You cannot add yourself')

  const db = getFirestoreDb()
  const existing = await getDoc(doc(db, 'users', myUid, 'friends', friend.uid))
  if (existing.exists()) throw new Error('Already friends')

  const friendDoc: CloudFriend = {
    uid: friend.uid,
    displayName: friend.displayName,
    friendCode: friend.friendCode,
    photoURL: friend.photoURL,
  }

  await setDoc(doc(db, 'users', myUid, 'friends', friend.uid), {
    ...friendDoc,
    addedAt: serverTimestamp(),
  })

  const myProfile = await getDoc(doc(db, 'users', myUid))
  if (myProfile.exists()) {
    const me = myProfile.data() as CloudUserProfile
    await setDoc(doc(db, 'users', friend.uid, 'friends', myUid), {
      uid: myUid,
      displayName: me.displayName,
      friendCode: me.friendCode,
      photoURL: me.photoURL,
      addedAt: serverTimestamp(),
    })
  }

  return friendDoc
}

export async function listFriends(uid: string): Promise<CloudFriend[]> {
  const db = getFirestoreDb()
  const snap = await getDocs(collection(db, 'users', uid, 'friends'))
  return snap.docs.map((d) => d.data() as CloudFriend)
}

export async function pushDailyProgress(
  uid: string,
  dateKey: string,
  stats: { completed: number; total: number; rate: number },
): Promise<void> {
  const db = getFirestoreDb()
  await setDoc(doc(db, 'users', uid, 'daily', dateKey), {
    ...stats,
    updatedAt: serverTimestamp(),
  })
}

export async function getDailyProgress(
  uid: string,
  dateKey: string,
): Promise<CloudDailyProgress | null> {
  const db = getFirestoreDb()
  const snap = await getDoc(doc(db, 'users', uid, 'daily', dateKey))
  if (!snap.exists()) return null
  return snap.data() as CloudDailyProgress
}
