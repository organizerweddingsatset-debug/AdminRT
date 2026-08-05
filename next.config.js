'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function TransparansiKas(){
  const [kas,setKas]=useState<any[]>([])
  const [form,setForm]=useState({keterangan:'',jenis:'masuk',jumlah:0})
  const load=async()=>{
    const { data } = await supabase.from('kas').select('*').order('tanggal',{ascending:false})
    setKas(data||[])
  }
  useEffect(()=>{load()},[])
  const add=async()=>{
    if(!form.keterangan || !form.jumlah) return
    await supabase.from('kas').insert([{...form,tanggal:new Date().toISOString()}])
    setForm({keterangan:'',jenis:'masuk',jumlah:0}); load()
  }
  const totalMasuk = kas.filter(k=>k.jenis==='masuk').reduce((a,b)=>a+(b.jumlah||0),0)
  const totalKeluar = kas.filter(k=>k.jenis==='keluar').reduce((a,b)=>a+(b.jumlah||0),0)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="card rounded-[20px] p-5"><div className="text-[11px] text-slate-500">Pemasukan</div><div className="text-xl font-black text-emerald-400">Rp {totalMasuk.toLocaleString()}</div></div>
        <div className="card rounded-[20px] p-5"><div className="text-[11px] text-slate-500">Pengeluaran</div><div className="text-xl font-black text-red-400">Rp {totalKeluar.toLocaleString()}</div></div>
        <div className="card rounded-[20px] p-5 glow"><div className="text-[11px] text-slate-500">Saldo</div><div className="text-xl font-black">Rp {(totalMasuk-totalKeluar).toLocaleString()}</div></div>
      </div>
      <div className="card rounded-[24px] p-6">
        <div className="flex gap-3 mb-4">
          <input value={form.keterangan} onChange={e=>setForm({...form,keterangan:e.target.value})} placeholder="Keterangan" className="flex-1 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" />
          <select value={form.jenis} onChange={e=>setForm({...form,jenis:e.target.value})} className="bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]"><option value="masuk">Masuk</option><option value="keluar">Keluar</option></select>
          <input type="number" value={form.jumlah} onChange={e=>setForm({...form,jumlah:parseInt(e.target.value)||0})} placeholder="Jumlah" className="w-32 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" />
          <button onClick={add} className="bg-white text-black rounded-full px-6 text-[12px] font-bold">Tambah</button>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-auto">
          {kas.map((k:any)=>(
            <div key={k.id} className="flex justify-between bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3 text-[12px]">
              <span>{k.keterangan} • {new Date(k.tanggal).toLocaleDateString('id-ID')}</span>
              <span className={k.jenis==='masuk'?'text-emerald-400':'text-red-400'}>{k.jenis==='masuk'?'+':'-'} Rp {k.jumlah?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
