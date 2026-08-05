
'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient, supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin(){
  const [warga,setWarga]=useState<any[]>([])
  const [active,setActive]=useState('dashboard')
  const router=useRouter()

  useEffect(()=>{
    const s=createBrowserClient()
    s.auth.getUser().then(({data})=>{ if(!data.user) router.push('/login') })
    supabase.from('warga').select('*').then(({data})=>setWarga(data||[]))
  },[])

  const logout=async()=>{
    const s=createBrowserClient()
    await s.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex bg-[#0F1220]">
      {/* Sidebar */}
      <div className="w-[260px] card border-r border-[#2A2F4A] border-l-0 border-t-0 border-b-0 p-5 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-white text-black font-black flex items-center justify-center">09</div>
          <div><div className="font-bold text-[13px]">RT 09/14</div><div className="text-[10px] text-slate-500">De Naila Village</div></div>
        </div>
        <div className="space-y-1 flex-1">
          {[
            {id:'dashboard',label:'Dashboard',icon:'📊'},
            {id:'warga',label:'Data Warga',icon:'👥'},
            {id:'iuran',label:'Iuran',icon:'💰'},
            {id:'kas',label:'Kas Transparan',icon:'📈'},
            {id:'inventaris',label:'Inventaris',icon:'📦'},
          ].map(m=>(
            <button key={m.id} onClick={()=>setActive(m.id)} className={`w-full text-left px-4 py-3 rounded-full text-[13px] flex items-center gap-3 transition ${active===m.id?'bg-white text-black font-bold':'text-slate-400 hover:bg-[#252A42] hover:text-white'}`}>
              <span>{m.icon}</span>{m.label}
            </button>
          ))}
        </div>
        <button onClick={logout} className="w-full bg-[#252A42] hover:bg-[#2A2F4A] text-[12px] rounded-full py-3">Logout</button>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-2xl font-black">Dashboard Superadmin</h1><p className="text-slate-500 text-[12px]">Kelola warga Blok G secara transparan & digital</p></div>
          <div className="card rounded-full px-5 py-2.5 text-[12px]">👋 Daniel Fajarsyah</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card rounded-[20px] p-5 glow"><div className="text-[11px] text-slate-500">Total Warga</div><div className="text-2xl font-black mt-1">{warga.length}</div><div className="text-[10px] text-emerald-400 mt-2">↑ Blok G terdata</div></div>
          <div className="card rounded-[20px] p-5"><div className="text-[11px] text-slate-500">Total Kas</div><div className="text-2xl font-black mt-1">Rp 12.5jt</div><div className="text-[10px] text-slate-500 mt-2">Saldo terkini</div></div>
          <div className="card rounded-[20px] p-5"><div className="text-[11px] text-slate-500">Iuran Lunas</div><div className="text-2xl font-black mt-1">85%</div><div className="text-[10px] text-violet-400 mt-2">Bulan ini</div></div>
          <div className="card rounded-[20px] p-5"><div className="text-[11px] text-slate-500">Inventaris</div><div className="text-2xl font-black mt-1">12</div><div className="text-[10px] text-slate-500 mt-2">Item aktif</div></div>
        </div>

        {/* Table */}
        <div className="card rounded-[24px] p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold">Data Warga Blok G</h3>
            <div className="text-[11px] bg-[#252A42] rounded-full px-4 py-2">{warga.length} warga</div>
          </div>
          <div className="space-y-2">
            {warga.map((w:any)=>(
              <div key={w.id} className="group flex items-center justify-between bg-[#0F1220] hover:bg-[#15182E] border border-[#2A2F4A]/50 rounded-full px-5 py-3.5 transition">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[11px] font-bold">{w.nama?.[0]}</div>
                  <div><div className="text-[13px] font-medium">{w.nama}</div><div className="text-[10px] text-slate-500">{w.nik}</div></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right"><div className="text-[12px]">{w.alamat || 'Blok G'}</div><div className="text-[10px] text-slate-500">RT 09/14</div></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
              </div>
            ))}
            {warga.length===0 && <div className="text-center text-slate-500 text-[12px] py-8">Belum ada data warga, tambahkan di Supabase tabel warga</div>}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="card rounded-[20px] p-5">
            <h4 className="font-bold text-[13px] mb-3">Grafik Iuran (Dummy Chart)</h4>
            <div className="flex items-end gap-2 h-[60px]">
              {[40,70,45,90,65,80].map((v,i)=><div key={i} className="flex-1 bg-gradient-to-t from-violet-600 to-indigo-400 rounded-t-lg" style={{height: v+'%'}} />)}
            </div>
          </div>
          <div className="card rounded-[20px] p-5">
            <h4 className="font-bold text-[13px] mb-3">Aktivitas Terbaru</h4>
            <div className="space-y-3 text-[11px] text-slate-400">
              <div>• Iuran Bu Widi (G-18) lunas</div>
              <div>• Surat pengantar Pak Harri diproses</div>
              <div>• Inventaris kursi lipat ditambahkan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
