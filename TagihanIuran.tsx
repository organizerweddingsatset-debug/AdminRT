
'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
export default function Login(){
  const [nik,setNik]=useState(''); const [pass,setPass]=useState(''); const [msg,setMsg]=useState(''); const [loading,setLoading]=useState(false)
  const router=useRouter()
  const login=async()=>{
    setLoading(true); setMsg('')
    const supabase=createBrowserClient()
    const { data: profile } = await supabase.from('profiles').select('*').eq('nik',nik.trim()).single()
    if(!profile){ setMsg('NIK tidak ditemukan'); setLoading(false); return }
    const { error } = await supabase.auth.signInWithPassword({email: profile.email, password: pass})
    if(error){ setMsg(error.message); setLoading(false); return }
    if(profile.role==='superadmin') router.push('/admin')
    else router.push('/warga')
  }
  return (
    <div className="min-h-screen flex bg-[#0F1220]">
      <div className="hidden lg:flex w-[55%] bg-[#15182E] items-center justify-center relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[120px]" />
        <div className="relative z-10 p-12"><div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black mb-6">09</div><h1 className="text-4xl font-black">RT 09/14<br/>De Naila Village</h1><p className="text-slate-400 text-[13px] mt-3">Sistem digital Blok G</p></div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px] card glow rounded-[28px] p-8">
          <h2 className="font-bold text-[20px]">Login</h2><p className="text-slate-500 text-[12px] mb-6">NIK & Password</p>
          <input value={nik} onChange={e=>setNik(e.target.value)} placeholder="NIK" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-5 py-3.5 text-[13px] mb-3 outline-none" />
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-5 py-3.5 text-[13px] mb-3 outline-none" />
          {msg && <div className="text-red-400 text-[11px] bg-red-500/10 p-3 rounded-xl mb-3">{msg}</div>}
          <button onClick={login} disabled={loading} className="w-full bg-white text-black font-bold rounded-full py-3.5 text-[13px]">{loading?'...':'Masuk'}</button>
          <div className="text-[10px] text-slate-500 mt-4">Demo: 3578030504830006 / admin123 | 3578030504830001 / warga123</div>
        </div>
      </div>
    </div>
  )
}
