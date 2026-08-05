'use client'
import { useState } from 'react'
import { createBrowserClient, supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login(){
  const [user,setUser]=useState('')
  const [pass,setPass]=useState('')
  const [msg,setMsg]=useState('')
  const [loading,setLoading]=useState(false)
  const router=useRouter()

  const normalize = (s:string) => s.toLowerCase().replace(/\s+/g,'').replace('blok','')

  const login=async()=>{
    setLoading(true); setMsg('')
    try{
      const s = createBrowserClient()
      // 1. Coba ADMIN dulu via profiles (NIK)
      const { data: profile } = await supabase.from('profiles').select('*').eq('nik', user.trim()).single()
      if(profile && profile.role==='superadmin'){
        const { error } = await s.auth.signInWithPassword({email: profile.email, password: pass})
        if(!error){ router.push('/admin'); return }
        // kalau password salah tampilkan error admin
        if(error){ setMsg('Password admin salah: ' + error.message); setLoading(false); return }
      }

      // 2. WARGA LOGIN: cari di tabel warga by NIK atau NAMA
      let wargaRow = null
      // coba by NIK dulu
      const { data: byNik } = await supabase.from('warga').select('*').eq('nik', user.trim()).single()
      if(byNik) wargaRow = byNik
      else {
        // coba by nama (case insensitive)
        const { data: byNama } = await supabase.from('warga').select('*').ilike('nama', user.trim())
        if(byNama && byNama.length>0){
          // cari exact match normalized, atau ambil pertama
          const normInput = normalize(user)
          wargaRow = byNama.find((w:any)=> normalize(w.nama)===normInput) || byNama[0]
        }
      }

      if(!wargaRow){
        setMsg('Warga tidak ditemukan. Coba pakai NIK atau Nama lengkap (contoh: Harri)')
        setLoading(false); return
      }

      // 3. Cek password = nomor blok rumah
      const passNorm = normalize(pass)
      const alamatNorm = normalize(wargaRow.alamat || '')
      const blokOnly = (wargaRow.alamat || '').split(' ').pop() || ''
      const blokNorm = normalize(blokOnly)

      const isBlokMatch = passNorm===alamatNorm || passNorm===blokNorm || wargaRow.alamat?.toLowerCase().includes(pass.toLowerCase()) || pass.toLowerCase().includes(blokOnly.toLowerCase())

      if(!isBlokMatch){
        setMsg(`Password salah. Untuk ${wargaRow.nama}, password = Blok rumah: ${wargaRow.alamat} (coba: ${blokOnly} atau ${wargaRow.alamat})`)
        setLoading(false); return
      }

      // 4. Sukses - simpan session warga di localStorage
      localStorage.setItem('warga_session', JSON.stringify(wargaRow))
      localStorage.setItem('warga_nik', wargaRow.nik)
      // coba juga login supabase kalau ada akun (optional, jangan gagalkan kalau tidak ada)
      try{
        const { data: profByNik } = await supabase.from('profiles').select('email').eq('nik', wargaRow.nik).single()
        if(profByNik?.email){
          await s.auth.signInWithPassword({email: profByNik.email, password: pass}).catch(()=>{})
        }
      }catch(e){}

      router.push('/warga')
    }catch(e:any){
      setMsg(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0F1220]">
      <div className="hidden lg:flex w-[55%] bg-[#15182E] items-center justify-center relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[120px]" />
        <div className="relative z-10 p-12 max-w-lg"><div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black mb-6">09</div><h1 className="text-4xl font-black leading-tight">RT 09/14<br/>De Naila Village</h1><p className="text-slate-400 text-[13px] mt-3">Blok G - Login Warga pakai Nama & Blok Rumah</p><div className="mt-8 bg-[#1C2035] border border-[#2A2F4A] rounded-2xl p-4"><div className="text-[11px] font-bold text-violet-300">Cara Login Warga:</div><div className="text-[11px] text-slate-400 mt-2">Username: <b>Nama</b> (contoh: Harri)<br/>Password: <b>Blok Rumah</b> (contoh: G-1 atau Blok G-1)</div></div></div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px] card glow rounded-[28px] p-8">
          <h2 className="font-bold text-[20px]">Login</h2><p className="text-slate-500 text-[12px] mb-6">Admin pakai NIK, Warga pakai Nama</p>
          <input value={user} onChange={e=>setUser(e.target.value)} placeholder="NIK / Nama Warga (contoh: Harri)" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-5 py-3.5 text-[13px] mb-3 outline-none" />
          <input type="text" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password: Blok Rumah (contoh: G-1)" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-5 py-3.5 text-[13px] mb-3 outline-none" />
          {msg && <div className="text-amber-300 bg-amber-500/10 border border-amber-500/20 text-[11px] p-3 rounded-xl mb-3 leading-relaxed">{msg}</div>}
          <button onClick={login} disabled={loading} className="w-full bg-white text-black font-bold rounded-full py-3.5 text-[13px]">{loading?'...':'Masuk Dashboard'}</button>
          <div className="text-[10px] text-slate-500 mt-4 leading-relaxed">
            <b>Admin:</b> 3578030504830006 / admin123<br/>
            <b>Warga Harri:</b> Harri / G-1 atau Harri / Blok G-1<br/>
            <b>Warga lain:</b> Nama sesuai tabel / Blok masing-masing
          </div>
        </div>
      </div>
    </div>
  )
}
