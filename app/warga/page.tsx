
'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient, supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function WargaPage(){
  const [profile,setProfile]=useState<any>(null)
  const [iuran,setIuran]=useState<any[]>([])
  const [kas,setKas]=useState<any[]>([])
  const [tab,setTab]=useState('home')
  const router=useRouter()
  
  useEffect(()=>{
    const s=createBrowserClient()
    s.auth.getUser().then(async ({data})=>{
      if(!data.user){ router.push('/login'); return }
      const { data: prof } = await s.from('profiles').select('*, warga(*)').eq('id', data.user.id).single()
      setProfile(prof)
      if(prof?.warga?.id){
        const { data: i } = await supabase.from('iuran').select('*').eq('warga_id', prof.warga.id).order('tahun',{ascending:false})
        setIuran(i||[])
      }
      const { data: k } = await supabase.from('kas').select('*').order('tanggal',{ascending:false}).limit(10)
      setKas(k||[])
    })
  },[])

  const logout=async()=>{ const s=createBrowserClient(); await s.auth.signOut(); router.push('/login') }

  if(!profile) return <div className="min-h-screen bg-[#0F1220] flex items-center justify-center text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0F1220] text-white p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black font-black flex items-center justify-center">09</div>
            <div><div className="font-bold text-[13px]">RT 09/14</div><div className="text-[10px] text-slate-500">Warga Panel</div></div>
          </div>
          <button onClick={logout} className="card rounded-full px-5 py-2 text-[12px] hover:bg-red-500/20 hover:text-red-400 transition">Logout</button>
        </div>

        <div className="card rounded-[28px] p-7 glow mb-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xl font-black">{profile.warga?.nama?.[0] || 'W'}</div>
              <div>
                <h1 className="text-xl font-black">Halo, {profile.warga?.nama || profile.email}</h1>
                <p className="text-slate-400 text-[12px] mt-1">NIK: {profile.nik} | {profile.warga?.alamat || 'Blok G-1'}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=>setTab('home')} className={`rounded-full px-4 py-1.5 text-[11px] ${tab==='home'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Home</button>
                  <button onClick={()=>setTab('iuran')} className={`rounded-full px-4 py-1.5 text-[11px] ${tab==='iuran'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Iuran Saya</button>
                  <button onClick={()=>setTab('kas')} className={`rounded-full px-4 py-1.5 text-[11px] ${tab==='kas'?'bg-white text-black font-bold':'bg-[#252A42] text-slate-400'}`}>Kas RT</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {tab==='home' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="card rounded-[20px] p-5"><div className="text-[11px] text-slate-500">Status Iuran</div><div className="text-lg font-black text-emerald-400 mt-1">Lunas</div><div className="text-[10px] text-slate-500 mt-1">{iuran.length} riwayat</div></div>
            <div className="card rounded-[20px] p-5"><div className="text-[11px] text-slate-500">Blok</div><div className="text-lg font-black mt-1">{profile.warga?.alamat || 'G-1'}</div><div className="text-[10px] text-slate-500 mt-1">RT 09/14</div></div>
            <div className="card rounded-[20px] p-5 col-span-2">
              <h4 className="font-bold text-[13px] mb-3">Info RT Terbaru</h4>
              <div className="space-y-2 text-[12px] text-slate-400">
                <div>• Kerja bakti Minggu jam 7 pagi Blok G</div>
                <div>• Iuran bulan Juni paling lambat tgl 10</div>
                <div>• Ronda malam terjadwal via grup WA</div>
              </div>
            </div>
          </div>
        )}

        {tab==='iuran' && (
          <div className="card rounded-[24px] p-6">
            <h3 className="font-bold mb-4">Riwayat Iuran Saya</h3>
            <div className="space-y-2">
              {iuran.length===0 ? <div className="text-slate-500 text-[12px] text-center py-8">Belum ada data iuran</div> :
                iuran.map((i:any)=>(
                  <div key={i.id} className="flex justify-between bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3 text-[12px]">
                    <span>{i.bulan} {i.tahun}</span><span className="font-bold text-emerald-400">Rp {i.nominal?.toLocaleString()} • {i.status}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {tab==='kas' && (
          <div className="card rounded-[24px] p-6">
            <h3 className="font-bold mb-4">Transparansi Kas RT</h3>
            <div className="space-y-2 max-h-[400px] overflow-auto">
              {kas.map((k:any)=>(
                <div key={k.id} className="flex justify-between bg-[#0F1220] border border-[#2A2F4A]/50 rounded-full px-5 py-3 text-[12px]">
                  <span className="truncate w-[60%]">{k.keterangan}</span><span className={k.jenis==='masuk'?'text-emerald-400':'text-red-400'}>{k.jenis==='masuk'?'+':'-'} Rp {k.jumlah?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
