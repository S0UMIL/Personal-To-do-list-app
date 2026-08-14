import { getSupabase } from '../../lib/supabase'
import type { DbDailyProgress } from '../../types/database'

function toUnitRate(ratePercent: number): number {
  if (ratePercent <= 1) return Math.min(1, Math.max(0, ratePercent))
  return Math.min(1, Math.max(0, ratePercent / 100))
}

/** Persist only aggregate leaderboard stats. Never send task titles or history. */
export async function upsertDailyProgress(
  userId: string,
  progressDate: string,
  stats: { completed: number; total: number; rate: number },
): Promise<DbDailyProgress> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('daily_progress')
    .upsert(
      {
        user_id: userId,
        progress_date: progressDate,
        completed: stats.completed,
        total: stats.total,
        rate: toUnitRate(stats.rate),
      },
      { onConflict: 'user_id,progress_date' },
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getDailyProgress(
  userId: string,
  progressDate: string,
): Promise<DbDailyProgress | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('progress_date', progressDate)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export function progressRatePercent(rate: number): number {
  if (rate <= 1) return Math.round(rate * 100)
  return Math.round(rate)
}
