# RT 09/14 - NextJS + Supabase Live - SIAP DEPLOY HARI INI

## 1. Buat Supabase (2 menit)
1. Buka supabase.com -> New Project
2. Masuk SQL Editor -> Paste file `supabase/schema.sql` -> Run
3. Settings -> API -> Copy URL dan anon key

## 2. Push ke GitHub
```bash
git init
git add .
git commit -m "RT09 live supabase"
git branch -M main
git remote add origin https://github.com/USERNAME/rt09-dashboard.git
git push -u origin main
```

## 3. Deploy Vercel (1 klik live)
1. vercel.com -> New Project -> Import GitHub repo
2. Add Environment Variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Deploy -> Live!

## 4. Data Migration dari Google Sheets
- Export Sheets Warga/Iuran ke CSV
- Import di Supabase Table Editor -> Import CSV
- Atau pakai script migrasi yang sudah ada di `supabase/migrate.js` (akan aku bikinkan kalau butuh)

## Fitur Live
- Kas realtime dari Supabase (bukan Sheets lagi)
- Grafik otomatis update
- Riwayat tagihan live
- Pengumuman live
- Inventaris pinjam (bisa update stok langsung)

Sudah termasuk RLS public untuk MVP biar cepat live, nanti bisa diperketat auth.

Butuh bantuan migrasi data Sheets -> Supabase? Bilang aja kak!
