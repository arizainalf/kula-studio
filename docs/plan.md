# Plan Eksekusi — Kula Studio

Urutan kerja docs-first. Tiap fase punya definisi selesai; jangan lanjut sebelum tercapai.

## Fase 0 — Setup (½ hari)

- [x] Init repo: `web/` (Vite React TS), `worker/` (Hono), root `package.json`
- [x] Supabase project baru (free tier) — simpan connection string (pooler)
- [ ] GitHub Actions keep-alive (ping REST 2×/minggu — cegah auto-pause)
- [ ] R2 bucket `kulastudio-photos` + CF account API token

**Selesai jika**: `wrangler dev` jalan lokal, `npm run dev` FE jalan, koneksi DB dari Worker lokal sukses (ping query).

## Fase 1 — Skema DB (1 hari)

- [x] Translate `docs/erd.md` → `worker/migrations/0001_init.sql`
- [x] Jalankan di Supabase (SQL editor / `psql`)
- [x] Seed data dummy: 1 admin, 1 manager, 2 PT, 5 client, 10 sesi

**Selesai jika**: query join PT→client→sesi jalan, constraint unique/FK teruji (insert duplikat ditolak).

## Fase 2 — Auth & User (1–2 hari)

- [x] Tabel + endpoint: register (pending), login, logout, session
- [x] Password hash (bcrypt/argon2 via `@noble/hashes` — Workers-compatible)
- [x] Session token: signed cookie (HMAC) — tanpa tabel session dulu (stateless JWT)
- [x] Middleware `requireAuth` + `requireRole('admin'|'manager'|'pt')`
- [x] Admin: approve/reject registrasi (whitelist)

**Selesai jika**: curl login → token → akses endpoint protected; role salah → 403; token invalid → 401.

## Fase 3 — Core CRUD (2–3 hari)

- [x] `/api/clients` — CRUD + validasi zod + ownership check (PT hanya akses client-nya; manager lihat semua PT di bawahnya)
- [x] `/api/sessions` — create/edit/delete, nested exercises JSONB
- [x] `/api/schedule` — CRUD jadwal, query by rentang tanggal
- [x] Pagination (keyset) untuk list sesi

**Selesai jika**: suite test request (bash/httpyac atau unit vitest) lulus semua happy + unauthorized path.

## Fase 4 — FE Shell (2–3 hari)

- [x] Scaffold Vite + TanStack Router + Tailwind v4
- [x] Design token: Luxury Dark Theme — dominan hitam obsidian `#09090b` & abu tua charcoal `#131417`, aksen emas champagne `#d4af37`, Archivo + DM Mono (lihat docs/design-system.md)
- [x] Layout: login → dashboard → client list → client detail (tab riwayat/jadwal/foto)
- [x] Auth flow: login form, guard route, logout
- [x] API client typed (fetch wrapper, kontrak dari Fase 3)

**Selesai jika**: login pakai seed data, navigasi 4 screen tanpa reload, unauthorized redirect ke login.

## Fase 5 — Fitur (3–4 hari)

- [x] Form sesi latihan (4 kategori exercise, RPE slider, berat)
- [x] Jadwal mingguan (grid 7 hari × jam) — CSS grid, tanpa lib kalender
- [ ] Chart SVG custom (berat, RPE, volume) — reusable component
- [ ] Upload foto → R2 via Worker (presigned/signed URL), gallery per client
- [ ] Export PDF (print CSS)

**Selesai jika**: E2E manual — buat client, isi 3 sesi + foto, lihat chart, export PDF.

## Fase 6 — Tier & Deploy (1–2 hari)

- [ ] Kolom `plan_tier`, `expires_at`; middleware grace logic (expired ≤14 hari → GET only)
- [x] Landing page 1 halaman (marketing statis) — tema Luxury Noir & Champagne Gold (lihat web/src/components/LandingPage.tsx)
- [x] `wrangler deploy` + CF Pages
- [x] Custom domain `kula-studio.my.id`

**Selesai jika**: live di domain publik, cold start < 1s, foto persist.

## Backlog (jangan sentuh sebelum MVP jalan)

- Generate program AI (Claude via proxy)
- Import PDF migrasi data
- Template sesi
- PWA + service worker offline cache
- Realtime (Supabase Realtime) — sync lintas device

## Risiko & mitigasi

| Risiko | Mitigasi |
|---|---|
| Supabase auto-pause | keep-alive cron (Fase 0) |
| 500 MB DB penuh | sesi = teks kecil; foto di R2; monitor via query size |
| Workers 10ms CPU | query diindeks + pooler; tanpa N+1 |
| Scope creep | backlog di atas dikunci sampai Fase 6 selesai |
