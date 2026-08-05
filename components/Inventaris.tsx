
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Inventaris(){
  const [data,setData]=useState<any[]>([])
  useEffect(()=>{ supabase.from('inventaris').select('*').then(({data})=>setData(data||[])) },[])
  return <div className="p-4">Inventaris: {data.length} item</div>
}
