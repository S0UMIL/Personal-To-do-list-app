export { checkSupabaseHealth, pingSupabase } from './health'
export type { SupabaseHealthResult } from './health'

export { fetchMyProfile, updateMyDisplayName } from './profiles'

export {
  lookupProfileByFriendCode,
  listMyFriends,
  addFriendByCode,
  removeFriend,
} from './friends'
export type { SupabaseFriend } from './friends'

export {
  upsertDailyProgress,
  getDailyProgress,
  progressRatePercent,
} from './progress'
