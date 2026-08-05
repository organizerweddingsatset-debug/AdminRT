# RT 09 - Full Auth (Superadmin + Warga)

## Fitur Baru V7 Auth
- Login page /login dengan NIK + Password
- Role: superadmin vs warga
- /admin = lihat semua kas + warga
- /warga = lihat iuran milik sendiri saja
- Supabase Auth + profiles table

## Setup Auth (5 menit)
1. Run schema_auth.sql di SQL Editor (setelah schema FIX)
2. Supabase Dashboard -> Authentication -> Users -> Add User:
   - Email: superadmin@rt09.local, Password: admin123, Auto Confirm: ON
   - Email: warga1@rt09.local, Password: warga123, Auto Confirm: ON
3. Copy UUID dari masing-masing user, lalu run:
```sql
insert into profiles (id, email, nik, role) values
('UUID_SUPERADMIN','superadmin@rt09.local','3578030504830006','superadmin'),
('UUID_WARGA','warga1@rt09.local','3578030504830001','warga');
```
4. Deploy Vercel dengan ENV yang sama, buka /login

Login:
- Superadmin NIK 3578030504830006 pass admin123 -> redirect /admin
- Warga NIK 3578030504830001 pass warga123 -> redirect /warga
