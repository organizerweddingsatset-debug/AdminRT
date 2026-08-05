
'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
export default function WargaPage(){
  const [profile,setProfile]=useState<any>(null)
  const router=useRouter()
  useEffect(()=>{
    const s=createBrowserClient()
    s.auth.getUser().then(async ({data})=>{
      if(!data.user){ router.push('/login'); return }
      const { data: prof } = await s.from('profiles').select('*, warga(*)').eq('id', data.user.id).single()
      setProfile(prof)
    })
  },[])
  if(!profile) return <div className="min-h-screen bg-[#0F1220] flex items-center justify-center text-white">Loading...</div>
  return (
    <div className="min-h-screen bg-[#0F1220] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="card rounded-[28px] p-8 glow">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xl font-black mb-4">{profile.warga?.nama?.[0] || 'W'}</div>
          <h1 className="text-2xl font-black">Halo, {profile.warga?.nama || profile.email}</h1>
          <p className="text-slate-400 text-[13px] mt-1">NIK: {profile.nik} | {profile.warga?.alamat || 'Blok G-1'}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-[#0F1220] rounded-2xl p-4 border border-[#2A2F4A]"><div className="text-[11px] text-slate-500">Status Iuran</div><div className="font-bold text-emerald-400 mt-1">Lunas</div></div>
            <div className="bg-[#0F1220] rounded-2xl p-4 border border-[#2A2F4A]"><div className="text-[11px] text-slate-500">Blok</div><div className="font-bold mt-1">{profile.warga?.alamat || 'G-1'}</div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
