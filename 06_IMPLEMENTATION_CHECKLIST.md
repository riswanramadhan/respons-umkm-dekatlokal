# IMPLEMENTATION CHECKLIST

## Phase 0 — Persiapan

- [ ] Baca semua spesifikasi.
- [ ] Buat implementation plan.
- [ ] Inisialisasi Next.js TypeScript.
- [ ] Pasang dependency.
- [ ] Buat `.env.example`.
- [ ] Konfigurasi lint, typecheck, dan test.

## Phase 1 — Database

- [ ] Jalankan migration.
- [ ] Buat RLS.
- [ ] Buat indexes.
- [ ] Buat seed idempotent.
- [ ] Verifikasi 50 UMKM.
- [ ] Pastikan distribusi 39 Rendah, 9 Menengah, 2 Siap.

## Phase 2 — Auth dan Shell

- [ ] Login.
- [ ] Middleware protected routes.
- [ ] Role guard.
- [ ] Sidebar/header.
- [ ] Responsive navigation.
- [ ] Unauthorized state.

## Phase 3 — Overview

- [ ] KPI.
- [ ] Distribution chart.
- [ ] Gap chart.
- [ ] Modul priority chart.
- [ ] Latest submissions.
- [ ] High-priority list.
- [ ] Loading/empty/error states.

## Phase 4 — Tabel

- [ ] Server pagination.
- [ ] Search.
- [ ] Filter.
- [ ] Sorting.
- [ ] Column toggle.
- [ ] URL state.
- [ ] Contact masking.
- [ ] Export filtered data.

## Phase 5 — Detail dan Edit

- [ ] Detail summary.
- [ ] Tabs.
- [ ] Edit form.
- [ ] Zod validation.
- [ ] Scoring recalculation.
- [ ] Recompute modules.
- [ ] Audit trail.
- [ ] Verification.
- [ ] WhatsApp action.
- [ ] Concurrency conflict handling.

## Phase 6 — Integration API

- [ ] POST checkup.
- [ ] Auth integration secret.
- [ ] Idempotency.
- [ ] Rate limit.
- [ ] Normalisasi nomor.
- [ ] Upsert UMKM.
- [ ] API docs.
- [ ] Error contract.

## Phase 7 — Quality

- [ ] Unit test scoring.
- [ ] Unit test recommendation.
- [ ] Integration test CRUD.
- [ ] RLS test.
- [ ] Smoke test auth.
- [ ] Keyboard test.
- [ ] Mobile test.
- [ ] `npm run lint`.
- [ ] `npm run typecheck`.
- [ ] `npm run test`.
- [ ] `npm run build`.

## Definition of Done

- Tidak ada tombol dummy.
- Tidak ada secret di client.
- Tidak ada TypeScript/build error.
- Edit mengubah skor dan modul.
- Audit log tercatat.
- Dashboard memakai database.
- Seed dapat dijalankan ulang tanpa duplikasi.
- Data personal aman.
