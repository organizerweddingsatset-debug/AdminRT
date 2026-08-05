'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function getQRISImage(qris:string){
  if(!qris) return ''
  if(qris.startsWith('http') || qris.startsWith('data:')) return qris
  // raw QRIS payload -> render via QR API
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qris)}`
}

export default function Pengaturan(){
  const [wa,setWa]=useState({ketua:'',keamanan:'',template_bayar:'Halo {nama}, iuran {bulan} {tahun} Rp {nominal} sudah lunas. Terima kasih!',template_tagih:'Halo {nama}, tagihan iuran {bulan} {tahun} Rp {nominal} belum lunas. Mohon segera dibayar.',template_ingat:'Reminder: {nama}, iuran {bulan} jatuh tempo 3 hari lagi.'})
  const [qris,setQris]=useState('')
  const load=async()=>{
    const { data } = await supabase.from('app_settings').select('*')
    data?.forEach((d:any)=>{ if(d.key==='whatsapp') setWa(d.value); if(d.key==='qris') setQris(d.value.url||''); if(d.key==='iuran_wajib' && d.value?.qris_url) setQris(d.value.qris_url) })
  }
  useEffect(()=>{load()},[])
  const saveWA=async()=>{ await supabase.from('app_settings').upsert({key:'whatsapp',value:wa},{onConflict:'key'}); alert('WA Config disimpan') }
  const saveQRIS=async()=>{ await supabase.from('app_settings').upsert({key:'qris',value:{url:qris}},{onConflict:'key'}); await supabase.from('app_settings').upsert({key:'iuran_wajib',value:{nominal:20000,tahun:2026,qris_url:qris}},{onConflict:'key'}); alert('QRIS disimpan - sekarang bisa pakai string 0002010... atau URL PNG!') }
  return (
    <div className="space-y-4">
      <div className="card rounded-[24px] p-6">
        <h3 className="font-bold mb-4">Konfigurasi WhatsApp Notifikasi</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] text-slate-500">No WA Ketua RT</label><input value={wa.ketua} onChange={e=>setWa({...wa,ketua:e.target.value})} className="input mt-1" placeholder="62xxx" /></div>
          <div><label className="text-[10px] text-slate-500">No WA Keamanan</label><input value={wa.keamanan} onChange={e=>setWa({...wa,keamanan:e.target.value})} className="input mt-1" placeholder="62xxx" /></div>
          <div className="col-span-2"><label className="text-[10px] text-slate-500">Template Bayar Lunas (gunakan {'{nama} {bulan} {tahun} {nominal}'})</label><textarea value={wa.template_bayar} onChange={e=>setWa({...wa,template_bayar:e.target.value})} className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-3 text-[12px] mt-1 h-20" /></div>
          <div className="col-span-2"><label className="text-[10px] text-slate-500">Template Tagih</label><textarea value={wa.template_tagih} onChange={e=>setWa({...wa,template_tagih:e.target.value})} className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-3 text-[12px] mt-1 h-20" /></div>
          <div className="col-span-2"><label className="text-[10px] text-slate-500">Template Pengingat</label><textarea value={wa.template_ingat} onChange={e=>setWa({...wa,template_ingat:e.target.value})} className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-3 text-[12px] mt-1 h-20" /></div>
        </div>
        <button onClick={saveWA} className="mt-4 bg-violet-600 text-white rounded-full px-6 py-2.5 text-[12px] font-bold">Simpan WA Template</button>
      </div>
      <div className="card rounded-[24px] p-6">
        <h3 className="font-bold mb-4">QRIS RT - Support Raw String & PNG</h3>
        <p className="text-[11px] text-slate-400 mb-3">Bisa paste string QRIS mentah 00020101... atau URL gambar PNG. Sistem auto render jadi QR Code.</p>
        <textarea value={qris} onChange={e=>setQris(e.target.value)} placeholder="Paste 0002010102112661... atau https://.../qris.png" className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-3 text-[11px] h-24 mb-3" />
        {qris && (
          <div className="bg-white rounded-2xl p-4 w-fit">
            <img src={getQRISImage(qris)} className="w-64 h-64 object-contain" alt="QRIS Preview" />
            <div className="text-[10px] text-black mt-2 text-center font-bold">QRIS RT 09/14 De Naila Village</div>
          </div>
        )}
        <button onClick={saveQRIS} className="mt-4 bg-white text-black rounded-full px-6 py-2.5 text-[12px] font-bold">Update QRIS</button>
      </div>
    </div>
  )
}
