'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function WargaManager({warga, refresh}:{warga:any[], refresh:()=>void}){
  const [show,setShow]=useState(false)
  const [edit,setEdit]=useState<any>(null)
  const [form,setForm]=useState({nik:'',nama:'',alamat:'Blok G-',no_hp:''})
  const save=async()=>{
    if(!form.nik || !form.nama) return alert('Lengkapi NIK & Nama')
    try{
      if(edit){
        const payload:any = {nik:form.nik, nama:form.nama, alamat:form.alamat}
        // coba pakai no_hp, kalau error karena kolom nggak ada, coba tanpa no_hp
        let { error } = await supabase.from('warga').update({...payload, no_hp:form.no_hp}).eq('id',edit.id)
        if(error && error.message.includes('no_hp')){
          const res = await supabase.from('warga').update(payload).eq('id',edit.id)
          if(res.error) throw res.error
        } else if(error) throw error
        setEdit(null); setForm({nik:'',nama:'',alamat:'Blok G-',no_hp:''}); setShow(false); refresh()
      } else {
        const payload:any = {nik:form.nik, nama:form.nama, alamat:form.alamat}
        let { error } = await supabase.from('warga').insert([{...payload, no_hp:form.no_hp}])
        if(error && error.message.includes('no_hp')){
          const res = await supabase.from('warga').insert([payload])
          if(res.error) throw res.error
        } else if(error) throw error
        setForm({nik:'',nama:'',alamat:'Blok G-',no_hp:''}); setShow(false); refresh()
      }
    }catch(e:any){
      alert('Error: '+e.message + '\n\nCoba jalankan FIX_SQL.sql di Supabase: ALTER TABLE warga ADD COLUMN no_hp text;')
    }
  }
  const startEdit=(w:any)=>{ setEdit(w); setForm({nik:w.nik,nama:w.nama,alamat:w.alamat,no_hp:w.no_hp||''}); setShow(true) }
  const del=async(id:string)=>{ if(!confirm('Hapus warga ini?')) return; await supabase.from('warga').delete().eq('id',id); refresh() }
  return (
    <div className="card rounded-[24px] p-6">
      <div className="flex justify-between mb-4"><h3 className="font-bold">Data Warga - {warga.length} orang</h3><button onClick={()=>{setEdit(null); setForm({nik:'',nama:'',alamat:'Blok G-',no_hp:''}); setShow(!show)}} className="bg-white text-black text-[12px] font-bold rounded-full px-5 py-2">+ {show?'Tutup':'Tambah Warga'}</button></div>
      {show && (
        <div className="bg-[#0F1220] border border-[#2A2F4A] rounded-[20px] p-5 mb-5 grid grid-cols-2 gap-3">
          <input value={form.nik} onChange={e=>setForm({...form,nik:e.target.value})} placeholder="NIK" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" />
          <input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} placeholder="Nama Lengkap (untuk login)" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" />
          <input value={form.alamat} onChange={e=>setForm({...form,alamat:e.target.value})} placeholder="Blok G-... (jadi password warga)" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" />
          <input value={form.no_hp} onChange={e=>setForm({...form,no_hp:e.target.value})} placeholder="No HP WA (opsional)" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px]" />
          <button onClick={save} className="col-span-2 bg-violet-600 hover:bg-violet-500 text-white rounded-full py-2.5 text-[12px] font-bold">{edit?'Update Warga':'Simpan Warga (Nama=Username, Blok=Password)'}</button>
        </div>
      )}
      <div className="space-y-2 max-h-[500px] overflow-auto">
        {warga.map((w:any)=>(
          <div key={w.id} className="flex justify-between items-center bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3">
            <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[11px] font-bold">{w.nama?.[0]}</div><div><div className="text-[13px] font-medium">{w.nama} - {w.alamat}</div><div className="text-[10px] text-slate-500">NIK: {w.nik} • Login: {w.nama} / {w.alamat} • HP: {w.no_hp||'-'}</div></div></div>
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
