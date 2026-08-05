
'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login(){
  const [nik,setNik]=useState('')
  const [pass,setPass]=useState('')
  const [msg,setMsg]=useState('')
  const [loading,setLoading]=useState(false)
  const router = useRouter()

  const login = async () => {
    setLoading(true); setMsg('')
    try{
      const supabase = createBrowserClient()
      const { data: profile, error: pErr } = await supabase.from('profiles').select('*').eq('nik',nik).single()
      if(pErr || !profile){ setMsg('NIK tidak ada di profiles: '+nik); setLoading(false); return }
      const { error } = await supabase.auth.signInWithPassword({ email: profile.email, password: pass })
      if(error){ setMsg('Login gagal: '+error.message); setLoading(false); return }
      if(profile.role==='superadmin') router.push('/admin')
      else router.push('/warga')
    }catch(e:any){ setMsg(e.message); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F1220]">
      <div className="w-full max-w-sm bg-[#1C2035] border border-[#2A2F4A] rounded-[24px] p-8">
        <h1 className="font-bold text-center text-white">Login RT 09/14</h1>
        <p className="text-slate-400 text-[11px] text-center mb-6">De Naila Village Blok G</p>
        <input value={nik} onChange={e=>setNik(e.target.value)} placeholder="NIK" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-3 text-[13px] mb-3 text-white outline-none" />
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-3 text-[13px] mb-3 text-white outline-none" />
        {msg && <div className="text-red-400 text-[11px] mb-3 bg-red-900/20 p-2 rounded">{msg}</div>}
        <button onClick={login} disabled={loading} className="w-full bg-white text-black font-bold rounded-full py-3 text-[13px]">{loading?'Loading...':'Masuk'}</button>
        <div className="mt-4 text-[10px] text-slate-500">Superadmin: 3578030504830006 / admin123<br/>Warga: 3578030504830001 / warga123</div>
      </div>
    </div>
  )
}
