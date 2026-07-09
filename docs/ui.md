# Ruang lingkup UI demo

- `/login`: simulasi login dan pemulihan password; kredensial sudah terisi.
- `/dashboard`: KPI, distribusi kategori, gap, modul, tren, adopsi kanal, submission terbaru, dan prioritas tinggi.
- `/dashboard/umkm`: tabel dengan filter URL, sorting, pagination, mobile card, bulk action, column/density toggle, dan export.
- `/dashboard/umkm/[id]`: ringkasan, jawaban, edit tujuh bagian, modul, histori, audit, reveal kontak, verifikasi, override, WhatsApp, dan export.
- `/dashboard/modul`: kebutuhan/progres modul serta simulasi pengelolaan katalog.
- `/dashboard/aktivitas`: audit diff, filter, pagination, dan pemulihan checkup yang dihapus.
- `/dashboard/pengaturan`: profil, pengguna demo, status sumber data, dan reset sesi.

Data berasal dari seed lokal. Mutation memperbarui store in-memory dan audit simulasi, sehingga tombol utama dapat diuji tanpa backend eksternal. Semua layar utama memiliki state responsif, fokus keyboard, label, skeleton, dan fallback error.
