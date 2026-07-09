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
