'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Inventaris(){
  const [data,setData]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    supabase.from('inventaris').select('*').then(({data,error})=>{
      if(!error) setData(data||[])
      setLoading(false)
    })
  },[])
  if(loading) return <div className="p-4 text-slate-400 text-[13px]">Loading inventaris...</div>
  return (
    <div className="p-4">
      <h3 className="font-bold mb-3">Inventaris RT</h3>
      <div className="space-y-2">
        {data.length===0 ? <div className="text-slate-500 text-[12px]">Belum ada data inventaris</div> : data.map((it:any,i:number)=>(
          <div key={i} className="bg-[#1C2035] border border-[#2A2F4A] rounded-xl p-3 text-[13px] flex justify-between">
            <span>{it.nama_barang || it.nama}</span>
            <span className="text-slate-400">{it.jumlah || 1} pcs</span>
          </div>
        ))}
      </div>
    </div>
  )
}
