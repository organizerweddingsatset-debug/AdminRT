
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function Pengaturan(){
  const [wa,setWa]=useState({ketua:'',keamanan:'',template_bayar:'Halo {nama}, iuran {bulan} {tahun} Rp {nominal} sudah lunas. Terima kasih!',template_tagih:'Halo {nama}, tagihan iuran {bulan} {tahun} Rp {nominal} belum lunas. Mohon segera dibayar.',template_ingat:'Reminder: {nama}, iuran {bulan} jatuh tempo 3 hari lagi.'})
  const [qris,setQris]=useState('')
  const load=async()=>{
    const { data } = await supabase.from('app_settings').select('*')
    data?.forEach((d:any)=>{ if(d.key==='whatsapp') setWa(d.value); if(d.key==='qris') setQris(d.value.url||'') })
  }
  useEffect(()=>{load()},[])
  const saveWA=async()=>{ await supabase.from('app_settings').upsert({key:'whatsapp',value:wa},{onConflict:'key'}); alert('WA Config disimpan') }
  const saveQRIS=async()=>{ await supabase.from('app_settings').upsert({key:'qris',value:{url:qris}},{onConflict:'key'}); alert('QRIS disimpan') }
  return (
    <div className="space-y-4">
      <div className="card rounded-[24px] p-6">
        <h3 className="font-bold mb-4">Konfigurasi WhatsApp Notifikasi</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] text-slate-500">No WA Ketua RT</label><input value={wa.ketua} onChange={e=>setWa({...wa,ketua:e.target.value})} className="input mt-1" placeholder="62xxx" /></div>
          <div><label className="text-[10px] text-slate-500">No WA Keamanan</label><input value={wa.keamanan} onChange={e=>setWa({...wa,keamanan:e.target.value})} className="input mt-1" placeholder="62xxx" /></div>
          <label>Template Bayar Lunas (gunakan {'{nama} {bulan} {tahun} {nominal}'})</label>
          <div className="col-span-2"><label className="text-[10px] text-slate-500">Template Tagih</label><textarea value={wa.template_tagih} onChange={e=>setWa({...wa,template_tagih:e.target.value})} className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-3 text-[12px] mt-1 h-20" /></div>
          <div className="col-span-2"><label className="text-[10px] text-slate-500">Template Pengingat</label><textarea value={wa.template_ingat} onChange={e=>setWa({...wa,template_ingat:e.target.value})} className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-3 text-[12px] mt-1 h-20" /></div>
        </div>
        <button onClick={saveWA} className="mt-4 bg-violet-600 text-white rounded-full px-6 py-2.5 text-[12px] font-bold">Simpan WA Template</button>
      </div>
      <div className="card rounded-[24px] p-6">
        <h3 className="font-bold mb-4">QRIS RT</h3>
        <input value={qris} onChange={e=>setQris(e.target.value)} placeholder="https://.../qris.png atau upload ke storage" className="input mb-3" />
        {qris && <img src={qris} className="w-64 rounded-xl border border-[#2A2F4A]" />}
        <button onClick={saveQRIS} className="mt-3 bg-white text-black rounded-full px-6 py-2.5 text-[12px] font-bold">Update QRIS</button>
      </div>
    </div>
  )
}
