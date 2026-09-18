# Analisa trainlog.id — Bagian 2: Eksplorasi Dalam (pakai akun)

Tanggal: 2026-09-18. Akun: hadinasrulhalim@gmail.com (role PT, tier STANDARD, expired 14 Sep 2026 → masa tenggang, mode baca-saja).

## State akun & data

- Login sukses via Supabase `signInWithPassword`. Sesi persist (localStorage `tl_session` + Supabase session).
- Role user ini: **PT** (bukan admin) — tombol Admin tidak muncul, `App.openAdminPanel` ada tapi di-guard.
- Data nyata: 7 client (SITI RAHMA, FAJAR SATRIA, WIDHI SUSILA UTAMA, ADE TRIA ISKANDAR, FARIHA, WALID RAMADHAN HANIBALDY, FADYA HERINI PUTRI), 255 total sisa sesi, 0 sesi tercatat.
- Status: `Expired 14 Sep 2026 · lewat 4 hari` → `GRACE_DAYS=14` aktif, `_accessState='grace'` → semua tulis diblok `guardWrite()` (modal "Akun Expired" + tombol WA admin).
- Tier STANDARD: `Jatah generate habis — Upgrade ke Pro` → generate program NASM diblok modal `m-upgrade-required`.

## Arsitektur internal (dikonfirmasi live)

- Objek `window.App` expose **±160 method publik** (`onclick="App.x()"` inline) — facade lengkap: login, client CRUD, jadwal, sesi, template, PDF, admin panel, whitelist.
- Screen switching: `show('auth'|'home'|'clients'|'jadwal'|'profile'|'detail'|'new-session'|'photos'|'charts'|'admin')` — div toggle, tanpa router/URL. Back browser TIDAK dinavigasi (SPA tanpa history API) — `history.back()` malah keluar app. [ catatan UX ]
- Modal system: `openModal('m-*')` + `closeOv()`.

## Fitur terverifikasi di UI

- **Jadwal**: kalender mingguan 14–20 Sep, kolom per jam 05:00–23:00, nav minggu, `+ Tambah Jadwal` (diblok grace).
- **Client profile**: stat SESI/PAKET/SISA/AVG RPE, tab Riwayat Sesi|Progress, sort (terbaru/terlama/RPE tinggi/rendah), `+ Sesi Baru`, `Pilih & Export PDF` (multi-select), `Foto Progress`, `Progress Chart`.
- **Charts**: 3 chart SVG custom — Berat Badan (kg), RPE per sesi, Volume latihan (est. kg). Kosong jika tanpa data (empty state jelas).
- **Generate Program NASM**: modal input ageBracket/gender/problem (knee/back/shoulder) → Edge Function `generate-program` (Claude Sonnet) — kuota ditegakkan server; client hanya UX guard.
- **Export PDF**: TANPA library — `buildPDF()` generate HTML lalu `window.print()` (print native). Template PDF: seksi Warm-Up/Resistance/Cardio/Cool-Down dengan warna per seksi.
- **Import PDF**: parser PDF internal (drag & drop) untuk migrasi data.
- **Session template**: simpan/load sesi rutin, localStorage `tl_templates` (per browser).
- **WhatsApp integration**: `shareWA()` (recap sesi ke client via wa.me link), `sendUpsellWA()` (tombol WA muncul otomatis di kartu client dengan sisa ≤3 sesi — pesan upsell paket), tombol "Hubungi admin" pakai nomor dari `trainlog_settings.admin_wa` (fallback hardcode `6287884241516`).
- **Copy/move sesi antar PT**, copy recap, global search, manual sync (`manualSync`/`refreshCloud`), optimistic locking `updated_at`.

## Audit XSS (render path)

- `esc()` solid: replace `& < > " '` — dipakai 92×.
- Kartu client: `esc(c.name)`, `esc(c.goal)`, `esc(initials())` ✓.
- Interpolasi inline `onclick="App.sendUpsellWA('${escJs(c.id)}')"` — id di-escape utk JS context ✓.
- 3 jalur `${c.name}` tanpa `esc` = pesan WhatsApp (teks murni, bukan HTML) — aman.
- `${msg}` di sync-banner = string internal app, bukan input user — aman.
- `${title}` chart = label statis app — aman.
- Template literal WL (whitelist admin) render jumlah exercise — numerik — aman.
- Kesimpulan: **tidak ditemukan jalur XSS aktif** pada render utama. Risiko sisa: 131 titik `innerHTML` — disiplin esc bagus tapi manual, tanpa DOMPurify; regresi mudah terjadi saat fitur baru.

## Catatan UX/teknis

1. Field password login bertipe `text` (id `#in-password`) — password terlihat plain (memang ada `toggleShowPassword`, default terlihat). Trade-off sadar utk "password diberikan admin", tapi kurang lazim.
2. Tanpa history API: refresh/back = keluar ke posisi awal (screen-clients), dalam-app navigation hilang.
3. Grace mode UX bagus: read-only jelas dikomunikasikan, data tidak disandera, CTA WA admin langsung.
4. Print-native PDF = zero-dependency, tapi tidak bisa "download PDF" langsung di mobile (harus lewat print dialog).
5. App single-file 746 KB (semua inline) + SW cache — first load berat, kunjungan berikut instan.

Update file bagian 1: `ANALISA.md` (analisa stack/color way — tetap valid).
