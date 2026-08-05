'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
export default function Admin(){
  const [kas,setKas]=useState({total:0,masuk:0,keluar:0})
  const [warga,setWarga]=useState<any[]>([])
  const supabase = createClient()
  useEffect(()=>{
    supabase.from('iuran').select('nominal').eq('status','LUNAS').then(({data})=>{
      supabase.from('pengeluaran').select('nominal').then(({data:kel})=>{
        const m=(data||[]).reduce((s:any,r:any)=>s+r.nominal,0)
        const k=(kel||[]).reduce((s:any,r:any)=>s+r.nominal,0)
        setKas({total:m-k,masuk:m,keluar:k})
      })
    })
    supabase.from('warga').select('*').then(({data})=>setWarga(data||[]))
  },[])
  return (
    <div className="min-h-screen bg-[#0F1220] p-6 max-w-[1400px] mx-auto">
      <h1 className="text-white font-bold text-[20px] mb-1">Superadmin RT 09/14</h1>
      <p className="text-slate-400 text-[12px] mb-6">Kelola semua warga, kas, tunggakan</p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1C2035] border border-[#2A2F4A] rounded-2xl p-4"><div className="text-slate-400 text-[11px]">Total Kas</div><div className="text-white font-mono text-[18px]">Rp {kas.total.toLocaleString()}</div></div>
        <div className="bg-[#1C2035] border border-[#2A2F4A] rounded-2xl p-4"><div className="text-slate-400 text-[11px]">Pemasukan</div><div className="text-white font-mono text-[18px]">Rp {kas.masuk.toLocaleString()}</div></div>
        <div className="bg-[#1C2035] border border-[#2A2F4A] rounded-2xl p-4"><div className="text-slate-400 text-[11px]">Pengeluaran</div><div className="text-white font-mono text-[18px]">Rp {kas.keluar.toLocaleString()}</div></div>
      </div>
      <div className="bg-[#1C2035] border border-[#2A2F4A] rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4">Daftar Warga ({warga.length})</h2>
        <table className="w-full text-[12px]"><thead className="text-slate-500 text-[10px]"><tr><th className="text-left">NIK</th><th className="text-left">Nama</th><th>Blok</th><th>HP</th></tr></thead><tbody>{warga.map((w:any)=><tr key={w.id} className="border-t border-[#2A2F4A]"><td className="py-2 text-white font-mono">{w.nik}</td><td className="text-white">{w.nama}</td><td className="text-slate-400">{w.alamat}</td><td className="text-slate-400">{w.nohp}</td></tr>)}</tbody></table>
      </div>
    </div>
  )
}
