-- RT 09/14 SUPABASE SCHEMA - RUN IN SQL EDITOR
-- Buat extension uuid
create extension if not exists "uuid-ossp";

-- 1. Hapus tabel lama kalau ada (biar fresh)
drop table if exists iuran cascade;
drop table if exists pengeluaran cascade;
drop table if exists pengumuman cascade;
drop table if exists inventaris cascade;
drop table if exists warga cascade;

-- 2. Buat ulang dengan schema benar
create extension if not exists "uuid-ossp";

create table warga (
  id uuid primary key default uuid_generate_v4(),
  nik text unique not null,
  nama text not null,
  alamat text,
  nohp text,
  created_at timestamp default now()
);

create table iuran (
  id uuid primary key default uuid_generate_v4(),
  nik text references warga(nik) on delete cascade,
  bulan int not null check (bulan between 1 and 12),
  tahun int not null,
  nominal int default 20000,
  status text default 'BELUM' check (status in ('LUNAS','BELUM')),
  metode text default 'Cash',
  tgl_bayar timestamp,
  created_at timestamp default now(),
  unique(nik, bulan, tahun)
);

create table pengeluaran (
  id uuid primary key default uuid_generate_v4(),
  tanggal date not null default current_date,
  kategori text not null,
  keterangan text,
  nominal int not null,
  metode text default 'Cash',
  created_at timestamp default now()
);

create table pengumuman (
  id uuid primary key default uuid_generate_v4(),
  judul text not null,
  isi text,
  kategori text default 'Info',
  created_at timestamp default now()
);

create table inventaris (
  id uuid primary key default uuid_generate_v4(),
  nama text not null,
  stok int default 1,
  tersedia int default 1,
  icon text default 'fa-box',
  created_at timestamp default now()
);

-- 3. RLS + Policy public (biar cepat live)
alter table warga enable row level security;
alter table iuran enable row level security;
alter table pengeluaran enable row level security;
alter table pengumuman enable row level security;
alter table inventaris enable row level security;

create policy "public all warga" on warga for all using (true) with check (true);
create policy "public all iuran" on iuran for all using (true) with check (true);
create policy "public all pengeluaran" on pengeluaran for all using (true) with check (true);
create policy "public all pengumuman" on pengumuman for all using (true) with check (true);
create policy "public all inventaris" on inventaris for all using (true) with check (true);

-- 4. Seed data (3 warga RT 09/14)
insert into warga (nik, nama, alamat, nohp) values
('3578030504830006','DANIEL FAJARSYAH','Blok G-43','081234567890'),
('3578030504830002','Widi Setyowati','Blok G-18','081234567891'),
('3578030504830001','Harri','Blok G-1','081234567892');

insert into iuran (nik, bulan, tahun, nominal, status, tgl_bayar) values
('3578030504830006',5,2026,20000,'LUNAS',now()),
('3578030504830002',5,2026,20000,'LUNAS',now()),
('3578030504830006',1,2026,20000,'LUNAS',now()),
('3578030504830006',2,2026,20000,'LUNAS',now()),
('3578030504830006',3,2026,20000,'LUNAS',now());

insert into pengeluaran (kategori, keterangan, nominal) values
('Konsumsi','Rapat Rutin RT',20000);

insert into pengumuman (judul, isi, kategori) values
('Jadwal Ronda Malam Diperketat','Mulai minggu depan ronda dimulai pukul 21.00. Harap warga blok G bergiliran.','Ronda'),
('Kerja Bakti Minggu Pagi','Got depan masjid akan dibersihkan bersama. Kumpul jam 07.00 bawa cangkul.','Kerja Bakti'),
('Pembayaran Iuran Tepat Waktu','Batas pembayaran tanggal 15 setiap bulan untuk kelancaran kas RT.','Penting');

insert into inventaris (nama, stok, tersedia, icon) values
('Tenda Terpal 4x6',2,2,'fa-campground'),
('Kursi Plastik',50,50,'fa-chair'),
('Sound System Portable',1,1,'fa-volume-up'),
('Meja Lipat',8,8,'fa-table');
