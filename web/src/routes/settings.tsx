import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  api,
  type User,
  type PlatformSettings,
  type FeatureItem,
  type HowItWorksStep,
  type PricingPlan,
  type LongTermPlan,
} from '../lib/api'
import { AppLayout } from '../components/AppLayout'
import { dispatchPlatformSettingsChange } from '../lib/platformSettings'
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Save,
  Phone,
  Mail,
  Check,
  ExternalLink,
  Users,
  ClipboardList,
  Zap,
  Calendar,
  TrendingUp,
  Share2,
  Dumbbell,
  Layers,
  HelpCircle,
  DollarSign,
  Search,
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

export const AVAILABLE_FEATURE_ICONS = [
  { key: 'users', label: 'Klien & Tim', icon: Users, keywords: 'user klien member tim profil' },
  { key: 'clipboard', label: 'Log & Catatan', icon: ClipboardList, keywords: 'catatan log sesi rpe latihan' },
  { key: 'dumbbell', label: 'Latihan / Beban', icon: Dumbbell, keywords: 'gym beban dumbbell workout latihan' },
  { key: 'zap', label: 'AI & NASM', icon: Zap, keywords: 'ai nasm petir cepat generate otomatis' },
  { key: 'calendar', label: 'Jadwal Kalender', icon: Calendar, keywords: 'jadwal kalender waktu sesi booking' },
  { key: 'chart', label: 'Grafik & Analisis', icon: TrendingUp, keywords: 'grafik analisis progres kemajuan trend statistik' },
  { key: 'share', label: 'Export & Share', icon: Share2, keywords: 'share pdf whatsapp kirim export bagikan' },
  { key: 'sparkles', label: 'Spesial / Fitur', icon: Sparkles, keywords: 'fitur bintang spesial premium ai cerdas' },
  { key: 'timer', label: 'Stopwatch / Waktu', icon: Timer, keywords: 'waktu timer durasi stopwatch interval istirahat' },
  { key: 'trophy', label: 'Peringkat & Skor', icon: Trophy, keywords: 'piala peringkat leaderboard ranking prestasi juara' },
  { key: 'target', label: 'Target & Goals', icon: Target, keywords: 'target sasaran goal fatloss muscle tujuan' },
  { key: 'heart', label: 'Kebugaran Fisik', icon: Activity, keywords: 'kebugaran cardio denyut detak jantung sehat pulse' },
  { key: 'flame', label: 'Kalori & Fat Loss', icon: Flame, keywords: 'api bakar lemak kalori fat loss intense bakar' },
  { key: 'scale', label: 'Timbangan & BB', icon: Scale, keywords: 'berat badan timbangan scale massa lemak timbang' },
  { key: 'smartphone', label: 'Akses Mobile', icon: Smartphone, keywords: 'hp smartphone mobile gadget tablet responsif' },
  { key: 'cloud', label: 'Cloud Sync', icon: Cloud, keywords: 'cloud simpan otomatis sync cadangan edge' },
  { key: 'message', label: 'Chat WhatsApp', icon: MessageCircle, keywords: 'pesan chat wa whatsapp kirim hubungi' },
  { key: 'file-text', label: 'Laporan PDF', icon: FileText, keywords: 'dokumen laporan pdf cetak rekap unduh' },
  { key: 'shield', label: 'Keamanan Data', icon: ShieldCheck, keywords: 'keamanan privasi aman lisensi proteksi' },
  { key: 'crown', label: 'Tier Eksklusif', icon: Crown, keywords: 'mahkota eksklusif vip pro tier mahkota' },
  { key: 'gauge', label: 'Skala RPE', icon: Gauge, keywords: 'kecepatan rpe intensitas speedometer level skala' },
  { key: 'award', label: 'Sertifikasi NASM', icon: Award, keywords: 'sertifikat lencana medali award piagam' },
]

function renderFeatureIcon(iconKey?: string, className = 'w-4 h-4') {
  const item = AVAILABLE_FEATURE_ICONS.find((i) => i.key === iconKey)
  if (item) {
    const IconComponent = item.icon
    return <IconComponent className={className} />
  }
  return <Sparkles className={className} />
}

export const Route = createFileRoute('/settings')({
  beforeLoad: async () => {
    try {
      const res = await api<{ user: User }>('/auth/me')
      if (res.user.role !== 'platform_admin') {
        throw redirect({ to: '/' })
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'to' in e) throw e
      throw redirect({ to: '/login' })
    }
  },
  loader: async () => {
    const [meRes, settingsRes] = await Promise.all([
      api<{ user: User }>('/auth/me'),
      api<{ settings: PlatformSettings }>('/platform/settings').catch(() => ({
        settings: {
          id: 'default',
          app_name: 'TrainLog',
          app_tagline: 'Pro PT Manager',
          app_initials: 'TL',
          hero_pill: 'Eksklusif untuk Personal Trainer & Studio',
          hero_headline: 'Catat Sesi. Susun Program NASM.',
          hero_gradient: 'Pantau Progress Klien.',
          hero_subheadline:
            'Tinggalkan buku catatan kertas dan spreadsheet yang tercecer. Satu platform terpadu untuk mengatur jadwal, mencatat beban & RPE, merancang program berbasis sains, dan membagikan rekap sesi ke WhatsApp klien.',
          features: [],
          how_it_works: [],
          pricing_plans: [],
          long_term_plans: [],
          contact_whatsapp: '6287884241516',
          contact_email: 'support@trainlog.id',
          cta_headline: 'Mulai Catat Sesi Latihan Hari Ini.',
          cta_subheadline:
            'Daftarkan akun Anda, verifikasi melalui admin studio, dan rasakan kemudahan pengelolaan latihan berstandar internasional.',
          footer_copyright: 'TrainLog Replica. Hak Cipta Dilindungi.',
        },
      })),
    ])

    return {
      currentUser: meRes.user,
      initialSettings: settingsRes.settings,
    }
  },
  component: PlatformSettingsPage,
})

