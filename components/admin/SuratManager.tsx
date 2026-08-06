'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SuratManager({warga}:{warga:any[]}){
  const [surat,setSurat]=useState<any[]>([])
  const [filter,setFilter]=useState<'all'|'PENDING'|'DISETUJUI'|'DITOLAK'>('PENDING')

  const load=async()=>{
    const { data } = await supabase.from('surat').select('*').order('created_at',{ascending:false})
    const merged = (data||[]).map((s:any)=>{
      const w = warga.find((x:any)=> x.id===s.warga_id || x.nik===s.nik)
      return {...s, warga: w || {nama: s.nik, alamat:'-'}}
    })
    setSurat(merged)
  }
  useEffect(()=>{load()},[warga])

  const updateStatus=async(id:string, status:string)=>{
    let no_surat = ''
    if(status==='DISETUJUI'){
      no_surat = prompt('Masukkan No. Surat (ex: 140/09/14/V/2026):', `140/09/14/${new Date().getMonth()+1}/${new Date().getFullYear()}`) || ''
      if(!no_surat) return
    }
    await supabase.from('surat').update({status, no_surat: no_surat||null, tanggal_disetujui: status==='DISETUJUI'? new Date().toISOString(): null}).eq('id',id)
    load()
  }

  const cetakSurat=(s:any)=>{
    const w=window.open('','_blank'); if(!w) return
    const tgl = new Date().toLocaleDateString('id-ID',{day:'numeric', month:'long', year:'numeric'})
    const tglLahir = s.warga?.ttl || s.warga?.tempat_lahir || '-'
    const jk = s.warga?.jenis_kelamin || s.warga?.gender || '-'
    const pekerjaan = s.warga?.pekerjaan || '-'
    const alamat = s.warga?.alamat || '-'
    const nama = s.warga?.nama || s.nik
    w.document.write(`<!DOCTYPE html><html><head><title>${s.jenis} - ${nama}</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Times+New+Roman&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{background:white;font-family:'Times New Roman',serif;color:#000;padding:40px}
      .kop{border-bottom:3px double #000;padding-bottom:15px;display:flex;align-items:center;gap:20px;text-align:center;justify-content:center}
      .kop img{width:70px;height:70px}
      .kop-text{flex:1}
      .kop h1{font-size:16px;font-weight:700;letter-spacing:1px}
      .kop h2{font-size:14px}
      .kop p{font-size:11px}
      .content{margin-top:30px;padding:0 20px;line-height:1.8;font-size:14px}
      .title{text-align:center;margin-bottom:25px}
      .title h3{text-decoration:underline;font-size:16px}
      .title p{font-size:14px;margin-top:5px}
      table{margin:15px 0}
      td{padding:3px 8px;font-size:14px;vertical-align:top}
      .ttd{margin-top:60px;text-align:right;padding-right:40px}
      .no-surat{margin-bottom:20px}
    </style></head><body>
      <div class="kop">
        <div class="kop-text">
          <h1>RUKUN TETANGGA 09 / RUKUN WARGA 14</h1>
          <h2>Perumahan De Naila Village</h2>
          <p>Desa Kedungbunder, Kec. Gresik, Kab. Gresik - 61121 • Email: rt09rw14.denaila@gmail.com</p>
        </div>
      </div>
      <div class="content">
        <div class="no-surat">No: ${s.no_surat||'.../09/14/...'}<br>Gresik, ${tgl}</div>
        <div class="title"><h3>${s.jenis?.toUpperCase()}</h3><p>Nomor: ${s.no_surat||'-'}</p></div>
        <p>Yang bertanda tangan di bawah ini Ketua RT 09/RW 14 Perumahan De Naila Village menerangkan bahwa:</p>
        <table>
          <tr><td>Nama</td><td>: <b>${nama}</b></td></tr>
          <tr><td>NIK</td><td>: ${s.warga?.nik||s.nik}</td></tr>
          <tr><td>Tempat, Tgl Lahir</td><td>: ${tglLahir}</td></tr>
          <tr><td>Jenis Kelamin</td><td>: ${jk}</td></tr>
          <tr><td>Pekerjaan</td><td>: ${pekerjaan}</td></tr>
          <tr><td>Alamat</td><td>: ${alamat}</td></tr>
        </table>
        <p style="margin-top:15px">Adalah benar warga kami yang berdomisili di alamat tersebut di atas.</p>
        <p>Surat keterangan ini dibuat untuk keperluan: <b>${s.keperluan}</b></p>
        <p style="margin-top:15px">Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
        <div class="ttd">
          <p>Mengetahui,</p>
          <p>Ketua RT 09 / RW 14</p>
          <br><br><br><br>
          <p><b><u>(........................)</u></b></p>
        </div>
      </div>
      <script>window.onload=()=>setTimeout(()=>window.print(),500)</script>
    </body></html>`)
  }

  const filtered = surat.filter(s=> filter==='all' ? true : s.status===filter)
  const pendingCount = surat.filter(s=>s.status==='PENDING').length

  return (
    <div className="space-y-4">
      <div className="card rounded-[24px] p-6">
        <div className="flex justify-between items-center">
          <div><h3 className="font-bold text-[16px]">✉️ Persuratan Warga {pendingCount>0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-2 animate-pulse">{pendingCount} PENDING</span>}</h3><p className="text-[12px] text-slate-500">Kelola pengajuan surat domisili, SKCK, usaha dll</p></div>
          <button onClick={load} className="bg-[#1C2035] border border-[#2A2F4A] rounded-full px-4 py-2 text-[11px]">🔄 Refresh</button>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={()=>setFilter('PENDING')} className={`rounded-full px-4 py-1.5 text-[11px] font-bold ${filter==='PENDING'?'bg-yellow-500 text-black':'bg-[#252A42] text-slate-400'}`}>PENDING ({surat.filter(s=>s.status==='PENDING').length})</button>
          <button onClick={()=>setFilter('DISETUJUI')} className={`rounded-full px-4 py-1.5 text-[11px] font-bold ${filter==='DISETUJUI'?'bg-emerald-500 text-black':'bg-[#252A42] text-slate-400'}`}>DISETUJUI</button>
          <button onClick={()=>setFilter('DITOLAK')} className={`rounded-full px-4 py-1.5 text-[11px] font-bold ${filter==='DITOLAK'?'bg-red-500 text-white':'bg-[#252A42] text-slate-400'}`}>DITOLAK</button>
          <button onClick={()=>setFilter('all')} className={`rounded-full px-4 py-1.5 text-[11px] font-bold ${filter==='all'?'bg-white text-black':'bg-[#252A42] text-slate-400'}`}>SEMUA</button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length===0 && <div className="card rounded-[24px] p-8 text-center text-[12px] text-slate-500">Tidak ada surat {filter}</div>}
        {filtered.map((s:any)=>(
          <div key={s.id} className="card rounded-[20px] p-4 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-bold text-[13px]">{s.warga?.nama} - {s.warga?.alamat}</div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${s.status==='PENDING'?'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30': s.status==='DISETUJUI'?'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30':'bg-red-500/20 text-red-400'}`}>{s.status}</span>
              </div>
              <div className="text-[12px] mt-1">{s.jenis}</div>
              <div className="text-[11px] text-slate-400">Keperluan: {s.keperluan}</div>
              <div className="text-[10px] text-slate-500 mt-1">{new Date(s.created_at).toLocaleString('id-ID')} • NIK: {s.warga?.nik||s.nik} • {s.no_surat||'Belum ada no surat'}</div>
            </div>
            <div className="flex flex-col gap-2 ml-3">
              {s.status==='PENDING' && (
                <>
                  <button onClick={()=>updateStatus(s.id,'DISETUJUI')} className="bg-emerald-500 text-white rounded-full px-4 py-1.5 text-[11px] font-bold">✓ Setujui</button>
                  <button onClick={()=>updateStatus(s.id,'DITOLAK')} className="bg-[#252A42] text-slate-400 rounded-full px-4 py-1.5 text-[11px]">✕ Tolak</button>
                </>
              )}
              {s.status==='DISETUJUI' && <button onClick={()=>cetakSurat(s)} className="bg-white text-black rounded-full px-4 py-1.5 text-[11px] font-bold">🖨️ Cetak Surat</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
