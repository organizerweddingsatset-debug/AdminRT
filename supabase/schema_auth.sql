-- SCHEMA AUTH RT 09 - RUN SETELAH schema FIX sebelumnya
-- 1. Buat tabel profiles untuk link auth.users ke warga
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nik text references warga(nik) on delete cascade,
  role text default 'warga' check (role in ('superadmin','warga')),
  created_at timestamp default now()
);

alter table profiles enable row level security;
drop policy if exists "public all profiles" on profiles;
create policy "public all profiles" on profiles for all using (true) with check (true);

-- 2. Buat user auth untuk demo (jalankan di Dashboard -> Authentication -> Users -> Add User manual, atau via SQL)
-- SUPERADMIN: email superadmin@rt09.local, pass admin123, nik 3578030504830006
-- WARGA: email warga1@rt09.local, pass warga123, nik 3578030504830001
-- NOTE: Buat user di Dashboard dulu, baru insert profiles di bawah

-- Setelah buat user di Auth UI, ambil UUID mereka dan run:
-- INSERT INTO profiles (id, email, nik, role) VALUES ('UUID_SUPERADMIN','superadmin@rt09.local','3578030504830006','superadmin');
-- INSERT INTO profiles (id, email, nik, role) VALUES ('UUID_WARGA','warga1@rt09.local','3578030504830001','warga');

-- Untuk testing cepat tanpa buat user manual, kita buat function untuk auto-create:
-- (Kamu bisa buat user via Supabase Dashboard > Authentication > Add User)

-- 3. RLS untuk iuran: warga hanya bisa lihat miliknya, superadmin lihat semua (untuk MVP kita masih public)
-- Nanti perketat: 
-- create policy "warga lihat iuran sendiri" on iuran for select using (
--   auth.uid() in (select id from profiles where profiles.nik = iuran.nik) OR
--   exists (select 1 from profiles where profiles.id = auth.uid() and role='superadmin')
-- );
