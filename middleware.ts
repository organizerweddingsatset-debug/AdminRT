
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function Inventaris(){
  const [data,setData]=useState<any[]>([])
  const [form,setForm]=useState({nama:'',jumlah:1,kondisi:'baik'})
  const load=async()=>{ const { data } = await supabase.from('inventaris').select('*').order('created_at',{ascending:false}); setData(data||[]) }
  useEffect(()=>{load()},[])
  const add=async()=>{ if(!form.nama) return; await supabase.from('inventaris').insert([form]); setForm({nama:'',jumlah:1,kondisi:'baik'}); load() }
  return (
    <div className="card rounded-[24px] p-6">
      <div className="flex gap-3 mb-4">
        <input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} placeholder="Nama barang" className="flex-1 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" />
        <input type="number" value={form.jumlah} onChange={e=>setForm({...form,jumlah:parseInt(e.target.value)||0})} className="w-24 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" />
        <select value={form.kondisi} onChange={e=>setForm({...form,kondisi:e.target.value})} className="bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]"><option>baik</option><option>rusak</option></select>
        <button onClick={add} className="bg-white text-black rounded-full px-6 text-[12px] font-bold">Tambah</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {data.map((d:any)=>(
          <div key={d.id} className="bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-4 flex justify-between"><div><div className="text-[13px] font-medium">{d.nama}</div><div className="text-[10px] text-slate-500">{d.kondisi}</div></div><div className="text-[12px] font-bold">{d.jumlah} pcs</div></div>
        ))}
      </div>
    </div>
  )
}
