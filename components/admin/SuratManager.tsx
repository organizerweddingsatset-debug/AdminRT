
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function SuratManager(){
  const [surat,setSurat]=useState<any[]>([])
  const load=async()=>{ const { data } = await supabase.from('surat').select('*, warga(nama,alamat)').order('created_at',{ascending:false}); setSurat(data||[]) }
  useEffect(()=>{load()},[])
  const approve=async(s:any)=>{
    const nomor = `470/${s.jenis?.slice(0,3).toUpperCase()}/${new Date().getMonth()+1}/${new Date().getFullYear()}/${Math.floor(Math.random()*1000)}`
    await supabase.from('surat').update({status:'approved',nomor_surat:nomor}).eq('id',s.id); load()
  }
  return (
    <div className="card rounded-[24px] p-6">
      <h3 className="font-bold mb-4">Persuratan Warga - {surat.length} pengajuan</h3>
      <div className="space-y-2 max-h-[600px] overflow-auto">
        {surat.map((s:any)=>(
          <div key={s.id} className="bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-4">
            <div className="flex justify-between"><div><div className="text-[13px] font-bold">{s.jenis} - {s.warga?.nama}</div><div className="text-[11px] text-slate-400">No: {s.nomor_surat||'Belum ada'} • {s.keperluan}</div><div className="text-[10px] text-slate-500 mt-1">Penutup: {s.penutup||'-'}</div></div><div className="flex gap-2"><span className={`text-[10px] rounded-full px-3 py-1 h-fit ${s.status==='approved'?'bg-emerald-500/20 text-emerald-400':'bg-yellow-500/20 text-yellow-400'}`}>{s.status}</span>{s.status!=='approved' && <button onClick={()=>approve(s)} className="bg-white text-black rounded-full px-3 py-1 text-[11px] font-bold">Approve + Nomor</button>}</div></div>
          </div>
        ))}
      </div>
    </div>
  )
}
