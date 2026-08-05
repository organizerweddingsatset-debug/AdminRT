'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function PengumumanManager(){
  const [list,setList]=useState<any[]>([])
  const [form,setForm]=useState({judul:'',isi:'',kategori:'INFO',penting:false})
  const [show,setShow]=useState(false)
  const load=async()=>{ const { data } = await supabase.from('pengumuman').select('*').order('created_at',{ascending:false}); setList(data||[]) }
  useEffect(()=>{load()},[])
  const save=async()=>{ if(!form.judul) return alert('Judul wajib'); await supabase.from('pengumuman').insert([{judul:form.judul,isi:form.isi,kategori:form.kategori,penting:form.penting}]); setForm({judul:'',isi:'',kategori:'INFO',penting:false}); setShow(false); load() }
  const del=async(id:string)=>{ if(!confirm('Hapus?')) return; await supabase.from('pengumuman').delete().eq('id',id); load() }
  return (<div className="space-y-4"><div className="card rounded-[24px] p-6 flex justify-between"><h3 className="font-bold">Pengumuman - {list.length}</h3><button onClick={()=>setShow(!show)} className="bg-white text-black rounded-full px-5 py-2 text-[12px] font-bold">+ Buat</button></div>{show && <div className="card rounded-[24px] p-6 space-y-3"><input value={form.judul} onChange={e=>setForm({...form,judul:e.target.value})} placeholder="Judul" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-2xl px-4 py-3 text-[13px]" /><textarea value={form.isi} onChange={e=>setForm({...form,isi:e.target.value})} placeholder="Isi..." rows={4} className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-2xl px-4 py-3 text-[13px]" /><button onClick={save} className="bg-violet-600 text-white rounded-full px-6 py-2 text-[12px] font-bold">Publish</button></div>}<div className="space-y-2">{list.map((p:any)=><div key={p.id} className="card rounded-[20px] p-5 flex justify-between"><div><div className="font-bold">{p.judul}</div><div className="text-[13px] text-slate-400 mt-1">{p.isi}</div></div><button onClick={()=>del(p.id)} className="text-[11px] text-red-400">Hapus</button></div>)}</div></div>)
}
