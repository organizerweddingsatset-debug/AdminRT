
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
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('nik',nik.trim()).single()
    if(error || !profile){ setMsg('NIK tidak ditemukan di profiles'); setLoading(false); return }
    const { error: authErr } = await supabase.auth.signInWithPassword({email: profile.email, password: pass})
    if(authErr){ setMsg(authErr.message); setLoading(false); return }
    if(profile.role==='superadmin') router.push('/admin')
    else router.push('/warga')
  }
  return (
    <div className="min-h-screen flex bg-[#0F1220]">
      <div className="hidden lg:flex w-[55%] bg-[#15182E] items-center justify-center relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[120px]" />
        <div className="relative z-10 p-12 max-w-lg"><div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black mb-6">09</div><h1 className="text-4xl font-black leading-tight">Administrasi Digital<br/>RT 09/14 De Naila</h1><p className="text-slate-400 text-[13px] mt-3">Blok G - Transparan, Digital, Akuntabel</p></div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px] card glow rounded-[28px] p-8">
          <h2 className="font-bold text-[20px]">Login</h2><p className="text-slate-500 text-[12px] mb-6">Gunakan NIK terdaftar</p>
          <input value={nik} onChange={e=>setNik(e.target.value)} placeholder="NIK" className="input mb-3" />
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="input mb-3" />
          {msg && <div className="text-red-400 bg-red-500/10 border border-red-500/20 text-[11px] p-3 rounded-xl mb-3">{msg}</div>}
          <button onClick={login} disabled={loading} className="w-full bg-white text-black font-bold rounded-full py-3.5 text-[13px]">{loading?'...':'Masuk Dashboard'}</button>
          <div className="text-[10px] text-slate-500 mt-4 leading-relaxed">Superadmin: 3578030504830006 / admin123<br/>Warga: 3578030504830001 / warga123</div>
        </div>
      </div>
    </div>
  )
}
