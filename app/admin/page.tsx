
'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient, supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage(){
  const [warga,setWarga]=useState<any[]>([])
  const router = useRouter()
  useEffect(()=>{
    const s = createBrowserClient()
    s.auth.getUser().then(({data})=>{ if(!data.user) router.push('/login') })
    supabase.from('warga').select('*').then(({data})=>setWarga(data||[]))
  },[])
  return <div className="p-6"><h1 className="font-bold text-xl">Dashboard Superadmin RT09</h1><p className="text-slate-400 text-[13px]">Total Warga: {warga.length}</p><div className="mt-4 space-y-2">{warga.map((w:any)=><div key={w.id} className="bg-[#1C2035] border border-[#2A2F4A] p-3 rounded-xl text-[13px]">{w.nik} - {w.nama} - {w.alamat}</div>)}</div></div>
}
