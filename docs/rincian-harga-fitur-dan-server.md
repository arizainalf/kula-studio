# Dokumen Penawaran Harga & Spesifikasi Biaya Per Fitur
## Sistem Manajemen Gym & Personal Trainer — Kula Studio

**Kepada:** Klien / Manajemen Studio Gym  
**Tanggal:** 20 September 2026  
**Status Proyek:** Sistem Produksi Siap Pakai (*Production Ready*)  
**Arsitektur:** Single-Tenant Cloud Native (Hak Milik Penuh Studio)

---

## 1. Pendahuluan & Ringkasan Nilai Investasi

Dokumen ini berisi rincian penawaran harga per modul dan per fitur aplikasi **Kula Studio**, serta rincian biaya teknis infrastruktur server/cloud. 

Sistem ini dirancang untuk memberikan efisiensi operasional maksimal:
1. **Menghilangkan ketergantungan catatan kertas & spreadsheet** yang rawan hilang.
2. **Meningkatkan omset perpanjangan sesi klien (*upsell renewal*)** dengan notifikasi otomatis saat kuota sesi tersisa $\le 3$ kali.
3. **Meningkatkan kepuasan klien** melalui pesan rekap latihan otomatis ke WhatsApp dan portal mandiri (*gamification leaderboard*).
4. **Kepemilikan Penuh (Bukan Sewa SaaS Bulanan Mahal)**: Studio Anda memiliki sistem dan database sendiri tanpa dikenakan biaya lisensi per pelatih yang membebani setiap bulan.

---

## 2. Rincian Harga Pengembangan / Lisensi Per Fitur

Berikut adalah tabel rincian harga itemized per fitur jika dihitung berdasarkan modul implementasi mandiri:

### Modul 1: Manajemen Profil Klien & Kuota Sesi

| No | Nama Fitur | Deskripsi Teknis & Fungsional | Nilai / Harga Satuan |
| :---: | :--- | :--- | :---: |
| 1.1 | **Form Tambah Klien Baru** | Input data member baru: nama lengkap, nomor WhatsApp, email, target kebugaran (Fat Loss, Muscle Gain, General Fitness), catatan fisik khusus, dan penentuan paket sesi awal. | Rp 450.000 |
| 1.2 | **Edit Profil & Status Klien** | Modifikasi data member, perbarui nomor kontak, ubah target latihan, serta toggle aktivasi/nonaktifkan status keanggotaan klien. | Rp 300.000 |
| 1.3 | **Manajemen Kuota Paket Sesi** | Otomasi pemotongan kuota tiap kali sesi selesai, riwayat paket yang dibeli, sisa kuota real-time, dan persentase kehadiran. | Rp 500.000 |
| 1.4 | **Alert Riwayat Cedera & Medis** | Badge peringatan otomatis pada profil klien yang memiliki riwayat cedera sendi (lutut, bahu, pinggang) untuk mencegah kesalahan program latihan. | Rp 350.000 |
| 1.5 | **Penetapan & Rotasi Pelatih (Assign PT)** | Fitur admin untuk menetapkan atau memindahkan tanggung jawab klien dari satu pelatih ke pelatih lain secara instan tanpa kehilangan riwayat data. | Rp 400.000 |
| **SUBTOTAL MODUL 1** | **Manajemen Klien & Kuota** | **5 Fitur Lengkap Terintegrasi** | **Rp 2.000.000** |

---

### Modul 2: Pencatatan Sesi Latihan & Kalkulator RPE (Core Training Engine)

| No | Nama Fitur | Deskripsi Teknis & Fungsional | Nilai / Harga Satuan |
| :---: | :--- | :--- | :---: |
| 2.1 | **Log Sesi Latihan 4-Fase** | Form pencatatan latihan harian terstruktur: Warm-Up, Resistance (Inti), Cardio, dan Cool-Down langsung dari smartphone di lantai gym. | Rp 750.000 |
| 2.2 | **Input Set, Repetisi, Beban & Detail** | Input dinamis multi-set per gerakan dengan pencatatan beban (kg), jumlah repetisi, dan detail tempo/jarak. | Rp 600.000 |
| 2.3 | **Slider Intensitas RPE (Skala 1–10)** | Pengukuran intensitas kelelahan otot berbasis sains NASM/RPE dengan indikator warna (Ringan, Optimal, Maksimal) untuk panduan *progressive overload*. | Rp 500.000 |
| 2.4 | **Tracking Berat Badan & Estimasi Fat %** | Pencatatan metrik fisik klien di tiap sesi untuk memantau grafik perubahan komposisi tubuh berkala. | Rp 350.000 |
| 2.5 | **Fitur Duplikasi Sesi Cepat** | Tombol 1-klik untuk menyalin susunan gerakan dari sesi minggu lalu, menghemat waktu input pelatih hingga 80%. | Rp 400.000 |
| **SUBTOTAL MODUL 2** | **Engine Log Sesi & RPE** | **5 Fitur Inti Bimbingan Latihan** | **Rp 2.600.000** |

