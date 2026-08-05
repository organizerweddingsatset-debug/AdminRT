
import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createServerClient(){
  const store = cookies()
  return createSSRServerClient(url, anon, {
    cookies: {
      get(name: string){ return store.get(name)?.value },
      set(name: string, value: string, options: any){ store.set({name, value, ...options}) },
      remove(name: string, options: any){ store.set({name, value: '', ...options}) }
    }
  })
}
