
'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function WargaPage(){
  const [profile,setProfile]=useState<any>(null)
  const router = useRouter()
  useEffect(()=>{
    const s = createBrowserClient()
    s.auth.getUser().then(async ({data})=>{
      if(!data.user){ router.push('/login'); return }
      const { data: prof } = await s.from('profiles').select('*, warga(*)').eq('id', data.user.id).single()
      setProfile(prof)
    })
  },[])
  if(!profile) return <div className="p-6">Loading...</div>
  return <div className="p-6"><h1 className="font-bold">Halo {profile.warga?.nama}</h1><p className="text-[13px] text-slate-400">NIK: {profile.nik} | Blok: {profile.warga?.alamat}</p></div>
}
