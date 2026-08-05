
'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient, supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function WargaPage(){
  const [profile,setProfile]=useState<any>(null)
  const [iuran,setIuran]=useState<any[]>([])
  const [inventaris,setInventaris]=useState<any[]>([])
  const [myPinjam,setMyPinjam]=useState<any[]>([])
  const [tab,setTab]=useState('home')
  const [showQRIS,setShowQRIS]=useState<any>(null)
  const [qrisUrl,setQrisUrl]=useState('')
  const [formSurat,setFormSurat]=useState({jenis:'Surat Pengantar',keperluan:'',penutup:'Demikian surat ini dibuat untuk keperluan tersebut.'})
  const [formPengumuman,setFormPengumuman]=useState({judul:'',isi:''})
  const [waKontak,setWaKontak]=useState({ketua:'',keamanan:''})
  const router=useRouter()

  const load=async(prof:any)=>{
    const { data: i } = await supabase.from('iuran').select('*').eq('warga_id',prof.warga.id).order('tahun',{ascending:false})
    setIuran(i||[])
    const { data: inv } = await supabase.from('inventaris').select('*')
    setInventaris(inv||[])
    const { data: pj } = await supabase.from('inventaris_peminjaman').select('*, inventaris(nama)').eq('warga_id',prof.warga.id).order('created_at',{ascending:false})
    setMyPinjam(pj||[])
    const { data: settings } = await supabase.from('app_settings').select('*')
    settings?.forEach((s:any)=>{ if(s.key==='iuran_wajib') setQrisUrl(s.value?.qris_url||''); if(s.key==='whatsapp'){ setWaKontak({ketua:s.value.ketua||'',keamanan:s.value.keamanan||''}) } if(s.key==='qris') setQrisUrl(s.value.url||qrisUrl) })
  }

  useEffect(()=>{
    const s=createBrowserClient()
    s.auth.getUser().then(async ({data})=>{
      if(!data.user){ router.push('/login'); return }
      const { data: prof } = await supabase.from('profiles').select('*, warga(*)').eq('id', data.user.id).single()
      if(!prof){ router.push('/login'); return }
      setProfile(prof)
      if(prof.warga) load(prof)
    })
  },[])

  const bayarCash=async(id:string)=>{ await supabase.from('iuran').update({status:'lunas',metode:'cash',tanggal_bayar:new Date().toISOString(),kuitansi_no:`KW-${Date.now()}`}).eq('id',id); if(profile) load(profile) }
  const bayarQRIS=async(id:string)=>{ await supabase.from('iuran').update({status:'lunas',metode:'qris',tanggal_bayar:new Date().toISOString(),kuitansi_no:`KW-${Date.now()}`}).eq('id',id); setShowQRIS(null); if(profile) load(profile) }
  const cetakKuitansi=(i:any)=>{
    const w=window.open('','_blank'); if(!w) return
    w.document.write(`<html><body style="font-family:sans-serif;padding:40px"><h2>KUITANSI IURAN RT 09/14</h2><p>No: ${i.kuitansi_no}</p><p>Nama: ${profile.warga?.nama}</p><p>Bulan: ${i.bulan} ${i.tahun}</p><p>Nominal: Rp ${i.nominal?.toLocaleString()}</p><p>Status: LUNAS - ${i.metode}</p><script>window.print()</script></body></html>`)
  }
  const ajukanSurat=async()=>{
    if(!formSurat.keperluan) return alert('Isi keperluan')
    await supabase.from('surat').insert([{warga_id:profile.warga.id,jenis:formSurat.jenis,keperluan:formSurat.keperluan,penutup:formSurat.penutup,status:'pending'}])
    alert('Surat diajukan, menunggu approval admin'); setFormSurat({jenis:'Surat Pengantar',keperluan:'',penutup:'Demikian surat ini dibuat untuk keperluan tersebut.'})
  }
  const pinjamBarang=async(invId:string)=>{
    const jml = parseInt(prompt('Jumlah pinjam?')||'1')
    if(!jml) return
    const inv = inventaris.find((x:any)=>x.id===invId)
    if(inv.jumlah_tersedia < jml) return alert('Stok tidak cukup')
    await supabase.from('inventaris_peminjaman').insert([{warga_id:profile.warga.id,inventaris_id:invId,jumlah:jml,status:'dipinjam'}])
    await supabase.from('inventaris').update({jumlah_tersedia:inv.jumlah_tersedia-jml}).eq('id',invId)
    load(profile)
  }
  const buatPengumuman=async()=>{
    if(!formPengumuman.judul || !formPengumuman.isi) return alert('Lengkapi')
    await supabase.from('pengumuman').insert([{warga_id:profile.warga.id,judul:formPengumuman.judul,isi:formPengumuman.isi,status:'pending'}])
    alert('Draft pengumuman dikirim ke admin untuk approval'); setFormPengumuman({judul:'',isi:''})
  }
  const logout=async()=>{ const s=createBrowserClient(); await s.auth.signOut(); router.push('/login') }
  const updateProfil=async()=>{
    const nama = prompt('Nama baru',profile.warga.nama)
    if(!nama) return
    await supabase.from('warga').update({nama}).eq('id',profile.warga.id)
    alert('Profil diupdate'); location.reload()
  }

  if(!profile) return <div className="min-h-screen bg-[#0F1220] flex items-center justify-center text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0F1220] text-white p-4 lg:p-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white text-black font-black flex items-center justify-center">09</div><div><div className="font-bold text-[13px]">RT 09/14</div><div className="text-[10px] text-slate-500">Warga Panel</div></div></div>
          <button onClick={logout} className="card rounded-full px-5 py-2 text-[12px]">Logout</button>
        </div>

        <div className="card rounded-[28px] p-7 glow mb-6">
          <div className="flex gap-4"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xl font-black">{profile.warga?.nama?.[0]}</div><div><h1 className="text-xl font-black">Halo, {profile.warga?.nama}</h1><p className="text-slate-400 text-[12px] mt-1">NIK: {profile.nik} | {profile.warga?.alamat}</p><div className="flex gap-2 mt-3 flex-wrap"><button onClick={()=>setTab('home')} className={`rounded-full px-4 py-1.5 text-[11px] ${tab==='home'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Home</button><button onClick={()=>setTab('iuran')} className={`rounded-full px-4 py-1.5 text-[11px] ${tab==='iuran'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Iuran Saya</button><button onClick={()=>setTab('surat')} className={`rounded-full px-4 py-1.5 text-[11px] ${tab==='surat'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Surat</button><button onClick={()=>setTab('inventaris')} className={`rounded-full px-4 py-1.5 text-[11px] ${tab==='inventaris'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Inventaris</button><button onClick={()=>setTab('profil')} className={`rounded-full px-4 py-1.5 text-[11px] ${tab==='profil'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Profil</button></div></div></div>
        </div>

        {tab==='home' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div className="card rounded-[20px] p-5"><div className="text-[11px] text-slate-500">Tagihan Belum Lunas</div><div className="text-xl font-black text-red-400 mt-1">{iuran.filter((i:any)=>i.status!=='lunas').length}</div></div><div className="card rounded-[20px] p-5"><div className="text-[11px] text-slate-500">Sudah Lunas</div><div className="text-xl font-black text-emerald-400 mt-1">{iuran.filter((i:any)=>i.status==='lunas').length}</div></div></div>
            <div className="card rounded-[24px] p-6"><h4 className="font-bold text-[13px] mb-3">Buat Draft Pengumuman (Ibu-ibu, Karang Taruna, dll)</h4><input value={formPengumuman.judul} onChange={e=>setFormPengumuman({...formPengumuman,judul:e.target.value})} placeholder="Judul: Undangan Pengajian Ibu-ibu" className="input mb-2" /><textarea value={formPengumuman.isi} onChange={e=>setFormPengumuman({...formPengumuman,isi:e.target.value})} placeholder="Isi pengumuman..." className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-3 text-[12px] h-24 mb-2" /><button onClick={buatPengumuman} className="bg-white text-black rounded-full px-6 py-2 text-[12px] font-bold">Kirim ke Admin untuk Approval</button></div>
          </div>
        )}

        {tab==='iuran' && (
          <div className="card rounded-[24px] p-6">
            <h3 className="font-bold mb-4">Tagihan Saya - {profile.warga?.nama}</h3>
            <div className="space-y-2">
              {iuran.map((i:any)=>(
                <div key={i.id} className="flex justify-between items-center bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3 text-[12px]">
                  <div><div className="font-medium">{i.bulan} {i.tahun} - Rp {i.nominal?.toLocaleString()}</div><div className="text-[10px] text-slate-500">{i.jenis} • {i.status}</div></div>
                  <div className="flex gap-2">
                    {i.status!=='lunas' ? <><button onClick={()=>setShowQRIS(i)} className="bg-[#1C2035] border border-[#2A2F4A] rounded-full px-3 py-1.5 text-[11px]">QRIS</button><button onClick={()=>bayarCash(i.id)} className="bg-white text-black rounded-full px-3 py-1.5 text-[11px] font-bold">Cash</button></> : <button onClick={()=>cetakKuitansi(i)} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-4 py-1.5 text-[11px] font-bold">🧾 Kuitansi</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='surat' && (
          <div className="card rounded-[24px] p-6">
            <h3 className="font-bold mb-4">Pengajuan Surat</h3>
            <select value={formSurat.jenis} onChange={e=>setFormSurat({...formSurat,jenis:e.target.value})} className="input mb-2"><option>Surat Pengantar</option><option>Surat Keterangan Domisili</option><option>Surat Keterangan Usaha</option><option>Surat Tidak Mampu</option></select>
            <input value={formSurat.keperluan} onChange={e=>setFormSurat({...formSurat,keperluan:e.target.value})} placeholder="Keperluan" className="input mb-2" />
            <textarea value={formSurat.penutup} onChange={e=>setFormSurat({...formSurat,penutup:e.target.value})} className="w-full bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-3 text-[12px] h-20 mb-3" />
            <button onClick={ajukanSurat} className="bg-white text-black rounded-full px-6 py-2.5 text-[12px] font-bold w-full">Ajukan Surat</button>
          </div>
        )}

        {tab==='inventaris' && (
          <div className="space-y-4">
            <div className="card rounded-[24px] p-6"><h3 className="font-bold mb-3">Pinjam Inventaris RT</h3><div className="grid grid-cols-2 gap-3">{inventaris.map((inv:any)=><div key={inv.id} className="bg-[#0F1220] border border-[#2A2F4A] rounded-2xl p-4 flex justify-between items-center"><div><div className="text-[13px] font-bold">{inv.nama}</div><div className="text-[10px] text-slate-500">{inv.jumlah_tersedia}/{inv.jumlah_total} tersedia</div></div><button onClick={()=>pinjamBarang(inv.id)} disabled={inv.jumlah_tersedia<=0} className="bg-white text-black rounded-full px-3 py-1 text-[11px] font-bold disabled:opacity-50">Pinjam</button></div>)}</div></div>
            <div className="card rounded-[24px] p-6"><h3 className="font-bold mb-3">Peminjaman Saya</h3><div className="space-y-2">{myPinjam.map((p:any)=><div key={p.id} className="bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3 text-[12px] flex justify-between"><span>{p.inventaris?.nama} x{p.jumlah} - {p.status}</span><span className="text-[10px] text-slate-500">{new Date(p.created_at).toLocaleDateString()}</span></div>)}</div></div>
          </div>
        )}

        {tab==='profil' && (
          <div className="card rounded-[24px] p-6"><h3 className="font-bold mb-4">Update Biodata Mandiri</h3><div className="text-[12px] space-y-2"><div>Nama: {profile.warga?.nama}</div><div>NIK: {profile.nik}</div><div>Alamat: {profile.warga?.alamat}</div><div>No HP: {profile.warga?.no_hp||'-'}</div></div><button onClick={updateProfil} className="mt-4 bg-white text-black rounded-full px-6 py-2.5 text-[12px] font-bold w-full">✏️ Edit Nama (contoh update mandiri)</button></div>
        )}
      </div>

      {/* Floating WA */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        {waKontak.ketua && <a href={`https://wa.me/${waKontak.ketua}`} target="_blank" className="bg-green-500 text-white rounded-full px-5 py-3 text-[12px] font-bold shadow-lg flex items-center gap-2">💬 Ketua RT</a>}
        {waKontak.keamanan && <a href={`https://wa.me/${waKontak.keamanan}`} target="_blank" className="bg-[#1C2035] border border-[#2A2F4A] text-white rounded-full px-5 py-3 text-[12px] font-bold shadow-lg">🚨 Keamanan</a>}
        {!waKontak.ketua && <div className="bg-[#1C2035] border border-[#2A2F4A] text-slate-400 rounded-full px-5 py-3 text-[11px]">WA Ketua belum di-set admin</div>}
      </div>

      {showQRIS && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card rounded-[24px] p-6 max-w-sm w-full text-center">
            <h3 className="font-bold mb-2">Bayar QRIS - {showQRIS.bulan} {showQRIS.tahun}</h3>
            <p className="text-[12px] text-slate-400 mb-3">Rp {showQRIS.nominal?.toLocaleString()}</p>
            {qrisUrl ? <img src={qrisUrl} className="w-full rounded-xl mb-3" /> : <div className="bg-[#0F1220] border border-dashed rounded-xl p-10 text-[11px] text-slate-500 mb-3">QRIS belum di-set admin</div>}
            <div className="flex gap-2"><button onClick={()=>setShowQRIS(null)} className="flex-1 bg-[#252A42] rounded-full py-2.5 text-[12px]">Batal</button><button onClick={()=>bayarQRIS(showQRIS.id)} className="flex-1 bg-white text-black rounded-full py-2.5 text-[12px] font-bold">Sudah Bayar - Lunas</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
