'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function SuratManager({warga}:{warga:any[]}){
  const [list,setList]=useState<any[]>([])
  const [filter,setFilter]=useState('PENDING')
  const load=async()=>{
    const { data } = await supabase.from('surat').select('*').order('created_at',{ascending:false})
    const merged=(data||[]).map((s:any)=>{ const w=warga.find((x:any)=>x.id===s.warga_id||x.nik===s.nik); return {...s,warga:w}})
    setList(merged)
  }
  useEffect(()=>{load()},[warga])
  const updateStatus=async(id:string,status:string)=>{
    const no_surat = status==='DISETUJUI' ? `09/14/${new Date().getMonth()+1}/${new Date().getFullYear()}/${id.slice(0,4).toUpperCase()}` : null
    const upd:any={status}
    if(no_surat) upd.no_surat=no_surat
    await supabase.from('surat').update(upd).eq('id',id)
    load()
  }
  const cetakSurat=(s:any)=>{
    const w=window.open('','_blank'); if(!w) return
    const tgl=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
    w.document.write(`<html><head><style>body{padding:40px;max-width:700px;margin:auto;font-family:sans-serif} .kop{border-bottom:3px double black;padding-bottom:16px;text-align:center} .kop h1{font-size:18px;font-weight:800} .isi{margin-top:24px;line-height:1.8;font-size:14px}</style></head><body><div class="kop"><h1>RT 09 / RW 14 - De Naila Village</h1></div><div style="text-align:center;margin-top:20px"><h2 style="text-decoration:underline">SURAT KETERANGAN ${s.jenis||'WARGA'}</h2><p>No: ${s.no_surat||'--'}</p></div><div class="isi"><p>Yang bertanda tangan di bawah ini menerangkan:</p><p>Nama: <b>${s.warga?.nama||''}</b><br>NIK: ${s.warga?.nik||s.nik}<br>Blok: ${s.warga?.alamat||''}<br>Keperluan: ${s.keperluan||'-'}</p><p>Adalah warga RT 09/14.</p><div style="text-align:right;margin-top:48px">Gresik, ${tgl}<br><br><br><b>Ketua RT 09/14</b></div></div><script>window.print()</script></body></html>`)
  }
  const filtered=list.filter(x=> filter==='ALL' ? true : x.status===filter)
  return (<div className="space-y-4"><div className="card rounded-[24px] p-6 flex justify-between"><h3 className="font-bold">Persuratan - {list.length}</h3><div className="flex gap-2"><button onClick={()=>setFilter('PENDING')} className={`rounded-full px-4 py-1.5 text-[11px] ${filter==='PENDING'?'bg-white text-black':'bg-[#252A42] text-slate-400'}`}>PENDING</button><button onClick={()=>setFilter('DISETUJUI')} className={`rounded-full px-4 py-1.5 text-[11px] ${filter==='DISETUJUI'?'bg-white text-black':'bg-[#252A42] text-slate-400'}`}>DISETUJUI</button><button onClick={()=>setFilter('ALL')} className={`rounded-full px-4 py-1.5 text-[11px] ${filter==='ALL'?'bg-white text-black':'bg-[#252A42] text-slate-400'}`}>Semua</button></div></div><div className="space-y-2">{filtered.map((s:any)=><div key={s.id} className="card rounded-[20px] p-5 flex justify-between items-center"><div><div className="font-medium text-[13px]">{s.warga?.nama||s.nik} - {s.jenis}</div><div className="text-[11px] text-slate-500">{s.keperluan} • {s.status}</div></div><div className="flex gap-2">{s.status==='PENDING' && <><button onClick={()=>updateStatus(s.id,'DISETUJUI')} className="bg-emerald-500 text-white rounded-full px-4 py-1.5 text-[11px] font-bold">Setujui</button><button onClick={()=>updateStatus(s.id,'DITOLAK')} className="bg-red-500/20 text-red-400 rounded-full px-3 py-1.5 text-[11px]">Tolak</button></>}{s.status==='DISETUJUI' && <button onClick={()=>cetakSurat(s)} className="bg-white text-black rounded-full px-4 py-1.5 text-[11px] font-bold">Cetak</button>}</div></div>)}</div></div>)
}
