# Preview deployment

Build ini ditujukan sebagai preview UI di `dashboard.dekatlokal.com`, bukan dashboard operasional.

## Vercel

1. Import repository sebagai project Next.js dengan pnpm.
2. Gunakan build command `pnpm build` dan output default Next.js.
3. Environment tidak wajib. `NEXT_PUBLIC_APP_URL` dan `NEXT_PUBLIC_MAIN_SITE_URL` boleh diatur bila URL preview berbeda.
4. Hubungkan custom domain `dashboard.dekatlokal.com` setelah preview lolos review.
5. Verifikasi `/api/health`, `/login`, `/dashboard`, detail UMKM, mutation demo, reset, dan export.

Tidak ada migration, container, database, SMTP, secret, atau provisioning layanan eksternal.

## Batas penggunaan

- Data bersifat sintetis dan tidak persisten.
- Login/role hanya simulasi UI.
- Jangan memasukkan data pelanggan nyata.
- Jangan menghubungkan web utama ke endpoint demo.
- Saat UI diadopsi ke sistem DekatLokal, pertahankan kontrak komponen dan ganti repository demo dengan adapter backend resmi.
