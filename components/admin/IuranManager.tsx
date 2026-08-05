'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function getQRISImage(qris:string){
  if(!qris) return ''
  if(qris.startsWith('http') || qris.startsWith('data:')) return qris
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qris)}`
}

export default function IuranManager({warga}:{warga:any[]}){
  const [iuran,setIuran]=useState<any[]>([])
  const [config,setConfig]=useState({nominal:15000,tahun:2026})
  const [filter,setFilter]=useState<'all'|'belum'|'lunas'>('belum')
  const [showQRIS,setShowQRIS]=useState<any>(null)
  const [qrisUrl,setQrisUrl]=useState('')

  const load=async()=>{
    const { data } = await supabase.from('iuran').select('*').order('created_at',{ascending:false})
    const merged = (data||[]).map((i:any)=>{
      const w = warga.find((x:any)=> x.id===i.warga_id || x.nik===i.nik)
      return {...i, warga: w || {nama: 'Warga '+ (i.nik||'').slice(-4), alamat: '-'}}
    })
    setIuran(merged)
    const { data: cfg } = await supabase.from('app_settings').select('*').eq('key','iuran_wajib').single()
    if(cfg){ setConfig({nominal: cfg.value?.nominal||15000, tahun: cfg.value?.tahun||2026}); setQrisUrl(cfg.value?.qris_url||'') }
    const { data: qrisCfg } = await supabase.from('app_settings').select('*').eq('key','qris').single()
    if(qrisCfg?.value?.url) setQrisUrl(qrisCfg.value.url)
  }
  useEffect(()=>{load()},[warga])

  const saveConfig=async()=>{
    await supabase.from('app_settings').upsert({key:'iuran_wajib',value:{nominal:config.nominal,tahun:config.tahun,qris_url:qrisUrl}},{onConflict:'key'})
    alert('Config disimpan!')
  }
  const generateTagihan=async()=>{
    const bulanAngka = new Date().getMonth()+1
    const tahun = config.tahun
    if(!confirm(`Generate tagihan bulan ${bulanAngka} tahun ${tahun} Rp ${config.nominal} untuk ${warga.length} warga?`)) return
    let count=0
    for(const w of warga){
      const { data: exist } = await supabase.from('iuran').select('id').eq('nik',w.nik).eq('bulan',bulanAngka).eq('tahun',tahun).maybeSingle()
      if(!exist){
        const { error } = await supabase.from('iuran').insert([{warga_id:w.id, nik:w.nik, bulan:bulanAngka, tahun, nominal:config.nominal, status:'BELUM', jenis:'wajib'}])
        if(!error) count++; else console.error('Insert error', error.message)
      }
    }
    alert(`Berhasil generate ${count} tagihan baru`)
    load()
  }
  const bayarCash=async(id:string)=>{
    const { error } = await supabase.from('iuran').update({status:'LUNAS',metode:'CASH',tanggal_bayar:new Date().toISOString(),kuitansi_no:`KW-${Date.now()}`}).eq('id',id)
    if(error){ alert('Gagal bayar: '+error.message); console.error(error); return }
    load()
  }
  const bayarQRIS=async(id:string)=>{
    const { error } = await supabase.from('iuran').update({status:'LUNAS',metode:'QRIS',tanggal_bayar:new Date().toISOString(),kuitansi_no:`KW-${Date.now()}`}).eq('id',id)
    if(error){ alert('Gagal bayar: '+error.message); return }
    setShowQRIS(null); load()
  }
  const cetakKuitansi=(i:any)=>{
    const w=window.open('','_blank'); if(!w) return
    w.document.write(`<html><body style="font-family:sans-serif;padding:40px"><h2>KUITANSI RT 09/14</h2><p>No: ${i.kuitansi_no}</p><p>Nama: ${i.warga?.nama}</p><p>Blok: ${i.warga?.alamat}</p><p>Bulan: ${i.bulan} ${i.tahun}</p><p>Nominal: Rp ${i.nominal?.toLocaleString()}</p><p>Metode: ${i.metode}</p><p>Status: LUNAS</p><script>window.print()</script></body></html>`)
  }
  const filtered = iuran.filter(i=>{
    const s = (i.status||'').toUpperCase()
    if(filter==='belum') return s!=='LUNAS'
    if(filter==='lunas') return s==='LUNAS'
    return true
  })
  return (
    <div className="space-y-4">
      <div className="card rounded-[24px] p-6">
        <h3 className="font-bold mb-1">Iuran Wajib - {warga.length} warga</h3>
        <p className="text-[11px] text-slate-500 mb-4">Status DB: BELUM / LUNAS (huruf besar) - Bulan 1-12</p>
        <div className="grid grid-cols-4 gap-3">
          <div><label className="text-[10px] text-slate-500">Nominal</label><input type="number" value={config.nominal} onChange={e=>setConfig({...config,nominal:parseInt(e.target.value)||0})} className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px] mt-1" /></div>
          <div><label className="text-[10px] text-slate-500">Tahun</label><input type="number" value={config.tahun} onChange={e=>setConfig({...config,tahun:parseInt(e.target.value)||2026})} className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[12px] mt-1" /></div>
          <div className="col-span-2 flex items-end gap-2"><button onClick={saveConfig} className="bg-violet-600 text-white rounded-full px-5 py-2.5 text-[12px] font-bold">Simpan</button><button onClick={generateTagihan} className="flex-1 bg-white text-black rounded-full py-2.5 text-[13px] font-bold">⚡ Generate Tagihan Semua Warga</button></div>
        </div>
      </div>
      <div className="card rounded-[24px] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Daftar Tagihan ({filtered.length}) - Filter: {filter}</h3>
          <div className="flex gap-2"><button onClick={()=>setFilter('belum')} className={`rounded-full px-4 py-1.5 text-[11px] ${filter==='belum'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Belum Lunas ({iuran.filter(i=>(i.status||'').toUpperCase()!=='LUNAS').length})</button><button onClick={()=>setFilter('lunas')} className={`rounded-full px-4 py-1.5 text-[11px] ${filter==='lunas'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Lunas ({iuran.filter(i=>(i.status||'').toUpperCase()==='LUNAS').length})</button><button onClick={()=>setFilter('all')} className={`rounded-full px-4 py-1.5 text-[11px] ${filter==='all'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Semua</button></div>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-auto">
          {filtered.map((i:any)=>(
            <div key={i.id} className="flex justify-between items-center bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3">
              <div><div className="text-[13px] font-medium">{i.warga?.nama} - {i.warga?.alamat}</div><div className="text-[10px] text-slate-500">{i.bulan}/{i.tahun} • Rp {i.nominal?.toLocaleString()} • {i.status}</div></div>
              <div className="flex gap-2">{(i.status||'').toUpperCase()!=='LUNAS' ? <><button onClick={()=>setShowQRIS(i)} className="bg-[#1C2035] border border-[#2A2F4A] rounded-full px-3 py-1.5 text-[11px]">💳 QRIS</button><button onClick={()=>bayarCash(i.id)} className="bg-white text-black rounded-full px-3 py-1.5 text-[11px] font-bold">Cash</button></> : <button onClick={()=>cetakKuitansi(i)} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-4 py-1.5 text-[11px] font-bold">🧾 Kuitansi</button>}</div>
            </div>
          ))}
        </div>
      </div>
      {showQRIS && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card rounded-[24px] p-6 max-w-sm w-full text-center">
            <h3 className="font-bold mb-1">{showQRIS.warga?.nama}</h3><p className="text-[12px] text-slate-400 mb-3">{showQRIS.bulan}/{showQRIS.tahun} - Rp {showQRIS.nominal?.toLocaleString()}</p>
            <div className="bg-white rounded-2xl p-4 mb-3"><img src={getQRISImage(qrisUrl)} className="w-full rounded-xl" alt="QRIS" /></div>
            <div className="flex gap-2"><button onClick={()=>setShowQRIS(null)} className="flex-1 bg-[#252A42] rounded-full py-2.5 text-[12px]">Batal</button><button onClick={()=>bayarQRIS(showQRIS.id)} className="flex-1 bg-white text-black rounded-full py-2.5 text-[12px] font-bold">Konfirmasi LUNAS</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
