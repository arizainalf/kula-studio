import type { User } from '../lib/api'
import { Check, ArrowRight } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export function LandingPage({ currentUser }: { currentUser?: User | null }) {
  return (
    <div className="bg-bg text-text min-h-dvh selection:bg-accent/30 selection:text-text font-sans antialiased overflow-x-hidden">
      {/* ── 1. Sticky Navigation Bar ── */}
      <header className="sticky top-0 z-50 bg-panel backdrop-blur-xl border-b border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            {/* Luxury Monogram Badge */}
            <div className="w-9 h-9 rounded-lg bg-panel border border-accent/40 flex items-center justify-center shadow-[0_0_15px_rgba(226,232,0,0.15)] group-hover:border-accent transition-colors">
              <span className="font-extrabold text-sm tracking-tighter text-accent">TL</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-none text-text">
                Train<span className="text-accent">Log</span>
              </span>
              <span className="text-[10px] text-dim tracking-wider uppercase font-mono mt-0.5">
                Pro PT Manager
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-dim">
            <a href="#fitur" className="hover:text-accent transition-colors">Fitur</a>
            <a href="#cara" className="hover:text-accent transition-colors">Cara Kerja</a>
            <a href="#peran" className="hover:text-accent transition-colors">Untuk Siapa</a>
            <a href="#paket" className="hover:text-accent transition-colors">Harga</a>
          </nav>

          {/* Right Action CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {currentUser ? (
              <a
                href="/"
                className="btn-interactive bg-accent hover:bg-accent/90 text-[#141414] font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg transition-all shadow-[0_2px_12px_rgba(226,232,0,0.25)] flex items-center gap-1.5"
              >
                <span>Buka Dashboard</span>
                <span className="text-[11px] opacity-75 font-normal">({currentUser.name.split(' ')[0]})</span>
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  className="btn-interactive text-dim hover:text-text text-xs sm:text-sm font-medium px-3 py-2 transition-colors"
                >
                  Masuk
                </a>
                <a
                  href="/login"
                  className="btn-interactive bg-accent hover:bg-accent/90 text-[#141414] font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-lg transition-all shadow-[0_2px_14px_rgba(226,232,0,0.25)]"
                >
                  Coba Gratis
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section ── */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Subtle Ambient Gold Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/6 blur-[120px] pointer-events-none rounded-full animate-gold-pulse" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center relative z-10 animate-fade-in-up">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-panel border border-accent/30 text-accent text-xs font-mono tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Eksklusif untuk Personal Trainer &amp; Studio
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text leading-[1.12] mb-6">
            Catat Sesi. Susun Program NASM.{' '}
            <span className="block mt-1 bg-gradient-to-r from-[#f4f4f6] via-accent to-[#c5a059] bg-clip-text text-transparent">
              Pantau Progress Klien.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-dim leading-relaxed mb-8">
            Tinggalkan buku catatan kertas dan spreadsheet yang tercecer. Satu platform terpadu untuk mengatur jadwal,
            mencatat beban &amp; RPE, merancang program berbasis sains, dan membagikan rekap sesi ke WhatsApp klien.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <a
              href="/login"
              className="btn-interactive w-full sm:w-auto bg-accent hover:bg-accent/90 text-[#141414] font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all shadow-[0_4px_24px_rgba(226,232,0,0.3)] hover:scale-[1.02]"
            >
              Mulai Sekarang — 14 Hari Percobaan
            </a>
            <a
              href="#fitur"
              className="btn-interactive w-full sm:w-auto bg-panel hover:bg-panel-elevated text-text border border-line hover:border-accent/40 text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all"
            >
              Pelajari Fitur
            </a>
          </div>

          {/* Trust Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-dim font-mono max-w-3xl mx-auto border-t border-line/60 pt-6">
            <div className="flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
              <span>Cloudflare Edge Sync</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
              <span>HP, Tablet &amp; Desktop</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
              <span>Native PDF Export</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
              <span>Instant WhatsApp Share</span>
            </div>
          </div>
        </div>

        {/* ── App Live Preview Card Mockup ── */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 mt-12 animate-fade-in">
          <div className="hover-gold-glow rounded-2xl border border-line bg-panel p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative transition-all duration-500">
            {/* Top Bar dots */}
            <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="ml-2 text-xs font-mono text-dim">trainlog.id / dashboard</span>
              </div>
              <span className="text-xs font-mono text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                PRO EDITION
              </span>
            </div>

            {/* Mockup Content Grid */}
            <div className="grid sm:grid-cols-3 gap-4 text-left">
              {/* Client Card 1 */}
              <div className="rounded-xl border border-line bg-bg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-text">Siti Rahma</span>
                    <span className="text-xs font-mono text-accent">18/20 sesi</span>
                  </div>
                  <p className="text-xs text-dim mb-3">Goal: Fat Loss &amp; Hypertrophy</p>
                  <div className="w-full bg-line h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent h-full rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-dim">
                  <span>Sisa 2 sesi</span>
                  <span className="text-amber-400 font-medium">Perlu Upsell</span>
                </div>
              </div>

              {/* Workout Log Active Session */}
              <div className="rounded-xl border border-line bg-bg p-4 sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-dim">
                    Log Latihan Terakhir · 18 Sep 2026
                  </span>
                  <span className="text-xs font-mono bg-panel px-2 py-0.5 rounded text-accent border border-line">
                    RPE 8.5 / 10
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-panel border border-line/50">
                    <div className="text-dim text-[10px] uppercase font-mono mb-1">Warm-Up</div>
                    <div className="font-medium text-text">Foam Roll + Glute Bridge</div>
                    <div className="text-dim text-[11px]">2 set x 15 rep</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-panel border border-line/50">
                    <div className="text-dim text-[10px] uppercase font-mono mb-1">Resistance</div>
                    <div className="font-medium text-text">Barbell Back Squat</div>
                    <div className="text-dim text-[11px]">4 set x 10 rep @ 65 kg</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-panel border border-line/50">
                    <div className="text-dim text-[10px] uppercase font-mono mb-1">Cardio</div>
                    <div className="font-medium text-text">Incline Treadmill Walk</div>
                    <div className="text-dim text-[11px]">15 mnt, Incline 10, Spd 4.8</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-panel border border-line/50">
                    <div className="text-dim text-[10px] uppercase font-mono mb-1">Cool-Down</div>
                    <div className="font-medium text-text">Hip Flexor &amp; Hamstring</div>
                    <div className="text-dim text-[11px]">Static stretch 30s per leg</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Feature Highlights Section (`#fitur`) ── */}
      <section id="fitur" className="py-20 border-t border-line bg-panel/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono tracking-widest text-accent uppercase mb-2">
              Fitur Lengkap
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
              Dibuat Khusus Sesuai Alur Kerja Pelatih Profesional
            </h3>
            <p className="mt-3 text-sm sm:text-base text-dim">
              Setiap detail dirancang untuk mempercepat pencatatan di lantai gym dan memperjelas progres klien.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="hover-gold-glow p-6 rounded-2xl bg-panel border border-line transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center text-accent mb-4 group-hover:border-accent/60 group-hover:scale-110 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-lg text-text mb-2">Manajemen Profil Klien</h4>
              <p className="text-sm text-dim leading-relaxed">
                Kelola profil klien lengkap dengan target kebugaran (Fat Loss, Muscle Gain, General Fitness), nomor WhatsApp, paket kuota sesi, dan catatan kondisi fisik khusus.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="hover-gold-glow p-6 rounded-2xl bg-panel border border-line transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center text-accent mb-4 group-hover:border-accent/60 group-hover:scale-110 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h4 className="font-bold text-lg text-text mb-2">Log Sesi 4 Fase Terstruktur</h4>
              <p className="text-sm text-dim leading-relaxed">
                Pencatatan sesi sesuai standar internasional: Warm-Up, Resistance, Cardio, dan Cool-Down dengan data set, repetisi, beban (kg), dan slider skala intensitas RPE 1–10.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="hover-gold-glow p-6 rounded-2xl bg-panel border border-line transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center text-accent mb-4 group-hover:border-accent/60 group-hover:scale-110 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-bold text-lg text-text mb-2">Generate Program NASM (AI)</h4>
              <p className="text-sm text-dim leading-relaxed">
                Rancang program latihan komprehensif berbasis metodologi NASM OPT Model bertenaga kecerdasan buatan, disesuaikan dengan usia, jenis kelamin, serta riwayat cedera sendi.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="hover-gold-glow p-6 rounded-2xl bg-panel border border-line transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center text-accent mb-4 group-hover:border-accent/60 group-hover:scale-110 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-lg text-text mb-2">Jadwal Kalender Mingguan</h4>
              <p className="text-sm text-dim leading-relaxed">
                Tampilan jadwal per jam (05:00–23:00) yang rapi untuk 7 hari dalam sepekan. Cegah bentrok jadwal sesi personal training dan pantau slot waktu kosong dengan mudah.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="hover-gold-glow p-6 rounded-2xl bg-panel border border-line transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center text-accent mb-4 group-hover:border-accent/60 group-hover:scale-110 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h4 className="font-bold text-lg text-text mb-2">Grafik &amp; Foto Progres Klien</h4>
              <p className="text-sm text-dim leading-relaxed">
                Pantau grafik penurunan berat badan, perubahan RPE rata-rata, dan galeri foto transformasi klien yang tersimpan rapi dan aman di cloud storage.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="hover-gold-glow p-6 rounded-2xl bg-panel border border-line transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center text-accent mb-4 group-hover:border-accent/60 group-hover:scale-110 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-lg text-text mb-2">Export PDF &amp; WhatsApp Share</h4>
              <p className="text-sm text-dim leading-relaxed">
                Cetak riwayat latihan langsung ke format PDF elegan atau kirimkan pesan ringkasan latihan harian langsung ke nomor WhatsApp klien dengan satu ketukan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. How It Works Section (`#cara`) ── */}
      <section id="cara" className="py-20 border-t border-line">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-xs font-mono tracking-widest text-accent uppercase mb-2">
              Cara Kerja
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
              Tiga Langkah Praktis Tanpa Beban Administrasi
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="hover-gold-glow p-6 rounded-2xl bg-panel border border-line flex flex-col transition-all duration-300">
              <div className="font-mono text-2xl font-bold text-accent mb-3">01</div>
              <h4 className="font-bold text-base text-text mb-2">Tambahkan Profil Klien</h4>
              <p className="text-sm text-dim leading-relaxed">
                Masukkan nama klien, target latihan, dan jumlah paket sesi yang diambil. Sistem akan mengawasi kuota sesi otomatis.
              </p>
            </div>

            {/* Step 2 */}
            <div className="hover-gold-glow p-6 rounded-2xl bg-panel border border-line flex flex-col transition-all duration-300">
              <div className="font-mono text-2xl font-bold text-accent mb-3">02</div>
              <h4 className="font-bold text-base text-text mb-2">Catat Saat Latihan Berlangsung</h4>
              <p className="text-sm text-dim leading-relaxed">
                Gunakan smartphone saat mendampingi klien di gym. Masukkan beban, repetisi, dan RPE dalam hitungan detik.
              </p>
            </div>

            {/* Step 3 */}
            <div className="hover-gold-glow p-6 rounded-2xl bg-panel border border-line flex flex-col transition-all duration-300">
              <div className="font-mono text-2xl font-bold text-accent mb-3">03</div>
              <h4 className="font-bold text-base text-text mb-2">Kirim Rekap &amp; Evaluasi</h4>
              <p className="text-sm text-dim leading-relaxed">
                Kirimkan ringkasan latihan ke WhatsApp klien dan evaluasi grafik kemajuan beban dari waktu ke waktu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Target Audience (`#peran`) ── */}
      <section id="peran" className="py-20 border-t border-line bg-panel/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-xs font-mono tracking-widest text-accent uppercase mb-2">
              Segmentasi
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
              Dua Peran Utama, Satu Ekosistem
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card PT Independen */}
            <div className="hover-gold-glow p-8 rounded-2xl bg-panel border border-line relative overflow-hidden flex flex-col justify-between transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="inline-block text-xs font-mono text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 mb-4">
                  PERSONAL TRAINER
                </div>
                <h4 className="text-xl font-bold text-text mb-3">Untuk Personal Trainer Mandiri</h4>
                <p className="text-sm text-dim leading-relaxed mb-6">
                  Tingkatkan kredibilitas profesional Anda. Tidak perlu lagi mengingat di kepala atau mencari riwayat beban di chat WhatsApp yang hilang. Semua tersusun sistematis.
                </p>
                <ul className="space-y-2.5 text-xs text-text mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Mengurangi waktu administrasi manual hingga 80%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Notifikasi upsell otomatis saat sesi tersisa &le; 3 kali</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Akses cepat dari smartphone saat berada di area gym</span>
                  </li>
                </ul>
              </div>
              <a
                href="/login"
                className="btn-interactive inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-lg bg-bg border border-line hover:border-accent text-sm font-semibold transition-all"
              >
                <span>Mulai Sebagai PT</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Card Manager Studio */}
            <div className="hover-gold-glow p-8 rounded-2xl bg-panel border border-line relative overflow-hidden flex flex-col justify-between transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="inline-block text-xs font-mono text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 mb-4">
                  STUDIO MANAGER
                </div>
                <h4 className="text-xl font-bold text-text mb-3">Untuk Studio &amp; Gym Manager</h4>
                <p className="text-sm text-dim leading-relaxed mb-6">
                  Pantau seluruh pelatih di bawah naungan studio Anda. Lihat total utilisasi sesi latihan secara transparan dan atur hak akses tim pelatih dengan aman.
                </p>
                <ul className="space-y-2.5 text-xs text-text mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Monitoring performa dan sesi dari seluruh PT tim</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Sistem persetujuan registrasi (whitelist verification)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Kontrol terpusat lisensi paket Standard dan Pro</span>
                  </li>
                </ul>
              </div>
              <a
                href="/login"
                className="btn-interactive inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-lg bg-bg border border-line hover:border-accent text-sm font-semibold transition-all"
              >
                <span>Daftarkan Studio</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Pricing Section (`#paket`) ── */}
      <section id="paket" className="py-20 border-t border-line">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-xs font-mono tracking-widest text-accent uppercase mb-2">
              Paket Langganan
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
              Investasi Terjangkau untuk Hasil Maksimal
            </h3>
            <p className="mt-3 text-sm text-dim">
              Pilih paket yang paling cocok untuk kebutuhan pembinaan klien Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Tier: Standard */}
            <div className="hover-gold-glow p-8 rounded-2xl bg-panel border border-line flex flex-col justify-between transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-text">Standard</h4>
                  <span className="text-xs font-mono text-dim bg-bg px-2.5 py-1 rounded border border-line">
                    Dasar
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-text">Rp59.000</span>
                  <span className="text-xs text-dim font-mono">/ bulan</span>
                </div>
                <p className="text-xs sm:text-sm text-dim leading-relaxed mb-6">
                  Cocok untuk personal trainer yang fokus pada pencatatan harian yang cepat, akurat, dan pelaporan rapi.
                </p>
                <div className="space-y-3 text-xs sm:text-sm text-dim border-t border-line pt-6 mb-8">
                  <div className="flex items-center gap-2 text-text">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Manajemen Klien &amp; Sesi Unlimited</span>
                  </div>
                  <div className="flex items-center gap-2 text-text">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Kalender Jadwal Mingguan</span>
                  </div>
                  <div className="flex items-center gap-2 text-text">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Foto &amp; Grafik Progress Klien</span>
                  </div>
                  <div className="flex items-center gap-2 text-text">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Session Template Rutin</span>
                  </div>
                  <div className="flex items-center gap-2 text-text">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Sinkronisasi Cloud Otomatis</span>
                  </div>
                  <div className="flex items-center gap-2 text-dim">
                    <span className="text-dim opacity-50">&bull;</span> Kuota Generate AI Terbatas
                  </div>
                </div>
              </div>
              <a
                href="/login"
                className="btn-interactive w-full py-3 px-4 rounded-xl bg-bg border border-line hover:border-accent text-center text-sm font-semibold transition-all"
              >
                Pilih Standard
              </a>
            </div>

            {/* Tier: Pro (Best Seller) */}
            <div className="hover-gold-glow p-8 rounded-2xl bg-panel border-2 border-accent relative flex flex-col justify-between shadow-[0_8px_32px_rgba(226,232,0,0.2)] hover:shadow-[0_12px_44px_rgba(226,232,0,0.35)] transition-all duration-300">
              {/* Popular Tag */}
              <div className="absolute -top-3.5 left-8 px-3 py-0.5 rounded-full bg-accent text-[#141414] font-mono text-[11px] font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(226,232,0,0.4)]">
                Paling Diminati
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-text">Pro</h4>
                  <span className="text-xs font-mono text-accent bg-accent/15 px-2.5 py-1 rounded border border-accent/30 font-semibold">
                    Unlimited AI
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-accent">Rp89.000</span>
                  <span className="text-xs text-dim font-mono">/ bulan</span>
                </div>
                <p className="text-xs sm:text-sm text-dim leading-relaxed mb-6">
                  Solusi komprehensif bagi pelatih elit yang memanfaatkan kekuatan AI berbasis metodologi sains NASM.
                </p>
                <div className="space-y-3 text-xs sm:text-sm text-text border-t border-line pt-6 mb-8">
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Seluruh Fitur Paket Standard</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Generate Program NASM Tanpa Batas</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Kustomisasi &amp; Modifikasi Gerakan Instan</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Export PDF Bersih Tanpa Watermark</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                    <span>Prioritas Dukungan Admin Langsung via WA</span>
                  </div>
                </div>
              </div>
              <a
                href="/login"
                className="btn-interactive w-full py-3 px-4 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] text-center text-sm font-semibold transition-all shadow-[0_2px_16px_rgba(226,232,0,0.3)]"
              >
                Mulai Paket Pro
              </a>
            </div>
          </div>

          {/* Paket Hemat Pro */}
          <div className="hover-gold-glow mt-12 max-w-4xl mx-auto rounded-2xl border border-line bg-panel p-6 sm:p-8 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
              <h4 className="font-bold text-lg text-text">Paket Hemat Pro Jangka Panjang</h4>
              <span className="text-xs text-dim font-mono">Bayar di muka, harga per bulan lebih terjangkau</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="hover-gold-glow p-4 rounded-xl bg-bg border border-line text-left transition-all duration-300">
                <div className="text-xs text-dim font-mono mb-1">1 Bulan</div>
                <div className="text-xl font-bold text-text mb-1">Rp89.000</div>
                <p className="text-xs text-dim">Fleksibel bulanan, berhenti kapan saja.</p>
              </div>
              <div className="hover-gold-glow p-4 rounded-xl bg-bg border border-accent/40 text-left relative transition-all duration-300">
                <div className="text-xs text-accent font-mono mb-1">3 Bulan (Hemat 10%)</div>
                <div className="text-xl font-bold text-text mb-1">Rp239.000</div>
                <p className="text-xs text-dim">Setara Rp79.600 / bulan. Hemat Rp28.000.</p>
              </div>
              <div className="hover-gold-glow p-4 rounded-xl bg-bg border border-accent text-left relative transition-all duration-300">
                <div className="text-xs text-accent font-mono font-semibold mb-1">6 Bulan (Bayar 5, Dapat 6)</div>
                <div className="text-xl font-bold text-accent mb-1">Rp445.000</div>
                <p className="text-xs text-dim">Setara Rp74.200 / bulan. Hemat Rp89.000.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Bottom Call to Action ── */}
      <section className="py-20 border-t border-line relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10 text-center">
          <div className="hover-gold-glow p-8 sm:p-14 rounded-3xl bg-panel border border-accent/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight mb-4">
              Mulai Catat Sesi Latihan Hari Ini.
            </h3>
            <p className="text-dim text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Daftarkan akun Anda, verifikasi melalui admin studio, dan rasakan kemudahan pengelolaan latihan berstandar internasional.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/login"
                className="btn-interactive w-full sm:w-auto bg-accent hover:bg-accent/90 text-[#141414] font-semibold text-sm sm:text-base px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(226,232,0,0.25)]"
              >
                Daftar Sekarang
              </a>
              <a
                href="/login"
                className="btn-interactive w-full sm:w-auto bg-bg hover:bg-panel-elevated text-text border border-line text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all"
              >
                Masuk ke Akun
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Footer ── */}
      <footer className="border-t border-line bg-bg py-10 text-xs text-dim">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-panel border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
              TL
            </div>
            <span className="text-text font-medium">TrainLog Replica</span>
            <span>&copy; {new Date().getFullYear()} Hak Cipta Dilindungi.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#fitur" className="hover:text-accent transition-colors">Fitur</a>
            <a href="#cara" className="hover:text-accent transition-colors">Cara Pakai</a>
            <a href="#paket" className="hover:text-accent transition-colors">Harga</a>
            <a
              href="https://wa.me/6287884241516"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline flex items-center gap-1"
            >
              <span>Hubungi Admin WA</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
