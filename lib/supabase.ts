import { createClient } from '@supabase/supabase-js'
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'
import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// FIX: Export lama biar komponen lama tidak error + export baru untuk Auth
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 1. Export lama (yang dipakai Inventaris.tsx dll)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. Export baru untuk login page (SSR compatible)
export function createBrowserClient() {
  return createSSRBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function createServerClient() {
  const cookieStore = cookies()
  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value },
      set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
      remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }) },
    },
  })
}