function PlatformSettingsPage() {
  const { currentUser: initialUser, initialSettings } = Route.useLoaderData()
  const [currentUser, setCurrentUser] = useState<User>(initialUser)
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings)

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'identity' | 'features' | 'workflow' | 'pricing' | 'contact'
  >('identity')

  // Notification banners
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [savingIdentity, setSavingIdentity] = useState(false)
  const [savingContact, setSavingContact] = useState(false)

  // Form states for Identity Tab
  const [appName, setAppName] = useState(settings.app_name || 'TrainLog')
  const [appTagline, setAppTagline] = useState(settings.app_tagline || 'Pro PT Manager')
  const [appInitials, setAppInitials] = useState(settings.app_initials || 'TL')
  const [heroPill, setHeroPill] = useState(
    settings.hero_pill || 'Eksklusif untuk Personal Trainer & Studio'
  )
  const [heroHeadline, setHeroHeadline] = useState(
    settings.hero_headline || 'Catat Sesi. Susun Program NASM.'
  )
  const [heroGradient, setHeroGradient] = useState(
    settings.hero_gradient || 'Pantau Progress Klien.'
  )
  const [heroSubheadline, setHeroSubheadline] = useState(
    settings.hero_subheadline || ''
  )

  // Form states for Contact Tab
  const [contactWa, setContactWa] = useState(settings.contact_whatsapp || '')
  const [contactEmail, setContactEmail] = useState(settings.contact_email || '')
  const [ctaHeadline, setCtaHeadline] = useState(settings.cta_headline || '')
  const [ctaSubheadline, setCtaSubheadline] = useState(settings.cta_subheadline || '')
  const [footerCopyright, setFooterCopyright] = useState(settings.footer_copyright || '')

  // Modals state
  const [featureModalOpen, setFeatureModalOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<FeatureItem | null>(null)

  const [stepModalOpen, setStepModalOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<HowItWorksStep | null>(null)

  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [editingPricing, setEditingPricing] = useState<PricingPlan | null>(null)

  const [longTermModalOpen, setLongTermModalOpen] = useState(false)
  const [editingLongTerm, setEditingLongTerm] = useState<LongTermPlan | null>(null)

  // Helper notification
  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setErrorMsg('')
    setTimeout(() => setSuccessMsg(''), 4000)
  }
  function showError(msg: string) {
    setErrorMsg(msg)
    setSuccessMsg('')
  }

  function applySettings(updated: PlatformSettings) {
    setSettings(updated)
    dispatchPlatformSettingsChange(updated)
  }

  // Save Identity Section
  async function handleSaveIdentity(e: React.FormEvent) {
    e.preventDefault()
    setSavingIdentity(true)
    setErrorMsg('')
    try {
      const res = await api<{ settings: PlatformSettings; message: string }>(
        '/platform/settings',
        {
          method: 'PATCH',
          body: JSON.stringify({
            app_name: appName,
            app_tagline: appTagline,
            app_initials: appInitials,
            hero_pill: heroPill,
            hero_headline: heroHeadline,
            hero_gradient: heroGradient,
            hero_subheadline: heroSubheadline,
          }),
        }
      )
      applySettings(res.settings)
      showSuccess(res.message || 'Identitas & Hero aplikasi berhasil disimpan!')
    } catch (err: any) {
      showError(err.message || 'Gagal menyimpan identitas.')
    } finally {
      setSavingIdentity(false)
    }
  }

  // Save Contact & Footer Section
  async function handleSaveContact(e: React.FormEvent) {
    e.preventDefault()
    setSavingContact(true)
    setErrorMsg('')
    try {
      const res = await api<{ settings: PlatformSettings; message: string }>(
        '/platform/settings',
        {
          method: 'PATCH',
          body: JSON.stringify({
            contact_whatsapp: contactWa,
            contact_email: contactEmail,
            cta_headline: ctaHeadline,
            cta_subheadline: ctaSubheadline,
            footer_copyright: footerCopyright,
          }),
        }
      )
      applySettings(res.settings)
      showSuccess(res.message || 'Kontak & Footer aplikasi berhasil disimpan!')
    } catch (err: any) {
      showError(err.message || 'Gagal menyimpan kontak & footer.')
    } finally {
      setSavingContact(false)
    }
  }

  // Helper function to patch array collections to backend
  async function saveFeaturesList(updated: FeatureItem[]) {
    try {
      const res = await api<{ settings: PlatformSettings; message: string }>(
        '/platform/settings',
        {
          method: 'PATCH',
          body: JSON.stringify({ features: updated }),
        }
      )
      applySettings(res.settings)
      showSuccess('Daftar fitur aplikasi berhasil diperbarui!')
    } catch (err: any) {
      showError(err.message || 'Gagal memperbarui fitur.')
    }
  }

  async function saveWorkflowList(updated: HowItWorksStep[]) {
    try {
      const res = await api<{ settings: PlatformSettings; message: string }>(
        '/platform/settings',
        {
          method: 'PATCH',
          body: JSON.stringify({ how_it_works: updated }),
        }
      )
      applySettings(res.settings)
      showSuccess('Alur cara kerja berhasil diperbarui!')
    } catch (err: any) {
      showError(err.message || 'Gagal memperbarui alur cara kerja.')
    }
  }

  async function savePricingList(updated: PricingPlan[]) {
    try {
      const res = await api<{ settings: PlatformSettings; message: string }>(
        '/platform/settings',
        {
          method: 'PATCH',
          body: JSON.stringify({ pricing_plans: updated }),
        }
      )
      applySettings(res.settings)
      showSuccess('Daftar paket & harga berhasil diperbarui!')
    } catch (err: any) {
      showError(err.message || 'Gagal memperbarui paket & harga.')
    }
  }

  async function saveLongTermList(updated: LongTermPlan[]) {
    try {
      const res = await api<{ settings: PlatformSettings; message: string }>(
        '/platform/settings',
        {
          method: 'PATCH',
          body: JSON.stringify({ long_term_plans: updated }),
        }
      )
      applySettings(res.settings)
      showSuccess('Paket hemat jangka panjang berhasil diperbarui!')
    } catch (err: any) {
      showError(err.message || 'Gagal memperbarui paket hemat.')
    }
  }

  // Feature actions
  function handleDeleteFeature(id: string) {
    if (confirm('Hapus fitur ini dari landing page?')) {
      const updated = (settings.features || []).filter((f) => f.id !== id)
      saveFeaturesList(updated)
    }
  }

  // Step actions
  function handleDeleteStep(id: string) {
    if (confirm('Hapus langkah cara kerja ini?')) {
      const updated = (settings.how_it_works || []).filter((s) => s.id !== id)
      saveWorkflowList(updated)
    }
  }

  // Pricing actions
  function handleDeletePricing(id: string) {
    if (confirm('Hapus paket langganan ini?')) {
      const updated = (settings.pricing_plans || []).filter((p) => p.id !== id)
      savePricingList(updated)
    }
  }

  // Long-term actions
  function handleDeleteLongTerm(id: string) {
    if (confirm('Hapus paket hemat ini?')) {
      const updated = (settings.long_term_plans || []).filter((p) => p.id !== id)
      saveLongTermList(updated)
    }
  }

  return (
    <AppLayout
      currentUser={currentUser}
      onProfileUpdated={(up) => setCurrentUser((prev) => ({ ...prev, ...up }))}
      activeRoute="settings"
    >
      <main className="flex-1 w-full p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-12">
        <div className="w-full space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-panel border border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-accent/15 text-accent">
                <Sliders className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight">
                Identitas &amp; Landing Page SaaS
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25 uppercase">
                Platform Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-dim mt-1 max-w-2xl">
              Kustomisasi identitas aplikasi publik, nama brand, fitur unggulan, alur cara kerja,
              paket harga langganan, dan informasi kontak platform Anda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/landing"
              target="_blank"
              rel="noreferrer"
              className="btn-interactive flex items-center gap-2 px-3.5 py-2 rounded-xl bg-bg border border-line hover:border-accent text-xs font-semibold text-text transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-accent" />
              <span>Lihat Landing Page</span>
            </a>
          </div>
        </div>

        {/* Global Alert Notification */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between text-xs sm:text-sm animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMsg('')}
              className="p-1 hover:text-text"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-between text-xs sm:text-sm animate-fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="p-1 hover:text-text"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-line pb-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('identity')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'identity'
                ? 'bg-accent text-[#141414] shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                : 'text-dim hover:text-text hover:bg-panel-elevated'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Identitas Utama &amp; Hero</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'features'
                ? 'bg-accent text-[#141414] shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                : 'text-dim hover:text-text hover:bg-panel-elevated'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Fitur Aplikasi</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === 'features' ? 'bg-[#141414]/20 text-[#141414]' : 'bg-panel text-dim'
              }`}
            >
              {settings.features?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'workflow'
                ? 'bg-accent text-[#141414] shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                : 'text-dim hover:text-text hover:bg-panel-elevated'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Cara Kerja</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === 'workflow' ? 'bg-[#141414]/20 text-[#141414]' : 'bg-panel text-dim'
              }`}
            >
              {settings.how_it_works?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'pricing'
                ? 'bg-accent text-[#141414] shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                : 'text-dim hover:text-text hover:bg-panel-elevated'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Paket &amp; Harga</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === 'pricing' ? 'bg-[#141414]/20 text-[#141414]' : 'bg-panel text-dim'
              }`}
            >
              {settings.pricing_plans?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'contact'
                ? 'bg-accent text-[#141414] shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                : 'text-dim hover:text-text hover:bg-panel-elevated'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Kontak &amp; Footer</span>
          </button>
        </div>

        {/* ─── TAB 1: IDENTITAS UTAMA & HERO ─── */}
        {activeTab === 'identity' && (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Form Column */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSaveIdentity}
                className="p-6 rounded-2xl bg-panel border border-line space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-line/40">
                  <h3 className="text-sm font-bold text-text uppercase tracking-wider font-mono">
                    Parameter Identitas Aplikasi
                  </h3>
                  <span className="text-[10px] font-mono text-accent">Auto-sync ke Landing</span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-dim mb-1.5">
                      Nama Aplikasi <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="TrainLog"
                      className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-dim mb-1.5">
                      Inisial Monogram <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={appInitials}
                      onChange={(e) => setAppInitials(e.target.value.toUpperCase())}
                      placeholder="TL"
                      className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-accent uppercase focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-dim mb-1.5">
                    Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    value={appTagline}
                    onChange={(e) => setAppTagline(e.target.value)}
                    placeholder="Pro PT Manager"
                    className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-dim mb-1.5">
                    Hero Eyebrow (Pill Teks Atas)
                  </label>
                  <input
                    type="text"
                    value={heroPill}
                    onChange={(e) => setHeroPill(e.target.value)}
                    placeholder="Eksklusif untuk Personal Trainer & Studio"
                    className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-dim mb-1.5">
                      Hero Headline Utama
                    </label>
                    <input
                      type="text"
                      value={heroHeadline}
                      onChange={(e) => setHeroHeadline(e.target.value)}
                      placeholder="Catat Sesi. Susun Program NASM."
                      className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dim mb-1.5">
                      Hero Highlight Gradien
                    </label>
                    <input
                      type="text"
                      value={heroGradient}
                      onChange={(e) => setHeroGradient(e.target.value)}
                      placeholder="Pantau Progress Klien."
                      className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-accent focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-dim mb-1.5">
                    Subheadline Hero (Paragraf Deskripsi)
                  </label>
                  <textarea
                    rows={3}
                    value={heroSubheadline}
                    onChange={(e) => setHeroSubheadline(e.target.value)}
                    placeholder="Deskripsi singkat mengenai platform dan nilai tambahnya..."
                    className="w-full bg-bg border border-line rounded-xl p-3 text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingIdentity}
                    className="btn-interactive flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs sm:text-sm shadow-[0_2px_14px_rgba(226,232,0,0.25)] transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingIdentity ? 'Menyimpan...' : 'Simpan Identitas Utama'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-panel border border-line space-y-4 sticky top-6">
                <div className="flex items-center justify-between pb-3 border-b border-line/40">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-dim uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>Live Preview Hero</span>
                  </div>
                  <span className="text-[10px] font-mono text-dim">Pratinjau Nyata</span>
                </div>

                {/* Simulated Header Navbar */}
                <div className="p-3 rounded-xl bg-bg border border-line flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-panel border border-accent/40 flex items-center justify-center text-accent text-xs font-extrabold">
                      {appInitials || 'TL'}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-text">{appName || 'TrainLog'}</div>
                      <div className="text-[9px] font-mono text-dim uppercase">
                        {appTagline || 'Pro PT Manager'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                    Online
                  </span>
                </div>

                {/* Simulated Hero View */}
                <div className="p-6 rounded-xl bg-bg border border-line text-center space-y-3 relative overflow-hidden">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-panel border border-accent/30 text-accent text-[10px] font-mono uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="truncate max-w-[240px]">{heroPill || 'Pill Hero'}</span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-text leading-snug">
                    {heroHeadline || 'Catat Sesi.'}{' '}
                    <span className="text-accent">{heroGradient || 'Pantau Progress Klien.'}</span>
                  </h2>

                  <p className="text-xs text-dim leading-relaxed line-clamp-3">
                    {heroSubheadline || 'Deskripsi singkat keunggulan sistem...'}
                  </p>

                  <div className="pt-2 flex items-center justify-center gap-2">
                    <div className="px-3.5 py-1.5 rounded-lg bg-accent text-[#141414] font-bold text-xs">
                      Coba Gratis
                    </div>
                    <div className="px-3.5 py-1.5 rounded-lg bg-panel border border-line text-text text-xs">
                      Pelajari Fitur
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: FITUR APLIKASI ─── */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-panel border border-line">
              <div>
                <h3 className="font-bold text-sm text-text">Daftar Fitur di Landing Page</h3>
                <p className="text-xs text-dim mt-0.5">
                  Setiap fitur akan langsung ditampilkan pada bagian kartu grid di beranda publik.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingFeature(null)
                  setFeatureModalOpen(true)
                }}
                className="btn-interactive flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs shadow-[0_2px_12px_rgba(226,232,0,0.25)] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Fitur Baru</span>
              </button>
            </div>

            {(!settings.features || settings.features.length === 0) ? (
              <div className="p-12 text-center rounded-2xl bg-panel border border-line text-dim">
                <Layers className="w-10 h-10 mx-auto mb-3 opacity-40 text-accent" />
                <p className="font-semibold text-text text-sm">Belum ada fitur khusus.</p>
                <p className="text-xs text-dim mt-1">
                  Klik tombol &quot;Tambah Fitur Baru&quot; di atas untuk menambahkan fitur pertama.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {settings.features.map((feature, idx) => (
                  <div
                    key={feature.id}
                    className="hover-gold-glow p-5 rounded-2xl bg-panel border border-line flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-bg border border-line flex items-center justify-center text-accent">
                          {renderFeatureIcon(feature.icon, 'w-4 h-4')}
                        </div>
                        <span className="text-[10px] font-mono text-dim bg-bg px-2 py-0.5 rounded border border-line">
                          #{idx + 1}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-text mb-1.5">{feature.title}</h4>
                      <p className="text-xs text-dim leading-relaxed">{feature.description}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-line/40 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFeature(feature)
                          setFeatureModalOpen(true)
                        }}
                        className="p-1.5 rounded-lg bg-bg border border-line hover:border-accent text-dim hover:text-text text-xs flex items-center gap-1 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-accent" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeature(feature.id)}
                        className="p-1.5 rounded-lg bg-bg border border-line hover:border-red-500/40 text-dim hover:text-red-400 text-xs flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: CARA KERJA ─── */}
        {activeTab === 'workflow' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-panel border border-line">
              <div>
                <h3 className="font-bold text-sm text-text">Langkah-langkah Alur Kerja</h3>
                <p className="text-xs text-dim mt-0.5">
                  Tampilkan panduan cara kerja bagi pelatih atau gym manager yang baru berkunjung.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingStep(null)
                  setStepModalOpen(true)
                }}
                className="btn-interactive flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs shadow-[0_2px_12px_rgba(226,232,0,0.25)] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Langkah</span>
              </button>
            </div>

            {(!settings.how_it_works || settings.how_it_works.length === 0) ? (
              <div className="p-12 text-center rounded-2xl bg-panel border border-line text-dim">
                <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-40 text-accent" />
                <p className="font-semibold text-text text-sm">Belum ada langkah kerja.</p>
                <p className="text-xs text-dim mt-1">
                  Klik tombol &quot;Tambah Langkah&quot; di atas untuk menyusun langkah pertama.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {settings.how_it_works.map((step) => (
                  <div
                    key={step.id}
                    className="hover-gold-glow p-5 rounded-2xl bg-panel border border-line flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="font-mono text-2xl font-black text-accent mb-2">
                        {step.step}
                      </div>
                      <h4 className="font-bold text-sm text-text mb-1.5">{step.title}</h4>
                      <p className="text-xs text-dim leading-relaxed">{step.description}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-line/40 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStep(step)
                          setStepModalOpen(true)
                        }}
                        className="p-1.5 rounded-lg bg-bg border border-line hover:border-accent text-dim hover:text-text text-xs flex items-center gap-1 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-accent" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStep(step.id)}
                        className="p-1.5 rounded-lg bg-bg border border-line hover:border-red-500/40 text-dim hover:text-red-400 text-xs flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 4: PAKET & HARGA ─── */}
        {activeTab === 'pricing' && (
          <div className="space-y-8">
            {/* Section 1: Paket Langganan Utama */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-panel border border-line">
                <div>
                  <h3 className="font-bold text-sm text-text">Paket Langganan SaaS</h3>
                  <p className="text-xs text-dim mt-0.5">
                    Atur nama paket (Standard, Pro, dsb), harga bulanan, serta daftar fitur di dalamnya.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPricing(null)
                    setPricingModalOpen(true)
                  }}
                  className="btn-interactive flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs shadow-[0_2px_12px_rgba(226,232,0,0.25)] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Paket</span>
                </button>
              </div>

              {(!settings.pricing_plans || settings.pricing_plans.length === 0) ? (
                <div className="p-12 text-center rounded-2xl bg-panel border border-line text-dim">
                  <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-40 text-accent" />
                  <p className="font-semibold text-text text-sm">Belum ada paket langganan.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {settings.pricing_plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`hover-gold-glow p-6 rounded-2xl bg-panel flex flex-col justify-between transition-all relative ${
                        plan.is_popular
                          ? 'border-2 border-accent shadow-[0_4px_24px_rgba(226,232,0,0.2)]'
                          : 'border border-line'
                      }`}
                    >
                      {plan.is_popular && (
                        <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-accent text-[#141414] font-mono text-[10px] font-bold uppercase shadow-sm">
                          Paling Diminati
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-base text-text">{plan.name}</h4>
                          {plan.badge && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg text-accent border border-accent/20">
                              {plan.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-1 mb-3">
                          <span
                            className={`text-2xl font-black ${
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
                          <p className="text-xs text-dim leading-relaxed mb-4">
                            {plan.description}
                          </p>
                        )}

                        <div className="space-y-2 border-t border-line/50 pt-4 mb-4">
                          {plan.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-text">
                              <Check className="w-3.5 h-3.5 text-accent shrink-0 stroke-[2.5]" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-line/40 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-dim">
                          Btn: {plan.button_text || 'Pilih'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPricing(plan)
                              setPricingModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg bg-bg border border-line hover:border-accent text-dim hover:text-text text-xs flex items-center gap-1 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-accent" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePricing(plan.id)}
                            className="p-1.5 rounded-lg bg-bg border border-line hover:border-red-500/40 text-dim hover:text-red-400 text-xs flex items-center gap-1 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Paket Hemat Jangka Panjang */}
            <div className="space-y-4 pt-4 border-t border-line">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-panel border border-line">
                <div>
                  <h3 className="font-bold text-sm text-text">Paket Hemat Jangka Panjang (Bundle)</h3>
                  <p className="text-xs text-dim mt-0.5">
                    Penawaran khusus untuk komitmen 3 bulan, 6 bulan, atau tahunan dengan diskon.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingLongTerm(null)
                    setLongTermModalOpen(true)
                  }}
                  className="btn-interactive flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-bg border border-line hover:border-accent text-text font-bold text-xs transition-all"
                >
                  <Plus className="w-4 h-4 text-accent" />
                  <span>Tambah Paket Hemat</span>
                </button>
              </div>

              {(!settings.long_term_plans || settings.long_term_plans.length === 0) ? (
                <div className="p-8 text-center rounded-2xl bg-panel border border-line text-dim text-xs">
                  Belum ada paket hemat jangka panjang.
                </div>
              ) : (
                <div className="grid sm:grid-cols-3 gap-4">
                  {settings.long_term_plans.map((lt) => (
                    <div
                      key={lt.id}
                      className={`hover-gold-glow p-4 rounded-xl bg-panel flex flex-col justify-between transition-all ${
                        lt.is_highlight ? 'border border-accent' : 'border border-line'
                      }`}
                    >
                      <div>
                        <div
                          className={`text-xs font-mono font-semibold mb-1 ${
                            lt.is_highlight ? 'text-accent' : 'text-dim'
                          }`}
                        >
                          {lt.title}
                        </div>
                        <div className="text-lg font-extrabold text-text mb-1">{lt.price}</div>
                        {lt.description && (
                          <p className="text-xs text-dim leading-relaxed">{lt.description}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-2 border-t border-line/40 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLongTerm(lt)
                            setLongTermModalOpen(true)
                          }}
                          className="p-1 rounded-md bg-bg text-dim hover:text-text text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-accent" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLongTerm(lt.id)}
                          className="p-1 rounded-md bg-bg text-dim hover:text-red-400 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 5: KONTAK & FOOTER ─── */}
        {activeTab === 'contact' && (
          <div className="w-full">
            <form
              onSubmit={handleSaveContact}
              className="p-6 rounded-2xl bg-panel border border-line space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-line/40">
                <h3 className="text-sm font-bold text-text uppercase tracking-wider font-mono">
                  Kontak Platform, Banner CTA, &amp; Footer
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dim mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-accent" />
                    <span>Nomor WhatsApp Admin Support</span>
                  </label>
                  <input
                    type="text"
                    value={contactWa}
                    onChange={(e) => setContactWa(e.target.value)}
                    placeholder="6287884241516"
                    className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text font-mono focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-dim mt-1">Gunakan awalan kode negara 62.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-dim mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-accent" />
                    <span>Email Support Platform</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="support@trainlog.id"
                    className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-line/40 space-y-4">
                <h4 className="text-xs font-bold text-accent font-mono uppercase tracking-wider">
                  Banner Call-to-Action Bawah
                </h4>

                <div>
                  <label className="block text-xs font-medium text-dim mb-1.5">
                    Headline Call to Action
                  </label>
                  <input
                    type="text"
                    value={ctaHeadline}
                    onChange={(e) => setCtaHeadline(e.target.value)}
                    placeholder="Mulai Catat Sesi Latihan Hari Ini."
                    className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-dim mb-1.5">
                    Subheadline Call to Action
                  </label>
                  <textarea
                    rows={2}
                    value={ctaSubheadline}
                    onChange={(e) => setCtaSubheadline(e.target.value)}
                    placeholder="Daftarkan akun Anda, verifikasi melalui admin studio..."
                    className="w-full bg-bg border border-line rounded-xl p-3 text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-line/40 space-y-4">
                <h4 className="text-xs font-bold text-accent font-mono uppercase tracking-wider">
                  Footer Hak Cipta
                </h4>

                <div>
                  <label className="block text-xs font-medium text-dim mb-1.5">
                    Teks Hak Cipta Footer
                  </label>
                  <input
                    type="text"
                    value={footerCopyright}
                    onChange={(e) => setFooterCopyright(e.target.value)}
                    placeholder="TrainLog Replica. Hak Cipta Dilindungi."
                    className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingContact}
                  className="btn-interactive flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs sm:text-sm shadow-[0_2px_14px_rgba(226,232,0,0.25)] transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingContact ? 'Menyimpan...' : 'Simpan Kontak & Footer'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
        </div>
      </main>

      {/* ─── MODAL 1: TAMBAH / EDIT FITUR ─── */}
      {featureModalOpen && (
        <FeatureModal
          feature={editingFeature}
          onClose={() => setFeatureModalOpen(false)}
          onSave={(item) => {
            const list = settings.features || []
            const exists = list.some((f) => f.id === item.id)
            const updated = exists ? list.map((f) => (f.id === item.id ? item : f)) : [...list, item]
            saveFeaturesList(updated)
            setFeatureModalOpen(false)
          }}
        />
      )}

      {/* ─── MODAL 2: TAMBAH / EDIT LANGKAH KERJA ─── */}
      {stepModalOpen && (
        <HowItWorksModal
          stepItem={editingStep}
          defaultStepNumber={String((settings.how_it_works?.length || 0) + 1).padStart(2, '0')}
          onClose={() => setStepModalOpen(false)}
          onSave={(item) => {
            const list = settings.how_it_works || []
            const exists = list.some((s) => s.id === item.id)
            const updated = exists ? list.map((s) => (s.id === item.id ? item : s)) : [...list, item]
            saveWorkflowList(updated)
            setStepModalOpen(false)
          }}
        />
      )}

      {/* ─── MODAL 3: TAMBAH / EDIT PAKET HARGA ─── */}
      {pricingModalOpen && (
        <PricingPlanModal
          plan={editingPricing}
          onClose={() => setPricingModalOpen(false)}
          onSave={(item) => {
            const list = settings.pricing_plans || []
            const exists = list.some((p) => p.id === item.id)
            const updated = exists ? list.map((p) => (p.id === item.id ? item : p)) : [...list, item]
            savePricingList(updated)
            setPricingModalOpen(false)
          }}
        />
      )}

      {/* ─── MODAL 4: TAMBAH / EDIT PAKET HEMAT ─── */}
      {longTermModalOpen && (
        <LongTermPlanModal
          plan={editingLongTerm}
          onClose={() => setLongTermModalOpen(false)}
          onSave={(item) => {
            const list = settings.long_term_plans || []
            const exists = list.some((lt) => lt.id === item.id)
            const updated = exists ? list.map((lt) => (lt.id === item.id ? item : lt)) : [...list, item]
            saveLongTermList(updated)
            setLongTermModalOpen(false)
          }}
        />
      )}
    </AppLayout>
  )
}

// ── MODAL SUBCOMPONENTS ──

function FeatureModal({
  feature,
  onClose,
  onSave,
}: {
  feature: FeatureItem | null
  onClose: () => void
  onSave: (item: FeatureItem) => void
}) {
  const [title, setTitle] = useState(feature?.title || '')
  const [description, setDescription] = useState(feature?.description || '')
  const [icon, setIcon] = useState(feature?.icon || 'sparkles')
  const [iconSearch, setIconSearch] = useState('')

  const filteredIcons = AVAILABLE_FEATURE_ICONS.filter((item) => {
    if (!iconSearch.trim()) return true
    const q = iconSearch.toLowerCase()
    return (
      item.label.toLowerCase().includes(q) ||
      item.key.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
    )
  })

  const selectedIconObj = AVAILABLE_FEATURE_ICONS.find((i) => i.key === icon)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    onSave({
      id: feature?.id || `feat_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      icon,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-panel border border-line shadow-2xl p-6 relative animate-scale-up my-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
          <h3 className="font-bold text-base text-text flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <span>{feature ? 'Edit Fitur Aplikasi' : 'Tambah Fitur Baru'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-dim hover:text-text hover:bg-panel-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">
              Judul Fitur <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Log Sesi 4 Fase Terstruktur"
              className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>

          {/* Form Pemilihan Ikon */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-dim">
                Pilih Ikon Fitur <span className="text-red-400">*</span>
              </label>
              <span className="text-[11px] font-mono text-dim">
                {filteredIcons.length} pilihan
              </span>
            </div>

            {/* Preview Ikon Terpilih */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-accent/40 mb-2.5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-panel border border-accent flex items-center justify-center text-accent shadow-sm">
                  {renderFeatureIcon(icon, 'w-5 h-5')}
                </div>
                <div>
                  <div className="text-xs font-bold text-text">
                    {selectedIconObj?.label || icon}
                  </div>
                  <div className="text-[10px] font-mono text-accent">
                    ID Ikon: <span className="font-semibold">{icon}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
                Terpilih
              </span>
            </div>

            {/* Pencarian Ikon */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-dim absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                placeholder="Cari ikon (cth: beban, jadwal, kalender, ai, target, kalori, pdf)..."
                className="w-full bg-bg border border-line rounded-xl pl-9 pr-8 py-2 text-xs text-text placeholder:text-dim/50 focus:outline-none focus:border-accent"
              />
              {iconSearch && (
                <button
                  type="button"
                  onClick={() => setIconSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-text text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Grid Kartu Ikon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl border border-line bg-bg">
              {filteredIcons.map((item) => {
                const IconComp = item.icon
                const isSelected = icon === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setIcon(item.key)}
                    className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all group ${
                      isSelected
                        ? 'bg-accent/15 border-accent text-accent shadow-[0_0_10px_rgba(226,232,0,0.2)]'
                        : 'bg-panel border-line/60 text-dim hover:text-text hover:border-accent/40'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-accent text-[#141414]'
                          : 'bg-bg group-hover:text-accent border border-line/50'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-medium leading-tight truncate">
                      {item.label}
                    </span>
                  </button>
                )
              })}
              {filteredIcons.length === 0 && (
                <div className="col-span-full py-6 text-center text-xs text-dim">
                  Tidak ada ikon yang cocok dengan kata kunci &quot;{iconSearch}&quot;
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">
              Deskripsi Fitur <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan manfaat dan kapabilitas fitur ini bagi pengguna..."
              className="w-full bg-bg border border-line rounded-xl p-3 text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-dim hover:text-text hover:bg-panel-elevated"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-interactive px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs shadow-md"
            >
              {feature ? 'Simpan Perubahan' : 'Tambahkan Fitur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function HowItWorksModal({
  stepItem,
  defaultStepNumber,
  onClose,
  onSave,
}: {
  stepItem: HowItWorksStep | null
  defaultStepNumber: string
  onClose: () => void
  onSave: (item: HowItWorksStep) => void
}) {
  const [step, setStep] = useState(stepItem?.step || defaultStepNumber)
  const [title, setTitle] = useState(stepItem?.title || '')
  const [description, setDescription] = useState(stepItem?.description || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    onSave({
      id: stepItem?.id || `step_${Date.now()}`,
      step: step.trim(),
      title: title.trim(),
      description: description.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-panel border border-line shadow-2xl p-6 relative animate-scale-up">
        <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
          <h3 className="font-bold text-base text-text flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent" />
            <span>{stepItem ? 'Edit Langkah Alur Kerja' : 'Tambah Langkah Alur Kerja'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-dim hover:text-text hover:bg-panel-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">
                Nomor Langkah <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={step}
                onChange={(e) => setStep(e.target.value)}
                placeholder="01"
                className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-accent focus:outline-none focus:border-accent text-center"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-dim mb-1.5">
                Judul Langkah <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tambahkan Profil Klien"
                className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">
              Deskripsi Langkah <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan apa yang dilakukan pelatih pada langkah ini..."
              className="w-full bg-bg border border-line rounded-xl p-3 text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-dim hover:text-text hover:bg-panel-elevated"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-interactive px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs shadow-md"
            >
              {stepItem ? 'Simpan Perubahan' : 'Tambahkan Langkah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PricingPlanModal({
  plan,
  onClose,
  onSave,
}: {
  plan: PricingPlan | null
  onClose: () => void
  onSave: (item: PricingPlan) => void
}) {
  const [name, setName] = useState(plan?.name || '')
  const [badge, setBadge] = useState(plan?.badge || '')
  const [price, setPrice] = useState(plan?.price || 'Rp')
  const [period, setPeriod] = useState(plan?.period || '/ bulan')
  const [description, setDescription] = useState(plan?.description || '')
  const [buttonText, setButtonText] = useState(plan?.button_text || 'Pilih Paket')
  const [buttonLink, setButtonLink] = useState(plan?.button_link || '/login')
  const [isPopular, setIsPopular] = useState(plan?.is_popular ?? false)

  // Features list as multiline text
  const [featuresText, setFeaturesText] = useState(
    plan?.features?.join('\n') ||
      'Manajemen Klien & Sesi Unlimited\nKalender Jadwal Mingguan\nFoto & Grafik Progress Klien'
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !price.trim()) return

    const parsedFeatures = featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    onSave({
      id: plan?.id || `plan_${Date.now()}`,
      name: name.trim(),
      badge: badge.trim() || null,
      price: price.trim(),
      period: period.trim() || null,
      description: description.trim() || null,
      features: parsedFeatures,
      button_text: buttonText.trim() || 'Pilih Paket',
      button_link: buttonLink.trim() || '/login',
      is_popular: isPopular,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-panel border border-line shadow-2xl p-6 relative animate-scale-up my-8">
        <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
          <h3 className="font-bold text-base text-text flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            <span>{plan ? 'Edit Paket Langganan' : 'Tambah Paket Langganan Baru'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-dim hover:text-text hover:bg-panel-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">
                Nama Paket <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Pro"
                className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Badge / Label</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Contoh: Paling Diminati"
                className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-accent focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">
                Harga Ditampilkan <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Rp89.000"
                className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text font-bold focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Periode Penagihan</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="/ bulan"
                className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-dim focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Solusi komprehensif bagi pelatih elit..."
              className="w-full bg-bg border border-line rounded-xl p-3 text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">
              Daftar Fitur Poin (Satu per baris) <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="Fitur A&#10;Fitur B&#10;Fitur C"
              className="w-full bg-bg border border-line rounded-xl p-3 text-xs font-mono text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Teks Tombol</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Mulai Paket Pro"
                className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Link Tombol</label>
              <input
                type="text"
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                placeholder="/login"
                className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text font-mono focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-line cursor-pointer hover:border-accent/40 transition-colors">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-0 focus:ring-offset-0 bg-panel border-line cursor-pointer"
              />
              <div>
                <span className="font-semibold text-xs text-text block">
                  Tandai Sebagai Paket Populer (Best Seller)
                </span>
                <span className="text-[11px] text-dim block">
                  Akan ditampilkan dengan bingkai emas mewah dan highlight badge.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-dim hover:text-text hover:bg-panel-elevated"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-interactive px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs shadow-md"
            >
              {plan ? 'Simpan Perubahan' : 'Tambahkan Paket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LongTermPlanModal({
  plan,
  onClose,
  onSave,
}: {
  plan: LongTermPlan | null
  onClose: () => void
  onSave: (item: LongTermPlan) => void
}) {
  const [title, setTitle] = useState(plan?.title || '')
  const [price, setPrice] = useState(plan?.price || '')
  const [description, setDescription] = useState(plan?.description || '')
  const [isHighlight, setIsHighlight] = useState(plan?.is_highlight ?? false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !price.trim()) return
    onSave({
      id: plan?.id || `lt_${Date.now()}`,
      title: title.trim(),
      price: price.trim(),
      description: description.trim() || null,
      is_highlight: isHighlight,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-panel border border-line shadow-2xl p-6 relative animate-scale-up">
        <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
          <h3 className="font-bold text-base text-text flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            <span>{plan ? 'Edit Paket Hemat' : 'Tambah Paket Hemat Jangka Panjang'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-dim hover:text-text hover:bg-panel-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">
              Nama / Periode Paket <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: 6 Bulan (Bayar 5, Dapat 6)"
              className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">
              Harga Total <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Rp445.000"
              className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm font-bold text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Keterangan / Hemat</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Setara Rp74.200 / bulan. Hemat Rp89.000."
              className="w-full bg-bg border border-line rounded-xl p-3 text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-line cursor-pointer hover:border-accent/40 transition-colors">
              <input
                type="checkbox"
                checked={isHighlight}
                onChange={(e) => setIsHighlight(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-0 focus:ring-offset-0 bg-panel border-line cursor-pointer"
              />
              <span className="font-semibold text-xs text-text">
                Tampilkan dengan highlight aksen emas
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-dim hover:text-text hover:bg-panel-elevated"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-interactive px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs shadow-md"
            >
              {plan ? 'Simpan Perubahan' : 'Tambahkan Paket Hemat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