---

### Modul 3: Otomasi Komunikasi & WhatsApp Share

| No | Nama Fitur | Deskripsi Teknis & Fungsional | Nilai / Harga Satuan |
| :---: | :--- | :--- | :---: |
| 3.1 | **1-Click WhatsApp Recap Generator** | Membuat pesan rekap latihan otomatis yang rapi (lengkap dengan format teks tebal, rincian beban, RPE, sisa sesi, dan catatan coach) yang langsung membuka aplikasi WhatsApp klien. | Rp 750.000 |
| 3.2 | **Sistem Upsell Alert Kuota $\le 3$** | Indikator visual berkedip otomatis di dashboard pelatih dan admin saat kuota member tersisa 3 sesi atau kurang untuk perpanjangan paket tepat waktu. | Rp 450.000 |
| 3.3 | **Tautan Kontak Langsung Coach di Web** | Integrasi tautan WhatsApp interaktif di halaman depan publik yang langsung mengarahkan calon klien ke nomor pelatih pilihan. | Rp 300.000 |
| **SUBTOTAL MODUL 3** | **Komunikasi & WhatsApp** | **3 Fitur Otomasi Pesan & Peringatan** | **Rp 1.500.000** |

---

### Modul 4: Master Pustaka Gerakan & Kategori (Exercise Library)

| No | Nama Fitur | Deskripsi Teknis & Fungsional | Nilai / Harga Satuan |
| :---: | :--- | :--- | :---: |
| 4.1 | **Manajemen Kategori Gerakan** | Pengelompokan latihan terstruktur (Warm-up, Dada, Punggung, Kaki, Perut/Core, Kardio, Pemulihan) dengan ikon visual. | Rp 400.000 |
| 4.2 | **Pustaka Gerakan Global Studio** | Database gerakan terstandarisasi yang dibuat oleh Admin dan dapat diakses serentak oleh semua pelatih. | Rp 600.000 |
| 4.3 | **Pustaka Gerakan Custom Pelatih** | Ruang mandiri bagi tiap PT untuk menambahkan variasi gerakan uniknya sendiri tanpa mencampuri daftar gerakan pelatih lain. | Rp 600.000 |
| 4.4 | **Quick Search & Filter Autocomplete** | Pencarian instan gerakan saat input sesi berdasarkan nama otot, nama latihan, atau kategori. | Rp 350.000 |
| **SUBTOTAL MODUL 4** | **Master Pustaka Gerakan** | **4 Fitur Database Latihan Terpadu** | **Rp 1.950.000** |

---

### Modul 5: Kalender & Manajemen Jadwal Sesi

| No | Nama Fitur | Deskripsi Teknis & Fungsional | Nilai / Harga Satuan |
| :---: | :--- | :--- | :---: |
| 5.1 | **Kalender Mingguan Per Jam (05:00–23:00)** | Tampilan kisi waktu rapi untuk mengatur jadwal temu latihan 7 hari ke depan. | Rp 650.000 |
| 5.2 | **Penjadwalan Booking Sesi Klien** | Input jadwal sesi bimbingan lengkap dengan nama klien, jam latihan, dan catatan instruksi pra-sesi. | Rp 450.000 |
| 5.3 | **Deteksi Bentrok Jadwal (Conflict Prevention)** | Validasi otomatis untuk mencegah pelatih menjadwalkan dua klien berbeda pada jam dan tanggal yang sama. | Rp 400.000 |
| **SUBTOTAL MODUL 5** | **Jadwal & Kalender Studio** | **3 Fitur Pengaturan Waktu Terstruktur** | **Rp 1.500.000** |

---

### Modul 6: Monitoring, Evaluasi & Laporan PDF

