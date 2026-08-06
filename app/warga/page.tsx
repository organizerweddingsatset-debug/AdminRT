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
  const [surat,setSurat]=useState<any[]>([])
  const [pengumuman,setPengumuman]=useState<any[]>([])
  const [kas,setKas]=useState<any[]>([])
  const [inventaris,setInventaris]=useState<any[]>([])
  const [showQRIS,setShowQRIS]=useState<any>(null)
  const [qrisUrl,setQrisUrl]=useState('')
  const [tab,setTab]=useState('dashboard')
  const [suratForm,setSuratForm]=useState({jenis:'Surat Keterangan Domisili', keperluan:''})
  const [profileEdit,setProfileEdit]=useState(false)
  const [profileForm,setProfileForm]=useState<any>({})
  const router=useRouter()

  const load=async(wRow:any)=>{
    const { data: i } = await supabase.from('iuran').select('*').eq('warga_id', wRow.id).order('bulan',{ascending:true})
    setIuran(i||[])
    const { data: s } = await supabase.from('surat').select('*').eq('warga_id', wRow.id).order('created_at',{ascending:false})
    setSurat(s||[])
    const { data: p } = await supabase.from('pengumuman').select('*').order('created_at',{ascending:false}).limit(5)
    setPengumuman(p||[])
    const { data: k } = await supabase.from('kas').select('*').order('tanggal',{ascending:false}).limit(10)
    setKas(k||[])
    const { data: inv } = await supabase.from('inventaris').select('*').order('created_at',{ascending:false})
    setInventaris(inv||[])
    const { data: settings } = await supabase.from('app_settings').select('*')
    settings?.forEach((s:any)=>{ if(s.key==='iuran_wajib') setQrisUrl(s.value?.qris_url||''); if(s.key==='qris' && s.value?.url) setQrisUrl(s.value.url) })
  }

  useEffect(()=>{
    const sess = localStorage.getItem('warga_session')
    if(sess){
      try{ const w = JSON.parse(sess); setWargaData(w); setProfileForm(w); load(w); return }catch(e){}
    }
    const s=createBrowserClient()
    s.auth.getUser().then(async ({data}:any)=>{
      if(data.user){
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
        if(prof){
          const { data: wRow } = await supabase.from('warga').select('*').eq('nik', prof.nik).single()
          if(wRow){ setWargaData(wRow); setProfileForm(wRow); load(wRow); return }
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
    await supabase.from('kas').insert([{tanggal:new Date().toISOString(), jenis:'MASUK', jumlah:nominal, nominal:nominal, keterangan:`Iuran ${wargaData?.nama||''} - ${kuitansi} - CASH`, kategori:'Iuran Wajib'}])
    if(wargaData) load(wargaData)
  }
  const bayarQRIS=async(id:string)=>{
    const kuitansi=`KW-${Date.now()}`
    const { error } = await supabase.from('iuran').update({status:'LUNAS',metode:'QRIS',tanggal_bayar:new Date().toISOString(),kuitansi_no:kuitansi}).eq('id',id)
    if(error){ alert(error.message); return }
    const nominal = iuran.find((x:any)=>x.id===id)?.nominal||25000
    await supabase.from('kas').insert([{tanggal:new Date().toISOString(), jenis:'MASUK', jumlah:nominal, nominal:nominal, keterangan:`Iuran ${wargaData?.nama||''} - ${kuitansi} - QRIS`, kategori:'Iuran Wajib'}])
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
      <div class="kuitansi"><div class="top"></div><div class="stamp">LUNAS</div>
        <div class="header"><div style="display:flex;gap:14px;align-items:center"><div class="logo-icon">09</div><div><h1 style="font-size:18px;font-weight:800">RT 09 / RW 14</h1><p style="font-size:11px;color:#94a3b8">De Naila Village • Gresik</p></div></div><div class="badge">✓ PEMBAYARAN SAH</div></div>
        <div class="content">
          <div style="display:flex;justify-content:space-between;margin-bottom:24px"><div><h2 style="font-size:26px;font-weight:800">KUITANSI IURAN</h2><p style="font-size:12px;color:#64748b">Bukti pembayaran resmi</p></div><div style="text-align:right"><div style="font-size:11px;color:#64748b">No. Kuitansi</div><strong>${i.kuitansi_no}</strong><div style="font-size:11px;color:#64748b;margin-top:8px">Tanggal</div><strong>${tgl}</strong></div></div>
          <div class="grid"><div class="field"><label>Nama Warga</label><div>${wargaData?.nama||''}</div></div><div class="field"><label>Blok</label><div>${wargaData?.alamat||''}</div></div><div class="field"><label>NIK</label><div>${wargaData?.nik||'-'}</div></div><div class="field"><label>Periode</label><div>${bulanNama} ${i.tahun}</div></div></div>
          <div class="amount"><div><div style="font-size:11px;color:#94a3b8">Total Dibayar</div><div class="value">Rp ${i.nominal?.toLocaleString('id-ID')}</div></div><div style="background:white;color:#0F1220;padding:6px 12px;border-radius:999px;font-size:10px;font-weight:800">LUNAS 100%</div></div>
        </div>
      </div><script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`)
  }
  const ajukanSurat=async()=>{
    if(!suratForm.keperluan) return alert('Isi keperluan')
    await supabase.from('surat').insert([{warga_id:wargaData.id, nik:wargaData.nik, jenis:suratForm.jenis, keperluan:suratForm.keperluan, status:'PENDING'}])
    setSuratForm({jenis:'Surat Keterangan Domisili', keperluan:''})
    alert('Surat berhasil diajukan! Tunggu persetujuan RT')
    load(wargaData)
  }
  const saveProfile=async()=>{
    const { error } = await supabase.from('warga').update(profileForm).eq('id', wargaData.id)
    if(error){ alert(error.message); return }
    setWargaData(profileForm)
    localStorage.setItem('warga_session', JSON.stringify(profileForm))
    setProfileEdit(false)
    alert('Profil berhasil disimpan!')
  }
  const logout=async()=>{
    if(!confirm(`Yakin mau logout ${wargaData?.nama}?`)) return
    localStorage.removeItem('warga_session')
    const s=createBrowserClient(); await s.auth.signOut(); router.push('/login')
  }

  if(!wargaData) return <div className="min-h-screen bg-[#0F1220] flex items-center justify-center text-white">Loading...</div>

  const totalTunggakan = iuran.filter((x:any)=>x.status!=='LUNAS').reduce((a,b)=>a+b.nominal,0)
  const totalLunas = iuran.filter((x:any)=>x.status==='LUNAS').length
  const saldoKas = kas.reduce((a,b)=> b.jenis==='MASUK' ? a+b.jumlah : a-b.jumlah, 0)

  const tabs=[
    {id:'dashboard', label:'🏠 Dashboard'},
    {id:'tagihan', label:'💳 Tagihan'},
    {id:'surat', label:'✉️ Surat'},
    {id:'pengumuman', label:'📢 Info'},
    {id:'kas', label:'💰 Kas'},
    {id:'profil', label:'👤 Profil'},
  ]

  return (
    <div className="min-h-screen bg-[#0F1220] text-white p-4 lg:p-6 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white text-black font-black flex items-center justify-center">09</div><div><div className="font-black text-[14px]">RT 09/14 Warga</div><div className="text-[10px] text-slate-500">De Naila Village</div></div></div>
          <button onClick={logout} className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-5 py-2.5 text-[12px] font-bold">🚪 Logout</button>
        </div>

        {/* Hero */}
        <div className="card rounded-[28px] p-6 lg:p-7 glow mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-full blur-2xl"></div>
          <div className="flex gap-4 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-2xl font-black">{wargaData?.nama?.[0]}</div>
            <div className="flex-1">
              <h1 className="text-xl font-black">Halo, {wargaData?.nama} 👋</h1>
              <p className="text-slate-400 text-[12px] mt-1">Blok: {wargaData?.alamat} • NIK: {wargaData?.nik} • {wargaData?.pekerjaan||'Warga'}</p>
              <div className="flex gap-2 mt-3">
                <div className="bg-[#1C2035] border border-[#2A2F4A] rounded-full px-3 py-1 text-[10px]">Tunggakan: <span className="text-red-400 font-bold">Rp {totalTunggakan.toLocaleString('id-ID')}</span></div>
                <div className="bg-[#1C2035] border border-[#2A2F4A] rounded-full px-3 py-1 text-[10px]">Lunas: <span className="text-emerald-400 font-bold">{totalLunas} bulan</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-auto pb-2">
          {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`rounded-full px-4 py-2 text-[12px] font-bold whitespace-nowrap ${tab===t.id?'bg-white text-black':'bg-[#1C2035] border border-[#2A2F4A] text-slate-400'}`}>{t.label}</button>)}
        </div>

        {/* DASHBOARD */}
        {tab==='dashboard' && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="card rounded-[24px] p-6">
                <h3 className="font-bold mb-4">💳 Tagihan Terdekat ({iuran.filter((x:any)=>x.status!=='LUNAS').length})</h3>
                <div className="space-y-2">{iuran.filter((x:any)=>x.status!=='LUNAS').slice(0,3).map((i:any)=><div key={i.id} className="flex justify-between items-center bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3 text-[12px]"><div><div className="font-medium">Bulan {i.bulan}/{i.tahun} - Rp {i.nominal?.toLocaleString()}</div><div className="text-[10px] text-slate-500">{i.status}</div></div><div className="flex gap-2"><button onClick={()=>setShowQRIS(i)} className="bg-[#1C2035] border border-[#2A2F4A] rounded-full px-3 py-1.5 text-[11px]">QRIS</button><button onClick={()=>bayarCash(i.id)} className="bg-white text-black rounded-full px-3 py-1.5 text-[11px] font-bold">Cash</button></div></div>)}</div>
              </div>
              <div className="card rounded-[24px] p-6">
                <h3 className="font-bold mb-3">📢 Pengumuman Terbaru</h3>
                <div className="space-y-3">{pengumuman.map((p:any)=><div key={p.id} className="bg-[#0F1220] border border-[#2A2F4A]/50 rounded-2xl p-4"><div className="flex items-center gap-2 mb-1"><span className="text-[10px] bg-[#252A42] rounded-full px-2 py-0.5">{p.kategori}</span><span className="text-[10px] text-slate-500">{new Date(p.created_at).toLocaleDateString('id-ID')}</span></div><div className="font-bold text-[13px]">{p.judul}</div><div className="text-[12px] text-slate-400 mt-1">{p.isi}</div></div>)}{pengumuman.length===0 && <div className="text-[12px] text-slate-500 text-center py-4">Belum ada pengumuman</div>}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="card rounded-[24px] p-5 bg-gradient-to-br from-violet-600 to-indigo-600 text-white"><div className="text-[11px] opacity-80">SALDO KAS RT</div><div className="text-[22px] font-black mt-1">Rp {saldoKas.toLocaleString('id-ID')}</div><div className="text-[10px] opacity-70 mt-2">Transparan & update realtime</div></div>
              <div className="card rounded-[24px] p-5"><h4 className="font-bold text-[13px] mb-3">📄 Surat Saya ({surat.length})</h4>{surat.slice(0,3).map((s:any)=><div key={s.id} className="text-[11px] bg-[#0F1220] rounded-full px-3 py-2 mb-2 flex justify-between"><span>{s.jenis} - {s.status}</span><span className="text-slate-500">{new Date(s.created_at).toLocaleDateString('id-ID')}</span></div>)}</div>
              <div className="card rounded-[24px] p-5"><h4 className="font-bold text-[13px] mb-3">📦 Inventaris RT</h4>{inventaris.slice(0,4).map((inv:any)=><div key={inv.id} className="text-[11px] flex justify-between py-1"><span>{inv.nama}</span><span className="text-slate-500">{inv.jumlah} unit</span></div>)}</div>
            </div>
          </div>
        )}

        {/* TAGIHAN FULL */}
        {tab==='tagihan' && (
          <div className="card rounded-[24px] p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold">Daftar Tagihan Lengkap - Total Tunggakan Rp {totalTunggakan.toLocaleString('id-ID')}</h3></div>
            <div className="space-y-2">{iuran.map((i:any)=><div key={i.id} className="flex justify-between items-center bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3 text-[12px]"><div><div className="font-medium">Bulan {i.bulan}/{i.tahun} - Rp {i.nominal?.toLocaleString()}</div><div className="text-[10px] text-slate-500">{i.status} • {i.metode||'-'} • {i.kuitansi_no||''}</div></div><div className="flex gap-2">{i.status!=='LUNAS' ? <><button onClick={()=>setShowQRIS(i)} className="bg-[#1C2035] border border-[#2A2F4A] rounded-full px-3 py-1.5 text-[11px]">QRIS</button><button onClick={()=>bayarCash(i.id)} className="bg-white text-black rounded-full px-3 py-1.5 text-[11px] font-bold">Cash</button></> : <button onClick={()=>cetakKuitansi(i)} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-4 py-1.5 text-[11px] font-bold">🧾 Kuitansi Sultan</button>}</div></div>)}</div>
          </div>
        )}

        {/* SURAT */}
        {tab==='surat' && (
          <div className="space-y-4">
            <div className="card rounded-[24px] p-6">
              <h3 className="font-bold mb-4">✉️ Ajukan Surat Keterangan</h3>
              <div className="grid gap-3">
                <select value={suratForm.jenis} onChange={e=>setSuratForm({...suratForm, jenis:e.target.value})} className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-3 text-[13px]">
                  <option>Surat Keterangan Domisili</option><option>Surat Keterangan Tidak Mampu</option><option>Surat Pengantar SKCK</option><option>Surat Keterangan Usaha</option><option>Surat Keterangan Lainnya</option>
                </select>
                <textarea value={suratForm.keperluan} onChange={e=>setSuratForm({...suratForm, keperluan:e.target.value})} placeholder="Keperluan surat (ex: Untuk pengajuan KPR, daftar sekolah anak, dll)" rows={3} className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-2xl px-4 py-3 text-[13px]"></textarea>
                <button onClick={ajukanSurat} className="bg-white text-black rounded-full py-3 text-[13px] font-bold">Kirim Pengajuan Surat</button>
              </div>
            </div>
            <div className="card rounded-[24px] p-6"><h4 className="font-bold mb-3">Riwayat Surat ({surat.length})</h4><div className="space-y-2">{surat.map((s:any)=><div key={s.id} className="flex justify-between items-center bg-[#0F1220] border border-[#2A2F4A]/50 rounded-2xl px-5 py-3 text-[12px]"><div><div className="font-medium">{s.jenis}</div><div className="text-[11px] text-slate-500">{s.keperluan} • {s.status} • {s.no_surat||'Menunggu no surat'}</div></div><div className={`text-[10px] px-3 py-1 rounded-full font-bold ${s.status==='PENDING'?'bg-yellow-500/20 text-yellow-400': s.status==='DISETUJUI'?'bg-emerald-500/20 text-emerald-400':'bg-red-500/20 text-red-400'}`}>{s.status}</div></div>)}</div></div>
          </div>
        )}

        {/* PENGUMUMAN */}
        {tab==='pengumuman' && (
          <div className="card rounded-[24px] p-6"><h3 className="font-bold mb-4">📢 Semua Pengumuman RT 09/14</h3><div className="space-y-3">{pengumuman.map((p:any)=><div key={p.id} className="bg-[#0F1220] border border-[#2A2F4A]/50 rounded-2xl p-5"><div className="flex items-center gap-2 mb-2"><span className="text-[10px] bg-violet-500/20 text-violet-300 rounded-full px-2 py-1">{p.kategori}</span>{p.penting && <span className="text-[10px] bg-red-500 text-white rounded-full px-2 py-1">PENTING</span>}<span className="text-[10px] text-slate-500 ml-auto">{new Date(p.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</span></div><div className="font-bold">{p.judul}</div><div className="text-[13px] text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed">{p.isi}</div></div>)}</div></div>
        )}

        {/* KAS */}
        {tab==='kas' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="card rounded-[20px] p-5"><div className="text-[10px] text-slate-500">TOTAL MASUK</div><div className="text-[18px] font-black text-emerald-400">Rp {kas.filter((k:any)=>k.jenis==='MASUK').reduce((a,b)=>a+(b.jumlah||b.nominal||0),0).toLocaleString('id-ID')}</div></div>
              <div className="card rounded-[20px] p-5"><div className="text-[10px] text-slate-500">TOTAL KELUAR</div><div className="text-[18px] font-black text-red-400">Rp {kas.filter((k:any)=>k.jenis==='KELUAR').reduce((a,b)=>a+(b.jumlah||b.nominal||0),0).toLocaleString('id-ID')}</div></div>
              <div className="card rounded-[20px] p-5 bg-white text-black"><div className="text-[10px]">SALDO</div><div className="text-[18px] font-black">Rp {saldoKas.toLocaleString('id-ID')}</div></div>
            </div>
            <div className="card rounded-[24px] p-6"><h3 className="font-bold mb-4">💰 Transparansi Kas RT 09/14 (10 transaksi terakhir)</h3><div className="space-y-2">{kas.map((k:any)=><div key={k.id} className="flex justify-between items-center bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3"><div><div className="text-[13px] font-medium">{k.kategori||'Kas'} - {k.keterangan} <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${k.jenis==='MASUK'?'bg-emerald-500/20 text-emerald-400':'bg-red-500/20 text-red-400'}`}>{k.jenis}</span></div><div className="text-[10px] text-slate-500">{new Date(k.tanggal).toLocaleDateString('id-ID')} • Rp {(k.jumlah||k.nominal||0).toLocaleString('id-ID')}</div></div></div>)}</div></div>
          </div>
        )}

        {/* PROFIL */}
        {tab==='profil' && (
          <div className="card rounded-[24px] p-6">
            <div className="flex justify-between items-center mb-6"><h3 className="font-bold">👤 Profil Lengkap - Biodata Warga</h3><button onClick={()=> profileEdit ? saveProfile() : setProfileEdit(true)} className={`rounded-full px-5 py-2 text-[12px] font-bold ${profileEdit?'bg-emerald-500 text-white':'bg-white text-black'}`}>{profileEdit?'Simpan Profil':'Edit Profil'}</button></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div><label className="text-[10px] text-slate-500">Nama Lengkap</label><input disabled={!profileEdit} value={profileForm.nama||''} onChange={e=>setProfileForm({...profileForm,nama:e.target.value})} className="w-full mt-1 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[13px] disabled:opacity-60" /></div>
              <div><label className="text-[10px] text-slate-500">NIK (16 digit)</label><input disabled value={profileForm.nik||''} className="w-full mt-1 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[13px] opacity-60" /></div>
              <div><label className="text-[10px] text-slate-500">Tempat, Tanggal Lahir</label><input disabled={!profileEdit} value={profileForm.ttl||profileForm.tempat_lahir||''} onChange={e=>setProfileForm({...profileForm,ttl:e.target.value, tempat_lahir:e.target.value})} placeholder="Gresik, 15 Januari 1990" className="w-full mt-1 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[13px]" /></div>
              <div><label className="text-[10px] text-slate-500">Jenis Kelamin</label><select disabled={!profileEdit} value={profileForm.jenis_kelamin||profileForm.gender||''} onChange={e=>setProfileForm({...profileForm,jenis_kelamin:e.target.value})} className="w-full mt-1 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[13px]"><option value="">Pilih</option><option>Laki-laki</option><option>Perempuan</option></select></div>
              <div><label className="text-[10px] text-slate-500">Blok / Alamat</label><input disabled={!profileEdit} value={profileForm.alamat||''} onChange={e=>setProfileForm({...profileForm,alamat:e.target.value})} className="w-full mt-1 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[13px]" /></div>
              <div><label className="text-[10px] text-slate-500">Pekerjaan</label><input disabled={!profileEdit} value={profileForm.pekerjaan||''} onChange={e=>setProfileForm({...profileForm,pekerjaan:e.target.value})} placeholder="Wiraswasta, PNS, dll" className="w-full mt-1 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[13px]" /></div>
              <div><label className="text-[10px] text-slate-500">No. HP / WA</label><input disabled={!profileEdit} value={profileForm.no_hp||profileForm.hp||''} onChange={e=>setProfileForm({...profileForm,no_hp:e.target.value})} placeholder="08xxxxxxxxxx" className="w-full mt-1 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[13px]" /></div>
              <div><label className="text-[10px] text-slate-500">Status Perkawinan</label><select disabled={!profileEdit} value={profileForm.status_kawin||''} onChange={e=>setProfileForm({...profileForm,status_kawin:e.target.value})} className="w-full mt-1 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[13px]"><option value="">Pilih</option><option>Kawin</option><option>Belum Kawin</option><option>Cerai</option></select></div>
              <div className="lg:col-span-2"><label className="text-[10px] text-slate-500">Agama</label><select disabled={!profileEdit} value={profileForm.agama||''} onChange={e=>setProfileForm({...profileForm,agama:e.target.value})} className="w-full mt-1 bg-[#0F1220] border border-[#2A2F4A] rounded-full px-4 py-2.5 text-[13px]"><option value="">Pilih</option><option>Islam</option><option>Kristen</option><option>Katolik</option><option>Hindu</option><option>Buddha</option><option>Lainnya</option></select></div>
            </div>
            <div className="mt-6 p-4 bg-[#0F1220] border border-[#2A2F4A]/50 rounded-2xl"><div className="text-[11px] text-slate-400">💡 Info: Data ini dipakai untuk persuratan otomatis. Pastikan TTL, Jenis Kelamin, Pekerjaan terisi biar surat keterangan bisa dicetak langsung tanpa edit manual.</div></div>
          </div>
        )}

      </div>
      {showQRIS && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"><div className="card rounded-[24px] p-6 max-w-sm w-full text-center"><h3 className="font-bold mb-2">Bayar QRIS - Bulan {showQRIS.bulan}/{showQRIS.tahun}</h3><div className="bg-white rounded-2xl p-4 mb-3"><img src={getQRISImage(qrisUrl)} className="w-full rounded-xl" alt="QRIS" /></div><div className="flex gap-2"><button onClick={()=>setShowQRIS(null)} className="flex-1 bg-[#252A42] rounded-full py-2.5 text-[12px]">Batal</button><button onClick={()=>bayarQRIS(showQRIS.id)} className="flex-1 bg-white text-black rounded-full py-2.5 text-[12px] font-bold">Lunas</button></div></div></div>)}
    </div>
  )
}
