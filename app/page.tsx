'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import KasCard from '@/components/KasCard'
import ChartKas from '@/components/ChartKas'
import RiwayatTagihan from '@/components/RiwayatTagihan'
import Pengumuman from '@/components/Pengumuman'
import Inventaris from '@/components/Inventaris'

export default function Dashboard(){
  const [kas, setKas] = useState({ total: 0, masuk: 0, keluar: 0 })
  const [chartData, setChartData] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      // Total Kas
      const { data: iuran } = await supabase.from('iuran').select('nominal').eq('status','LUNAS')
      const { data: keluar } = await supabase.from('pengeluaran').select('nominal')
      const totalMasuk = (iuran||[]).reduce((s:any,r:any)=>s+(r.nominal||0),0)
      const totalKeluar = (keluar||[]).reduce((s:any,r:any)=>s+(r.nominal||0),0)
      setKas({ total: totalMasuk-totalKeluar, masuk: totalMasuk, keluar: totalKeluar })

      // Chart per bulan 2026
      const { data: iuranAll } = await supabase.from('iuran').select('bulan,nominal').eq('tahun',2026).eq('status','LUNAS')
      const { data: keluarAll } = await supabase.from('pengeluaran').select('nominal,tanggal').gte('tanggal','2026-01-01')
      // group
      const masukPerBulan = Array(12).fill(0)
      ;(iuranAll||[]).forEach((r:any)=>{ masukPerBulan[(r.bulan||1)-1]+=r.nominal })
      setChartData(masukPerBulan)
      setLoading(false)
    }
    load()
  },[])

  if(loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading RT 09 Dashboard...</div>

  return (
    <div className="min-h-screen bg-[#0F1220]">
      <div className="sticky top-0 z-50 bg-[#0F1220]/80 backdrop-blur-xl border-b border-[#2A2F4A]">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center font-bold text-white">RT</div>
            <div><div className="flex items-center gap-2"><h1 className="font-semibold text-white text-[14px]">Halo, Warga Blok G</h1><span className="text-[10px] bg-[#1a3a2a] text-green-400 border border-green-800 px-2 py-0.5 rounded-full">Supabase Live</span></div><div className="text-[11px] text-slate-400">De Naila Village • Connected to Supabase</div></div>
          </div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span><span className="text-[11px] text-slate-400">Live</span></div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <KasCard kas={kas} />
          <ChartKas data={chartData} />
          <RiwayatTagihan />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Pengumuman />
          <Inventaris />
        </div>
      </div>
    </div>
  )
}
