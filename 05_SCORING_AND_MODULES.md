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
