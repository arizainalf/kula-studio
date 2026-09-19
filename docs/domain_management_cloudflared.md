# Panduan Manajemen Domain & Integrasi Cloudflare untuk Kula Studio

Dokumen ini menjelaskan panduan langkah demi langkah memindahkan pengelolaan DNS domain dari registrar pihak ketiga (Niagahoster, Domainesia, Rumahweb, Namecheap, GoDaddy, dll.) ke **Cloudflare**, serta mengintegrasikannya dengan proyek Kula Studio (**Cloudflare Pages** untuk Frontend dan **Cloudflare Workers** untuk Backend).

---

## 1. Mengapa Menggunakan Cloudflare untuk Domain?

Mengalihkan DNS domain ke Cloudflare memberikan keuntungan signifikan:
- **100% Gratis**: Manajemen DNS, proteksi DDoS global, dan CDN berkecepatan tinggi tanpa biaya bulanan.
- **Sertifikat SSL/TLS Otomatis**: Enkripsi HTTPS gratis seumur hidup dengan pembaruan otomatis tanpa perlu repot konfigurasi Certbot.
- **Menuntaskan Masalah Cross-Site Cookie Secara Permanen**:
  Dengan menempatkan Frontend dan Backend di bawah domain yang sama (misal `app.domainanda.com` dan `api.domainanda.com`), browser mengenali keduanya sebagai **First-Party (Same-Site)**. Masalah pemblokiran session cookie di browser modern (Chrome, Safari iOS, dsb.) akan hilang sepenuhnya.

### Rekomendasi Skema Domain:
| Komponen | Subdomain Rekomendasi | Layanan Cloudflare | Keterangan |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | `app.domainanda.com` *(atau `domainanda.com`)* | Cloudflare Pages (`kula-studio-web`) | Halaman aplikasi React & Dashboard |
| **Backend API** | `api.domainanda.com` | Cloudflare Workers (`kula-studio-api`) | Serverless API Hono |

---

## 2. Langkah 1: Menambahkan Domain ke Cloudflare (Ganti Nameserver)

Anda tidak perlu mentransfer kepemilikan domain (tagihan perpanjangan tahunan domain tetap di registrar lama Anda). Anda hanya perlu mengarahkan **DNS Nameserver** ke Cloudflare:

