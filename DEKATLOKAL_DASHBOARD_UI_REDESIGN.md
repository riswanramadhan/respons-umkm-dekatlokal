# DEKATLOKAL DIGITAL CHECKUP DASHBOARD
## UI/UX Redesign Specification

> Gunakan dokumen ini untuk meredesain aplikasi yang **sudah berfungsi**.  
> Jangan mengubah database, autentikasi, API, scoring, role, RLS, CRUD, filter, export, seed, atau audit log.  
> Fokus pada **layout, visual system, component composition, responsiveness, dan interaction quality**.

---

## 1. Design Goal

Ubah dashboard menjadi produk SaaS analytics modern yang terinspirasi dari referensi:

- sidebar putih tetap di kiri;
- top header tipis;
- background halaman abu-abu sangat muda;
- card putih dengan border halus;
- radius besar namun tetap profesional;
- shadow sangat lembut;
- aksen biru sebagai primary color;
- dashboard modular berbasis widget;
- tabel data berada di card besar;
- panel kanan untuk menambah widget;
- tampilan padat data tetapi tidak ramai.

Jangan menyalin identitas brand pada referensi. Adaptasikan sepenuhnya menjadi identitas **DekatLokal**.

---

## 2. Existing Functionality Must Stay

Seluruh fitur berikut wajib tetap berjalan:

- login dan role-based access;
- dashboard overview;
- tabel data UMKM;
- search, filter, sorting, pagination;
- detail UMKM;
- edit data;
- auto-scoring;
- kategori Rendah, Menengah, Siap;
- rekomendasi modul;
- status verifikasi;
- audit log;
- export;
- API submission;
- Supabase;
- responsive layout.

Redesign tidak boleh mengubah source of truth dari database.

---

## 3. Design Tokens

```css
:root {
  --brand-primary: #0255F5;
  --brand-primary-hover: #0148D8;
  --brand-primary-soft: #EAF1FF;

  --page-bg: #F4F6FA;
  --surface: #FFFFFF;
  --surface-muted: #F8FAFC;

  --text-primary: #111827;
  --text-secondary: #667085;
  --text-tertiary: #98A2B3;

  --border: #E7EAF0;
  --border-strong: #D8DDE7;

  --success: #16A34A;
  --success-soft: #EAF8EF;
  --warning: #F59E0B;
  --warning-soft: #FFF7E8;
  --danger: #EF4444;
  --danger-soft: #FDECEC;

  --radius-control: 10px;
  --radius-card: 16px;
  --radius-panel: 20px;

  --shadow-card:
    0 1px 2px rgba(16,24,40,.03),
    0 4px 12px rgba(16,24,40,.04);

  --shadow-floating:
    0 16px 40px rgba(16,24,40,.12);
}
```

Gunakan `Geist` atau `Inter`.

- page title: 24–28 px;
- section title: 16–18 px;
- KPI value: 26–30 px;
- dashboard body: 13–14 px;
- table: 12–13 px;
- caption: 11–12 px.

---

## 4. Application Shell

### Desktop

```text
┌─────────────────────────────────────────────────────┐
│ Sidebar 232 px │ Sticky Top Header 64 px            │
│                ├─────────────────────────────────────┤
│                │ Main Content                       │
└─────────────────────────────────────────────────────┘
```

### Sidebar

- width 232 px;
- collapsed width 72 px;
- background putih;
- border kanan tipis;
- logo DekatLokal di bagian atas;
- icon 18 px;
- menu aktif memakai `#EAF1FF`;
- menu aktif memiliki indikator biru 3 px di kiri;
- bagian bawah berisi Pengaturan dan Bantuan.

Menu:

```text
Overview
Data UMKM
Modul Pendampingan
Aktivitas
Export & Laporan
Pengaturan
```

Active item:

```css
background: #EAF1FF;
color: #0255F5;
font-weight: 600;
```

### Top Header

Tinggi 64 px dan sticky.

Isi:

- global search;
- date range;
- tombol `Tambah Widget`;
- tombol `Export`;
- notification;
- avatar admin.

Search bar:

```text
width: 280–360 px
height: 38 px
background: #F8FAFC
radius: 10 px
```

---

## 5. Dashboard Grid

Gunakan grid 12 kolom.

### Desktop

```text
Row 1: 4 KPI cards
Row 2: Main analytics 8 col + Distribution 4 col
Row 3: Gap indicators 8 col + Readiness gauge 4 col
Row 4: Priority UMKM 8 col + Priority modules 4 col
Row 5: Latest submissions full width
```

### Tablet

- 2 KPI per row;
- chart menjadi full width bila sempit;
- sidebar dapat collapse.

### Mobile

- sidebar menjadi drawer;
- 1 KPI per row;
- chart full width;
- tabel menjadi card list;
- filter menjadi bottom sheet.

---

## 6. Dashboard Default Composition

```text
Dashboard
Pantau tingkat kesiapan digital dan kebutuhan pendampingan UMKM.

[Date Range] [Tambah Widget] [Export]

Total UMKM | Rendah | Menengah | Siap

Tren Kesiapan Digital       | Distribusi Kesiapan

Gap Digitalisasi Terbesar   | Indeks Kesiapan Digital

UMKM Prioritas              | Modul Paling Dibutuhkan

Submission Terbaru
```

---

## 7. KPI Cards

Visual:

- background putih;
- border tipis;
- radius 16 px;
- padding 16–18 px;
- tinggi 112–124 px;
- icon kecil kanan atas;
- angka besar;
- delta badge kecil;
- tanpa gradient penuh.

KPI utama:

1. Total UMKM
2. Kesiapan Rendah
3. Kesiapan Menengah
4. Siap Digital

KPI opsional:

- Rata-rata Skor
- Belum Memiliki NIB
- Belum Terdaftar Google Maps
- Belum Menggunakan WhatsApp Business

Contoh:

```tsx
<KpiCard
  title="Kesiapan Rendah"
  value={39}
  helper="Perlu intervensi prioritas"
  icon={AlertCircle}
  tone="danger"
/>
```

---

## 8. Main Analytics Card

Judul:

```text
Tren Kesiapan Digital
```

Isi:

- rata-rata skor;
- perubahan periode;
- line chart;
- date range;
- tooltip;
- menu tiga titik.

Metrik yang dapat dipilih:

- rata-rata skor;
- jumlah submission;
- jumlah verified;
- jumlah UMKM kategori rendah;
- progress pendampingan.

Chart style:

- garis utama biru;
- grid sangat tipis;
- axis kecil;
- tooltip putih;
- active dot jelas;
- tidak menggunakan banyak warna.

---

## 9. Distribution Card

Judul:

```text
Distribusi Kesiapan
```

Gunakan donut chart:

```text
Rendah   39
Menengah  9
Siap      2
```

Angka tengah:

```text
50
Total UMKM
```

Warna:

```text
Rendah   #EF4444
Menengah #F59E0B
Siap     #16A34A
```

---

## 10. Gap Indicators

Judul:

```text
Gap Digitalisasi Terbesar
```

Subjudul:

```text
Jumlah UMKM yang masih membutuhkan intervensi
```

Indikator:

- NIB;
- Logo;
- Google Maps;
- WhatsApp Business;
- Aktivitas Media Sosial;
- Marketplace;
- QRIS;
- Pengiriman.

Gunakan horizontal bar dengan track abu-abu dan bar biru.

---

## 11. Readiness Gauge

Judul:

```text
Indeks Kesiapan Digital
```

Gunakan radial gauge seperti card persentase pada referensi.

Contoh:

```text
39.6%
Kesiapan rata-rata
Target 70%
```

Tambahkan CTA:

```text
Lihat Detail
```

---

## 12. Priority Modules

Judul:

```text
Modul Paling Dibutuhkan
```

Tampilkan maksimal 5 modul.

