import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)

// Types
export type Warga = { id:string, nik:string, nama:string, alamat:string, nohp:string }
export type Iuran = { id:string, nik:string, bulan:number, tahun:number, nominal:number, status:string }
export type Pengeluaran = { id:string, tanggal:string, kategori:string, keterangan:string, nominal:number }
