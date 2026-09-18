# TrainLog Replica

Reverse-engineering & rebuild [trainlog.id](https://trainlog.id) — sistem manajemen sesi latihan personal trainer — sebagai proyek belajar fullstack (docs-first).

## Stack

| Layer | Teknologi | Kenapa |
|---|---|---|
| FE | React 19 + Vite + TanStack Router + Tailwind v4 | SPA static, deploy CF Pages |
| BE | Hono (TypeScript) di Cloudflare Workers | Ringan, edge, portabel |
| DB | Supabase Postgres (free tier) | Relasional penuh, skill transfer |
| Foto | Cloudflare R2 | 10 GB free, egress gratis |
| Auth | Session/JWT di Hono (build sendiri) | Belajar penuh, tanpa lock-in |
| Deploy | CF Pages (FE) + `wrangler deploy` (BE) | Monorepo, deploy terpisah |

## Struktur

```
trainlog-replica/
├─ web/                  # Vite SPA → CF Pages
├─ worker/               # Hono API → CF Workers
│  └─ wrangler.jsonc
└─ docs/
   ├─ plan.md            # roadmap eksekusi
   ├─ erd.md             # skema Postgres relasional (redisain)
   ├─ analisa-trainlog.md    # hasil analisa stack asli (bagian 1)
   ├─ analisa-app.md         # eksplorasi dalam app (bagian 2)
   └─ erd-asli.md            # ERD rekonstruksi TrainLog asli (document-store)
```

## Fitur target (MVP)

Dipetakan dari analisa TrainLog asli, dipotong ke skala belajar:

1. **Auth** — login email/password, role `admin|manager|pt`, whitelist + aktivasi admin
2. **Client CRUD** — profil client (goal, paket sesi, telepon, catatan) milik PT
3. **Sesi latihan** — catat per tanggal: latihan (warmup/resistance/cardio/cooldown), RPE, berat badan, catatan
4. **Jadwal** — entri per tanggal+jam per client
5. **Progress** — chart berat/RPE/volume per client
6. **Foto progress** — upload ke R2, tampil per client
7. **Export** — riwayat sesi → PDF (print native)
8. **Tier & grace** — paket standard/pro, expired → read-only 14 hari

Diluar scope MVP (later): generate program AI, import PDF, template sesi, integrasi WhatsApp.

## Prinsip

- Docs-first: PRD/ERD/API contract sebelum generate kode
- Keamanan di server: validasi zod di trust boundary, role check per endpoint — FE guard hanya UX
- Anti-slop: tidak ada abstraksi tanpa dua implementasi, UI mengikuti design token (dark navy + lime, lihat analisa)
- Semua tabel milik `owner` — akun PT tidak pernah baca data PT lain (pengganti RLS di lapisan Hono)

## Status

- [x] Analisa TrainLog asli (stack, color way, arsitektur, audit XSS)
- [x] ERD redisain relasional
- [ ] Skema SQL + migrasi Supabase
- [ ] API contract (Hono routes)
- [ ] Scaffold web/ + worker/
- [ ] Implementasi per modul
- [ ] Deploy

## Sumber analisa

Dokumen asli + artefak mentah (HTML/CSS/JS terdekde) di `~/Project/haditrain/`.
