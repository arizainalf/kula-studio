import type { User, PlatformSettings } from '../lib/api'
import {
  Check,
  ArrowRight,
  Users,
  ClipboardList,
  Zap,
  Calendar,
  TrendingUp,
  Share2,
  Dumbbell,
  Sparkles,
  Timer,
  Trophy,
  Activity,
  Target,
  ShieldCheck,
  Smartphone,
  Cloud,
  MessageCircle,
  FileText,
  Flame,
  Scale,
  Award,
  Crown,
  Gauge,
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

function renderFeatureIcon(iconKey?: string) {
  const cls = 'w-5 h-5'
  switch (iconKey) {
    case 'users':
      return <Users className={cls} />
    case 'clipboard':
      return <ClipboardList className={cls} />
    case 'dumbbell':
      return <Dumbbell className={cls} />
    case 'zap':
      return <Zap className={cls} />
    case 'calendar':
      return <Calendar className={cls} />
    case 'chart':
      return <TrendingUp className={cls} />
    case 'share':
      return <Share2 className={cls} />
    case 'timer':
      return <Timer className={cls} />
    case 'trophy':
      return <Trophy className={cls} />
    case 'target':
      return <Target className={cls} />
    case 'heart':
      return <Activity className={cls} />
    case 'flame':
      return <Flame className={cls} />
    case 'scale':
      return <Scale className={cls} />
    case 'smartphone':
      return <Smartphone className={cls} />
    case 'cloud':
      return <Cloud className={cls} />
    case 'message':
      return <MessageCircle className={cls} />
    case 'file-text':
      return <FileText className={cls} />
    case 'shield':
      return <ShieldCheck className={cls} />
    case 'crown':
      return <Crown className={cls} />
    case 'gauge':
      return <Gauge className={cls} />
    case 'award':
      return <Award className={cls} />
    case 'sparkles':
    default:
      return <Sparkles className={cls} />
  }
}

export function LandingPage({
  currentUser,
  initialSettings,
}: {
  currentUser?: User | null
  initialSettings?: PlatformSettings | null
}) {
  const s = initialSettings

  const appName = s?.app_name || 'TrainLog'
  const appInitials = s?.app_initials || 'TL'
  const appLogoUrl = s?.logo_url
  const appTagline = s?.app_tagline || 'Pro PT Manager'
  const heroPill = s?.hero_pill || 'Eksklusif untuk Personal Trainer & Studio'
  const heroHeadline = s?.hero_headline || 'Catat Sesi. Susun Program NASM.'
  const heroGradient = s?.hero_gradient || 'Pantau Progress Klien.'
  const heroSubheadline =
    s?.hero_subheadline ||
    'Tinggalkan buku catatan kertas dan spreadsheet yang tercecer. Satu platform terpadu untuk mengatur jadwal, mencatat beban & RPE, merancang program berbasis sains, dan membagikan rekap sesi ke WhatsApp klien.'

  const features =
    s?.features && s.features.length > 0
      ? s.features
      : [
          {
            id: 'f1',
            icon: 'users',
            title: 'Manajemen Profil Klien',
            description:
              'Kelola profil klien lengkap dengan target kebugaran (Fat Loss, Muscle Gain, General Fitness), nomor WhatsApp, paket kuota sesi, dan catatan kondisi fisik khusus.',
          },
          {
            id: 'f2',
            icon: 'clipboard',
            title: 'Log Sesi 4 Fase Terstruktur',
            description:
              'Pencatatan sesi sesuai standar internasional: Warm-Up, Resistance, Cardio, dan Cool-Down dengan data set, repetisi, beban (kg), dan slider skala intensitas RPE 1–10.',
          },
          {
            id: 'f3',
            icon: 'zap',
            title: 'Generate Program NASM (AI)',
            description:
              'Rancang program latihan komprehensif berbasis metodologi NASM OPT Model bertenaga kecerdasan buatan, disesuaikan dengan usia, jenis kelamin, serta riwayat cedera sendi.',
          },
          {
            id: 'f4',
            icon: 'calendar',
            title: 'Jadwal Kalender Mingguan',
            description:
              'Tampilan jadwal per jam (05:00–23:00) yang rapi untuk 7 hari dalam sepekan. Cegah bentrok jadwal sesi personal training dan pantau slot waktu kosong dengan mudah.',
          },
          {
            id: 'f5',
            icon: 'chart',
            title: 'Grafik & Foto Progres Klien',
            description:
              'Pantau grafik penurunan berat badan, perubahan RPE rata-rata, dan galeri foto transformasi klien yang tersimpan rapi dan aman di cloud storage.',
          },
          {
            id: 'f6',
            icon: 'share',
            title: 'Export PDF & WhatsApp Share',
            description:
              'Cetak riwayat latihan langsung ke format PDF elegan atau kirimkan pesan ringkasan latihan harian langsung ke nomor WhatsApp klien dengan satu ketukan.',
          },
        ]

  const howItWorks =
    s?.how_it_works && s.how_it_works.length > 0
      ? s.how_it_works
      : [
          {
            id: 's1',
            step: '01',
            title: 'Tambahkan Profil Klien',
            description:
              'Masukkan nama klien, target latihan, dan jumlah paket sesi yang diambil. Sistem akan mengawasi kuota sesi otomatis.',
          },
          {
            id: 's2',
            step: '02',
            title: 'Catat Saat Latihan Berlangsung',
            description:
              'Gunakan smartphone saat mendampingi klien di gym. Masukkan beban, repetisi, dan RPE dalam hitungan detik.',
          },
          {
            id: 's3',
            step: '03',
            title: 'Kirim Rekap & Evaluasi',
            description:
              'Kirimkan ringkasan latihan ke WhatsApp klien dan evaluasi grafik kemajuan beban dari waktu ke waktu.',
          },
        ]

  const pricingPlans =
    s?.pricing_plans && s.pricing_plans.length > 0
      ? s.pricing_plans
      : [
          {
            id: 'p1',
            name: 'Standard',
            badge: 'Dasar',
            price: 'Rp59.000',
            period: '/ bulan',
            description:
              'Cocok untuk personal trainer yang fokus pada pencatatan harian yang cepat, akurat, dan pelaporan rapi.',
            features: [
              'Manajemen Klien & Sesi Unlimited',
              'Kalender Jadwal Mingguan',
              'Foto & Grafik Progress Klien',
              'Session Template Rutin',
              'Sinkronisasi Cloud Otomatis',
              'Kuota Generate AI Terbatas',
            ],
            button_text: 'Pilih Standard',
            button_link: '/login',
            is_popular: false,
          },
          {
            id: 'p2',
            name: 'Pro',
            badge: 'Paling Diminati',
            price: 'Rp89.000',
            period: '/ bulan',
            description:
              'Solusi komprehensif bagi pelatih elit yang memanfaatkan kekuatan AI berbasis metodologi sains NASM.',
            features: [
              'Seluruh Fitur Paket Standard',
              'Generate Program NASM Tanpa Batas',
              'Kustomisasi & Modifikasi Gerakan Instan',
              'Export PDF Bersih Tanpa Watermark',
              'Prioritas Dukungan Admin Langsung via WA',
            ],
            button_text: 'Mulai Paket Pro',
            button_link: '/login',
            is_popular: true,
          },
        ]

  const longTermPlans =
    s?.long_term_plans && s.long_term_plans.length > 0
      ? s.long_term_plans
      : [
          {
            id: 'lt1',
            title: '1 Bulan',
            price: 'Rp89.000',
            description: 'Fleksibel bulanan, berhenti kapan saja.',
            is_highlight: false,
          },
          {
            id: 'lt2',
            title: '3 Bulan (Hemat 10%)',
            price: 'Rp239.000',
            description: 'Setara Rp79.600 / bulan. Hemat Rp28.000.',
            is_highlight: false,
          },
          {
            id: 'lt3',
            title: '6 Bulan (Bayar 5, Dapat 6)',
            price: 'Rp445.000',
            description: 'Setara Rp74.200 / bulan. Hemat Rp89.000.',
            is_highlight: true,
          },
        ]

  const ctaHeadline = s?.cta_headline || 'Mulai Catat Sesi Latihan Hari Ini.'
  const ctaSubheadline =
    s?.cta_subheadline ||
    'Daftarkan akun Anda, verifikasi melalui admin studio, dan rasakan kemudahan pengelolaan latihan berstandar internasional.'
  const contactWa = s?.contact_whatsapp || '6287884241516'
  const footerCopyright = s?.footer_copyright || 'TrainLog Replica. Hak Cipta Dilindungi.'

  return (
    <div className="bg-bg text-text min-h-dvh selection:bg-accent/30 selection:text-text font-sans antialiased overflow-x-hidden">
      {/* ── 1. Sticky Navigation Bar ── */}
      <header className="sticky top-0 z-50 bg-panel/80 backdrop-blur-2xl border-b border-line shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            {/* Luxury Logo / Monogram Badge */}
            {appLogoUrl ? (
              <img
                src={appLogoUrl}
                alt={appName}
                className="h-9 w-auto max-w-[120px] object-contain rounded-lg p-0.5 bg-panel border border-accent/40 shadow-[0_0_15px_rgba(226,232,0,0.15)] group-hover:border-accent transition-colors"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-panel border border-accent/40 flex items-center justify-center shadow-[0_0_15px_rgba(226,232,0,0.15)] group-hover:border-accent transition-colors">
                <span className="font-extrabold text-sm tracking-tighter text-accent">{appInitials}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-none text-text">
                {appName}
              </span>
              <span className="text-[10px] text-dim tracking-wider uppercase font-mono mt-0.5">
                {appTagline}
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-panel border border-accent/30 text-accent text-xs font-mono tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(226,232,0,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {heroPill}
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text leading-[1.12] mb-6">
            {heroHeadline}{' '}
            <span className="block mt-1 bg-gradient-to-r from-text via-accent to-accent-hover bg-clip-text text-transparent">
              {heroGradient}
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-dim leading-relaxed mb-8">
            {heroSubheadline}
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
                <span className="ml-2 text-xs font-mono text-dim">{appName.toLowerCase()}.id / dashboard</span>
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
            {features.map((feature) => (
              <div
                key={feature.id}
                className="hover-gold-glow p-6 rounded-2xl bg-panel border border-line transition-all duration-300 group cursor-default flex flex-col"
              >
                <div className="w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center text-accent mb-4 group-hover:border-accent/60 group-hover:scale-110 transition-all duration-300">
                  {renderFeatureIcon(feature.icon)}
                </div>
                <h4 className="font-bold text-lg text-text mb-2">{feature.title}</h4>
                <p className="text-sm text-dim leading-relaxed">{feature.description}</p>
              </div>
            ))}
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
              Langkah Praktis Tanpa Beban Administrasi
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {howItWorks.map((step) => (
              <div
                key={step.id}
                className="hover-gold-glow p-6 rounded-2xl bg-panel border border-line flex flex-col transition-all duration-300"
              >
                <div className="font-mono text-2xl font-bold text-accent mb-3">{step.step}</div>
                <h4 className="font-bold text-base text-text mb-2">{step.title}</h4>
                <p className="text-sm text-dim leading-relaxed">{step.description}</p>
              </div>
            ))}
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

          <div
            className={`grid gap-8 max-w-5xl mx-auto ${
              pricingPlans.length === 1
                ? 'max-w-md'
                : pricingPlans.length === 2
                  ? 'md:grid-cols-2'
                  : 'md:grid-cols-3'
            }`}
          >
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`hover-gold-glow p-8 rounded-2xl bg-panel flex flex-col justify-between transition-all duration-300 relative ${
                  plan.is_popular
                    ? 'border-2 border-accent shadow-[0_8px_32px_rgba(226,232,0,0.2)] hover:shadow-[0_12px_44px_rgba(226,232,0,0.35)]'
                    : 'border border-line'
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3.5 left-8 px-3 py-0.5 rounded-full bg-accent text-[#141414] font-mono text-[11px] font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(226,232,0,0.4)]">
                    {plan.badge || 'Paling Diminati'}
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-text">{plan.name}</h4>
                    {plan.badge && !plan.is_popular && (
                      <span className="text-xs font-mono text-dim bg-bg px-2.5 py-1 rounded border border-line">
                        {plan.badge}
                      </span>
                    )}
                    {plan.is_popular && (
                      <span className="text-xs font-mono text-accent bg-accent/15 px-2.5 py-1 rounded border border-accent/30 font-semibold">
                        {plan.badge || 'Pro Tier'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span
                      className={`text-3xl sm:text-4xl font-extrabold ${
                        plan.is_popular ? 'text-accent' : 'text-text'
                      }`}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs text-dim font-mono">{plan.period}</span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-xs sm:text-sm text-dim leading-relaxed mb-6">
                      {plan.description}
                    </p>
                  )}
                  <div className="space-y-3 text-xs sm:text-sm border-t border-line pt-6 mb-8">
                    {plan.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 ${
                          plan.is_popular ? 'text-text font-medium' : 'text-text'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <a
                  href={plan.button_link || '/login'}
                  className={`btn-interactive w-full py-3 px-4 rounded-xl text-center text-sm font-semibold transition-all ${
                    plan.is_popular
                      ? 'bg-accent hover:bg-accent/90 text-[#141414] shadow-[0_2px_16px_rgba(226,232,0,0.3)]'
                      : 'bg-bg border border-line hover:border-accent text-text'
                  }`}
                >
                  {plan.button_text || 'Pilih Paket'}
                </a>
              </div>
            ))}
          </div>

          {/* Paket Hemat Pro Jangka Panjang */}
          {longTermPlans.length > 0 && (
            <div className="hover-gold-glow mt-12 max-w-4xl mx-auto rounded-2xl border border-line bg-panel p-6 sm:p-8 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
                <h4 className="font-bold text-lg text-text">Paket Hemat Jangka Panjang</h4>
                <span className="text-xs text-dim font-mono">Bayar di muka, harga per bulan lebih terjangkau</span>
              </div>
              <div
                className={`grid gap-4 ${
                  longTermPlans.length === 1
                    ? 'sm:grid-cols-1'
                    : longTermPlans.length === 2
                      ? 'sm:grid-cols-2'
                      : 'sm:grid-cols-3'
                }`}
              >
                {longTermPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`hover-gold-glow p-4 rounded-xl bg-bg text-left transition-all duration-300 ${
                      plan.is_highlight
                        ? 'border border-accent'
                        : 'border border-line'
                    }`}
                  >
                    <div
                      className={`text-xs font-mono mb-1 ${
                        plan.is_highlight ? 'text-accent font-semibold' : 'text-dim'
                      }`}
                    >
                      {plan.title}
                    </div>
                    <div
                      className={`text-xl font-bold mb-1 ${
                        plan.is_highlight ? 'text-accent' : 'text-text'
                      }`}
                    >
                      {plan.price}
                    </div>
                    {plan.description && (
                      <p className="text-xs text-dim">{plan.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. Bottom Call to Action ── */}
      <section className="py-20 border-t border-line relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10 text-center">
          <div className="hover-gold-glow p-8 sm:p-14 rounded-3xl bg-panel border border-accent/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight mb-4">
              {ctaHeadline}
            </h3>
            <p className="text-dim text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              {ctaSubheadline}
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
            {appLogoUrl ? (
              <img
                src={appLogoUrl}
                alt={appName}
                className="h-6 w-auto max-w-[80px] object-contain rounded bg-panel border border-accent/30 p-0.5"
              />
            ) : (
              <div className="w-6 h-6 rounded bg-panel border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
                {appInitials}
              </div>
            )}
            <span className="text-text font-medium">{appName}</span>
            <span>&copy; {new Date().getFullYear()} {footerCopyright}</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#fitur" className="hover:text-accent transition-colors">Fitur</a>
            <a href="#cara" className="hover:text-accent transition-colors">Cara Kerja</a>
            <a href="#paket" className="hover:text-accent transition-colors">Harga</a>
            {contactWa && (
              <a
                href={`https://wa.me/${contactWa.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline flex items-center gap-1"
              >
                <span>Hubungi Admin WA</span>
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
