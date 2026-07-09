# DEKATLOKAL DASHBOARD — COMBINED PROMPT



---

## SOURCE FILE: 00_MASTER_IMPLEMENTATION_PROMPT.md

# MASTER IMPLEMENTATION PROMPT

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


---

## SOURCE FILE: 01_PRODUCT_REQUIREMENTS.md

# PRODUCT REQUIREMENTS DOCUMENT

## Nama Produk

**DekatLokal Digital Checkup Dashboard**

## Jenis Produk

Internal operations dashboard dan decision-support interface untuk monitoring kesiapan digital UMKM.

## Sasaran

Menyediakan satu sumber data yang konsisten dari pengisian Digital Checkup, sehingga tim DekatLokal dapat menentukan intervensi berbasis kebutuhan dan bukan asumsi.

## Pengguna

### Superadmin
Mengelola semua data, pengguna, scoring override, konfigurasi modul, dan integrasi.

### Admin Pendamping
Meninjau submission, memperbaiki data, memverifikasi UMKM, menetapkan modul, menghubungi pemilik, dan mengekspor laporan.

### Viewer/Partner
Melihat insight terbatas tanpa akses penuh ke data pribadi.

## Jobs to Be Done

- Ketika submission baru masuk, admin ingin segera melihat tingkat prioritas UMKM.
- Ketika mendampingi UMKM, admin ingin melihat gap paling kritis.
- Ketika data salah, admin ingin mengoreksinya tanpa merusak histori.
- Ketika melapor kepada partner, admin ingin mengekspor data yang telah difilter.
- Ketika UMKM melakukan checkup ulang, admin ingin membandingkan skor lama dan baru.

## Scope MVP

1. Auth dan role.
2. Overview dashboard.
3. Tabel UMKM.
4. Detail UMKM.
5. Edit checkup.
6. Auto-scoring.
7. Rekomendasi modul.
8. Verifikasi.
9. Audit log.
10. Export CSV/XLSX.
11. Seed 50 UMKM.
12. API submission dari web utama.

## Di Luar MVP

- Sistem belajar/LMS penuh.
- WhatsApp automation dua arah.
- Pembayaran.
- Public ranking individual UMKM.
- Machine learning.
- Multi-tenant kompleks.

## Status Kesiapan

- **Rendah**: skor < 50.
- **Menengah**: skor 50–69.
- **Siap**: skor ≥ 70.

## Prioritas Pendampingan

UMKM berprioritas tinggi bila salah satu kondisi terpenuhi:

- kategori Rendah;
- belum memiliki NIB;
- produk belum aktif;
- belum punya brand atau logo;
- belum terdaftar Google Maps;
- tidak menggunakan WhatsApp Business;
- media sosial tidak aktif;
- hanya menerima pembayaran tunai;
- belum terbiasa mengirim pesanan.

## State Data

- `unverified`
- `verified`
- `needs_revision`
- `archived`

## Source Data

- `digital_checkup_seed_import`
- `main_website_submission`
- `manual_admin_entry`
- `spreadsheet_import`

## UX States

Setiap modul harus memiliki:

- loading;
- data tersedia;
- data kosong;
- error dan retry;
- no search result;
- permission denied;
- unsaved changes confirmation.

## Acceptance Criteria Produk

- Admin dapat menemukan UMKM dalam ≤3 interaksi.
- Edit menghasilkan skor baru secara otomatis.
- Semua edit memiliki audit trail.
- Filter dan pagination tetap tersimpan pada URL.
- Export mengikuti filter aktif.
- Submission API tidak membuat duplikasi ketika request dikirim ulang.
- Data pribadi tidak muncul pada halaman tanpa autentikasi.


---

## SOURCE FILE: 02_UI_UX_DESIGN_SYSTEM.md

# UI/UX AND DESIGN SYSTEM

## Arah Visual

Dashboard harus mempertahankan identitas DekatLokal: bersih, optimistis, modern, ramah UMKM, dan tetap profesional. Gunakan banyak ruang putih, aksen biru kuat, komponen rounded, dan tipografi yang jelas.

## Design Tokens

```css
:root {
  --primary: #0255F5;
  --primary-hover: #0147D6;
  --primary-soft: #EAF1FF;
  --background: #F7F9FC;
  --surface: #FFFFFF;
  --foreground: #101828;
  --muted-foreground: #667085;
  --border: #E4E7EC;
  --success: #16A34A;
  --success-soft: #DCFCE7;
  --warning: #F59E0B;
  --warning-soft: #FEF3C7;
  --danger: #DC2626;
  --danger-soft: #FEE2E2;
  --radius-card: 16px;
  --radius-control: 10px;
}
```

