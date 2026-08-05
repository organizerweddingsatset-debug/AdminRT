
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function PengumumanManager(){
  const [data,setData]=useState<any[]>([])
  const load=async()=>{ const { data } = await supabase.from('pengumuman').select('*, warga(nama)').order('created_at',{ascending:false}); setData(data||[]) }
  useEffect(()=>{load()},[])
  const approve=async(id:string)=>{ await supabase.from('pengumuman').update({status:'approved'}).eq('id',id); load() }
  return (
    <div className="card rounded-[24px] p-6">
      <h3 className="font-bold mb-4">Pengumuman Warga (Butuh Approval)</h3>
      <div className="space-y-3">
        {data.map((p:any)=>(
          <div key={p.id} className="bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-4">
            <div className="flex justify-between"><div><div className="font-bold text-[13px]">{p.judul}</div><div className="text-[11px] text-slate-400 mt-1">{p.isi}</div><div className="text-[10px] text-slate-500 mt-2">Oleh: {p.warga?.nama||'Warga'} • {p.status}</div></div><div>{p.status!=='approved' && <button onClick={()=>approve(p.id)} className="bg-white text-black rounded-full px-4 py-1.5 text-[11px] font-bold">Approve Posting</button>}</div></div>
          </div>
        ))}
      </div>
    </div>
  )
}
