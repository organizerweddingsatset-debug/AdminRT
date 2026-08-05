'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function Pengumuman(){
  const [data,setData]=useState<any[]>([])
  useEffect(()=>{ supabase.from('pengumuman').select('*').order('created_at',{ascending:false}).limit(3).then(({data})=>setData(data||[])) },[])
  return (
    <div className="card-dark p-5"><h2 className="font-semibold text-white text-[13px] mb-4">Pengumuman RT Live</h2><div className="space-y-3">{data.map((p,i)=><div key={i} className="bg-[#1E233A] border border-[#2A2F4A] p-3 rounded-xl"><div className="text-[9px] px-2 py-0.5 rounded-full border bg-yellow-900/30 text-yellow-400 inline-block">{p.kategori}</div><div className="font-medium text-white text-[12px] mt-1">{p.judul}</div><div className="text-[11px] text-slate-400">{p.isi?.substring(0,100)}</div></div>)}</div></div>
  )
}
