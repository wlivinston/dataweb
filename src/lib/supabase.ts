import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wjeqwwilkbpqwuffiuio.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZXF3d2lsa2JwcXd1ZmZpdWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njg1MDYsImV4cCI6MjA2OTA0NDUwNn0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your schema
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: number
          email: string
          first_name: string
          last_name: string
          company: string | null
          phone: string | null
          created_at: string
          updated_at: string
          is_active: boolean
          subscription_status: string
          last_login: string | null
        }
        Insert: {
          id?: number
          email: string
          first_name: string
          last_name: string
          company?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          subscription_status?: string
          last_login?: string | null
        }
        Update: {
          id?: number
          email?: string
          first_name?: string
          last_name?: string
          company?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          subscription_status?: string
          last_login?: string | null
        }
      }
      blog_posts: {
        Row: {
          id: number
          slug: string
          title: string
          excerpt: string | null
          content: string
          author: string
          category: string | null
          tags: string[] | null
          featured: boolean
          published: boolean
          published_at: string
          created_at: string
          updated_at: string
          read_time: string | null
          view_count: number
          like_count: number
        }
        Insert: {
          id?: number
          slug: string
          title: string
          excerpt?: string | null
          content: string
          author: string
          category?: string | null
          tags?: string[] | null
          featured?: boolean
          published?: boolean
          published_at?: string
          created_at?: string
          updated_at?: string
          read_time?: string | null
          view_count?: number
          like_count?: number
        }
        Update: {
          id?: number
          slug?: string
          title?: string
          excerpt?: string | null
          content?: string
          author?: string
          category?: string | null
          tags?: string[] | null
          featured?: boolean
          published?: boolean
          published_at?: string
          created_at?: string
          updated_at?: string
          read_time?: string | null
          view_count?: number
          like_count?: number
        }
      }
      blog_comments: {
        Row: {
          id: number
          post_id: number
          parent_id: number | null
          author_name: string
          author_email: string
          author_website: string | null
          content: string
          is_approved: boolean
          is_spam: boolean
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          post_id: number
          parent_id?: number | null
          author_name: string
          author_email: string
          author_website?: string | null
          content: string
          is_approved?: boolean
          is_spam?: boolean
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          post_id?: number
          parent_id?: number | null
          author_name?: string
          author_email?: string
          author_website?: string | null
          content?: string
          is_approved?: boolean
          is_spam?: boolean
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          billing_cycle: string
          features: any | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number
          billing_cycle: string
          features?: any | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number
          billing_cycle?: string
          features?: any | null
          is_active?: boolean
          created_at?: string
        }
      }
    }
  }
}

// Typed Supabase client
export type TypedSupabaseClient = ReturnType<typeof createClient<Database>>
