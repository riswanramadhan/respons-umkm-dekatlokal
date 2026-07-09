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
