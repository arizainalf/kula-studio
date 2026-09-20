# Dokumentasi Fitur & Estimasi Biaya Infrastruktur Kula Studio

Dokumen ini menyajikan rincian lengkap seluruh fitur aplikasi **Kula Studio** (arsitektur Single-Tenant: Admin, Personal Trainer, dan Client), arsitektur teknologi serverless & tunneling Cloudflare, serta rincian estimasi biaya operasional (*cost breakdown*) mulai dari tier gratis (Rp 0) hingga skala komersial.

---

## 1. Arsitektur & Peran Pengguna (Single-Tenant)

Kula Studio dirancang khusus untuk studio gym / fitness center mandiri dengan 3 hierarki peran yang saling terintegrasi:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             KULA STUDIO                                  │
├───────────────────┬───────────────────────────────┬──────────────────────┤
│    1. ADMIN       │     2. PERSONAL TRAINER       │      3. CLIENT        │
│ (Manajemen & Ops) │      (Pelatih Lapangan)       │  (Member / Klien PT) │
└───────────────────┴───────────────────────────────┴──────────────────────┘
```

---

## 2. Rincian Fitur Berdasarkan Peran

### A. Fitur Administrator (`admin`)
Peran Administrator memiliki kendali penuh atas manajemen studio, direktori pelatih, klien, master latihan, dan identitas aplikasi:

| Fitur | Deskripsi | Manfaat Bisnis |
| :--- | :--- | :--- |
| **Executive KPI Dashboard** | Ringkasan metrik real-time: Total Pelatih aktif, Total Klien terdaftar, Sesi Selesai, Utilisasi Kuota Paket (%), dan Jadwal terdekat. | Evaluasi cepat performa studio tanpa perlu rekap spreadsheet manual. |
| **Upsell Renewal Alert** | Peringatan otomatis untuk klien dengan sisa kuota sesi &le; 3 sesi. | Meningkatkan *retention rate* & omset perpanjangan paket klien tepat waktu. |
| **Manajemen Akun Staf** | Tambah, undang, edit profil, pasang spesialisasi, ganti nomor WhatsApp, reset password, dan aktivasi/nonaktifkan akun staf PT. | Kontrol keamanan akun pelatih internal dalam satu pintu. |
| **Pusat Direktori Klien** | Akses ke seluruh data klien di studio dan kemampuan menetapkan (*assign*) atau memindahkan PT penanggung jawab klien. | Fleksibilitas rotasi pelatih jika ada PT yang berhalangan atau cuti. |
| **Master Library Gerakan** | Pengelolaan kategori latihan (Warm-up, Core, Cardio, Strength, Rehab, dll.) dan preset gerakan global studio. | Menstandarisasi metodologi latihan di seluruh pelatih gym Anda. |
| **Jadwal Sesi Terpadu** | Kalender komprehensif seluruh sesi latihan yang dijadwalkan oleh para pelatih. | Mencegah bentrok penggunaan area/alat latihan di studio. |
| **Ekspor Laporan PDF** | Cetak rekap sesi latihan, absensi, dan progres dalam format dokumen PDF siap cetak atau arsip. | Laporan profesional untuk manajemen atau evaluasi berkala klien. |
| **Editor Identitas Platform** | Pengaturan nama aplikasi, logo branding, headline promosi, video coach, kontak WhatsApp, dan paket langganan di Landing Page. | Membangun kredibilitas dan citra brand studio gym Anda sendiri. |
| **Role Switcher Instan** | Tombol 1-klik untuk beralih peran antara Admin dan Personal Trainer tanpa perlu logout. | Sangat praktis bagi *Owner* atau *Head Coach* yang juga aktif melatih klien. |

---

### B. Fitur Personal Trainer (`pt`)
Peran Pelatih berfokus pada eksekusi latihan, pemantauan progres klien harian, dan komunikasi:

| Fitur | Deskripsi | Manfaat Pelatih |
| :--- | :--- | :--- |
| **Log Sesi Real-Time** | Input sesi latihan harian: tanggal, RPE (*Rate of Perceived Exertion* 1–10), berat badan klien, estimasi lemak tubuh (% fat), dan catatan evaluasi. | Pencatatan cepat di lantai gym langsung via ponsel tanpa kertas. |
| **Penyusunan Gerakan Fleksibel** | Mengisi gerakan per kategori (set, repetisi, beban). Dilengkapi fitur rekomendasi cepat, simpan ke master library, dan tombol salin dari sesi sebelumnya. | Menghemat waktu input latihan repetitif hingga 80%. |
| **1-Click WhatsApp Recap** | Format pesan rekap latihan otomatis rapi (emoji, metrik RPE, rincian gerakan, catatan coach) yang langsung membuka chat WhatsApp klien. | Memberikan sentuhan pelayanan premium (*high-touch service*) ke klien. |
| **Manajemen Klien Pribadi** | Melihat daftar klien aktif miliknya, riwayat sesi lampau, status kuota paket, dan alert cedera fisik (lutut, pinggang, bahu). | Menghindari risiko cedera berulang dengan panduan keamanan latihan otomatis. |
| **Kalender Jadwal Pelatih** | Agenda jadwal sesi latihan pribadi dengan klien, lengkap dengan jam, tanggal, dan catatan sesi. | Pengaturan waktu melatih yang terstruktur dan meminimalisir pembatalan sepihak. |
| **Galeri Foto Transformasi** | Upload foto perkembangan fisik klien (*before/after* atau dokumentasi form gerakan) yang aman di cloud storage. | Bukti nyata keberhasilan program latihan yang memotivasi klien. |
| **Library Gerakan Favorit** | Menandai gerakan favorit dan menambah gerakan custom pelatih sendiri. | Personalisasi program latihan sesuai keahlian unik masing-masing coach. |

---

### C. Fitur Portal Klien (`client`)
Halaman portal khusus klien yang dapat diakses mandiri oleh member studio:

| Fitur | Deskripsi | Manfaat Klien |
| :--- | :--- | :--- |
| **Login Tanpa Password** | Masuk langsung menggunakan nomor WhatsApp dan email yang didaftarkan oleh pelatih. | Ramah pengguna (*frictionless*), klien tidak perlu mengingat kata sandi baru. |
| **Dashboard Progres Pribadi** | Tampilan visual sisa kuota sesi paket, grafik penurunan berat badan & fat %, serta riwayat intensitas latihan. | Klien merasakan transparansi dan kepuasan atas hasil investasinya. |
| **Gamifikasi & Peringkat (Leaderboard)** | Sistem poin berdasarkan konsistensi latihan dan intensitas RPE dengan tier level (Bronze, Silver, Gold, Diamond, Titan). | Memicu motivasi psikologis klien untuk konsisten datang latihan. |
| **Riwayat Catatan & Saran Coach** | Membaca kembali catatan teknis, PR (*Personal Record*) beban baru, dan saran pola hidup dari pelatih. | Panduan mandiri klien di luar jam sesi bersama pelatih. |

---

### D. Fitur Web Publik & Landing Page
Halaman depan modern untuk kebutuhan pemasaran studio gym:
- **Hero Showcase**: Desain responsif bertema dark modern dengan aksen warna gold/emerald.
- **Coach Showcase**: Galeri pelatih dengan video embed YouTube dan tombol interaktif *"Latihan Bareng"* yang langsung tersambung ke WhatsApp pelatih terkait.
- **Daftar Layanan & Paket**: Informasi program kebugaran (Fat Loss, Hypertrophy, Rehab) dan paket sesi latihan.
- **Theme Switcher**: Dukungan mode tampilan Gelap (*Dark Mode*) dan Terang (*Light Mode*).
- **Mobile PWA-Ready**: Tampilan navigasi mobile bawah (*Bottom Navigation Bar*) yang ergonomis seperti aplikasi *native* Android/iOS.

---

## 3. Arsitektur Infrastruktur & Server

Kula Studio dirancang dengan paradigma **Serverless Edge Computing & Zero Trust Tunneling** yang memanfaatkan ekosistem Cloudflare:

```
                                  [ Domain Studio ]
                              (app / api .domainanda.com)
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │    Cloudflare DNS     │
                             │ (DDoS Protection, SSL)│
                             └───────────┬───────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
      ┌─────────────────────┐                         ┌─────────────────────┐
      │  Cloudflare Pages   │                         │  Cloudflare Workers │
      │  (React Frontend)   │                         │    (Hono API Engine)│
      └─────────────────────┘                         └──────────┬──────────┘
                                                                 │
                                         ┌───────────────────────┴───────────────────────┐
                                         │                                               │
                                         ▼                                               ▼
                              ┌─────────────────────┐                         ┌─────────────────────┐
                              │    Cloudflare R2    │                         │ PostgreSQL Database │
                              │ (Foto Dokumentasi)  │                         │ (Data Sesi & Akun)  │
                              └─────────────────────┘                         └──────────┬──────────┘
                                                                                         │
                                                    ┌────────────────────────────────────┴────────────────────────────────────┐
                                                    ▼                                                                         ▼
                                         [ Opsi A: Cloud DB ]                                                      [ Opsi B: On-Premise ]
                                         (Supabase / Neon DB)                                                       (Mini PC di Gym via)
                                                                                                                    (cloudflared tunnel)