1. **Buka Dashboard Cloudflare**:
   - Masuk ke [https://dash.cloudflare.com/](https://dash.cloudflare.com/).
   - Di halaman utama / menu samping, klik **Add a site** (atau **Websites** &rarr; **Add a domain**).
2. **Masukkan Nama Domain**:
   - Ketikkan domain Anda tanpa `www` atau `https://` (contoh: `kulastudio.com` atau `trainlog.id`).
   - Klik **Continue**.
3. **Pilih Paket Layanan**:
   - Scroll ke bagian bawah dan pilih paket **Free ($0)**.
   - Klik **Continue**.
4. **Scan DNS Records Otomatis**:
   - Cloudflare akan secara otomatis memindai dan menyalin semua record DNS yang sudah ada (termasuk record email MX jika domain sudah memiliki email).
   - Periksa apakah semua record penting sudah tersalin, lalu klik **Continue**.
5. **Dapatkan Nameserver Cloudflare**:
   - Cloudflare akan menampilkan 2 buah Nameserver baru untuk domain Anda, contoh:
     - `ashley.ns.cloudflare.com`
     - `brad.ns.cloudflare.com`
   *(Catatan: Nama server yang Anda dapatkan bisa berbeda, gunakan yang tertera di layar Anda)*.
6. **Ubah Nameserver di Dashboard Registrar Anda**:
   - Buka website tempat Anda membeli domain (misal: *Niagahoster, Domainesia, Rumahweb, Namecheap, GoDaddy*).
   - Masuk ke menu **Domain Management** &rarr; pilih domain Anda &rarr; cari menu **Nameservers** (atau **DNS Management**).
   - Ubah mode dari *Default Nameserver* menjadi *Custom Nameserver*.
   - Ganti isi Nameserver 1 dan Nameserver 2 dengan 2 Nameserver dari Cloudflare tadi.
   - Simpan perubahan.
7. **Verifikasi di Cloudflare**:
   - Kembali ke Cloudflare dan klik **Check nameservers now**.
   - Propagasi DNS biasanya berlangsung dalam waktu **5 hingga 30 menit** (maksimal 24 jam tergantung registrar). Status domain di Cloudflare akan berubah menjadi **Active (Green Checkmark)**.

---

## 3. Langkah 2: Hubungkan Frontend Web (Cloudflare Pages)

Setelah domain aktif di Cloudflare, hubungkan subdomain Frontend (`app.domainanda.com`):

1. Di dashboard Cloudflare, buka menu **Compute (Workers & Pages)**.
2. Klik project Frontend Anda: **`kula-studio-web`**.
3. Masuk ke tab **Custom domains**.
4. Klik tombol **Set up a domain**.
5. Masukkan subdomain yang Anda inginkan:
   - Contoh: `app.kulastudio.com` (atau jika ingin domain utama tanpa subdomain: `kulastudio.com`).
6. Klik **Continue** &rarr; Cloudflare akan menampilkan konfirmasi pembuatan DNS record CNAME otomatis.
7. Klik **Activate domain**.
8. Cloudflare akan otomatis mengarahkan traffic dan memproses sertifikat SSL. Dalam 1–2 menit, status akan berubah menjadi **Active**.

---

## 4. Langkah 3: Hubungkan Backend API (Cloudflare Worker)

Hubungkan subdomain API (`api.domainanda.com`) ke backend Worker:

1. Di dashboard Cloudflare, buka menu **Compute (Workers & Pages)**.
2. Klik worker Backend Anda: **`kula-studio-api`**.
3. Masuk ke tab **Settings** &rarr; klik sub-tab **Triggers** (atau **Domains & Routes** pada tampilan dashboard terbaru).
4. Di bagian **Custom Domains**, klik tombol **Add Custom Domain**.
5. Masukkan subdomain API Anda:
   - Contoh: `api.kulastudio.com`.
6. Klik **Add Custom Domain**.
7. Cloudflare akan otomatis membuat record DNS dan mengaitkannya ke Worker Anda. Tunggu hingga sertifikat SSL terbit (status menjadi **Active**).

---

## 5. Langkah 4: Sinkronisasi Konfigurasi Project

Setelah kedua subdomain aktif, perbarui konfigurasi endpoint API di Frontend:

### Opsi A: Update Melalui Terminal Lokal (Deploy Ulang)
Jalankan build frontend dengan variabel `VITE_API_URL` mengarah ke domain baru:

```bash
cd /home/arizainalf/Project/trainlog-replica/web

# Build frontend menggunakan domain custom baru
VITE_API_URL=https://api.kulastudio.com npm run build

# Deploy ke Cloudflare Pages
npx wrangler pages deploy dist --project-name=kula-studio-web
```

### Opsi B: Update di Otomatisasi GitHub Actions (CI/CD)
Jika Anda menggunakan alur GitHub Actions:
1. Buka repository Anda di GitHub: `https://github.com/arizainalf/trainlog-replica`.
2. Masuk ke menu **Settings** &rarr; **Secrets and variables** &rarr; **Actions**.
3. Cari secret **`VITE_API_URL`** (atau buat baru jika belum ada).
4. Ubah nilainya menjadi:
   ```
   https://api.kulastudio.com
   ```
5. Simpan secret tersebut.
6. Commit & push perubahan ke branch `main` atau `multi-tenant`:
   ```bash
   git add .
   git commit -m "chore: switch API endpoint to custom domain"
   git push origin multi-tenant
   ```
   GitHub Actions akan otomatis me-rebuild dan mendeploy aplikasi dengan domain baru Anda.

---

## 6. Langkah 5: Optimasi Keamanan & Performa di Cloudflare

Untuk memastikan koneksi aman dan secepat kilat:

1. **SSL/TLS Encryption Mode**:
   - Di dashboard domain Cloudflare Anda &rarr; menu **SSL/TLS** &rarr; **Overview**.
   - Pilih mode **Full (strict)** untuk enkripsi end-to-end maksimal.
2. **Otomatiskan HTTPS**:
   - Masuk ke menu **SSL/TLS** &rarr; **Edge Certificates**.
   - Aktifkan opsi:
     - **Always Use HTTPS**: ON (otomatis mengalihkan HTTP ke HTTPS).
     - **Automatic HTTPS Rewrites**: ON.
     - **Minimum TLS Version**: TLS 1.2.
3. **Performa & Kompresi**:
   - Masuk ke menu **Speed** &rarr; **Optimization**.
   - Pastikan **Brotli** dan **Early Hints** aktif untuk mempercepat loading aset web hingga 30%.

---

## 7. Troubleshooting & FAQ

### Tanya: Apakah email domain saya (Google Workspace / cPanel Webmail) akan mati saat pindah ke Cloudflare?
**Jawab: TIDAK AKAN MATI.**
Cloudflare secara otomatis memindai dan menyalin seluruh MX record serta TXT record (SPF, DKIM, DMARC) dari DNS lama Anda pada Langkah 1 nomor 4. Layanan email Anda akan terus berjalan normal tanpa downtime.

### Tanya: Berapa lama waktu yang dibutuhkan sampai domain aktif?
- **Pergantian Nameserver**: Biasanya 5–30 menit. Di beberapa provider lokal bisa memakan waktu hingga beberapa jam.
- **Sertifikat SSL**: 1–5 menit setelah domain terverifikasi.

### Tanya: Bagaimana cara mengecek apakah DNS sudah mengarah ke Cloudflare?
Jalankan perintah ini di terminal laptop Anda:
```bash
# Cek Nameserver domain utama
dig +short NS domainanda.com

# Cek apakah subdomain web sudah mengarah ke Cloudflare Pages
dig +short app.domainanda.com

# Cek apakah subdomain API sudah mengarah ke Cloudflare Worker
dig +short api.domainanda.com
```
Jika output menampilkan alamat IP Cloudflare (misal awalan `104.x.x.x` atau `172.x.x.x`), berarti DNS Anda sudah aktif sempurna!
