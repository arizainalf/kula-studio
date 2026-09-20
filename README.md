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
   ├─ plan.md                       # roadmap eksekusi
   ├─ fitur-dan-estimasi-biaya.md  # fitur lengkap, arsitektur serverless & estimasi biaya
   ├─ domain_management_cloudflared.md # panduan setup DNS Cloudflare & domain
   ├─ design-system.md              # spesifikasi warna luxury noir, charcoal & gold
   ├─ erd.md                        # skema Postgres relasional
   └─ deploy.md                     # panduan deploy ke Cloudflare

## Fitur & Peran (Single-Tenant: Admin, PT, Client)

1. **Role Administrator** — Dashboard analitik & KPI real-time, manajemen staf PT, direktori klien, jadwal terpadu, master library latihan, dan konfigurasi landing page.
2. **Role Personal Trainer (PT)** — Log sesi real-time (RPE, beban, repetisi), 1-click WhatsApp recap, kelola klien pribadi, jadwal latihan, foto progres, dan library gerakan favorit.
3. **Role Client (Portal Member)** — Login instan nomor WA/email, dashboard sisa kuota sesi paket, grafik perkembangan berat/fat %, gamifikasi leaderboard poin latihan, dan saran coach.
4. **Landing Page & Coach Showcase** — Halaman depan modern, video embed showcase pelatih, tombol langsung "Latihan Bareng" via WhatsApp, dan switch Dark/Light theme.
5. **PDF Export & Reporting** — Ekspor riwayat sesi latihan & rekap perkembangan ke format PDF dokumen profesional.

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