Setiap row:

```text
[icon] Google Business Profile
       32 UMKM
       progress bar
```

Klik menuju:

```text
/dashboard/modul?module=google-business-profile
```

---

## 13. Add Widget System

Tombol:

```text
+ Tambah Widget
```

Klik membuka drawer kanan.

### Desktop

```text
width: 440 px
height: 100vh
position: fixed
right: 0
background: white
border-left
shadow: floating
```

### Mobile

Gunakan bottom sheet atau full-screen sheet.

Isi drawer:

```text
Tambah Widget                          ×

[Search widget...]

Analytics
- Distribusi Kesiapan
- Tren Submission
- Indeks Kesiapan
- Gap Digitalisasi

Operations
- UMKM Prioritas
- Submission Terbaru
- Status Verifikasi
- Aktivitas Admin

Intervention
- Modul Prioritas
- Google Maps Adoption
- WhatsApp Business Adoption
- Marketplace Adoption
```

Setiap item:

- icon preview;
- nama;
- deskripsi singkat;
- category badge;
- tombol `Tambahkan`.

Widget dapat:

- ditambahkan;
- disembunyikan;
- diurutkan;
- di-reset.

Jika preferensi belum disimpan di database, gunakan local storage tanpa mengubah core database.

---

## 14. Data UMKM Table

Card header:

```text
Data UMKM
Kelola hasil Digital Checkup dan kebutuhan pendampingan.

[Search] [Filter] [Kolom] [Export] [+ Tambah Data]
```

Kolom default:

```text
Nama UMKM
Pemilik
Skor
Kategori
NIB
Google Maps
WhatsApp Business
Konten
Modul Prioritas
Status
Tanggal Masuk
Aksi
```

Style:

- card putih;
- radius 16 px;
- row height 58–64 px;
- header sticky;
- hover `#F8FAFC`;
- divider tipis;
- nama UMKM bold;
- pemilik secondary text;
- score berupa angka + mini progress;
- action memakai kebab menu.

Badge:

```text
Rendah    red soft
Menengah  yellow soft
Siap      green soft
```

Contact masking:

```text
0813••••8341
ri••••@gmail.com
```

Data penuh hanya di halaman detail atau setelah reveal.

---

## 15. Filter Experience

Gunakan popover desktop dan sheet pada mobile.

Filter:

- kategori;
- rentang skor;
- NIB;
- Google Maps;
- WhatsApp Business;
- media sosial;
- e-commerce;
- modul;
- status verifikasi;
- tanggal submission.

Active filters tampil sebagai chips:

```text
Kategori: Rendah ×
NIB: Belum ×
```

Sediakan `Reset Filter`.

---

## 16. Detail UMKM

Desktop:

```text
Header full width
Main content 8 col
Summary panel 4 col
```

Header berisi:

- nama UMKM;
- pemilik;
- category badge;
- verification badge;
- score;
- Edit;
- Verifikasi;
- WhatsApp;
- overflow menu.

Tabs:

```text
Ringkasan
Jawaban Checkup
Modul
Riwayat
```

Right summary card bersifat sticky dan berisi:

- skor;
- kategori;
- gap utama;
- modul;
- status verifikasi;
- tanggal submission;
- last updated;
- sumber data.

Jawaban lemah memakai warning soft, bukan warna merah agresif.

---

## 17. Edit Drawer

Desktop width:

```text
580–640 px
```

Mobile:

```text
full screen
```

Section:

1. Identitas
2. Legalitas
3. Produk
4. Branding
5. Digitalisasi
6. Konsistensi
7. Operasional

Gunakan accordion atau stepper.

Sticky footer:

```text
[Batal] [Simpan Perubahan]
```

Sebelum menyimpan, tampilkan:

- skor lama;
- skor baru;
- kategori lama;
- kategori baru;
- modul yang ditambah;
- modul yang dihapus.

Semua perubahan tetap memakai validasi dan audit log yang sudah ada.

---

## 18. Module Page

