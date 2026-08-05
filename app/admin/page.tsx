'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import WargaManager from '@/components/admin/WargaManager'
import IuranManager from '@/components/admin/IuranManager'
import SuratManager from '@/components/admin/SuratManager'
import PengumumanManager from '@/components/admin/PengumumanManager'
import InventarisManager from '@/components/admin/InventarisManager'
import KasManager from '@/components/admin/KasManager'

export default function AdminPage(){
  const [warga,setWarga]=useState<any[]>([])
  const [active,setActive]=useState('warga')
  const loadWarga=async()=>{
    const { data } = await supabase.from('warga').select('*').order('nama')
    setWarga(data||[])
  }
  useEffect(()=>{loadWarga()},[])
  const menu=[
    {id:'warga',label:'Warga'},
    {id:'iuran',label:'Iuran Wajib'},
    {id:'surat',label:'Persuratan'},
    {id:'pengumuman',label:'Pengumuman'},
    {id:'inventaris',label:'Inventaris'},
    {id:'kas',label:'Kas Transparan'},
  ]
  return (
    <div className="min-h-screen bg-[#0F1220] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-2 mb-6 overflow-auto">
          {menu.map(m=><button key={m.id} onClick={()=>setActive(m.id)} className={`rounded-full px-5 py-2 text-[12px] font-bold whitespace-nowrap ${active===m.id?'bg-white text-black':'bg-[#1C2035] border border-[#2A2F4A] text-slate-400'}`}>{m.label}</button>)}
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