## Shell Desktop

- Sidebar kiri 248 px.
- Logo DekatLokal di bagian atas.
- Menu: Overview, Data UMKM, Modul Pendampingan, Aktivitas, Pengaturan.
- Header berisi breadcrumb, pencarian global, notifikasi, dan profil admin.
- Content max-width fleksibel, padding 24–32 px.
- Sidebar dapat collapse menjadi ikon.

## Mobile

- Sidebar menjadi sheet/drawer.
- KPI menjadi horizontal snap atau grid 2 kolom.
- Tabel berubah menjadi card list untuk layar sangat kecil.
- Filter dibuka melalui bottom sheet.
- Aksi utama tetap mudah dijangkau.

## Overview

Urutan visual:

1. Judul dan periode data.
2. KPI cards.
3. Distribusi kesiapan dan modul prioritas.
4. Gap indikator.
5. Submission terbaru dan UMKM prioritas.

KPI card menggunakan icon kecil dalam kotak primary-soft. Angka dominan, label ringkas, dan subtext perubahan jika data historis tersedia.

## Tabel

- Header sticky.
- Row height nyaman.
- Hover halus.
- Skor menggunakan progress mini.
- Badge:
  - Rendah: merah lembut.
  - Menengah: kuning lembut.
  - Siap: hijau lembut.
- Modul ditampilkan maksimal dua badge, sisanya `+N`.
- Aksi melalui kebab menu.
- Kontak dimasking.
- Kolom tidak terlalu padat.

## Detail

Header:

- nama UMKM;
- pemilik;
- badge kategori;
- badge verifikasi;
- skor besar;
- tombol Edit, Verifikasi, Hubungi.

Gunakan card per dimensi dan tab. Jawaban `Belum` atau kondisi lemah diberi highlight lembut, bukan merah agresif.

## Form Edit

- Stepper/accordion per kategori.
- Sticky action bar: Batal dan Simpan Perubahan.
- Ringkasan perubahan sebelum submit.
- Warning jika perubahan memengaruhi skor.
- Semua select memakai label yang sama dengan formulir Digital Checkup.

## Copywriting UI

Gunakan istilah:

- `Kesiapan Digital`
- `Modul Pendampingan`
- `Belum Diverifikasi`
- `Perlu Tindak Lanjut`
- `Data Terakhir Diperbarui`
- `Lihat Detail`
- `Simpan Perubahan`
- `Hubungi melalui WhatsApp`

Hindari istilah teknis yang tidak diperlukan pada UI admin operasional.

## Accessibility

- contrast minimum WCAG AA;
- focus ring jelas;
- semua tombol memiliki accessible name;
- chart memiliki textual summary;
- jangan mengandalkan warna sebagai satu-satunya indikator;
- modal dapat ditutup dengan Escape;
- form error terhubung ke field.


---

## SOURCE FILE: 03_TECHNICAL_ARCHITECTURE.md

# TECHNICAL ARCHITECTURE

## Rekomendasi Struktur

```text
src/
  app/
    (auth)/
      login/
    (dashboard)/
      dashboard/
        page.tsx
        umkm/
          page.tsx
          [id]/
            page.tsx
        modul/
        aktivitas/
        pengaturan/
    api/
      v1/
        checkups/
          route.ts
          [id]/
            route.ts
            verify/
              route.ts
        export/
          route.ts
  components/
    dashboard/
    charts/
    tables/
    forms/
    ui/
  features/
    auth/
    umkm/
    checkups/
    modules/
    audit/
  lib/
    supabase/
      client.ts
      server.ts
      admin.ts
    scoring/
      calculate-score.ts
      recommend-modules.ts
      types.ts
    validation/
    permissions/
    masking/
    export/
  server/
    repositories/
    services/
    actions/
  types/
supabase/
  migrations/
  seed/
tests/
```

## Data Flow

### Submission live

1. Form pada web utama mengirim request server-to-server ke `/api/v1/checkups`.
2. Dashboard API memvalidasi integration key dan idempotency key.
3. Service meng-upsert UMKM berdasarkan nomor WhatsApp yang dinormalisasi.
4. Service membuat digital checkup.
5. Scoring engine menghitung skor.
6. Recommendation engine menentukan modul.
7. Transaksi database diselesaikan.
8. Audit log dibuat.
9. Dashboard overview diperbarui.

### Edit admin