Tampilkan grid module cards.

Isi card:

- icon;
- nama modul;
- jumlah UMKM;
- persentase;
- progress;
- CTA `Lihat UMKM`;
- status aktif.

Contoh:

```text
Google Business Profile
32 UMKM membutuhkan
64% dari total
```

---

## 19. Activity Page

Gunakan activity timeline atau table.

Aktivitas:

- submission baru;
- edit;
- verifikasi;
- perubahan skor;
- export;
- reveal data;
- archive.

Item:

```text
Avatar
Nama Admin
Aksi
Entity
Waktu
```

---

## 20. Export Experience

Sediakan drawer atau halaman export.

Pilihan:

- CSV;
- XLSX;
- PDF summary;
- filter aktif;
- semua data;
- periode;
- include/exclude PII;
- include modules;
- include audit.

Catat setiap export pada audit log.

---

## 21. States

### Loading

Gunakan:

- skeleton KPI;
- skeleton chart;
- skeleton table.

Jangan gunakan spinner besar untuk seluruh halaman.

### Empty

```text
Belum ada data Digital Checkup
Data akan muncul setelah UMKM mengisi formulir.
```

### Error

```text
Data belum berhasil dimuat
Coba kembali beberapa saat lagi.
```

CTA:

```text
Muat Ulang
```

---

## 22. Microinteractions

- hover 120–180 ms;
- drawer slide;
- tooltip fade;
- card hover sangat halus;
- button press maksimal scale 0.98;
- chart animation singkat;
- tidak ada animasi berlebihan.

---

## 23. Responsive Rules

### ≥ 1440 px

- sidebar 232 px;
- 4 KPI columns;
- 12-column grid.

### 1024–1439 px

- sidebar dapat collapse;
- 2–4 KPI columns;
- chart 8/4 atau 7/5.

### 768–1023 px

- sidebar overlay;
- 2 KPI columns;
- chart full width;
- filter sheet.

### < 768 px

- 1 KPI column;
- table menjadi cards;
- actions masuk overflow menu;
- edit drawer full screen.

---

## 24. Reusable Components

```text
AppSidebar
TopHeader
PageHeader
KpiCard
ChartCard
ReadinessBadge
VerificationBadge
ScoreProgress
MetricDelta
WidgetDrawer
WidgetPickerCard
UmkmDataTable
FilterBar
FilterChip
ModuleProgressItem
ActivityItem
EmptyState
ErrorState
LoadingSkeleton
DetailSummaryCard
EditCheckupDrawer
```

Hindari markup duplikat antarhalaman.

---

## 25. Tailwind Patterns

### Card

```tsx
className="
  rounded-2xl
  border border-slate-200/80
  bg-white
  shadow-[0_1px_2px_rgba(16,24,40,0.03),0_4px_12px_rgba(16,24,40,0.04)]
"
```

### Active Sidebar

```tsx
className="
  relative flex items-center gap-3
  rounded-xl px-3 py-2.5
  bg-blue-50 text-[#0255F5]
  font-medium
  before:absolute before:left-[-12px]
  before:h-6 before:w-[3px]
  before:rounded-r-full before:bg-[#0255F5]
"
```

### Primary Button

```tsx
className="
  h-9 rounded-xl
  bg-[#0255F5] px-4
  text-sm font-medium text-white
  hover:bg-[#0148D8]
  transition-colors
"
```

### Input

```tsx
className="
  h-10 rounded-xl
  border border-slate-200
  bg-slate-50/60
  px-3 text-sm
  focus:border-[#0255F5]
  focus:ring-2 focus:ring-blue-100
"
```

---

## 26. Rules for Existing Codebase

1. Jangan menghapus route.
2. Jangan membangun ulang project dari nol.
3. Jangan mengganti Supabase implementation.
4. Jangan mengubah scoring.
5. Jangan mengubah role dan RLS.
6. Jangan mengganti API contract.
7. Jangan menghapus filter.
8. Jangan menghapus export.
9. Jangan mengubah seed format.
10. Jangan membuat hardcoded data.
11. Refactor presentation layer secara bertahap.
12. Jalankan lint, typecheck, test, dan build.

