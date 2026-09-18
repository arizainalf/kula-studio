# Analisa trainlog.id

Tanggal: 2026-09-18. Metode: fetch HTML/JS/CSS publik, dekode bundle, baca kode app. Tanpa akun (isi app butuh registrasi + verifikasi admin).

## Struktur

Dua bagian terpisah:

- `trainlog.id` — landing page statis, 1 file HTML self-contained (1.3 MB)
- `app.trainlog.id` — aplikasi (SPA), 1 file HTML (746 KB) berisi semua logic inline

Keduanya di-host **Hostinger** (header: `platform: hostinger`, `panel: hpanel`, `server: hcdn`), CDN Hostinger (hcdn), HTTP/2 + HTTP/3.

## Landing page (trainlog.id)

- **Builder**: dibangun pakai tool AI site builder — runtime bernama `dc-runtime` (`GENERATED from dc-runtime/src/*.ts — Rebuild with cd dc-runtime && bun run build`). Semua aset (JS, font woff2) di-embed base64+gzip dalam `<script type="__bundler/manifest">`. Zero request eksternal kecuali React.
- **JS**: React 18.3.1 UMD (unpkg) sebagai runtime render template. Tidak pakai router/state lib. Landing-nya statis (nav anchor `#fitur`, `#cara`, dll).
- **Tidak ada framework CSS** (bukan Tailwind/Bootstrap). Styling inline `style=""` per elemen + sedikit CSS global.
- **Icon**: inline SVG lucide-style.

## App (app.trainlog.id)

### Frontend
- **Vanilla JavaScript SPA. Tanpa framework.** 1 file, ~6.100 baris JS, 281 function, module pattern `const App = (() => {...})()`.
- Routing/manual screen switching: 10 screen (`screen-auth`, `-home`, `-clients`, `-jadwal`, `-profile`, `-detail`, `-new-session`, `-photos`, `-charts`, `-admin`).
- Render: `innerHTML` + template literal (131×), escaping manual `escapeHtml()` (92×). Tidak ada DOMPurify.
- Chart progress: **SVG buatan sendiri** — tidak pakai chart lib.
- **PWA**: `manifest.json` (display standalone, portrait, maskable icon), service worker sendiri (`trainlog-v3`): network-first untuk shell, fallback cache offline, panggilan API/Supabase tidak pernah di-cache.
- Icon set: inline SVG string (moon/sun theme toggle, dll).

### Backend — Supabase (project `nzmltaejtetdnnnbtfle`)
- `@supabase/supabase-js@2` via jsdelivr.
- **Auth**: email + password (`signInWithPassword`), plus `resetPasswordForEmail`, `updateUser`, `onAuthStateChange`.
- **Tabel**: `trainlog_admins`, `trainlog_data`, `trainlog_settings`, `trainlog_whitelist`. (Data app nyatanya satu tabel besar `trainlog_data` + pengaturan; disebut sendiri di komentar: "Supabase (sumber kebenaran) + localStorage sebagai cache tampilan".)
- **Storage**: bucket `session-photos` (foto progress, path = email owner/timestamp.jpg).
- **Edge Functions**: `create-account` (registrasi+verifikasi), `ai-proxy`, `generate-program` (generate NASM + kuota Standard/Pro), `change-email`.
- **Autorisasi di server via RLS**: role `admin | manager | pt`, tier `standard | pro`, expiry akun, masa tenggang 14 hari (bisa baca, tidak bisa tulis). Konstanta `GRACE_DAYS = 14` harus sinkron dengan policy RLS.
- **Optimistic locking**: `updated_at` terakhir dibaca dipakai untuk deteksi konflik tulis.
- **AI**: `claude-sonnet-4-20250514` dipanggil via Edge Function `ai-proxy` (API key tidak diekspos ke client; fallback langsung api.anthropic.com hanya untuk self-host).
- Cache lokal: `localStorage` (`tl_session`, `tl_templates`, `tl_theme`, `tl_admin_wa`, `tl_gen_limit`, `tl_name_*`).

## Color way / UI design system

Dark-first, tema gelap navy + aksen lime. Palet dari CSS custom properties (`:root`, app.css):

**Dark (default)**
- Background: `#0a0e14` → `#10151d` (navy hampir hitam)
- Surface: glassmorphism — `rgba(255,255,255,0.06/0.11/0.16)` + border `rgba(255,255,255,0.08/0.13/0.22)`
- Text: `#f4f6ff` / `#b4bcdb` / `#8792bd` (lavender abu; text3 sudah ditingkatkan ke 5.1:1 untuk WCAG AA — ada komentar di CSS)
- **Aksen utama: lime** `#a3e635` / `#bef264` / `#84cc16` (Tailwind lime 400/300/600)
- Status: green `#10d98c`, red `#f43f5e`, orange `#f59e0b`, teal `#14b8a6`
- Gradient: `135deg #65a30d→#3f6212` (lime), `#10d98c→#06b6d4`, `#f43f5e→#f59e0b`
- Radius: `--r:20px`, `--rm:14px`, `--rs:8px` (soft-rounded)
- Shadow: `0 8px 32px rgba(0,0,0,0.4)` (dalam, khas dark UI)

**Light**: toggle manual (icon sun/moon), state di `localStorage tl_theme`. Default dark; `theme-color` manifest `#0a0e14`.

**Tipografi** (self-hosted woff2 subset: latin, latin-ext, vietnamese)
- Display/body: **Archivo** (400–800, font-stretch 100%) — grotesque tegap, letter-spacing negatif di heading besar (`-0.03em`), uppercase + tracking lebar (`0.1–0.14em`) untuk label kecil
- Mono: **DM Mono** (angka/ kode)
- Landing juga load DM Sans tapi pemakaian utama Archivo
- Ukuran fluid: `clamp(27px,4.6vw,40px)` untuk H1

**Layout**: mobile-first, breakpoint 319/479/600/768/900/1024/1440, `prefers-reduced-motion` dihormati, ada style `@media print`. Landing: hero 2 kolom + screenshot, section fitur grid, pricing card (Standard Rp59rb/bln, Pro Rp89rb/bln; hemat 3 bln Rp239rb, 6 bln Rp445rb), CTA ganda.

## Catatan teknis menarik

- Seluruh FE = 2 file HTML. Tidak ada build step untuk app (vanilla). Landing dibundel builder AI.
- Keamanan nyata bergantung di RLS + Edge Function (kuota, role, expiry) — desain sadar bahwa client tidak dipercaya.
- Escape manual (92× escapeHtml) tanpa sanitizer lib — risiko XSS ada kalau ada jalur render yang lupa escape; belum diaudit per-jalur (butuh akun untuk eksplor dalam).
- Anon key Supabase terekspos (wajar untuk client Supabase).

## File artefak di folder ini

- `index.html` — landing mentah; `template.html`/`page.html` — template terdekde; `app.js` — runtime dc terdekde; `bundle/` — font woff2
- `app_trainlog.html` — app mentah; `app.css` (92 KB) — CSS terpisah untuk analisa; `sw.js`
- `extract.py`, `extract_all.py` — script dekode bundle

## Akun?

Butuh akun hanya untuk lihat isi app (screen dalam). Pendaftaran publik terbuka tapi diverifikasi admin dulu (via Edge Function `create-account` + tabel `trainlog_whitelist`). Kalau mau analisa dalam (UX flow, RLS efektifitas, dsb.), daftar di app.trainlog.id lalu tunggu aktivasi admin — atau kasih saya kredensial kalau sudah punya.