| No | Nama Fitur | Deskripsi Teknis & Fungsional | Nilai / Harga Satuan |
| :---: | :--- | :--- | :---: |
| 6.1 | **Galeri Foto Transformasi Fisik** | Upload dokumentasi foto bentuk tubuh (*before-after*) dan form gerakan yang tersimpan aman di cloud storage. | Rp 650.000 |
| 6.2 | **Grafik Tren Berat Badan & RPE Rata-rata** | Visualisasi diagram garis progres penurunan berat badan dan grafik spektrum beban latihan dari waktu ke waktu. | Rp 600.000 |
| 6.3 | **Export Dokumen Laporan Resmi ke PDF** | Pembuatan berkas PDF siap cetak berisi rekap absensi, total beban terangkat, dan catatan evaluasi resmi studio. | Rp 750.000 |
| **SUBTOTAL MODUL 6** | **Monitoring & Laporan PDF** | **3 Fitur Evaluasi Hasil Latihan** | **Rp 2.000.000** |

---

### Modul 7: Portal Khusus Klien (Client Self-Service & Gamifikasi)

| No | Nama Fitur | Deskripsi Teknis & Fungsional | Nilai / Harga Satuan |
| :---: | :--- | :--- | :---: |
| 7.1 | **Login Klien Tanpa Password (*Frictionless*)** | Member masuk cukup menggunakan nomor WhatsApp dan email terverifikasi tanpa ribet menghafal kata sandi baru. | Rp 500.000 |
| 7.2 | **Dashboard Transparansi Sisa Sesi** | Tampilan visual persentase kuota sesi yang telah digunakan dan tanggal kedaluwarsa paket. | Rp 400.000 |
| 7.3 | **Gamifikasi & Leaderboard Peringkat Member** | Sistem skor berbasis konsistensi dan volume latihan dengan tingkatan pangkat (Bronze, Silver, Gold, Diamond, Titan) untuk memacu motivasi member. | Rp 750.000 |
| 7.4 | **Riwayat Catatan & Anjuran Coach** | Arsip instruksi teknis, rekor beban baru (*Personal Record*), serta tips nutrisi yang dapat dibaca kembali oleh member kapan saja. | Rp 350.000 |
| **SUBTOTAL MODUL 7** | **Portal Klien & Gamifikasi** | **4 Fitur Pengalaman Eksklusif Member** | **Rp 2.000.000** |

---

### Modul 8: Administrasi Studio, Branding & White-Label

| No | Nama Fitur | Deskripsi Teknis & Fungsional | Nilai / Harga Satuan |
| :---: | :--- | :--- | :---: |
| 8.1 | **Executive KPI Dashboard Studio** | Pusat kendali Owner/Admin: melihat total pelatih, member aktif, utilisasi kuota studio (%), dan sesi hari ini secara *real-time*. | Rp 700.000 |
| 8.2 | **Manajemen Akun Staf Pelatih (PT)** | Tambah akun coach baru, pasang spesialisasi (Fat Loss, Bodybuilding, Rehab), reset sandi, dan kelola hak akses. | Rp 500.000 |
| 8.3 | **Editor Identitas Platform (*White-Label*)** | Kustomisasi nama brand gym, logo aplikasi, tagline, headline promosi, kontak resmi, dan informasi footer. | Rp 600.000 |
| 8.4 | **Saklar Visibilitas Tabel Harga Landing Page** | Fitur tombol saklar (*toggle switch*) untuk mengaktifkan atau menyembunyikan bagian tabel harga di halaman publik secara *real-time*. | Rp 400.000 |
| 8.5 | **Role Switcher 1-Klik** | Tombol cepat untuk beralih peran antara Administrator dan Personal Trainer tanpa perlu keluar-masuk akun. | Rp 350.000 |
| 8.6 | **Landing Page Publik Mewah & PWA Mobile** | Beranda depan responsif, showcase pelatih & video YouTube, serta navigasi bawah ergonomis yang dapat diinstal di homescreen HP. | Rp 900.000 |
| **SUBTOTAL MODUL 8** | **Administrasi & White-Label** | **6 Fitur Manajemen Bisnis & Branding** | **Rp 3.450.000** |

---

### Rekapitulasi Nilai Seluruh Fitur Per Modul