1. Admin membuka form edit.
2. Server mengambil record dan version number.
3. Admin menyimpan.
4. Zod memvalidasi payload.
5. Gunakan optimistic concurrency melalui `updated_at` atau `version`.
6. Recalculate score dan module.
7. Simpan snapshot sebelum/sesudah ke audit log.
8. Revalidate route terkait.

## Rendering Strategy

- Server component untuk page dan initial data.
- Client component hanya untuk chart, table interaktif, drawer, dan form.
- Query filter diproses server-side.
- Gunakan pagination berbasis database.
- Hindari mengambil seluruh row pada browser.
- Gunakan `select` kolom yang diperlukan.

## API Security

Header contoh:

```http
Authorization: Bearer <integration-secret>
Idempotency-Key: <uuid>
Content-Type: application/json
```

Secret hanya digunakan pada server web utama dan dashboard. Jangan menggunakan service role di client.

## Nomor WhatsApp

Simpan dua bentuk:

- `whatsapp_raw` untuk kebutuhan internal terbatas;
- `whatsapp_normalized` format E.164 untuk uniqueness dan integrasi.

Masking dilakukan pada server sebelum data dikirim ke viewer yang tidak memiliki izin reveal.

## Export

- Export mengikuti filter aktif.
- XLSX/CSV dibuat di server.
- Catat aktivitas export.
- Viewer tidak memperoleh kolom sensitif kecuali diberi izin.
- Batasi jumlah row atau gunakan background job bila data membesar.

## Environment Variables

```env
NEXT_PUBLIC_APP_URL=https://dashboard.dekatlokal.com
NEXT_PUBLIC_MAIN_SITE_URL=https://dekatlokal.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CHECKUP_INTEGRATION_SECRET=
AUDIT_HASH_SECRET=
NEXT_PUBLIC_DATA_MODE=demo
```

`SUPABASE_SERVICE_ROLE_KEY` dan `CHECKUP_INTEGRATION_SECRET` tidak boleh menggunakan prefix `NEXT_PUBLIC_`.

## Observability

- structured server logs;
- log request id;
- log integration errors tanpa data pribadi penuh;
- error monitoring;
- database slow-query monitoring;
- health endpoint opsional.


---

## SOURCE FILE: 04_DATABASE_SECURITY.md

# DATABASE AND SECURITY SPECIFICATION

## Model Data

### profiles

Profil pengguna dashboard dan role.

### umkm

Identitas stabil sebuah usaha.

Kolom utama:

- id UUID;
- legacy_no integer nullable;
- business_name;
- owner_name;
- whatsapp_raw;
- whatsapp_normalized unique;
- email;
- created_at;
- updated_at;
- deleted_at.

### digital_checkups

Satu record untuk satu pengisian.

Kolom utama:

- id UUID;
- umkm_id FK;
- jawaban legalitas, produk, branding, digitalisasi, konsistensi, dan operasional;
- readiness_score;
- readiness_category;
- source;
- verification_status;
- data_status;
- submitted_at;
- verified_at;
- verified_by;
- created_at;
- updated_at;
- version.

### intervention_modules

Master modul pendampingan.

### checkup_modules

Relasi checkup dengan modul, urutan prioritas, dan status progres.

### audit_logs

Mencatat create, edit, verify, override, delete, restore, reveal PII, dan export.

## RLS

- Superadmin: seluruh operasi.
- Admin: select/update checkup dan UMKM, tidak dapat mengubah role.
- Viewer: select terbatas melalui view aman.
- Anonymous: tidak dapat membaca tabel.
- API integration menggunakan server context.

## PII

- Jangan menaruh WhatsApp/email pada client logs.
- Jangan menampilkan nomor penuh di list.
- Reveal data sensitif dicatat.
- Gunakan backup dan retention policy.
- Hindari memasukkan PII pada analytics pihak ketiga.

## Audit Payload

Simpan:

- actor_id;
- action;
- entity_type;
- entity_id;
- before_data JSONB;
- after_data JSONB;
- reason;
- ip_hash;
- user_agent;
- created_at.

Untuk before/after data, redaksi nilai sensitif bila tidak diperlukan.

## Concurrency

Gunakan `version` integer. Update harus menyertakan version sebelumnya. Bila version berubah, tampilkan konflik dan minta pengguna reload agar edit orang lain tidak tertimpa.

## Verification

Admin dapat menandai:

- unverified;
- verified;
- needs_revision;
- archived.

Verifikasi tidak mengubah jawaban secara otomatis.


---

## SOURCE FILE: 05_SCORING_AND_MODULES.md

# SCORING AND INTERVENTION MODULE SPEC

## Prinsip

Skor dihitung dari 19 poin maksimum. Nilai akhir dibulatkan:

`round(total_point / 19 * 100)`

Scoring function harus menjadi pure function TypeScript dan memiliki unit test.

## Bobot

| Indikator | Jawaban | Poin |
|---|---|---:|
| NIB | Iya | 1 |
| Produk aktif | Iya | 1 |
| Harga | Iya Jelas | 1 |
| Harga | Kadang Berubah | 0.5 |
| Harga | Belum | 0 |
| Stok | Keduanya | 1 |
| Stok | Ready Stok / Pre-Order | 0.75 |
| Nama brand tetap | Iya | 1 |
| Logo | Iya | 1 |
| Visual | Konsisten | 1 |
| Visual | Sebagian | 0.5 |
| Visual | Belum | 0 |
| Instagram terisi | Ada | 1 |
| TikTok terisi | Ada | 0.5 |
| Google Maps | Sudah | 1 |
| Ulasan Google | Sudah | 1 |
| Rating | ≥4.0 | 1 |
| Rating | <4.0 | 0.5 |
| Rating | Belum/tidak tahu | 0 |
| Facebook | Iya | 0.5 |
| WhatsApp Business | Iya | 1 |
| E-commerce | Minimal satu | 1 |
| Sosial aktif | Aktif | 1 |
| Konten | Rutin | 1 |
| Konten | Kadang | 0.5 |
| Konten | Tidak | 0 |
| Pembayaran | Keduanya | 1 |
| Pembayaran | QRIS/Transfer | 0.75 |
| Pembayaran | Tunai | 0.25 |
| Pengiriman | Iya | 1 |
| Channel | WhatsApp | 1 |
| Channel | DM media sosial | 0.75 |
| Channel | Hanya toko | 0.25 |

## Kategori

- `<50`: Rendah
- `50–69`: Menengah
- `≥70`: Siap

## Mapping Modul

### Legalitas Usaha & Pembuatan NIB
Aktif bila belum memiliki NIB.

### Branding Dasar & Logo
Aktif bila belum memiliki nama brand tetap atau logo.

### Standardisasi Kemasan dan Visual Produk
Aktif bila visual tidak konsisten.

### Penetapan Harga & Katalog Produk
Aktif bila harga belum jelas atau kadang berubah.

### Google Business Profile & Google Maps
Aktif bila belum terdaftar Google Maps.

### WhatsApp Business & Katalog
Aktif bila tidak menggunakan WhatsApp Business.

### Strategi Konten Media Sosial
Aktif bila sosial tidak aktif atau posting tidak rutin.

### Marketplace & Penjualan Online
Aktif bila usaha menjual produk tetapi belum memakai e-commerce.

### QRIS & Pembayaran Digital
Aktif bila hanya menerima tunai.

### Pengelolaan Pesanan & Pengiriman
Aktif bila usaha produk belum terbiasa mengirim pesanan.

### Pembuatan Akun Digital Bisnis
Aktif bila Instagram dan TikTok kosong.

### Website Profil UMKM & CTA WhatsApp
Dapat menjadi modul umum, terutama untuk UMKM yang telah mempunyai identitas produk tetapi belum memiliki aset web.

## Prioritas Modul

Urutkan:

1. legalitas dan produk aktif;
2. identitas brand dan harga;
3. kanal pelanggan: WhatsApp dan Google Maps;
4. konten dan marketplace;
5. pembayaran/pengiriman;
6. website.

Simpan maksimal enam rekomendasi utama pada ringkasan, tetapi seluruh rules dapat disimpan pada detail.

## Override

Superadmin boleh override skor hanya dengan alasan. Simpan:

- calculated_score;
- overridden_score;
- override_reason;
- overridden_by;
- overridden_at.

Kategori default tetap dihitung dari effective score.


---

## SOURCE FILE: 06_IMPLEMENTATION_CHECKLIST.md

# IMPLEMENTATION CHECKLIST

## Phase 0 — Persiapan

- [ ] Baca semua spesifikasi.
- [ ] Buat implementation plan.
- [ ] Inisialisasi Next.js TypeScript.
- [ ] Pasang dependency.
- [ ] Buat `.env.example`.
- [ ] Konfigurasi lint, typecheck, dan test.

## Phase 1 — Database

- [ ] Jalankan migration.
- [ ] Buat RLS.
- [ ] Buat indexes.
- [ ] Buat seed idempotent.
- [ ] Verifikasi 50 UMKM.
- [ ] Pastikan distribusi 39 Rendah, 9 Menengah, 2 Siap.

## Phase 2 — Auth dan Shell

