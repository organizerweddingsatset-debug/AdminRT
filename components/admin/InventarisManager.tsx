'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function InventarisManager({warga}:{warga:any[]}){
  const [items,setItems]=useState<any[]>([])
  const [pinjam,setPinjam]=useState<any[]>([])
  const [form,setForm]=useState({nama:'',jumlah:1,kondisi:'BAIK',lokasi:'Balai RT'})
  const [show,setShow]=useState(false)
  const load=async()=>{
    const { data: inv } = await supabase.from('inventaris').select('*').order('created_at',{ascending:false})
    setItems(inv||[])
    const { data: pj } = await supabase.from('inventaris_peminjaman').select('*, inventaris(nama)').order('created_at',{ascending:false})
    setPinjam(pj||[])
  }
  useEffect(()=>{load()},[])
  const save=async()=>{ if(!form.nama) return alert('Nama wajib'); await supabase.from('inventaris').insert([form]); setForm({nama:'',jumlah:1,kondisi:'BAIK',lokasi:'Balai RT'}); setShow(false); load() }
  const pinjamBarang=async(inv:any)=>{
    const nik = prompt(`Pinjam ${inv.nama} - NIK:`)
    if(!nik) return
    const w = warga.find((x:any)=>x.nik===nik)
    if(!w) return alert('NIK tidak ditemukan')
    await supabase.from('inventaris_peminjaman').insert([{inventaris_id:inv.id,warga_id:w.id,nik:w.nik,status:'DIPINJAM'}])
    load()
  }
  const kembalikan=async(id:string)=>{ await supabase.from('inventaris_peminjaman').update({status:'DIKEMBALIKAN',tanggal_kembali:new Date().toISOString().split('T')[0]}).eq('id',id); load() }
  return (<div className="space-y-4"><div className="card rounded-[24px] p-6 flex justify-between"><h3 className="font-bold">Inventaris - {items.length}</h3><button onClick={()=>setShow(!show)} className="bg-white text-black rounded-full px-5 py-2 text-[12px] font-bold">+ Tambah</button></div>{show && <div className="card rounded-[24px] p-5 grid grid-cols-2 gap-3"><input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} placeholder="Nama barang" className="col-span-2 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" /><input type="number" value={form.jumlah} onChange={e=>setForm({...form,jumlah:parseInt(e.target.value)||1})} placeholder="Jumlah" className="bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" /><input value={form.lokasi} onChange={e=>setForm({...form,lokasi:e.target.value})} placeholder="Lokasi" className="bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" /><button onClick={save} className="col-span-2 bg-violet-600 text-white rounded-full py-2.5 text-[12px] font-bold">Simpan</button></div>}<div className="grid grid-cols-3 gap-3">{items.map((it:any)=><div key={it.id} className="card rounded-[20px] p-4"><div className="font-bold text-[13px]">{it.nama}</div><div className="text-[11px] text-slate-500">Jumlah: {it.jumlah} • {it.lokasi}</div><button onClick={()=>pinjamBarang(it)} className="mt-3 w-full bg-[#1C2035] border border-[#2A2F4A] rounded-full py-1.5 text-[11px]">Pinjam</button></div>)}</div><div className="card rounded-[24px] p-6"><h4 className="font-bold mb-3 text-[13px]">Riwayat ({pinjam.length})</h4><div className="space-y-2">{pinjam.map((p:any)=><div key={p.id} className="flex justify-between items-center bg-[#0F1220] rounded-full px-4 py-2 text-[11px]"><div>{p.inventaris?.nama} - {p.nik} - {p.status}</div>{p.status==='DIPINJAM' && <button onClick={()=>kembalikan(p.id)} className="bg-white text-black rounded-full px-3 py-1 font-bold">Kembalikan</button>}</div>)}</div></div></div>)
}
