'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function RiwayatTagihan(){
  const [rows,setRows]=useState<any[]>([])
  useEffect(()=>{ supabase.from('iuran').select('*, warga(nama,alamat)').eq('tahun',2026).order('bulan').limit(10).then(({data})=>setRows(data||[])) },[])
  return (
    <div className="card-dark p-5">
      <div className="flex justify-between mb-4"><h2 className="font-semibold text-white text-[14px]">Riwayat Tagihan Live</h2><span className="text-[11px] bg-[#1C2035] border px-3 py-1 rounded-full">Supabase</span></div>
      <table className="w-full text-[12px]"><thead className="text-[10px] text-slate-500"><tr><th className="text-left">Nama</th><th>Bulan</th><th>Nominal</th><th>Status</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i} className="border-t border-[#1e233a]"><td className="py-3 text-white">{(r.warga as any)?.nama || r.nik}</td><td className="text-slate-400">{r.bulan}/2026</td><td className="text-white">Rp {r.nominal}</td><td><span className={`${r.status=='LUNAS'?'badge-lunas':'badge-belum'} text-[10px] px-2 py-1 rounded-full`}>{r.status}</span></td></tr>)}</tbody></table>
    </div>
  )
}
