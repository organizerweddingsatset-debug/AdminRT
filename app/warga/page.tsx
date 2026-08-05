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
  const [inventaris,setInventaris]=useState<any[]>([])
  const [myPinjam,setMyPinjam]=useState<any[]>([])
  const [tab,setTab]=useState('iuran')
  const [showQRIS,setShowQRIS]=useState<any>(null)
  const [qrisUrl,setQrisUrl]=useState('')
  const [waKontak,setWaKontak]=useState({ketua:'',keamanan:''})
  const router=useRouter()

  const load=async(wRow:any)=>{
    const { data: i } = await supabase.from('iuran').select('*').eq('warga_id', wRow.id).order('created_at',{ascending:false})
    setIuran(i||[])
    const { data: inv } = await supabase.from('inventaris').select('*')
    setInventaris(inv||[])
    const { data: pj } = await supabase.from('inventaris_peminjaman').select('*, inventaris(nama)').eq('warga_id', wRow.id).order('created_at',{ascending:false})
    setMyPinjam(pj||[])
    const { data: settings } = await supabase.from('app_settings').select('*')
    settings?.forEach((s:any)=>{ if(s.key==='iuran_wajib') setQrisUrl(s.value?.qris_url||''); if(s.key==='whatsapp'){ setWaKontak({ketua:s.value.ketua||'',keamanan:s.value.keamanan||''}) } if(s.key==='qris' && s.value?.url) setQrisUrl(s.value.url) })
  }

  useEffect(()=>{
    const sess = localStorage.getItem('warga_session')
    if(sess){
      try{
        const w = JSON.parse(sess)
        setWargaData(w)
        load(w)
        return
      }catch(e){}
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

  const bayarCash=async(id:string)=>{ await supabase.from('iuran').update({status:'lunas',metode:'cash',tanggal_bayar:new Date().toISOString(),kuitansi_no:`KW-${Date.now()}`}).eq('id',id); if(wargaData) load(wargaData) }
  const bayarQRIS=async(id:string)=>{ await supabase.from('iuran').update({status:'lunas',metode:'qris',tanggal_bayar:new Date().toISOString(),kuitansi_no:`KW-${Date.now()}`}).eq('id',id); setShowQRIS(null); if(wargaData) load(wargaData) }
  const cetakKuitansi=(i:any)=>{
    const w=window.open('','_blank'); if(!w) return
    w.document.write(`<html><body style="font-family:sans-serif;padding:40px"><h2>KUITANSI IURAN RT 09/14</h2><p>No: ${i.kuitansi_no}</p><p>Nama: ${wargaData?.nama}</p><p>NIK: ${wargaData?.nik}</p><p>Blok: ${wargaData?.alamat}</p><p>Bulan: ${i.bulan} ${i.tahun}</p><p>Nominal: Rp ${i.nominal?.toLocaleString()}</p><p>Status: LUNAS - ${i.metode}</p><script>window.print()</script></body></html>`)
  }
  const logout=async()=>{ localStorage.removeItem('warga_session'); localStorage.removeItem('warga_nik'); const s=createBrowserClient(); await s.auth.signOut(); router.push('/login') }

  if(!wargaData) return <div className="min-h-screen bg-[#0F1220] flex items-center justify-center text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0F1220] text-white p-4 lg:p-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white text-black font-black flex items-center justify-center">09</div><div><div className="font-bold text-[13px]">RT 09/14</div><div className="text-[10px] text-slate-500">Warga Panel</div></div></div>
          <button onClick={logout} className="card rounded-full px-5 py-2 text-[12px]">Logout</button>
        </div>

        <div className="card rounded-[28px] p-7 glow mb-6">
          <div className="flex gap-4"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xl font-black">{wargaData?.nama?.[0]}</div><div><h1 className="text-xl font-black">Halo, {wargaData?.nama}</h1><p className="text-slate-400 text-[12px] mt-1">Blok: {wargaData?.alamat} | NIK: {wargaData?.nik}</p><p className="text-[10px] text-emerald-400 mt-1">Login: Nama + Blok (sesuai janji)</p></div></div>
          <div className="flex gap-2 mt-4 flex-wrap"><button onClick={()=>setTab('iuran')} className={`rounded-full px-4 py-1.5 text-[11px] ${tab==='iuran'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Iuran Saya ({iuran.length})</button><button onClick={()=>setTab('home')} className={`rounded-full px-4 py-1.5 text-[11px] ${tab==='home'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Home</button></div>
        </div>

        {tab==='iuran' && (
          <div className="card rounded-[24px] p-6">
            <h3 className="font-bold mb-4">Tagihan Saya - {wargaData?.nama} - {wargaData?.alamat}</h3>
            <div className="space-y-2">
              {iuran.length===0 ? <div className="bg-[#0F1220] border border-dashed border-[#2A2F4A] rounded-2xl p-8 text-center text-[12px] text-slate-500">Belum ada tagihan. Admin belum generate bulan ini.</div> :
                iuran.map((i:any)=>(
                  <div key={i.id} className="flex justify-between items-center bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3 text-[12px]">
                    <div><div className="font-medium">{i.bulan} {i.tahun} - Rp {i.nominal?.toLocaleString()}</div><div className="text-[10px] text-slate-500">{i.jenis} • {i.status}</div></div>
                    <div className="flex gap-2">
                      {i.status!=='lunas' ? <><button onClick={()=>setShowQRIS(i)} className="bg-[#1C2035] border border-[#2A2F4A] rounded-full px-3 py-1.5 text-[11px]">QRIS</button><button onClick={()=>bayarCash(i.id)} className="bg-white text-black rounded-full px-3 py-1.5 text-[11px] font-bold">Cash</button></> : <button onClick={()=>cetakKuitansi(i)} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-4 py-1.5 text-[11px] font-bold">🧾 Kuitansi</button>}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {showQRIS && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card rounded-[24px] p-6 max-w-sm w-full text-center">
            <h3 className="font-bold mb-2">Bayar QRIS - {showQRIS.bulan} {showQRIS.tahun}</h3>
            <div className="bg-white rounded-2xl p-4 mb-3"><img src={getQRISImage(qrisUrl)} className="w-full rounded-xl" alt="QRIS" /></div>
            <div className="flex gap-2"><button onClick={()=>setShowQRIS(null)} className="flex-1 bg-[#252A42] rounded-full py-2.5 text-[12px]">Batal</button><button onClick={()=>bayarQRIS(showQRIS.id)} className="flex-1 bg-white text-black rounded-full py-2.5 text-[12px] font-bold">Lunas</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
