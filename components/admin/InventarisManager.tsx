
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function InventarisManager(){
  const [data,setData]=useState<any[]>([])
  const [pinjam,setPinjam]=useState<any[]>([])
  const [form,setForm]=useState({nama:'',jumlah_total:1,kondisi:'baik'})
  const load=async()=>{
    const { data } = await supabase.from('inventaris').select('*'); setData(data||[])
    const { data: pj } = await supabase.from('inventaris_peminjaman').select('*, warga(nama), inventaris(nama)').order('created_at',{ascending:false}); setPinjam(pj||[])
  }
  useEffect(()=>{load()},[])
  const add=async()=>{ await supabase.from('inventaris').insert([{...form,jumlah_tersedia:form.jumlah_total}]); setForm({nama:'',jumlah_total:1,kondisi:'baik'}); load() }
  const kembalikan=async(id:string, invId:string, jml:number)=>{
    await supabase.from('inventaris_peminjaman').update({status:'dikembalikan'}).eq('id',id)
    const { data: inv } = await supabase.from('inventaris').select('jumlah_tersedia').eq('id',invId).single()
    if(inv) await supabase.from('inventaris').update({jumlah_tersedia:inv.jumlah_tersedia+jml}).eq('id',invId)
    load()
  }
  return (
    <div className="space-y-4">
      <div className="card rounded-[24px] p-6">
        <div className="flex gap-3"><input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} placeholder="Nama barang" className="input" /><input type="number" value={form.jumlah_total} onChange={e=>setForm({...form,jumlah_total:parseInt(e.target.value)||0})} className="input w-24" /><button onClick={add} className="bg-white text-black rounded-full px-6 text-[12px] font-bold">Tambah</button></div>
        <div className="grid grid-cols-3 gap-3 mt-4">{data.map((d:any)=><div key={d.id} className="bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-4"><div className="text-[13px] font-bold">{d.nama}</div><div className="text-[11px] text-slate-500">{d.jumlah_tersedia}/{d.jumlah_total} tersedia • {d.kondisi}</div></div>)}</div>
      </div>
      <div className="card rounded-[24px] p-6">
        <h3 className="font-bold mb-3">Peminjaman Warga</h3>
        <div className="space-y-2">{pinjam.map((p:any)=><div key={p.id} className="flex justify-between bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3 text-[12px]"><span>{p.warga?.nama} pinjam {p.inventaris?.nama} x{p.jumlah} - {p.status}</span>{p.status==='dipinjam' && <button onClick={()=>kembalikan(p.id,p.inventaris_id,p.jumlah)} className="bg-white text-black rounded-full px-3 py-1 text-[11px] font-bold">Kembalikan</button>}</div>)}</div>
      </div>
    </div>
  )
}