---

## 27. Codex / Claude Code Prompt

```text
Redesign aplikasi DekatLokal Digital Checkup Dashboard yang sudah ada menggunakan spesifikasi pada file DEKATLOKAL_DASHBOARD_UI_REDESIGN.md.

PENTING:
- Project sudah berfungsi.
- Jangan membangun ulang dari nol.
- Jangan merusak database, Supabase, API, auth, role, RLS, scoring, CRUD, filter, export, seed data, atau audit log.
- Fokus pada UI/UX redesign dan component refactor.
- Gunakan gaya modern SaaS analytics seperti gambar referensi, tetapi tetap memakai identitas DekatLokal.
- Primary color wajib #0255F5.
- Gunakan background abu-abu sangat muda, sidebar putih, header tipis, cards rounded, border halus, dan shadow lembut.
- Implementasikan add-widget drawer seperti spesifikasi.
- Implementasikan responsive behavior.
- Jangan meninggalkan tombol dummy.
- Jangan menggunakan hardcoded data.
- Semua dashboard tetap membaca data dari database.

Sebelum coding:
1. audit struktur project;
2. identifikasi komponen yang dapat dipertahankan;
3. buat mapping current component ke redesigned component;
4. buat implementation plan per halaman;
5. jelaskan file yang akan diubah;
6. baru mulai implementasi.

Urutan:
1. design tokens dan global styles;
2. app shell;
3. dashboard overview;
4. KPI cards;
5. charts;
6. widget drawer;
7. data table;
8. detail UMKM;
9. edit drawer;
10. module, activity, export;
11. responsiveness;
12. accessibility;
13. lint, typecheck, test, build.

Setelah selesai:
- tampilkan daftar file yang berubah;
- jelaskan perubahan visual;
- pastikan fitur lama tetap berjalan;
- laporkan lint, typecheck, test, dan build.
```

---

## 28. Acceptance Checklist

### Visual

- [ ] Sidebar mengikuti struktur referensi.
- [ ] Top header ringan dan modern.
- [ ] Background abu-abu muda.
- [ ] Semua card putih dengan border tipis.
- [ ] Radius konsisten.
- [ ] Shadow lembut.
- [ ] Primary color #0255F5.
- [ ] KPI cards ringkas.
- [ ] Main chart besar.
- [ ] Right analytics column.
- [ ] Add Widget drawer.
- [ ] Tabel premium dan mudah dibaca.
- [ ] Mobile layout nyaman.

### Functional

- [ ] Auth tetap berjalan.
- [ ] Role tetap berjalan.
- [ ] CRUD tetap berjalan.
- [ ] Scoring tetap berjalan.
- [ ] Filter tetap berjalan.
- [ ] Export tetap berjalan.
- [ ] Detail tetap berjalan.
- [ ] Edit menghitung ulang skor.
- [ ] Audit log tetap tercatat.
- [ ] API integration tetap berjalan.
- [ ] Tidak ada hardcoded data.

### Quality

- [ ] Tidak ada hydration error.
- [ ] Tidak ada TypeScript error.
- [ ] Tidak ada broken route.
- [ ] Tidak ada horizontal overflow mobile.
- [ ] Accessibility baik.
- [ ] Loading, empty, dan error state tersedia.
- [ ] Production build berhasil.

---

## 29. Final Direction

Hasil akhir harus terasa sebagai:

> **platform analytics dan intervention dashboard resmi DekatLokal**, bukan template admin biasa.

Dashboard harus memperlihatkan bahwa DekatLokal:

- memahami kondisi UMKM;
- memiliki data terstruktur;
- mampu menentukan intervensi;
- mampu memantau pendampingan;
- memiliki sistem digital profesional;
- siap digunakan bersama mitra dan institusi pendamping.