| Modul Sistem | Jumlah Fitur | Total Nilai Fitur |
| :--- | :---: | :---: |
| **Modul 1: Manajemen Profil Klien & Kuota** | 5 Fitur | Rp 2.000.000 |
| **Modul 2: Pencatatan Sesi Latihan & Kalkulator RPE** | 5 Fitur | Rp 2.600.000 |
| **Modul 3: Otomasi Komunikasi & WhatsApp** | 3 Fitur | Rp 1.500.000 |
| **Modul 4: Master Pustaka Gerakan (Exercise Library)** | 4 Fitur | Rp 1.950.000 |
| **Modul 5: Kalender & Manajemen Jadwal Sesi** | 3 Fitur | Rp 1.500.000 |
| **Modul 6: Monitoring, Evaluasi & Laporan PDF** | 3 Fitur | Rp 2.000.000 |
| **Modul 7: Portal Mandiri Klien & Gamifikasi** | 4 Fitur | Rp 2.000.000 |
| **Modul 8: Administrasi Studio, Branding & White-Label** | 6 Fitur | Rp 3.450.000 |
| **TOTAL NILAI FITUR KESELURUHAN (33 FITUR)** | **33 Fitur** | **Rp 17.000.000** |

---

## 3. Rincian Teknis Biaya Infrastruktur Server & Cloud

Aplikasi ini menggunakan teknologi **Serverless Edge Computing** modern dari Cloudflare dan basis data PostgreSQL. Arsitektur ini memungkinkan efisiensi biaya luar biasa:

### A. Rincian Komponen Teknis Server

| Komponen Infrastruktur | Fungsi Teknis | Penyedia Layanan | Estimasi Biaya |
| :--- | :--- | :--- | :---: |
| **Nama Domain Kustom** | Alamat web resmi studio Anda (misal: `namagym.com` atau `namagym.id`) | Registrar Resmi (Domainesia, Niagahoster, Namecheap) | ~Rp 130.000 – Rp 160.000 / **tahun** |
| **DNS, CDN & SSL Security** | Perlindungan dari serangan siber (DDoS mitigation), enkripsi SSL HTTPS gratis seumur hidup, dan DNS tercepat di dunia. | Cloudflare DNS (Free Tier) | **Rp 0** (Gratis) |
| **Frontend Hosting** | Hosting aset web React SPA di 300+ data center global Cloudflare dengan kecepatan akses instan sub-detik. | Cloudflare Pages (Free Tier) | **Rp 0** (Gratis, Unlimited Bandwidth) |
| **Backend API Engine** | Runtime serverless berbasis TypeScript/Hono yang mengeksekusi logika bisnis tanpa perlu menyewa OS server Linux. | Cloudflare Workers (Free Tier - 100.000 request/hari) | **Rp 0** (Gratis) |
| **Database PostgreSQL** | Basis data relasional terpusat untuk menyimpan akun staf, data member, riwayat sesi, dan katalog latihan. | Supabase / Neon DB (Free Tier - 500 MB) | **Rp 0** (Gratis, cukup untuk 50.000+ sesi) |
| **Cloud Storage Foto** | Penyimpanan foto transformasi fisik klien dan avatar dengan keunggulan *Zero Egress Fee* (bebas kuota unduh). | Cloudflare R2 (Free Tier - 10 GB) | **Rp 0** (Gratis, muat ~15.000 foto HD) |
| **Cloudflared Tunnel** | Jalur terenkripsi aman jika studio ingin memakai server/Mini PC sendiri di lokasi gym tanpa perlu IP Publik Statis. | Cloudflare Zero Trust (Free Tier) | **Rp 0** (Gratis) |

### B. Simulasi Biaya Operasional Berdasarkan Beban Penggunaan

| Skala Penggunaan Studio | Kapasitas Sesi / Member | Biaya Server Bulanan | Biaya Server Tahunan |
| :--- | :--- | :---: | :---: |
| **1. Skema Hemat (Free Tier)** *(Direkomendasikan)* | 1–15 Pelatih, hingga 1.000 Klien Aktif | **Rp 0 / bulan** | **~Rp 130.000 / tahun** *(Hanya sewa domain)* |
| **2. Skema Menengah / Ramai** | 500 – 2.000+ Sesi per Hari (Traffic masif) | **~Rp 500.000 / bulan** ($31/bln) | **~Rp 6.000.000 / tahun** |
| **3. Skema Hybrid On-Premise** | Server Mini PC di Gym via Cloudflared | **~Rp 25.000 / bulan** *(Listrik Mini PC)* | **~Rp 300.000 / tahun** + Hardware Rp 1.8 Jt (1x) |

