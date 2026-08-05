
import { createClient } from '@supabase/supabase-js'
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Export lama biar Inventaris dll gak error
export const supabase = createClient(url, anon)

// Export baru untuk login
export function createBrowserClient(){
  return createSSRBrowserClient(url, anon)
}
