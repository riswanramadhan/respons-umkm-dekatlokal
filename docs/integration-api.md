# Batas integrasi demo

Repository ini tidak mengimplementasikan integrasi dengan sistem DekatLokal. Route `POST /api/v1/checkups` hanya menjadi guard dan selalu mengembalikan `501 DEMO_UI_ONLY`.

UI menggunakan object canonical di `src/demo/store.ts` agar mudah dipetakan ke backend resmi di kemudian hari. Saat tim mengadopsi desain ini:

1. buat adapter pada layer repository;
2. petakan respons backend ke tipe feature yang sudah ada;
3. pertahankan masking, error state, loading state, dan optimistic-conflict UX;
4. serahkan autentikasi, otorisasi, audit, dan persistensi kepada sistem DekatLokal;
5. hapus store demo setelah seluruh layar terhubung dan diuji.

Tidak ada secret integrasi atau kontrak server-to-server yang diperlukan untuk menjalankan demo.
