'use client'
import { useEffect, useState } from 'react'
import { supabase, createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import WargaManager from '@/components/admin/WargaManager'
import IuranManager from '@/components/admin/IuranManager'
import SuratManager from '@/components/admin/SuratManager'
import PengumumanManager from '@/components/admin/PengumumanManager'
import InventarisManager from '@/components/admin/InventarisManager'
import KasManager from '@/components/admin/KasManager'

export default function AdminPage(){
  const [warga,setWarga]=useState<any[]>([])
  const [active,setActive]=useState('warga')
  const router=useRouter()
  const loadWarga=async()=>{
    const { data } = await supabase.from('warga').select('*').order('nama')
    setWarga(data||[])
  }
  useEffect(()=>{loadWarga()},[])
  const logout=async()=>{
    if(!confirm('Yakin mau logout Admin?')) return
    localStorage.removeItem('warga_session')
    localStorage.removeItem('admin_session')
    const s=createBrowserClient()
    await s.auth.signOut()
    router.push('/login')
  }
  const menu=[
    {id:'warga',label:'Warga'},
    {id:'iuran',label:'Iuran Wajib'},
    {id:'surat',label:'Persuratan'},
    {id:'pengumuman',label:'Pengumuman'},
    {id:'inventaris',label:'Inventaris'},
    {id:'kas',label:'Kas Transparan'},
  ]
  return (
    <div className="min-h-screen bg-[#0F1220] text-white p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black font-black flex items-center justify-center">09</div>
            <div><div className="font-black text-[14px]">RT 09/14 ADMIN</div><div className="text-[10px] text-slate-500">De Naila Village - Gresik</div></div>
          </div>
          <button onClick={logout} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-full px-5 py-2.5 text-[12px] font-bold">🚪 Logout</button>
        </div>
        <div className="flex gap-2 mb-6 overflow-auto pb-2">
          {menu.map(m=><button key={m.id} onClick={()=>setActive(m.id)} className={`rounded-full px-5 py-2.5 text-[12px] font-bold whitespace-nowrap transition ${active===m.id?'bg-white text-black':'bg-[#1C2035] border border-[#2A2F4A] text-slate-400 hover:bg-[#252A42]'}`}>{m.label}</button>)}
        </div>
        {active==='warga' && <WargaManager warga={warga} refresh={loadWarga} />}
        {active==='iuran' && <IuranManager warga={warga} />}
        {active==='surat' && <SuratManager warga={warga} />}
        {active==='pengumuman' && <PengumumanManager />}
        {active==='inventaris' && <InventarisManager warga={warga} />}
        {active==='kas' && <KasManager />}
      </div>
    </div>
  )
}
