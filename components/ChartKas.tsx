
'use client'
// FIXED - tidak pakai react-chartjs-2 biar build tidak error
export default function ChartKas({data}:{data:number[]}){
  const max = Math.max(...(data.length ? data : [1]))
  return (
    <div className="bg-[#1C2035] border border-[#2A2F4A] rounded-xl p-4">
      <h4 className="text-[12px] font-bold mb-3">Grafik Kas (Preview)</h4>
      <div className="flex items-end gap-1 h-[80px]">
        {data.map((v,i)=>(
          <div key={i} className="flex-1 bg-purple-500 rounded-t" style={{height: `${(v/max)*100}%`}} title={`${v}`}></div>
        ))}
      </div>
      <div className="text-[10px] text-slate-500 mt-2">Data: {data.join(', ')}</div>
    </div>
  )
}
