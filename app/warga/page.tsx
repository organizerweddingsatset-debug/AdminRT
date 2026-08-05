'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
export default function WargaDash(){
  const [profile,setProfile]=useState<any>(null)
  const [iuran,setIuran]=useState<any[]>([])
  const supabase = createClient()
  useEffect(()=>{
    supabase.auth.getUser().then(async ({data})=>{
      const { data: prof } = await supabase.from('profiles').select('*, warga(*)').eq('email',data.user?.email).single()
      setProfile(prof)
      if(prof){ supabase.from('iuran').select('*').eq('nik',prof.nik).order('tahun').order('bulan').then(({data})=>setIuran(data||[])) }
    })
  },[])
  return (
    <div className="min-h-screen bg-[#0F1220] p-6 max-w-[600px] mx-auto">
      <h1 className="text-white font-bold text-[18px]">Halo, {profile?.warga?.nama || 'Warga'}</h1>
      <p className="text-slate-400 text-[11px] mb-6">{profile?.warga?.alamat} • {profile?.nik}</p>
      <div className="bg-[#1C2035] border border-[#2A2F4A] rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-3">Riwayat Iuran Saya</h2>
        <div className="space-y-2">{iuran.map((r:any,i:number)=><div key={i} className="flex justify-between bg-[#0F1220] border border-[#2A2F4A] p-3 rounded-xl text-[12px]"><span className="text-slate-400">{r.bulan}/{r.tahun}</span><span className="text-white">Rp {r.nominal}</span><span className={`${r.status=='LUNAS'?'text-green-400':'text-red-400'}`}>{r.status}</span></div>)}</div>
      </div>
    </div>
  )
}
