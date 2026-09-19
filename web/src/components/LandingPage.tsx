import { useState, useEffect } from 'react'
import {
  api,
  type User,
  type PlatformSettings,
  type TrainerShowcase,
  extractYouTubeId,
  getYouTubeThumbnailUrl,
  getYouTubeEmbedUrl,
} from '../lib/api'
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
  Play,
  Video,
  Building2,
  MapPin,
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
  initialTrainers,
}: {
  currentUser?: User | null
  initialSettings?: PlatformSettings | null
  initialTrainers?: TrainerShowcase[] | null
}) {
  const [trainers, setTrainers] = useState<TrainerShowcase[]>(initialTrainers || [])
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

  useEffect(() => {
    if (initialTrainers && initialTrainers.length > 0) {
      setTrainers(initialTrainers)
    } else {
      api<{ trainers: TrainerShowcase[] }>('/platform/trainers')
        .then((res) => {
          if (res.trainers && res.trainers.length > 0) {
            setTrainers(res.trainers)
          }
        })
        .catch(() => {})
    }
  }, [initialTrainers])

  const s = initialSettings

  const appName = s?.app_name || 'Kula Studio'
  const appInitials = s?.app_initials || 'KS'
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
  const footerCopyright = s?.footer_copyright || 'Kula Studio. Hak Cipta Dilindungi.'

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
            <a href="#pelatih" className="hover:text-accent transition-colors">Pelatih</a>
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
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section ── */}
      <section className="relative pt-8 pb-10 md:pt-20 md:pb-24 overflow-hidden">
        {/* Subtle Ambient Gym Texture Backdrop */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80"
            alt="Gym training atmosphere backdrop"
            className="w-full h-full object-cover object-center opacity-[0.08] mix-blend-luminosity scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg" />
        </div>

        {/* Subtle Ambient Gold Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/6 blur-[120px] pointer-events-none rounded-full animate-gold-pulse" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center relative z-10 animate-fade-in-up">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-panel border border-accent/30 text-accent text-xs font-mono tracking-wider uppercase mb-3 sm:mb-6 shadow-[0_0_20px_rgba(226,232,0,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {heroPill}
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text leading-[1.12] mb-3 sm:mb-6">
            {heroHeadline}{' '}
            <span className="block mt-1 bg-gradient-to-r from-text via-accent to-accent-hover bg-clip-text text-transparent">
              {heroGradient}
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-dim leading-relaxed mb-5 sm:mb-8">
            {heroSubheadline}
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5 sm:mb-8">
            <a
              // href="/login"
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

          {/* Social Proof Avatar Strip */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 py-1.5 px-3.5 sm:px-4 rounded-full bg-panel/80 border border-line backdrop-blur-md mx-auto mb-6 sm:mb-12 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Trainer"
                className="inline-block h-6 w-6 sm:h-7 sm:w-7 rounded-full ring-2 ring-panel object-cover"
                loading="lazy"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Trainer"
                className="inline-block h-6 w-6 sm:h-7 sm:w-7 rounded-full ring-2 ring-panel object-cover"
                loading="lazy"
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                alt="Trainer"
                className="inline-block h-6 w-6 sm:h-7 sm:w-7 rounded-full ring-2 ring-panel object-cover"
                loading="lazy"
              />
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                alt="Trainer"
                className="inline-block h-6 w-6 sm:h-7 sm:w-7 rounded-full ring-2 ring-panel object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-dim">
              <span className="text-amber-400 font-bold">★ 4.9/5</span>
              <span className="text-line">•</span>
              <span className="text-text font-medium">120+ Pelatih &amp; Studio</span>
            </div>
          </div>
        </div>

        {/* ── App Live Preview Card Mockup ── */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 mt-6 sm:mt-10 animate-fade-in">
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
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
                      alt="Siti Rahma"
                      className="w-9 h-9 rounded-full object-cover border border-line/80 shadow-sm shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-text truncate">Siti Rahma</span>
                        <span className="text-xs font-mono text-accent">18/20</span>
                      </div>
                      <p className="text-[11px] text-dim truncate">Fat Loss &amp; Hypertrophy</p>
                    </div>
                  </div>
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
      <section id="fitur" className="py-10 md:py-20 border-t border-line bg-panel/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-14">
            <h2 className="text-xs font-mono tracking-widest text-accent uppercase mb-2">
              Fitur Lengkap
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
              Dibuat Khusus Sesuai Alur Kerja Pelatih Profesional
            </h3>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-dim">
              Setiap detail dirancang untuk mempercepat pencatatan di lantai gym dan memperjelas progres klien.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="hover-gold-glow p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-panel border border-line transition-all duration-300 group cursor-default flex flex-col"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-bg border border-line flex items-center justify-center text-accent mb-3 sm:mb-4 group-hover:border-accent/60 group-hover:scale-110 transition-all duration-300">
                  {renderFeatureIcon(feature.icon)}
                </div>
                <h4 className="font-bold text-base sm:text-lg text-text mb-1.5 sm:mb-2">{feature.title}</h4>
                <p className="text-xs sm:text-sm text-dim leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. How It Works Section (`#cara`) ── */}
      <section id="cara" className="py-10 md:py-20 border-t border-line">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 md:mb-14">
            <h2 className="text-xs font-mono tracking-widest text-accent uppercase mb-2">
              Cara Kerja
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
              Langkah Praktis Tanpa Beban Administrasi
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-3.5 sm:gap-8 relative">
            {howItWorks.map((step) => (
              <div
                key={step.id}
                className="hover-gold-glow p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-panel border border-line flex flex-col transition-all duration-300"
              >
                <div className="font-mono text-xl sm:text-2xl font-bold text-accent mb-2 sm:mb-3">{step.step}</div>
                <h4 className="font-bold text-base text-text mb-1.5 sm:mb-2">{step.title}</h4>
                <p className="text-xs sm:text-sm text-dim leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Coach Showcase & YouTube Videos (`#pelatih`) ── */}
      <section id="pelatih" className="py-10 md:py-20 border-t border-line relative overflow-hidden">
        {/* Ambient Gold Glow Backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-accent/5 blur-[140px] pointer-events-none rounded-full" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-panel border border-accent/30 text-accent text-xs font-mono tracking-wider uppercase mb-2.5 sm:mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COACH SHOWCASE</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
              Belajar &amp; Berlatih Bersama Pelatih Terbaik
            </h3>
            <p className="mt-2.5 sm:mt-3 text-sm text-dim leading-relaxed">
              Tonton video panduan latihan, teknik gerakan, dan profil personal trainer profesional kami yang berdedikasi membimbing perjalanan kebugaran Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {(trainers.length > 0
              ? trainers
              : [
                  {
                    id: 'demo-hadi',
                    name: 'Coach Hadi',
                    role: 'pt',
                    spec: 'NASM Hypertrophy & Fat Loss',
                    studio_name: 'FitZone Studio Utama',
                    youtube_url: 'https://www.youtube.com/watch?v=aclHkVaku9U',
                    avatar_url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80',
                  },
                ]
            ).map((trainer) => {
              const ytId = extractYouTubeId(trainer.youtube_url)
              const isPlaying = playingVideoId === trainer.id

              return (
                <div
                  key={trainer.id}
                  className="hover-gold-glow flex flex-col rounded-2xl bg-panel border border-line overflow-hidden transition-all duration-300 group"
                >
                  {/* Video Player / Thumbnail Area */}
                  <div className="relative aspect-video w-full bg-[#0a0a0a] overflow-hidden border-b border-line">
                    {ytId ? (
                      isPlaying ? (
                        <iframe
                          src={`${getYouTubeEmbedUrl(ytId)}?autoplay=1&rel=0`}
                          title={`Video latihan ${trainer.name}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPlayingVideoId(trainer.id)}
                          className="relative w-full h-full cursor-pointer group/video select-none text-left p-0 border-0 bg-transparent block"
                          title="Klik untuk memutar video"
                        >
                          <img
                            src={getYouTubeThumbnailUrl(ytId)}
                            alt={`Video latihan ${trainer.name}`}
                            className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover/video:bg-black/25 transition-colors flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-accent text-[#141414] flex items-center justify-center shadow-[0_4px_24px_rgba(226,232,0,0.5)] group-hover/video:scale-110 transition-all duration-300">
                              <Play className="w-6 h-6 ml-1 fill-current" />
                            </div>
                          </div>
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono text-white/90 drop-shadow">
                            <span className="bg-black/75 backdrop-blur-md px-2 py-0.5 rounded flex items-center gap-1.5">
                              <Video className="w-3 h-3 text-accent" />
                              <span>Tonton Video</span>
                            </span>
                            <span className="bg-red-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                              YouTube
                            </span>
                          </div>
                        </button>
                      )
                    ) : (
                      <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-panel overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&w=800&q=80"
                          alt="Sesi Pembinaan Gym"
                          className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/80 to-panel/40" />
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 backdrop-blur-md flex items-center justify-center text-accent mb-2 shadow-[0_0_15px_rgba(226,232,0,0.2)]">
                            <Dumbbell className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-semibold text-text">Sesi Pembinaan Eksklusif</span>
                          <span className="text-[11px] text-dim mt-1">1-on-1 Personal Coaching</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trainer Info Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Avatar & Name Header */}
                      <div className="flex items-start gap-3.5 mb-3">
                        {trainer.avatar_url ? (
                          <img
                            src={trainer.avatar_url}
                            alt={trainer.name}
                            className="w-11 h-11 rounded-xl object-cover border border-line shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/30 text-accent font-bold text-sm flex items-center justify-center shrink-0">
                            {trainer.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base text-text truncate group-hover:text-accent transition-colors">
                            {trainer.name}
                          </h4>
                          <div className="text-xs text-accent font-mono truncate">
                            {trainer.spec || 'Personal Trainer'}
                          </div>
                        </div>
                      </div>

                      {/* Studio Affiliation */}
                      {trainer.studio_name && (
                        <div className="flex items-center gap-1.5 text-xs text-dim mb-4 bg-bg px-2.5 py-1 rounded-lg border border-line/60 w-fit flex-wrap">
                          <Building2 className="w-3.5 h-3.5 text-dim shrink-0" />
                          <span className="truncate">{trainer.studio_name}</span>
                          {trainer.studio_gmaps_url && (
                            <a
                              href={trainer.studio_gmaps_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline font-mono ml-1 px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 transition-colors"
                              title={`Buka lokasi ${trainer.studio_name} di Google Maps`}
                            >
                              <MapPin className="w-3 h-3 text-accent shrink-0" />
                              <span>GMaps</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Links */}
                    <div className="pt-3 border-t border-line/70 flex items-center justify-between gap-2 text-xs">
                      {trainer.youtube_url ? (
                        <a
                          href={trainer.youtube_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-dim hover:text-text transition-colors group/yt font-medium"
                        >
                          <span className="w-5 h-5 rounded-md bg-red-600/15 border border-red-600/30 flex items-center justify-center text-red-500 group-hover/yt:bg-red-600 group-hover/yt:text-white transition-colors">
                            <Play className="w-2.5 h-2.5 ml-0.5 fill-current" />
                          </span>
                          <span className="underline-offset-2 group-hover/yt:underline">Tonton di YT</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-dim font-mono">
                          <Check className="w-3 h-3 text-accent" />
                          <span>Verified Coach</span>
                        </span>
                      )}

                      {(() => {
                        const ptPhone = (trainer.phone || contactWa || '').replace(/[^0-9]/g, '')
                        const waMessage = encodeURIComponent(
                          `Halo Coach ${trainer.name}, saya tertarik untuk latihan bareng personal training dan ingin didaftarkan akun di Kula Studio. Boleh info jadwal latihan & ketersediaan slotnya Coach?`
                        )
                        const waUrl = ptPhone ? `https://wa.me/${ptPhone}?text=${waMessage}` : '/login'

                        return (
                          <a
                            href={waUrl}
                            target={ptPhone ? '_blank' : undefined}
                            rel={ptPhone ? 'noreferrer' : undefined}
                            className="btn-interactive inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-[#141414] font-bold text-xs shadow-[0_2px_10px_rgba(226,232,0,0.25)] hover:shadow-[0_4px_16px_rgba(226,232,0,0.4)] transition-all shrink-0"
                            title={`Hubungi Coach ${trainer.name} via WhatsApp untuk pendaftaran`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Latihan Bareng</span>
                          </a>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 6. Target Audience (`#peran`) ── */}
      <section id="peran" className="py-10 md:py-20 border-t border-line bg-panel/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 md:mb-14">
            <h2 className="text-xs font-mono tracking-widest text-accent uppercase mb-2">
              Segmentasi
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
              Dua Peran Utama, Satu Ekosistem
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
            {/* Card PT Independen */}
            <div className="hover-gold-glow rounded-xl sm:rounded-2xl bg-panel border border-line relative overflow-hidden flex flex-col justify-between transition-all duration-300 group">
              {/* Image Banner */}
              <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80"
                  alt="Personal Trainer mendampingi klien latihan"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/50 to-transparent" />
                <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4">
                  <span className="inline-block text-xs font-mono text-accent bg-panel/90 backdrop-blur-md px-3 py-1 rounded-full border border-accent/30 shadow-sm">
                    PERSONAL TRAINER
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-7 pt-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-text mb-2 sm:mb-3">Untuk Personal Trainer Mandiri</h4>
                  <p className="text-xs sm:text-sm text-dim leading-relaxed mb-4 sm:mb-6">
                    Tingkatkan kredibilitas profesional Anda. Tidak perlu lagi mengingat di kepala atau mencari riwayat beban di chat WhatsApp yang hilang. Semua tersusun sistematis.
                  </p>
                  <ul className="space-y-2 sm:space-y-2.5 text-xs text-text mb-4 sm:mb-6">
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
                  className="btn-interactive inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-lg bg-bg border border-line hover:border-accent text-sm font-semibold transition-all group-hover:border-accent/60"
                >
                  <span>Mulai Sebagai PT</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Card Manager Studio */}
            <div className="hover-gold-glow rounded-xl sm:rounded-2xl bg-panel border border-line relative overflow-hidden flex flex-col justify-between transition-all duration-300 group">
              {/* Image Banner */}
              <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80"
                  alt="Studio fitness dan gym modern"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/50 to-transparent" />
                <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4">
                  <span className="inline-block text-xs font-mono text-accent bg-panel/90 backdrop-blur-md px-3 py-1 rounded-full border border-accent/30 shadow-sm">
                    STUDIO MANAGER
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-7 pt-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-text mb-2 sm:mb-3">Untuk Studio &amp; Gym Manager</h4>
                  <p className="text-xs sm:text-sm text-dim leading-relaxed mb-4 sm:mb-6">
                    Pantau seluruh pelatih di bawah naungan studio Anda. Lihat total utilisasi sesi latihan secara transparan dan atur hak akses tim pelatih dengan aman.
                  </p>
                  <ul className="space-y-2 sm:space-y-2.5 text-xs text-text mb-4 sm:mb-6">
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
                  className="btn-interactive inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-lg bg-bg border border-line hover:border-accent text-sm font-semibold transition-all group-hover:border-accent/60"
                >
                  <span>Daftarkan Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Pricing Section (`#paket`) ── */}
      <section id="paket" className="py-10 md:py-20 border-t border-line">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 md:mb-14">
            <h2 className="text-xs font-mono tracking-widest text-accent uppercase mb-2">
              Paket Langganan
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
              Investasi Terjangkau untuk Hasil Maksimal
            </h3>
            <p className="mt-2.5 sm:mt-3 text-sm text-dim">
              Pilih paket yang paling cocok untuk kebutuhan pembinaan klien Anda.
            </p>
          </div>

          <div
            className={`grid gap-4 sm:gap-8 max-w-5xl mx-auto ${
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
                className={`hover-gold-glow p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-panel flex flex-col justify-between transition-all duration-300 relative ${
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
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 className="text-lg sm:text-xl font-bold text-text">{plan.name}</h4>
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
                  <div className="flex items-baseline gap-1.5 mb-3 sm:mb-4">
                    <span
                      className={`text-2xl sm:text-4xl font-extrabold ${
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
                    <p className="text-xs sm:text-sm text-dim leading-relaxed mb-4 sm:mb-6">
                      {plan.description}
                    </p>
                  )}
                  <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm border-t border-line pt-4 sm:pt-6 mb-6 sm:mb-8">
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
                  className={`btn-interactive w-full py-2.5 sm:py-3 px-4 rounded-xl text-center text-sm font-semibold transition-all ${
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
            <div className="hover-gold-glow mt-6 md:mt-12 max-w-4xl mx-auto rounded-xl sm:rounded-2xl border border-line bg-panel p-4 sm:p-8 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-2 mb-4 sm:mb-6">
                <h4 className="font-bold text-base sm:text-lg text-text">Paket Hemat Jangka Panjang</h4>
                <span className="text-[11px] sm:text-xs text-dim font-mono">Bayar di muka, harga per bulan lebih terjangkau</span>
              </div>
              <div
                className={`grid gap-3 sm:gap-4 ${
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
                    className={`hover-gold-glow p-3.5 sm:p-4 rounded-xl bg-bg text-left transition-all duration-300 ${
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
                      className={`text-lg sm:text-xl font-bold mb-1 ${
                        plan.is_highlight ? 'text-accent' : 'text-text'
                      }`}
                    >
                      {plan.price}
                    </div>
                    {plan.description && (
                      <p className="text-[11px] sm:text-xs text-dim">{plan.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. Bottom Call to Action ── */}
      <section className="py-10 md:py-20 border-t border-line relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10 text-center">
          <div className="hover-gold-glow p-6 sm:p-14 rounded-2xl sm:rounded-3xl bg-panel border border-accent/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500 relative overflow-hidden">
            {/* Ambient Gym Backdrop */}
            <div className="absolute inset-0 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"
                alt="Gym workout atmosphere"
                className="w-full h-full object-cover opacity-15 mix-blend-luminosity"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/85 to-panel" />
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight mb-3 sm:mb-4">
                {ctaHeadline}
              </h3>
              <p className="text-dim text-xs sm:text-base max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed">
                {ctaSubheadline}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  // href="/login"
                  className="btn-interactive w-full sm:w-auto bg-accent hover:bg-accent/90 text-[#141414] font-semibold text-sm sm:text-base px-8 py-3 sm:py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(226,232,0,0.25)]"
                >
                  Daftar Sekarang
                </a>
                <a
                  href="/login"
                  className="btn-interactive w-full sm:w-auto bg-bg hover:bg-panel-elevated text-text border border-line text-sm sm:text-base px-6 py-3 sm:py-3.5 rounded-xl transition-all"
                >
                  Masuk ke Akun
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Footer ── */}
      <footer className="border-t border-line bg-bg py-8 text-xs text-dim">
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
            <a href="#pelatih" className="hover:text-accent transition-colors">Pelatih</a>
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
