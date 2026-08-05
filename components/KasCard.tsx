export default function KasCard({kas}:{kas:{total:number,masuk:number,keluar:number}}){
  return (
    <div className="card-dark p-5">
      <div className="flex justify-between mb-5"><div className="flex gap-3"><div className="w-10 h-10 rounded-xl bg-[#232845] flex items-center justify-center">💳</div><div><h2 className="font-semibold text-white text-[14px]">Kas Transparansi RT</h2><p className="text-[11px] text-slate-400">Live dari Supabase</p></div></div><span className="text-[10px] bg-[#2a2640] text-purple-300 px-3 py-1 rounded-full border">Transparan 100%</span></div>
      <div className="grid grid-cols-3 gap-3">
        <div className="card-dark-2 p-4"><div className="text-[11px] text-slate-400">Total Kas</div><div className="font-mono font-bold text-white text-[16px] mt-1">Rp {kas.total.toLocaleString('id-ID')}</div><div className="text-[10px] text-green-400 mt-1">Live</div></div>
        <div className="card-dark-2 p-4"><div className="text-[11px] text-slate-400">Pemasukan</div><div className="font-mono font-bold text-white text-[16px] mt-1">Rp {kas.masuk.toLocaleString('id-ID')}</div></div>
        <div className="card-dark-2 p-4"><div className="text-[11px] text-slate-400">Pengeluaran</div><div className="font-mono font-bold text-white text-[16px] mt-1">Rp {kas.keluar.toLocaleString('id-ID')}</div></div>
      </div>
    </div>
  )
}
