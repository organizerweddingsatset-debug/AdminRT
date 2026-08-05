'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient, supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function getQRISImage(qris:string){
  if(!qris) return ''
  if(qris.startsWith('http') || qris.startsWith('data:')) return qris
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qris)}`
}

export default function WargaPage(){
  const [wargaData,setWargaData]=useState<any>(null)
  const [iuran,setIuran]=useState<any[]>([])
  const [showQRIS,setShowQRIS]=useState<any>(null)
  const [qrisUrl,setQrisUrl]=useState('')
  const router=useRouter()
  const load=async(wRow:any)=>{
    const { data } = await supabase.from('iuran').select('*').eq('warga_id', wRow.id).order('bulan',{ascending:true})
    setIuran(data||[])
    const { data: settings } = await supabase.from('app_settings').select('*')
    settings?.forEach((s:any)=>{ if(s.key==='iuran_wajib') setQrisUrl(s.value?.qris_url||''); if(s.key==='qris' && s.value?.url) setQrisUrl(s.value.url) })
  }
  useEffect(()=>{
    const sess = localStorage.getItem('warga_session')
    if(sess){
      try{ const w = JSON.parse(sess); setWargaData(w); load(w); return }catch(e){}
    }
    const s=createBrowserClient()
    s.auth.getUser().then(async ({data}:any)=>{
      if(data.user){
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
        if(prof){
          const { data: wRow } = await supabase.from('warga').select('*').eq('nik', prof.nik).single()
          if(wRow){ setWargaData(wRow); load(wRow); return }
        }
      }
      router.push('/login')
    })
  },[])
  const bayarCash=async(id:string)=>{
    const kuitansi=`KW-${Date.now()}`
    const { error } = await supabase.from('iuran').update({status:'LUNAS',metode:'CASH',tanggal_bayar:new Date().toISOString(),kuitansi_no:kuitansi}).eq('id',id)
    if(error){ alert(error.message); return }
    const nominal = iuran.find((x:any)=>x.id===id)?.nominal||25000
    await supabase.from('kas').insert([{tanggal:new Date().toISOString(), jenis:'MASUK', jumlah:nominal, nominal:nominal, keterangan:`Iuran ${wargaData?.nama||''} - ${kuitansi} - CASH`}])
    if(wargaData) load(wargaData)
  }
  const bayarQRIS=async(id:string)=>{
    const kuitansi=`KW-${Date.now()}`
    const { error } = await supabase.from('iuran').update({status:'LUNAS',metode:'QRIS',tanggal_bayar:new Date().toISOString(),kuitansi_no:kuitansi}).eq('id',id)
    if(error){ alert(error.message); return }
    const nominal = iuran.find((x:any)=>x.id===id)?.nominal||25000
    await supabase.from('kas').insert([{tanggal:new Date().toISOString(), jenis:'MASUK', jumlah:nominal, nominal:nominal, keterangan:`Iuran ${wargaData?.nama||''} - ${kuitansi} - QRIS`}])
    setShowQRIS(null); if(wargaData) load(wargaData)
  }
  const cetakKuitansi=(i:any)=>{
    const w=window.open('','_blank'); if(!w) return
    const tgl = new Date(i.tanggal_bayar || Date.now()).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
    const bulanList=['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
    const bulanNama = bulanList[i.bulan] || i.bulan
    w.document.write(`<!DOCTYPE html><html><head><title>Kuitansi ${i.kuitansi_no}</title><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"><style>
      *{margin:0;padding:0;box-sizing:border-box;font-family:'Plus Jakarta Sans',sans-serif}
      body{background:#f5f5f7;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
      .kuitansi{width:720px;background:white;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.15);position:relative}
      .top{height:6px;background:linear-gradient(90deg,#7c3aed,#4f46e5,#06b6d4)}
      .header{background:#0F1220;color:white;padding:28px 36px;display:flex;justify-content:space-between;align-items:center}
      .logo{display:flex;gap:14px;align-items:center}
      .logo-icon{width:48px;height:48px;background:white;color:black;border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px}
      .badge{background:linear-gradient(135deg,#22c55e,#16a34a);color:white;padding:8px 16px;border-radius:999px;font-size:11px;font-weight:700}
      .content{padding:32px 36px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px}
      .field{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 18px}
      .field label{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700}
      .field div{font-size:14px;font-weight:600;color:#0F1220;margin-top:4px}
      .amount{background:linear-gradient(135deg,#0F1220,#1e293b);color:white;border-radius:16px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center}
      .amount .value{font-size:28px;font-weight:800}
      .stamp{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-18deg);border:4px solid #22c55e;color:#22c55e;font-weight:800;font-size:32px;padding:8px 24px;border-radius:12px;opacity:0.15}
    </style></head><body>
      <div class="kuitansi">
        <div class="top"></div>
        <div class="stamp">LUNAS</div>
        <div class="header"><div class="logo"><div class="logo-icon">09</div><div><h1 style="font-size:18px;font-weight:800">RT 09 / RW 14</h1><p style="font-size:11px;color:#94a3b8">De Naila Village • Gresik</p></div></div><div class="badge">✓ PEMBAYARAN SAH</div></div>
        <div class="content">
          <div style="display:flex;justify-content:space-between;margin-bottom:24px"><div><h2 style="font-size:26px;font-weight:800">KUITANSI IURAN</h2><p style="font-size:12px;color:#64748b">Bukti pembayaran resmi</p></div><div style="text-align:right"><div style="font-size:11px;color:#64748b">No. Kuitansi</div><strong>${i.kuitansi_no}</strong><div style="font-size:11px;color:#64748b;margin-top:8px">Tanggal</div><strong>${tgl}</strong></div></div>
          <div class="grid">
            <div class="field"><label>Nama Warga</label><div>${i.warga?.nama||i.nama||''}</div></div>
            <div class="field"><label>Blok</label><div>${i.warga?.alamat||''}</div></div>
            <div class="field"><label>NIK</label><div>${i.warga?.nik||i.nik||'-'}</div></div>
            <div class="field"><label>Periode</label><div>${bulanNama} ${i.tahun}</div></div>
          </div>
          <div class="amount"><div><div style="font-size:11px;color:#94a3b8">Total Dibayar</div><div class="value">Rp ${i.nominal?.toLocaleString('id-ID')}</div></div><div style="background:white;color:#0F1220;padding:6px 12px;border-radius:999px;font-size:10px;font-weight:800">LUNAS 100%</div></div>
        </div>
      </div>
      <script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
    </body></html>`)
  }
  const logout=async()=>{
    if(!confirm(`Yakin mau logout ${wargaData?.nama}?`)) return
    localStorage.removeItem('warga_session')
    const s=createBrowserClient(); await s.auth.signOut(); router.push('/login')
  }
  if(!wargaData) return <div className="min-h-screen bg-[#0F1220] flex items-center justify-center text-white">Loading...</div>
  return (
    <div className="min-h-screen bg-[#0F1220] text-white p-4 lg:p-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white text-black font-black flex items-center justify-center">09</div><div><div className="font-bold text-[13px]">RT 09/14</div><div className="text-[10px] text-slate-500">Warga Panel</div></div></div>
          <button onClick={logout} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-full px-5 py-2.5 text-[12px] font-bold">🚪 Logout</button>
        </div>
        <div className="card rounded-[28px] p-7 glow mb-6"><div className="flex gap-4"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xl font-black">{wargaData?.nama?.[0]}</div><div><h1 className="text-xl font-black">Halo, {wargaData?.nama}</h1><p className="text-slate-400 text-[12px] mt-1">Blok: {wargaData?.alamat}</p></div></div></div>
        <div className="card rounded-[24px] p-6"><h3 className="font-bold mb-4">Tagihan Saya</h3><div className="space-y-2">{iuran.map((i:any)=>(<div key={i.id} className="flex justify-between items-center bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3 text-[12px]"><div><div className="font-medium">Bulan {i.bulan}/{i.tahun} - Rp {i.nominal?.toLocaleString()}</div><div className="text-[10px] text-slate-500">{i.status}</div></div><div className="flex gap-2">{i.status!=='LUNAS' ? <><button onClick={()=>setShowQRIS(i)} className="bg-[#1C2035] border border-[#2A2F4A] rounded-full px-3 py-1.5 text-[11px]">QRIS</button><button onClick={()=>bayarCash(i.id)} className="bg-white text-black rounded-full px-3 py-1.5 text-[11px] font-bold">Cash</button></> : <button onClick={()=>cetakKuitansi({...i,warga:wargaData})} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-4 py-1.5 text-[11px] font-bold">🧾 Kuitansi Sultan</button>}</div></div>))}</div></div>
      </div>
      {showQRIS && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"><div className="card rounded-[24px] p-6 max-w-sm w-full text-center"><h3 className="font-bold mb-2">Bayar QRIS - Bulan {showQRIS.bulan}/{showQRIS.tahun}</h3><div className="bg-white rounded-2xl p-4 mb-3"><img src={getQRISImage(qrisUrl)} className="w-full rounded-xl" alt="QRIS" /></div><div className="flex gap-2"><button onClick={()=>setShowQRIS(null)} className="flex-1 bg-[#252A42] rounded-full py-2.5 text-[12px]">Batal</button><button onClick={()=>bayarQRIS(showQRIS.id)} className="flex-1 bg-white text-black rounded-full py-2.5 text-[12px] font-bold">Lunas</button></div></div></div>)}
    </div>
  )
}
