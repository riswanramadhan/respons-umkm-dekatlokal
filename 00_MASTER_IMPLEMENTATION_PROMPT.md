# MASTER IMPLEMENTATION PROMPT

> Catatan scope: dokumen ini adalah brief produksi awal. Implementasi aktif pada repository telah diubah menjadi demo UI mandiri sesuai README; tidak memakai database, Supabase, Docker, atau integrasi sistem nyata.

Anda adalah **Senior Full-Stack Engineer, Product Designer, dan Data Dashboard Architect**. Bangun aplikasi production-ready bernama **DekatLokal Digital Checkup Dashboard** untuk subdomain `dashboard.dekatlokal.com`.

Baca seluruh dokumen dalam paket ini sebelum menulis kode. Jangan hanya membuat mockup statis. Implementasikan aplikasi yang benar-benar berfungsi, terhubung database, dapat menerima submission dari web utama, dapat diedit, memiliki autentikasi, validasi, audit log, filter, analitik, dan seed data.

---

## 1. Konteks Produk

DekatLokal memiliki web utama `dekatlokal.com` yang menyediakan Digital Checkup UMKM. Dashboard baru ini berfungsi sebagai pusat monitoring hasil submission. Secara konseptual, setiap record pada dashboard berasal dari formulir Digital Checkup di web utama.

Dashboard digunakan oleh tim DekatLokal untuk:

- melihat seluruh UMKM yang mengisi Digital Checkup;
- memahami tingkat kesiapan digital;
- mengidentifikasi gap legalitas, produk, branding, digitalisasi, konsistensi, dan operasional;
- menentukan modul pendampingan prioritas;
- mengedit atau memverifikasi data;
- memantau perubahan skor dari waktu ke waktu;
- mengekspor data untuk analisis dan pelaporan.

Seed awal berisi 50 UMKM pada `data/digital-checkup.seed.json`.

---

## 2. Stack Wajib

Gunakan:

- Next.js App Router versi stabil terbaru;
- TypeScript strict mode;
- Tailwind CSS;
- shadcn/ui untuk primitive UI;
- Supabase PostgreSQL;
- Supabase Auth;
- Supabase Row Level Security;
- React Hook Form + Zod;
- TanStack Table;
- Recharts;
- Lucide Icons;
- server components sebagai default;
- server actions atau route handlers untuk mutasi data;
- ESLint dan formatting yang konsisten.

Jangan gunakan data hardcoded sebagai satu-satunya sumber tampilan. Setelah seeding, seluruh dashboard harus membaca dari database.

---

## 3. Identitas Visual

Aplikasi harus terasa sebagai bagian resmi dari DekatLokal, bukan template admin generik.

Gunakan:

- primary blue: `#0255F5`;
- dark text: `#101828`;
- secondary text: `#667085`;
- background: `#F7F9FC`;
- card: `#FFFFFF`;
- border: `#E4E7EC`;
- success: `#16A34A`;
- warning: `#F59E0B`;
- danger: `#DC2626`;
- radius utama: 14–18 px;
- shadow sangat tipis;
- whitespace lapang;
- font sans-serif modern seperti Geist;
- logo DekatLokal di sidebar/header;
- bahasa UI: Bahasa Indonesia.

Jangan membuat interface terlalu ramai, terlalu gelap, atau menyerupai dashboard crypto.

---

## 4. Rute Utama

Implementasikan:

- `/login`
- `/dashboard`
- `/dashboard/umkm`
- `/dashboard/umkm/[id]`
- `/dashboard/modul`
- `/dashboard/aktivitas`
- `/dashboard/pengaturan`
- `/api/v1/checkups`
- `/api/v1/checkups/[id]`
- `/api/v1/checkups/[id]/verify`
- `/api/v1/export`

Semua rute dashboard dilindungi autentikasi.

---

## 5. Halaman Overview

Tampilkan KPI:

- total UMKM;
- jumlah kategori Rendah;
- jumlah kategori Menengah;
- jumlah kategori Siap;
- rata-rata skor kesiapan;
- jumlah belum memiliki NIB;
- jumlah belum terdaftar Google Maps;
- jumlah belum menggunakan WhatsApp Business;
- jumlah belum aktif di media sosial.

Tampilkan visualisasi:

1. Donut distribusi kategori kesiapan.
2. Bar chart gap berdasarkan indikator utama.
3. Horizontal bar modul pendampingan paling banyak dibutuhkan.
4. Tren submission per waktu.
5. Ringkasan adopsi kanal digital.
6. Tabel lima submission terbaru.
7. Daftar UMKM berprioritas tinggi.

Semua chart harus responsive, memiliki tooltip, empty state, dan tidak menampilkan data palsu ketika query kosong.

---

## 6. Tabel UMKM

Gunakan TanStack Table dengan fitur:

- server-side pagination;
- pencarian nama UMKM/pemilik/nomor;
- filter kategori;
- filter rentang skor;
- filter NIB;
- filter Google Maps;
- filter WhatsApp Business;
- filter aktivitas media sosial;
- filter platform e-commerce;
- filter modul pendampingan;
- sorting;
- column visibility;
- sticky header;
- density toggle;
- bulk select;
- export hasil filter;
- clear filters;
- URL query params agar filter dapat dibagikan.

Kolom default:

