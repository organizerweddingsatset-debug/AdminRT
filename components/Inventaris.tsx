'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function Inventaris(){
  const [data,setData]=useState<any[]>([])
  useEffect(()=>{ supabase.from('inventaris').select('*').then(({data})=>setData(data||[])) },[])
  return (
    <div className="card-dark p-5"><h2 className="font-semibold text-white text-[13px] mb-4">Inventaris RT</h2><div className="space-y-3">{data.map((i,idx)=><div key={idx} className="bg-[#1E233A] border border-[#2A2F4A] p-3 rounded-xl flex justify-between items-center"><div><div className="text-white text-[12px]">{i.nama}</div><div className="text-[10px] text-slate-400">{i.stok} unit • {i.tersedia} tersedia</div></div><button className="bg-green-600 text-white text-[11px] px-3 py-1 rounded-full">Pinjam</button></div>)}</div></div>
  )
}
