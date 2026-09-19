# Kula Studio

Sistem manajemen sesi latihan personal trainer — dibangun dari awal sebagai proyek fullstack (docs-first) dengan desain eksklusif **Luxury Dark Noir**.

🌐 **Live:** [app.kula-studio.my.id](https://app.kula-studio.my.id)  
⚙️ **API:** [api.kula-studio.my.id](https://api.kula-studio.my.id)

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
├─ web/                  # Vite SPA → CF Pages (kula-studio-web)
├─ worker/               # Hono API → CF Workers (kula-studio-api)
│  └─ wrangler.jsonc
└─ docs/
   ├─ plan.md            # roadmap eksekusi
   ├─ design-system.md   # spesifikasi warna luxury noir, charcoal & gold
   ├─ erd.md             # skema Postgres relasional (redisain)
   └─ deploy.md          # panduan deploy ke Cloudflare
```

## Fitur (MVP)

1. **Auth** — login email/password, role `admin|manager|pt`, whitelist + aktivasi admin
2. **Multi-tenant Studio** — setiap studio punya branding, logo, dan URL Google Maps sendiri
3. **Client CRUD** — profil client (goal, paket sesi, telepon, catatan) milik PT
4. **Sesi latihan** — catat per tanggal: latihan (warmup/resistance/cardio/cooldown), RPE, berat badan, catatan
5. **Jadwal** — entri per tanggal+jam per client
6. **Progress** — chart berat/RPE/volume per client
7. **Foto progress** — upload ke R2, tampil per client
8. **Export** — riwayat sesi → PDF (print native)
9. **Landing page** — halaman marketing dengan daftar coach + WhatsApp deep-link
10. **Tier & grace** — paket standard/pro, expired → read-only 14 hari

## Prinsip

- Docs-first: PRD/ERD/API contract sebelum generate kode
- Keamanan di server: validasi zod di trust boundary, role check per endpoint — FE guard hanya UX
- Anti-slop: tidak ada abstraksi tanpa dua implementasi, UI mengikuti design token (Luxury Dark: hitam obsidian, abu tua charcoal + aksen emas champagne, lihat docs/design-system.md)
- Semua tabel milik `owner` — akun PT tidak pernah baca data PT lain (pengganti RLS di lapisan Hono)

## Deploy

```bash
# Backend (Worker)
cd worker
npm run deploy

# Frontend (Pages)
cd web
VITE_API_URL=https://api.kula-studio.my.id npm run build
npx wrangler pages deploy dist --project-name=kula-studio-web
```

## Status

- [x] ERD redisain relasional
- [x] Skema SQL + migrasi Supabase
- [x] API contract (Hono routes)
- [x] Scaffold web/ + worker/
- [x] Auth (login, role-based access)
- [x] Multi-tenant studio management
- [x] Client CRUD + session log
- [x] Landing page Luxury Noir
- [x] Custom domain kula-studio.my.id
- [x] WhatsApp deep-link untuk coach
- [x] Google Maps URL untuk studio
- [ ] Upload foto progress (R2)
- [ ] Chart progress SVG
- [ ] Export PDF
