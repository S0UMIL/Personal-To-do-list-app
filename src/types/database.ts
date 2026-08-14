/**
 * Supabase types for North's local-first cloud schema.
 * Tables: profiles, friendships, daily_progress only.
 *
 * Regenererate after schema changes:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          email: string | null
          avatar_url: string | null
          friend_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          email?: string | null
          avatar_url?: string | null
          friend_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          email?: string | null
          avatar_url?: string | null
          friend_code?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'friendships_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'friendships_friend_id_fkey'
            columns: ['friend_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      daily_progress: {
        Row: {
          user_id: string
          progress_date: string
          completed: number
          total: number
          rate: number
          updated_at: string
        }
        Insert: {
          user_id: string
          progress_date: string
          completed?: number
          total?: number
          rate?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          progress_date?: string
          completed?: number
          total?: number
          rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'daily_progress_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      get_profile_by_friend_code: {
        Args: { lookup_code: string }
        Returns: {
          id: string
          display_name: string
          friend_code: string
          avatar_url: string | null
        }[]
      }
      add_friend_by_code: {
        Args: { lookup_code: string }
        Returns: {
          id: string
          display_name: string
          friend_code: string
          avatar_url: string | null
        }[]
      }
      remove_friend: {
        Args: { target_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type DbDailyProgress = Database['public']['Tables']['daily_progress']['Row']
export type DbFriendship = Database['public']['Tables']['friendships']['Row']
export type PublicProfile =
  Database['public']['Functions']['get_profile_by_friend_code']['Returns'][number]
