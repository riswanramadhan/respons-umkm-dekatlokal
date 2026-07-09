# DATABASE AND SECURITY SPECIFICATION

## Model Data

### profiles

Profil pengguna dashboard dan role.

### umkm

Identitas stabil sebuah usaha.

Kolom utama:

- id UUID;
- legacy_no integer nullable;
- business_name;
- owner_name;
- whatsapp_raw;
- whatsapp_normalized unique;
- email;
- created_at;
- updated_at;
- deleted_at.

### digital_checkups

Satu record untuk satu pengisian.

Kolom utama:

- id UUID;
- umkm_id FK;
- jawaban legalitas, produk, branding, digitalisasi, konsistensi, dan operasional;
- readiness_score;
- readiness_category;
- source;
- verification_status;
- data_status;
- submitted_at;
- verified_at;
- verified_by;
- created_at;
- updated_at;
- version.

### intervention_modules

Master modul pendampingan.

### checkup_modules

Relasi checkup dengan modul, urutan prioritas, dan status progres.

### audit_logs

Mencatat create, edit, verify, override, delete, restore, reveal PII, dan export.

## RLS

- Superadmin: seluruh operasi.
- Admin: select/update checkup dan UMKM, tidak dapat mengubah role.
- Viewer: select terbatas melalui view aman.
- Anonymous: tidak dapat membaca tabel.
- API integration menggunakan server context.

## PII

- Jangan menaruh WhatsApp/email pada client logs.
- Jangan menampilkan nomor penuh di list.
- Reveal data sensitif dicatat.
- Gunakan backup dan retention policy.
- Hindari memasukkan PII pada analytics pihak ketiga.

## Audit Payload

Simpan:

- actor_id;
- action;
- entity_type;
- entity_id;
- before_data JSONB;
- after_data JSONB;
- reason;
- ip_hash;
- user_agent;
- created_at.

Untuk before/after data, redaksi nilai sensitif bila tidak diperlukan.

## Concurrency

Gunakan `version` integer. Update harus menyertakan version sebelumnya. Bila version berubah, tampilkan konflik dan minta pengguna reload agar edit orang lain tidak tertimpa.

## Verification

Admin dapat menandai:

- unverified;
- verified;
- needs_revision;
- archived.

Verifikasi tidak mengubah jawaban secara otomatis.
