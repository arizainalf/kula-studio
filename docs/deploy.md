# Panduan Deployment Kula Studio (SaaS & Multi-Tenant)

Dokumen ini berisi panduan lengkap persiapan akun, konfigurasi database, deployment backend & frontend, serta otomatisasi CI/CD melalui **GitHub Actions**.

---

## 1. Arsitektur Infrastruktur Produksi

Aplikasi Kula Studio dibangun dengan arsitektur modern yang hemat biaya (dapat berjalan 100% pada **Free Tier**):

```
                       ┌──────────────────────────────┐
                       │        Pengguna / Web        │
                       └──────────────┬───────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            │                                                   │
     (Akses Halaman Web)                                 (Permintaan API / Data)
            ▼                                                   ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│       Cloudflare Pages        │               │      Cloudflare Workers       │
│     (Frontend React SPA)      │──────────────▶│         (Hono Backend)        │
└───────────────────────────────┘               └───────────────┬───────────────┘
                                                                │
                                        ┌───────────────────────┴───────────────────────┐
                                        │                                               │
                                        ▼                                               ▼
                         ┌─────────────────────────────┐                 ┌─────────────────────────────┐
                         │      Supabase Postgres      │                 │        Cloudflare R2        │
                         │    (Database Multi-Tenant)  │                 │    (Penyimpanan Foto Beban) │
                         └─────────────────────────────┘                 └─────────────────────────────┘
```

| Komponen | Layanan | Keterangan | Biaya |
| :--- | :--- | :--- | :--- |
| **Database** | **Supabase** (PostgreSQL) | Menyimpan seluruh data multi-tenant studio, user, sesi latihan, program, dll. | Gratis (500 MB) |
| **Backend API** | **Cloudflare Workers** | Runtime serverless edge super cepat menggunakan Hono framework. | Gratis (100.000 req/hari) |
| **Frontend Web** | **Cloudflare Pages** | Hosting statis Vite + React dengan CDN global & SSL otomatis. | Gratis (Unlimited bandwidth) |
| **Object Storage** | **Cloudflare R2** | Penyimpanan foto progres latihan / avatar (opsional). | Gratis (10 GB) |
| **CI/CD** | **GitHub Actions** | Otomatisasi pengujian, build, dan deploy setiap kali Anda melakukan `git push`. | Gratis (2.000 menit/bulan) |

---

## 2. Akun & Persiapan yang Diperlukan

Sebelum melakukan deploy, siapkan 3 akun gratis berikut:

1. **Akun GitHub**: [https://github.com](https://github.com) — Tempat menyimpan source code dan menjalankan workflow CI/CD.
2. **Akun Supabase**: [https://supabase.com](https://supabase.com) — Sebagai basis data relasional PostgreSQL.
3. **Akun Cloudflare**: [https://cloudflare.com](https://cloudflare.com) — Untuk hosting Worker (API) dan Pages (Web).

---

## 3. Langkah Demi Langkah Deployment

### Langkah 1: Setup Database di Supabase

1. Buka dashboard [Supabase](https://supabase.com/dashboard) &rarr; klik **New Project**.
2. Isi formulir:
   - **Name**: `kula-studio-db`
   - **Database Password**: Buat password kuat (simpan dengan aman).
   - **Region**: Pilih yang terdekat dengan Indonesia (misal: `Singapore (ap-southeast-1)`).
3. Setelah database selesai dibuat:
   - Masuk ke menu **Project Settings** &rarr; **Database**.
   - Scroll ke bagian **Connection parameters / Connection string**.
   - Pilih tab **URI** dan pastikan mode **Transaction** (Port `6543`) atau **Session** (Port `5432`).
   - Salin connection string tersebut. Contoh:
     ```
     postgres://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
     ```
4. **Jalankan Migrasi Database**:
   - Buka menu **SQL Editor** di dashboard Supabase.
   - Buka folder `worker/migrations/` di proyek ini, lalu jalankan file-file SQL secara berurutan:
     1. `0001_init.sql`
     2. `0002_photos_pt.sql`
     3. `0003_client_email.sql`
     4. `0004_exercise_tables.sql`
     5. `0005_multi_tenant.sql`
     6. `0006_rename_admin_to_admin_studio.sql`
     7. `0007_user_avatar.sql`
     8. `0008_platform_settings.sql`
     9. `0009_platform_logo.sql`
     10. `0010_user_youtube_url.sql`
     11. `0011_studio_gmaps_and_user_phone.sql`
     12. *(Opsional)* `seed.sql` jika ingin mengisikan data awal akun demo.

---

### Langkah 2: Setup Cloudflare & Dapatkan Kredensial API

1. Masuk ke dashboard [Cloudflare](https://dash.cloudflare.com).
2. Dapatkan **Account ID**:
   - Di dashboard beranda Cloudflare, lihat kolom kanan bawah: **Account ID** &rarr; klik *Click to copy*.
3. Dapatkan **API Token**:
   - Klik avatar profil di kanan atas &rarr; **My Profile** &rarr; **API Tokens**.
   - Klik **Create Token** &rarr; gunakan template **Edit Cloudflare Workers** (atau *Custom Token*).
   - Berikan izin (*Permissions*):
     - `Account` &rarr; `Cloudflare Pages` &rarr; `Edit`
     - `Account` &rarr; `Workers Scripts` &rarr; `Edit`
     - `Account` &rarr; `Workers R2 Storage` &rarr; `Edit` *(opsional, hanya jika menggunakan R2 untuk foto)*
   - Klik **Continue to summary** &rarr; **Create Token**, lalu salin token tersebut.

---

### Langkah 3: Deploy Manual dari Komputer Lokal (Uji Coba Pertama)

Sebelum mengaktifkan GitHub Actions, Anda bisa mencoba deploy langsung dari terminal laptop:

#### 1. Deploy Backend (Cloudflare Worker):
```bash
cd worker

# Login ke Cloudflare di terminal
npx wrangler login

# Set secret database di Cloudflare
npx wrangler secret put DATABASE_URL
# (Tempelkan connection string Supabase Anda saat diminta)

# Set secret session token
npx wrangler secret put SESSION_SECRET
# (Ketikkan string rahasia acak minimal 32 karakter)

# (Opsional) Buat R2 Bucket untuk upload foto:
npx wrangler r2 bucket create kulastudio-photos
# Catatan: Jika belum mengaktifkan R2, kosongkan `"r2_buckets": []`
# di file `worker/wrangler.jsonc` agar deploy tidak gagal dengan error code 10085.

# Jalankan deploy
npm run deploy
```
*Output akan memberikan URL API publik: `https://api.kula-studio.my.id`*

#### 2. Deploy Frontend (Cloudflare Pages):
```bash
cd web

# Build frontend dengan API URL produksi
VITE_API_URL=https://api.kula-studio.my.id npm run build

# Deploy ke Cloudflare Pages
npx wrangler pages deploy dist --project-name=kula-studio-web
```

---

### Langkah 4: Otomatisasi CI/CD via GitHub Actions

Proyek ini telah dilengkapi file workflow di `.github/workflows/deploy.yml`. Setiap kali Anda melakukan `git push` ke branch `main` atau `multi-tenant`, GitHub akan secara otomatis memvalidasi kode, menjalankan build, dan mendeploy ke Cloudflare tanpa intervensi manual.

#### Konfigurasi Repository Secrets di GitHub:
1. Buka repository Anda di GitHub.
2. Masuk ke menu **Settings** &rarr; **Secrets and variables** &rarr; **Actions**.
3. Klik **New repository secret** dan tambahkan variabel berikut:

| Nama Secret | Nilai / Deskripsi |
| :--- | :--- |
| **`CLOUDFLARE_API_TOKEN`** | Token API Cloudflare yang dibuat pada Langkah 2. |
| **`CLOUDFLARE_ACCOUNT_ID`** | Account ID Cloudflare Anda. |
| **`VITE_API_URL`** | URL publik Worker backend: `https://api.kula-studio.my.id` |

Setiap kali Anda push commit baru:
```bash
git add .
git commit -m "feat: pembaruan sistem"
git push origin main
```
Buka tab **Actions** di GitHub untuk memantau proses deployment yang berjalan otomatis secara realtime!

---

## 4. Konfigurasi Custom Domain

Domain Kula Studio sudah aktif di Cloudflare:
- **Frontend**: `app.kula-studio.my.id` → Cloudflare Pages (`kula-studio-web`)
- **API**: `api.kula-studio.my.id` → Cloudflare Workers (`trainlog-api`)

Untuk panduan lengkap konfigurasi domain, lihat: 👉 **[Panduan Manajemen Domain & Integrasi Cloudflare](domain_management_cloudflared.md)**

---

## 5. Checklist Verifikasi Pasca-Deploy

Setelah deployment selesai, lakukan pengujian berikut:
- [ ] Buka [app.kula-studio.my.id](https://app.kula-studio.my.id) & pastikan halaman login / beranda publik muncul sempurna.
- [ ] Login menggunakan akun Platform Admin.
- [ ] Masuk ke menu **Kelola Studio** & pastikan data studio terbaca dari Supabase.
- [ ] Masuk ke menu **Pengaturan (Settings)** & coba ganti nama brand atau upload logo baru.
- [ ] Buka di perangkat mobile untuk memastikan tampilan responsif berjalan mulus.

---

## 6. Troubleshooting & FAQ

### Tanya: Muncul error `R2 bucket 'kulastudio-photos' not found. [code: 10085]` saat deploy backend.
**Jawab: Error ini terjadi karena binding R2 aktif di `worker/wrangler.jsonc` tapi bucket belum dibuat.**

**Cara Mengatasinya:**
1. **Solusi Cepat (Default)**:
   Di file `worker/wrangler.jsonc`, pastikan `r2_buckets` diset kosong:
   ```jsonc
   "r2_buckets": []
   ```
   Seluruh fitur inti Kula Studio (Multi-tenant Studio, Latihan, Beban, Setting, Logo) berjalan 100% menggunakan Supabase PostgreSQL. Dengan mengosongkan `r2_buckets`, deploy backend akan langsung sukses tanpa perlu R2.
2. **Solusi Jika Ingin Menggunakan R2**:
   Buat bucket tersebut terlebih dahulu:
   ```bash
   cd worker
   npx wrangler r2 bucket create kulastudio-photos
   ```
   Lalu aktifkan kembali di `worker/wrangler.jsonc`:
   ```jsonc
   "r2_buckets": [
     {
       "binding": "PHOTOS_BUCKET",
       "bucket_name": "kulastudio-photos"
     }
   ]
   ```

### Tanya: Kapan sebaiknya saya push ke GitHub?
Setelah Anda memasukkan secret `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` di tab **Settings** &rarr; **Secrets** repository GitHub Anda, setiap kali Anda melakukan:
```bash
git add .
git commit -m "update konfigurasi deploy"
git push origin main
```
Maka GitHub Actions akan otomatis menjalankan build dan deploy untuk Worker maupun Pages ke Cloudflare tanpa Anda perlu deploy manual dari laptop lagi.
