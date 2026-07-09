# DekatLokal Dashboard — UI Demo

Prototipe UI profesional untuk mengevaluasi pengalaman dashboard Digital Checkup DekatLokal. Aplikasi ini sengaja berdiri sendiri: tidak memakai Docker, Supabase, database, akun cloud, atau backend DekatLokal yang sebenarnya.

Target preview: `https://dashboard.dekatlokal.com`.

## Yang dapat diuji

- Overview analitik dengan KPI, chart, tren, prioritas, dan aktivitas terbaru.
- Daftar 50 UMKM sintetis dengan pencarian, filter, sorting, pagination, density, dan pilihan kolom.
- Detail UMKM, edit tujuh bagian, perhitungan skor otomatis, verifikasi, override, reveal kontak, dan soft delete/restore.
- Rekomendasi serta progres modul intervensi.
- Simulasi role, pengguna, audit log, notifikasi, dan export CSV/XLSX.
- Layout desktop/mobile, loading state, empty state, error boundary, dan aksesibilitas dasar.

Semua aksi bekerja pada store in-memory agar alur UI terasa nyata. Perubahan bertahan selama proses development berjalan dan dapat dikembalikan melalui **Pengaturan → Reset data**.

## Menjalankan di localhost

Prasyarat: Node.js 20.9+ dan pnpm 11.

```bash
pnpm install
pnpm dev
```

Buka `http://localhost:3000`. Tidak perlu membuat `.env.local`. Halaman login sudah berisi kredensial demo; `/dashboard` juga dapat dibuka langsung.

## Sumber data dan arsitektur demo

`data/digital-checkup.seed.json` menjadi sumber 50 UMKM sintetis. Server Next.js memuatnya ke store in-memory, lalu repository dan route internal menyimulasikan query serta mutation yang kelak dapat dipetakan ke API milik DekatLokal.

Endpoint submission eksternal sengaja dinonaktifkan dan mengembalikan `501 DEMO_UI_ONLY`. Prototipe ini tidak boleh diperlakukan sebagai sistem penyimpanan data atau dashboard produksi.

## Quality gate

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

`test:e2e` menggunakan Google Chrome yang terpasang di sistem. CI hanya menjalankan pemeriksaan aplikasi; tidak ada job database atau container.

## Dokumentasi

- [Ruang lingkup UI](docs/ui.md)
- [Preview deployment](docs/deployment.md)
- [Batas integrasi](docs/integration-api.md)

Dokumen `00_` sampai `07_` merupakan brief implementasi awal. Scope aktif untuk repository ini adalah demo UI yang dijelaskan pada README ini.
