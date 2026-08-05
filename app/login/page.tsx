'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login(){
  const [nik,setNik]=useState('')
  const [pass,setPass]=useState('')
  const [loading,setLoading]=useState(false)
  const [msg,setMsg]=useState('')
  const router = useRouter()
  const supabase = createClient()

  const login = async () => {
    setLoading(true); setMsg('')
    // 1. Cek profiles berdasarkan nik
    const { data: profile } = await supabase.from('profiles').select('*').eq('nik',nik).single()
    if(!profile){ setMsg('NIK tidak ditemukan'); setLoading(false); return }
    // 2. Login pakai email yang ada di profile
    const { data, error } = await supabase.auth.signInWithPassword({ email: profile.email, password: pass })
    if(error){ setMsg('Password salah: '+error.message); setLoading(false); return }
    // 3. Redirect berdasarkan role
    if(profile.role==='superadmin') router.push('/admin')
    else router.push('/warga')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1220] p-4">
      <div className="w-full max-w-sm bg-[#1C2035] border border-[#2A2F4A] rounded-[24px] p-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center font-bold text-white mx-auto mb-4">RT</div>
        <h1 className="text-white font-bold text-center text-[18px]">Login RT 09/14</h1>
        <p className="text-slate-400 text-[12px] text-center mb-6">De Naila Village - Blok G</p>
        <div className="space-y-3">
          <input value={nik} onChange={e=>setNik(e.target.value)} placeholder="NIK (3578...)" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-3 text-[13px] text-white outline-none" />
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-3 text-[13px] text-white outline-none" />
          {msg && <div className="text-red-400 text-[11px] bg-red-900/20 p-2 rounded-xl">{msg}</div>}
          <button onClick={login} disabled={loading} className="w-full bg-white text-black font-bold rounded-full py-3 text-[13px]">{loading?'Loading...':'Masuk'}</button>
        </div>
        <div className="mt-6 text-[10px] text-slate-500 bg-[#0F1220] p-3 rounded-xl">
          <b>Demo Akun:</b><br/>Superadmin: NIK 3578030504830006 / pass: admin123<br/>Warga: NIK 3578030504830001 / pass: warga123
        </div>
      </div>
    </div>
  )
}