- [ ] Login.
- [ ] Middleware protected routes.
- [ ] Role guard.
- [ ] Sidebar/header.
- [ ] Responsive navigation.
- [ ] Unauthorized state.

## Phase 3 — Overview

- [ ] KPI.
- [ ] Distribution chart.
- [ ] Gap chart.
- [ ] Modul priority chart.
- [ ] Latest submissions.
- [ ] High-priority list.
- [ ] Loading/empty/error states.

## Phase 4 — Tabel

- [ ] Server pagination.
- [ ] Search.
- [ ] Filter.
- [ ] Sorting.
- [ ] Column toggle.
- [ ] URL state.
- [ ] Contact masking.
- [ ] Export filtered data.

## Phase 5 — Detail dan Edit

- [ ] Detail summary.
- [ ] Tabs.
- [ ] Edit form.
- [ ] Zod validation.
- [ ] Scoring recalculation.
- [ ] Recompute modules.
- [ ] Audit trail.
- [ ] Verification.
- [ ] WhatsApp action.
- [ ] Concurrency conflict handling.

## Phase 6 — Integration API

- [ ] POST checkup.
- [ ] Auth integration secret.
- [ ] Idempotency.
- [ ] Rate limit.
- [ ] Normalisasi nomor.
- [ ] Upsert UMKM.
- [ ] API docs.
- [ ] Error contract.

## Phase 7 — Quality

- [ ] Unit test scoring.
- [ ] Unit test recommendation.
- [ ] Integration test CRUD.
- [ ] RLS test.
- [ ] Smoke test auth.
- [ ] Keyboard test.
- [ ] Mobile test.
- [ ] `npm run lint`.
- [ ] `npm run typecheck`.
- [ ] `npm run test`.
- [ ] `npm run build`.

## Definition of Done

- Tidak ada tombol dummy.
- Tidak ada secret di client.
- Tidak ada TypeScript/build error.
- Edit mengubah skor dan modul.
- Audit log tercatat.
- Dashboard memakai database.
- Seed dapat dijalankan ulang tanpa duplikasi.
- Data personal aman.


---

## SOURCE FILE: 07_DEPLOYMENT_SUBDOMAIN.md

# DEPLOYMENT AND SUBDOMAIN

## Subdomain

Gunakan:

`dashboard.dekatlokal.com`

Karena dashboard berisi data pribadi, jangan mengindeks halaman dashboard.

Tambahkan:

```ts
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
```

## Vercel

1. Buat project Vercel baru dari repository dashboard.
2. Tambahkan environment variables Production/Preview/Development.
3. Tambahkan domain `dashboard.dekatlokal.com`.
4. Pastikan build, migration, dan seed memiliki prosedur terpisah.
5. Jangan menjalankan seed training otomatis pada production setelah data live digunakan.

## Cloudflare

Buat DNS record:

- Type: CNAME
- Name: dashboard
- Target: nilai CNAME yang diberikan Vercel
- Proxy: ikuti rekomendasi verifikasi Vercel; bila ada masalah domain, gunakan DNS only sampai verifikasi selesai.

Gunakan SSL/TLS Full (strict).

## Integrasi dengan Web Utama

Jangan mengirim service-role key dari browser web utama.

Opsi yang direkomendasikan:

- Form web utama submit ke server action/route handler pada project web utama.
- Server web utama meneruskan payload ke `https://dashboard.dekatlokal.com/api/v1/checkups`.
- Gunakan integration secret dan idempotency key.
- Dashboard API mengembalikan submission id dan score.
- Web utama dapat menampilkan halaman hasil berdasarkan response aman.

## CORS

Server-to-server tidak membutuhkan CORS browser. Bila tetap ada browser request lintas subdomain, batasi origin hanya ke `https://dekatlokal.com`, tetapi pola ini bukan pilihan utama untuk secret integration.

## Data Mode

Gunakan:

- `NEXT_PUBLIC_DATA_MODE=demo` saat memakai seed training.
- `NEXT_PUBLIC_DATA_MODE=live` saat menerima submission aktual.

Pada mode demo, tampilkan badge internal kecil `Data Training`. Jangan menyebut seed sintetis sebagai hasil asesmen terverifikasi dalam laporan publik.

## Go-Live Checklist

- [ ] Domain terverifikasi.
- [ ] Auth berjalan.
- [ ] RLS diuji.
- [ ] Backup aktif.
- [ ] Secret dirotasi.
- [ ] API integration diuji.
- [ ] Robots noindex.
- [ ] Error monitoring aktif.
- [ ] Data seed training dipisahkan dari data live.
- [ ] Admin awal dibuat secara aman.
