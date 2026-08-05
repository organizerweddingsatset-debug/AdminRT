
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function TagihanIuran(){
  const [iuran,setIuran]=useState<any[]>([])
  const [warga,setWarga]=useState<any[]>([])
  const [form,setForm]=useState({warga_id:'',bulan:'Januari',tahun:2025,nominal:50000})
  const load=async()=>{
    const { data } = await supabase.from('iuran').select('*, warga(nama, alamat)').order('created_at',{ascending:false})
    setIuran(data||[])
    const { data: w } = await supabase.from('warga').select('*')
    setWarga(w||[])
  }
  useEffect(()=>{load()},[])
  const add=async()=>{
    if(!form.warga_id) return alert('Pilih warga')
    await supabase.from('iuran').insert([{...form,status:'lunas',tanggal_bayar:new Date().toISOString()}])
    load()
  }
  return (
    <div className="space-y-4">
      <div className="card rounded-[24px] p-6">
        <h3 className="font-bold mb-4">Input Iuran Warga</h3>
        <div className="grid grid-cols-4 gap-3">
          <select value={form.warga_id} onChange={e=>setForm({...form,warga_id:e.target.value})} className="bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]">
            <option value="">Pilih Warga</option>
            {warga.map((w:any)=><option key={w.id} value={w.id}>{w.nama} - {w.alamat}</option>)}
          </select>
          <input value={form.bulan} onChange={e=>setForm({...form,bulan:e.target.value})} className="bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" placeholder="Bulan" />
          <input type="number" value={form.nominal} onChange={e=>setForm({...form,nominal:parseInt(e.target.value)})} className="bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" />
          <button onClick={add} className="bg-white text-black rounded-full py-2.5 text-[12px] font-bold">Tandai Lunas</button>
        </div>
      </div>
      <div className="card rounded-[24px] p-6">
        <h3 className="font-bold mb-3">Riwayat Iuran</h3>
        <div className="space-y-2 max-h-[300px] overflow-auto">
          {iuran.map((i:any)=>(
            <div key={i.id} className="flex justify-between bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3 text-[12px]">
              <span>{i.warga?.nama} • {i.bulan} {i.tahun}</span>
              <span className="font-bold text-emerald-400">Rp {i.nominal?.toLocaleString()} - {i.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
