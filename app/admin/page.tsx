'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient, supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import WargaManager from '@/components/admin/WargaManager'
import IuranManager from '@/components/admin/IuranManager'
import SuratManager from '@/components/admin/SuratManager'
import PengumumanManager from '@/components/admin/PengumumanManager'
import InventarisManager from '@/components/admin/InventarisManager'
import Pengaturan from '@/components/admin/Pengaturan'

export default function Admin(){
  const [warga,setWarga]=useState<any[]>([])
  const [active,setActive]=useState('dashboard')
  const router=useRouter()
  const loadWarga=async()=>{ const { data } = await supabase.from('warga').select('*').order('nama'); setWarga(data||[]) }
  useEffect(()=>{
    const s=createBrowserClient()
    s.auth.getUser().then(({data}:any)=>{ if(!data.user) router.push('/login') })
    loadWarga()
  },[])
  const logout=async()=>{ const s=createBrowserClient(); await s.auth.signOut(); localStorage.clear(); router.push('/login') }
  return (
    <div className="min-h-screen flex bg-[#0F1220] text-white">
      <div className="w-[260px] card border-r border-[#2A2F4A] p-5 flex flex-col sticky top-0 h-screen overflow-auto">
        <div className="flex items-center gap-3 mb-8"><div className="w-9 h-9 rounded-xl bg-white text-black font-black flex items-center justify-center">09</div><div><div className="font-bold text-[13px]">RT 09/14</div><div className="text-[10px] text-slate-500">De Naila Village</div></div></div>
        <div className="space-y-1 flex-1">
          {[
            {id:'dashboard',label:'📊 Dashboard'},
            {id:'warga',label:'👥 Data Warga'},
            {id:'iuran',label:'💰 Iuran Wajib'},
            {id:'surat',label:'✉️ Persuratan'},
            {id:'pengumuman',label:'📢 Pengumuman'},
            {id:'inventaris',label:'📦 Inventaris'},
            {id:'kas',label:'📈 Kas Transparan'},
            {id:'pengaturan',label:'⚙️ Pengaturan'},
          ].map(m=>(
            <button key={m.id} onClick={()=>setActive(m.id)} className={`w-full text-left px-4 py-3 rounded-full text-[13px] transition ${active===m.id?'bg-white text-black font-bold':'text-slate-400 hover:bg-[#252A42] hover:text-white'}`}>{m.label}</button>
          ))}
        </div>
        <button onClick={logout} className="w-full bg-[#252A42] hover:bg-red-500/20 hover:text-red-400 text-[12px] rounded-full py-3 transition mt-4">Logout</button>
      </div>
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-2xl font-black">{active==='dashboard'?'Dashboard Superadmin':active}</h1><p className="text-slate-500 text-[12px]">Blok G • {warga.length} warga terdata</p></div>
          <div className="card rounded-full px-5 py-2.5 text-[12px]">👋 Daniel Fajarsyah (Superadmin)</div>
        </div>
        {active==='dashboard' && <div className="grid grid-cols-4 gap-4 mb-6"><div className="card rounded-[20px] p-5 glow"><div className="text-[11px] text-slate-500">Total Warga</div><div className="text-2xl font-black mt-1">{warga.length}</div></div><div className="card rounded-[20px] p-5"><div className="text-[11px] text-slate-500">Iuran Bulan</div><div className="text-2xl font-black mt-1">Wajib</div></div><div className="card rounded-[20px] p-5"><div className="text-[11px] text-slate-500">Surat Masuk</div><div className="text-2xl font-black mt-1">-</div></div><div className="card rounded-[20px] p-5"><div className="text-[11px] text-slate-500">Inventaris</div><div className="text-2xl font-black mt-1">-</div></div></div>}
        {active==='warga' && <WargaManager warga={warga} refresh={loadWarga} />}
        {active==='iuran' && <IuranManager warga={warga} />}
        {active==='surat' && <SuratManager />}
        {active==='pengumuman' && <PengumumanManager />}
        {active==='inventaris' && <InventarisManager />}
        {active==='kas' && <div className="card rounded-[24px] p-6">Kas menyusul - pakai komponen TransparansiKas lama</div>}
        {active==='pengaturan' && <Pengaturan />}
      </div>
    </div>
  )
}