- Nama UMKM;
- Pemilik;
- Skor;
- Kategori;
- NIB;
- Google Maps;
- WhatsApp Business;
- Aktivitas Konten;
- Modul Prioritas;
- Status Verifikasi;
- Tanggal Masuk;
- Aksi.

Nomor WhatsApp dan email tidak ditampilkan penuh pada daftar. Gunakan masking seperti `0813••••8341`. Data penuh hanya muncul di detail setelah pengguna berizin melakukan reveal.

---

## 7. Detail dan Edit UMKM

Halaman detail harus memiliki:

- header identitas;
- skor kesiapan berbentuk radial/progress;
- kategori kesiapan;
- status sumber dan verifikasi;
- tab `Ringkasan`, `Jawaban Checkup`, `Modul`, dan `Riwayat`;
- tombol Edit;
- tombol Verifikasi;
- tombol Hubungi WhatsApp;
- tombol Export satu UMKM.

Edit dilakukan menggunakan drawer atau dialog besar, dibagi per section:

1. Identitas
2. Legalitas
3. Produk
4. Branding
5. Digitalisasi
6. Konsistensi
7. Operasional

Setiap perubahan:

- divalidasi Zod;
- disimpan ke database;
- menghitung ulang skor;
- menghitung ulang kategori;
- memperbarui rekomendasi modul;
- menulis audit log;
- menampilkan toast sukses/gagal;
- tidak melakukan optimistic update yang berisiko kehilangan data.

Skor hasil rumus tidak boleh diedit manual oleh admin biasa. Hanya superadmin boleh melakukan override, dengan alasan wajib dan audit log.

---

## 8. Integrasi Submission dari Web Utama

Buat endpoint server-to-server:

`POST /api/v1/checkups`

Syarat:

- menerima payload JSON;
- validasi dengan Zod;
- menggunakan integration key/HMAC yang hanya tersedia di server;
- mendukung `Idempotency-Key`;
- melakukan upsert identitas UMKM bila nomor WhatsApp sudah ada;
- membuat record checkup baru;
- menghitung skor dan rekomendasi;
- mengembalikan `201 Created`;
- rate limiting;
- audit log;
- tidak pernah mengekspos Supabase service role key ke browser.

Payload dan contoh respons harus didokumentasikan di README proyek.

---

## 9. Database dan Riwayat

Pisahkan identitas UMKM dari submission checkup agar satu UMKM dapat memiliki lebih dari satu asesmen.

Minimal tabel:

- `profiles`
- `umkm`
- `digital_checkups`
- `intervention_modules`
- `checkup_modules`
- `audit_logs`
- `integration_keys` atau mekanisme secret server-side yang setara.

Gunakan UUID. Gunakan `created_at`, `updated_at`, dan soft delete jika sesuai.

---

## 10. Seed Data

Gunakan `data/digital-checkup.seed.json`.

Ketentuan:

- seed bersifat idempotent;
- gunakan `legacy_no` sebagai referensi import;
- jangan membuat duplikasi bila seed dijalankan ulang;
- tandai `source = digital_checkup_seed_import`;
- tandai `verification_status = unverified`;
- tandai `data_status = training_synthetic`;
- UI admin boleh menampilkan badge kecil `Data Training`;
- data sintetis tidak boleh digunakan sebagai klaim publik terverifikasi.

Setelah data live masuk, gunakan `source = main_website_submission` dan `data_status = live_submission`.

---

## 11. Autentikasi dan Hak Akses

Role:

- `superadmin`: akses penuh, manajemen user, override skor, hapus/restore;
- `admin`: baca, edit, verifikasi, export;
- `viewer`: hanya baca data yang diizinkan dan export terbatas.

Gunakan Supabase Auth dan RLS. Semua policy wajib diuji.

---

## 12. Quality Requirements

Wajib memiliki:

- responsive desktop/tablet/mobile;
- loading skeleton;
- empty state;
- error boundary;
- not-found state;
- toast;
- keyboard accessibility;
- label dan aria yang benar;
- query yang efisien;
- index database;
- debounce pencarian;
- unit test untuk scoring;
- integration test untuk CRUD;
- smoke test login dan protected routes;
- tidak ada TypeScript error;
- tidak ada hydration warning;
- tidak ada secret di client bundle;
- Lighthouse yang wajar untuk dashboard authenticated.

---

## 13. Deliverables

Hasil akhir harus mencakup:

- source code lengkap;
- schema/migration SQL;
- seed script;
- `.env.example`;
- README setup lokal;
- README integrasi web utama;
- dokumentasi deployment;
- screenshot atau dokumentasi UI;
- test;
- daftar asumsi;
- daftar pekerjaan lanjutan.

---

## 14. Cara Kerja Agen

Kerjakan secara bertahap:

1. Analisis seluruh dokumen.
2. Tulis implementation plan.
3. Buat schema dan migration.
4. Buat seed script.
5. Implementasi auth dan shell dashboard.
6. Implementasi overview.
7. Implementasi tabel.
8. Implementasi detail/edit/audit.
9. Implementasi API integration.
10. Implementasi tests.
11. Verifikasi lint, typecheck, build, dan test.
12. Berikan ringkasan file yang dibuat serta instruksi deployment.

Jangan berhenti pada desain. Jangan meninggalkan tombol tanpa fungsi. Jangan membuat data random baru bila seed sudah tersedia.