---

## 4. Opsi Paket Penawaran untuk Klien (Pilihan Paket Implementasi)

Untuk mempermudah penyerahan penawaran kepada pemilik studio/klien, berikut disajikan 3 paket siap pilih:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                PILIHAN PAKET IMPLEMENTASI                              │
├────────────────────────────┬───────────────────────────────┬───────────────────────────┤
│      PAKET 1: ESSENTIAL    │       PAKET 2: PRO STUDIO     │    PAKET 3: ENTERPRISE    │
│         (Basic Gym)        │         (Best Value)          │       (Full Custom)       │
├────────────────────────────┼───────────────────────────────┼───────────────────────────┤
│ • Modul 1: Manajemen Klien │ • SELURUH FITUR PAKET 1       │ • SELURUH FITUR PAKET 2   │
│ • Modul 2: Log Sesi & RPE  │ • Modul 4: Master Pustaka     │ • Setup Server On-Premise │
│ • Modul 3: WhatsApp Share  │ • Modul 5: Kalender Jadwal    │   Mini PC di lokasi Gym   │
│ • Modul 8: Branding & Logo │ • Modul 6: Laporan PDF & Foto │ • Cloudflared Zero Trust  │
│ • Setup Serverless & Domain│ • Modul 7: Portal Klien & Rank│ • Backup Harian Otomatis  │
│ • Garansi Teknis 1 Bulan   │ • Setup Lengkap + Pelatihan PT│ • Maintenance 12 Bulan    │
├────────────────────────────┼───────────────────────────────┼───────────────────────────┤
│     Rp 6.500.000 (1x Bayar)│      Rp 11.500.000 (1x Bayar) │   Rp 18.500.000 (1x Bayar)│
└────────────────────────────┴───────────────────────────────┴───────────────────────────┘
```

### Keuntungan Memilih Sistem Kula Studio Dibandingkan SaaS Komersial:
- **Penghematan Signifikan**: Software SaaS gym komersial (seperti Mindbody atau Glofox) mematok biaya sewa Rp 12 Juta – Rp 35 Juta **setiap tahun selamanya**.
- **Tanpa Batasan Akun**: Bebas menambah ratusan pelatih dan ribuan klien tanpa biaya tambahan per kepala.
- **Data 100% Milik Studio**: Database tersimpan di tangan Anda sendiri, aman, dan dapat diunduh kapan saja.

---

## 5. Layanan Tambahan (Opsional Maintenance & Dukungan Teknis)

Jika pihak studio membutuhkan pendampingan teknis berkelanjutan setelah masa implementasi awal:

| Layanan | Cakupan Pekerjaan | Biaya |
| :--- | :--- | :---: |
| **SLA Maintenance Bulanan** | Pemantauan uptime server, update patch keamanan, backup database rutin mingguan, dan bantuan teknis prioritas via WA. | Rp 250.000 – Rp 500.000 / bulan |
| **Pelatihan Staf Pelatih (Training)** | Sesi pelatihan cara penggunaan aplikasi untuk seluruh pelatih gym (durasi 2–3 jam via Zoom atau tatap muka). | Rp 500.000 / sesi |
| **Kustomisasi Fitur Lanjutan** | Penambahan alur khusus di luar spesifikasi dasar (misal integrasi payment gateway otomatis, mesin fingerprint, dll.). | Sesuai estimasi man-days |

---

## 6. Syarat & Ketentuan Penawaran

1. **Masa Berlaku Penawaran**: Penawaran harga ini berlaku selama 30 (tiga puluh) hari kalender sejak tanggal diterbitkan.
2. **Termin Pembayaran**:
   - DP 50% saat penandatanganan kesepakatan / dimulainya setup sistem.
   - Pelunasan 50% setelah serah terima sistem dan pelatihan selesai.
3. **Masa Garansi Bug**: Diberikan garansi perbaikan bug dan pendampingan teknis gratis selama 30 hari pasca serah terima.
4. **Kepemilikan Akun**: Seluruh akun domain dan database didaftarkan atas nama pihak studio gym (klien).

---

*Disiapkan dan disusun oleh: Tim Pengembang Kula Studio*  
*Dokumen ini sah sebagai lembar spesifikasi dan penawaran teknis resmi.*
