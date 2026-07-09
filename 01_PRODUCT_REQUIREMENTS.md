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
