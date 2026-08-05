
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function WargaManager({warga, refresh}:{warga:any[], refresh:()=>void}){
  const [show,setShow]=useState(false)
  const [edit,setEdit]=useState<any>(null)
  const [form,setForm]=useState({nik:'',nama:'',alamat:'Blok G-',no_hp:''})
  const save=async()=>{
    if(!form.nik || !form.nama) return alert('Lengkapi')
    if(edit){
      const { error } = await supabase.from('warga').update(form).eq('id',edit.id)
      if(error) alert(error.message); else { setEdit(null); setForm({nik:'',nama:'',alamat:'Blok G-',no_hp:''}); setShow(false); refresh() }
    } else {
      const { error } = await supabase.from('warga').insert([form])
      if(error) alert(error.message); else { setForm({nik:'',nama:'',alamat:'Blok G-',no_hp:''}); setShow(false); refresh() }
    }
  }
  const startEdit=(w:any)=>{ setEdit(w); setForm({nik:w.nik,nama:w.nama,alamat:w.alamat,no_hp:w.no_hp||''}); setShow(true) }
  const del=async(id:string)=>{ if(!confirm('Hapus?')) return; await supabase.from('warga').delete().eq('id',id); refresh() }
  return (
    <div className="card rounded-[24px] p-6">
      <div className="flex justify-between mb-4"><h3 className="font-bold">Data Warga - {warga.length} orang</h3><button onClick={()=>{setEdit(null); setForm({nik:'',nama:'',alamat:'Blok G-',no_hp:''}); setShow(!show)}} className="bg-white text-black text-[12px] font-bold rounded-full px-5 py-2">+ {show?'Tutup':'Tambah Warga'}</button></div>
      {show && (
        <div className="bg-[#0F1220] border border-[#2A2F4A] rounded-[20px] p-5 mb-5 grid grid-cols-2 gap-3">
          <input value={form.nik} onChange={e=>setForm({...form,nik:e.target.value})} placeholder="NIK" className="input" />
          <input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} placeholder="Nama Lengkap" className="input" />
          <input value={form.alamat} onChange={e=>setForm({...form,alamat:e.target.value})} placeholder="Blok G-..." className="input" />
          <input value={form.no_hp} onChange={e=>setForm({...form,no_hp:e.target.value})} placeholder="No HP WA" className="input" />
          <button onClick={save} className="col-span-2 bg-violet-600 hover:bg-violet-500 text-white rounded-full py-2.5 text-[12px] font-bold">{edit?'Update Warga':'Simpan Warga'}</button>
        </div>
      )}
      <div className="space-y-2 max-h-[500px] overflow-auto">
        {warga.map((w:any)=>(
          <div key={w.id} className="flex justify-between items-center bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3">
            <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[11px] font-bold">{w.nama?.[0]}</div><div><div className="text-[13px] font-medium">{w.nama}</div><div className="text-[10px] text-slate-500">{w.nik} • {w.alamat}</div></div></div>
            <div className="flex items-center gap-2">
              <button onClick={()=>startEdit(w)} className="text-[11px] bg-[#1C2035] border border-[#2A2F4A] rounded-full px-3 py-1 hover:bg-white hover:text-black">✏️ Edit</button>
              <button onClick={()=>del(w.id)} className="text-[11px] text-red-400 hover:text-red-300">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
