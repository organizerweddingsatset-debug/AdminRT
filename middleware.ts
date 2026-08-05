
'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login(){
  const [nik,setNik]=useState('')
  const [pass,setPass]=useState('')
  const [msg,setMsg]=useState('')
  const [loading,setLoading]=useState(false)
  const router=useRouter()
  const login=async()=>{
    setLoading(true); setMsg('')
    try{
      const supabase=createBrowserClient()
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('nik',nik.trim()).single()
      if(error || !profile){ setMsg('NIK tidak ditemukan: '+nik); setLoading(false); return }
      const { error: authErr } = await supabase.auth.signInWithPassword({email: profile.email, password: pass})
      if(authErr){ setMsg(authErr.message); setLoading(false); return }
      if(profile.role==='superadmin') router.push('/admin')
      else router.push('/warga')
    }catch(e:any){ setMsg(e.message); setLoading(false) }
  }
  return (
    <div className="min-h-screen flex bg-[#0F1220]">
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-[#15182E] items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-indigo-600/20" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[120px]" />
        <div className="relative z-10 p-12 max-w-lg">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black mb-6">09</div>
          <h1 className="text-4xl font-black leading-tight mb-4">Administrasi Digital<br/>RT 09/14</h1>
          <p className="text-slate-400 text-[14px] leading-relaxed">De Naila Village Blok G - Sistem terintegrasi untuk pengelolaan warga, iuran, kas transparan, inventaris & surat menyurat.</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="card rounded-2xl p-4"><div className="text-2xl font-bold">3</div><div className="text-[11px] text-slate-500">Total Warga Blok G</div></div>
            <div className="card rounded-2xl p-4"><div className="text-2xl font-bold">100%</div><div className="text-[11px] text-slate-500">Transparansi Kas</div></div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          <div className="card glow rounded-[28px] p-8">
            <h2 className="font-bold text-[20px]">Login Warga</h2>
            <p className="text-slate-500 text-[12px] mb-6">Masuk dengan NIK & Password</p>
            <div className="space-y-3">
              <div>
                <div className="text-[11px] text-slate-400 mb-1 ml-1">NIK</div>
                <input value={nik} onChange={e=>setNik(e.target.value)} placeholder="35780305048xxxxx" className="w-full bg-[#0F1220] border border-[#2A2F4A] focus:border-violet-500 rounded-full px-5 py-3.5 text-[13px] outline-none transition" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 mb-1 ml-1">Password</div>
                <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" className="w-full bg-[#0F1220] border border-[#2A2F4A] focus:border-violet-500 rounded-full px-5 py-3.5 text-[13px] outline-none transition" />
              </div>
              {msg && <div className="text-red-400 bg-red-500/10 border border-red-500/20 text-[11px] p-3 rounded-xl">{msg}</div>}
              <button onClick={login} disabled={loading} className="w-full bg-white text-black font-bold rounded-full py-3.5 text-[13px] hover:bg-slate-100 transition mt-2">{loading?'Memproses...':'Masuk Dashboard'}</button>
              <div className="pt-4 border-t border-[#2A2F4A] mt-4 text-[10px] text-slate-500 leading-relaxed">
                <div className="font-bold text-slate-400 mb-1">Akun Demo:</div>
                Superadmin: 3578030504830006 / admin123<br/>Warga: 3578030504830001 / warga123
              </div>
            </div>
          </div>
          <div className="text-center text-[10px] text-slate-600 mt-4">© 2025 RT 09/14 De Naila Village Blok G</div>
        </div>
      </div>
    </div>
  )
}