```

### Penjelasan Komponen:
1. **Cloudflare Pages (Frontend Web SPA)**
   - Menghantarkan aset HTML/JS/CSS React dari 300+ lokasi data center global Cloudflare.
   - Kecepatan muat halaman instan (*sub-second load*) dan proteksi SSL HTTPS gratis seumur hidup.
2. **Cloudflare Workers (Backend RESTful API)**
   - Menggunakan framework **Hono**, framework TypeScript teringan dan tercepat saat ini.
   - Berjalan secara *serverless edge*, tanpa *cold-start delay* dan tanpa perlu memelihara OS server/Linux.
3. **Cloudflare R2 (Object Storage Foto Latihan)**
   - Kompatibel dengan protokol Amazon S3 untuk menyimpan foto fisik klien dan avatar profil.
   - Keunggulan utama: **Zero Egress Fees** (bebas biaya transfer bandwidth saat melihat foto).
4. **Koneksi Database (PostgreSQL)**
   - Dapat dihubungkan ke penyedia Cloud PostgreSQL (seperti Supabase atau Neon).
5. **Cloudflared Tunnel (Solusi Private Database / Self-Hosted Server)**
   - Jika Anda memiliki server fisik / Mini PC di lokasi gym dan ingin menjalankan database PostgreSQL sendiri:
   - Tool `cloudflared` membuat terowongan terenkripsi outbound (*outbound-only tunnel*) dari server gym Anda ke jaringan Cloudflare.
   - **Keuntungan Besar**:
     - Tidak memerlukan IP Publik Statis dari ISP.
     - Tidak perlu membuka port router (*zero port-forwarding*), sehingga kebal dari serangan scanning hacker di internet.
     - Gratis menggunakan fitur Cloudflare Zero Trust.

---

## 4. Estimasi Rincian Biaya Operasional (Cost Breakdown)

Berikut adalah tabel rincian biaya operasional Kula Studio dari skala pemula (Free Tier) hingga skala komersial:

### Opsi 1: Skema Hemat / Free Tier (100% Gratis Tanpa Biaya Server Bulanan)
Sangat direkomendasikan untuk studio gym independen dengan 1–10 pelatih dan hingga 1.000 klien aktif:

| Komponen Infrastruktur | Penyedia Layanan | Kuota Gratis yang Didapat | Biaya Bulanan | Biaya Tahunan |
| :--- | :--- | :--- | :---: | :---: |
| **Nama Domain Pribadi** | Registrar (Namecheap / Domainesia / Niagahoster) | Domain resmi (`.com`, `.id`, `.my.id`, dll.) | Rp 0 | ~Rp 130.000 – Rp 160.000 / thn |
| **DNS & Proteksi DDoS** | Cloudflare DNS | DNS tercepat dunia, SSL otomatis, proteksi bot | **Rp 0** | **Rp 0** |
| **Frontend Web Hosting** | Cloudflare Pages | **Unlimited bandwidth**, 100 domain custom | **Rp 0** | **Rp 0** |
| **Backend API Engine** | Cloudflare Workers | **100.000 request/hari** (~3 juta req/bulan) | **Rp 0** | **Rp 0** |
| **Database PostgreSQL** | Supabase / Neon (Free Plan) | **500 MB data** (~50.000+ sesi latihan) | **Rp 0** | **Rp 0** |
| **Storage Foto Transformasi** | Cloudflare R2 | **10 GB storage gratis** (~15.000 foto HD) | **Rp 0** | **Rp 0** |
| **Cloudflared Tunnel** | Cloudflare Zero Trust | Terowongan aman untuk koneksi database private | **Rp 0** | **Rp 0** |
| **TOTAL BIAYA OPERASIONAL** | — | — | **Rp 0 / bulan** | **~Rp 130.000 / tahun** *(Hanya domain)* |

---

### Opsi 2: Skema Skala Menengah / Gym Ramai (Skala 500 – 2.000+ Sesi per Hari)
Dibutuhkan saat studio Anda bertumbuh pesat dan melampaui kuota gratis harian Cloudflare / database:

| Komponen | Spesifikasi / Upgrade | Biaya Bulanan (USD) | Estimasi Biaya (Rupiah) |
| :--- | :--- | :---: | :---: |
| **Cloudflare Workers Paid** | **10 Juta request/bulan** + waktu komputasi CPU lebih tinggi | $5.00 / bulan | ~Rp 80.000 / bulan |
| **Supabase Pro Database** | **8 GB database**, backup harian otomatis selama 7 hari, compute tanpa pause | $25.00 / bulan | ~Rp 400.000 / bulan |
| **Cloudflare R2 Over-quota** | Tambahan penyimpanan foto di atas 10 GB ($0.015 / GB) | ~$0.50 / bulan | ~Rp 8.000 / bulan |
| **Domain Tahunan** | Pembayaran prorata bulanan | ~$0.80 / bulan | ~Rp 13.000 / bulan |
| **TOTAL ESTIMASI** | — | **~$31.30 / bulan** | **~Rp 500.000 / bulan** |

---

### Opsi 3: Skema Hybrid On-Premise + Cloudflared Tunnel (Database di Gym Sendiri)
Jika studio gym Anda memiliki Mini PC / komputer kasir yang selalu menyala di lokasi dan Anda ingin menyimpan seluruh data di server lokal studio sendiri:

| Komponen | Rincian | Biaya |
| :--- | :--- | :--- |
| **Hardware Mini PC** | Mini PC hemat daya (Intel N100 / RAM 8GB / SSD 256GB) | ~Rp 1.800.000 *(investasi alat 1x di awal)* |
| **Koneksi Internet Gym** | Wi-Fi gym biasa (Indihome, Biznet, FirstMedia, MyRepublic, dsb.) | Rp 0 *(memakai internet yang sudah ada di gym)* |
| **Cloudflared Tunnel** | Mengekspos database lokal ke Cloudflare Worker secara aman | **Rp 0 (Gratis)** |
| **Listrik Mini PC** | Konsumsi daya ~10–15 Watt menyala 24/7 | ~Rp 20.000 – Rp 35.000 / bulan |
| **Cloudflare Frontend & API** | Pages & Workers Free Tier | **Rp 0** |
| **BIAYA BULANAN BERJALAN** | — | **~Rp 25.000 / bulan** *(hanya biaya listrik)* |

---

## 5. Analisis Perbandingan: Kula Studio vs Software Gym SaaS Komersial

Sebagian besar software manajemen gym di pasaran (seperti Mindbody, Glofox, Zen Planner, atau software SaaS lokal) menggunakan sistem tagihan per bulan yang mahal:

| Aspek | Software SaaS Komersial | Kula Studio (Solusi Anda) |
| :--- | :--- | :--- |
| **Model Biaya** | Langganan wajib bulanan ($30 – $150/bulan) | **Rp 0 / bulan** (Hanya sewa domain tahunan) |
| **Biaya per Akun PT** | Sering mengenakan biaya tambahan per pelatih | **Bebas tanpa batas** jumlah akun pelatih |
| **Kepemilikan Data** | Data tersimpan di server pihak ketiga | **100% milik Anda sendiri** (Database PostgreSQL Anda) |
| **Branding & Identitas** | Menampilkan watermark/logo vendor software | **Branding eksklusif studio Anda sendiri** |
| **Fitur WhatsApp** | Memerlukan biaya SMS / kuota API WA berbayar | **Gratis** via protokol langsung tautan WhatsApp |
| **Fleksibilitas Kode** | Sistem tertutup (*proprietary*), tidak bisa diubah | **Open Source / Source Code penuh milik Anda** |

---

## 6. Kesimpulan & Rekomendasi

1. **Untuk Memulai**: Manfaatkan **Opsi 1 (Free Tier)**. Anda hanya perlu menyiapkan satu nama domain pribadi seharga ~Rp 130.000/tahun. Seluruh serverless edge (Cloudflare Pages, Workers, R2) dan database cloud (Supabase) sudah lebih dari cukup untuk menangani ratusan member aktif setiap hari tanpa mengeluarkan biaya bulanan sepeser pun.
2. **Kapan Harus Upgrade**: Anda hanya perlu mempertimbangkan upgrade ke paket berbayar jika jumlah klien aktif telah melampaui 1.000 orang atau studio Anda membutuhkan retensi log cadangan otomatis skala enterprise.
