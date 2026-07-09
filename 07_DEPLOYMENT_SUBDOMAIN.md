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
