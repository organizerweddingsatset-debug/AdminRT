import { createClient } from '@supabase/supabase-js'
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton - cegah multiple GoTrueClient
let supabaseInstance:any = null

function getSupabase(){
  if(!supabaseInstance){
    supabaseInstance = createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'sb-myinmkdykpjflrxywiez-auth-token'
      }
    })
  }
  return supabaseInstance
}

export const supabase = getSupabase()

export function createBrowserClient(){
  return getSupabase()
}
