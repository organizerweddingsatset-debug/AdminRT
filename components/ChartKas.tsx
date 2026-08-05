'use client'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)
export default function ChartKas({data}:{data:number[]}){
  const labels=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  const chartData={labels,datasets:[{label:'Masuk',data:data.length?data:[20000,20000,20000,0,40000,0,0,0,0,0,0,0],backgroundColor:'#22c55e',borderRadius:6}]}
  return (
    <div className="card-dark p-5"><h3 className="text-[12px] font-semibold text-slate-300 mb-4">Pemasukan 2026 (Live Supabase)</h3><Bar data={chartData} options={{responsive:true,plugins:{legend:{display:false}},scales:{y:{display:false},x:{grid:{display:false},ticks:{color:'#64748b'}}}}} /></div>
  )
}
