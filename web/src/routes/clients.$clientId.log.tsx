import { useState } from 'react'
import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router'
import { api, type User } from '../lib/api'
import { formatDate, formatDateWithDay, getLocalTodayString } from '../lib/date'
import { ThemeToggle } from '../components/ThemeToggle'
import { AdminExerciseModal } from '../components/AdminExerciseModal'
import {
  ArrowLeft,
  Copy,
  Sparkles,
  AlertTriangle,
  Flame,
  Dumbbell,
  HeartPulse,
  Wind,
  Activity,
  ShieldPlus,
  Plus,
  Trash2,
  Smartphone,
  Check,
  BookmarkPlus,
} from 'lucide-react'

export type Client = {
  id: string
  name: string
  goal: string
  pkg_total: number
  pkg_used: number
  avg_rpe?: number
  last_session_date?: string | null
  phone?: string | null
  notes?: string | null
  age_bracket?: string | null
  gender?: 'pria' | 'wanita' | null
  problem?: 'none' | 'knee' | 'back' | 'shoulder' | string | null
  pt_id?: string | null
}

export type Ex = { name: string; detail?: string }

export type Session = {
  id: string
  date: string
  rpe: number
  weight: number | null
  fat_pct: number | null
  exercises: Array<Record<string, Ex[]>>
  notes: string | null
  created_at?: string
}

export type DBCategory = {
  slug: string
  name: string
  description?: string | null
  icon?: string | null
  sort_order: number
}

export type DBExercise = {
  id: string
  category_slug: string
  name: string
  default_detail?: string | null
  muscle_group?: string | null
}

// Preset fallback library if database is empty or offline
const FALLBACK_PRESETS: Record<string, Array<{ name: string; detail: string }>> = {
  warmup: [
    { name: 'Dynamic Full-Body Stretch', detail: '10 menit' },
    { name: 'Cat-Cow Mobility', detail: '2 set x 10 reps' },
    { name: 'Glute Bridge Activation', detail: '2 set x 15 reps' },
    { name: 'Band Pull-Apart', detail: '2 set x 20 reps' },
    { name: 'Jumping Jack', detail: '3 set x 30 detik' },
  ],
  resistance: [
    { name: 'Barbell Back Squat', detail: '3 set x 8 reps @ 60kg' },
    { name: 'Bench Press', detail: '3 set x 10 reps @ 50kg' },
    { name: 'Lat Pulldown', detail: '3 set x 12 reps @ 45kg' },
    { name: 'Romanian Deadlift', detail: '3 set x 10 reps @ 60kg' },
    { name: 'Dumbbell Shoulder Press', detail: '3 set x 10 reps @ 14kg' },
    { name: 'Leg Press', detail: '3 set x 12 reps @ 90kg' },
    { name: 'Seated Cable Row', detail: '3 set x 12 reps @ 40kg' },
  ],
  core: [
    { name: 'Plank Hold', detail: '3 set x 45 detik' },
    { name: 'Hanging Leg Raise', detail: '3 set x 12 reps' },
    { name: 'Russian Twist', detail: '3 set x 20 reps' },
    { name: 'Deadbug', detail: '3 set x 10 reps / sisi' },
  ],
  cardio: [
    { name: 'Incline Treadmill Walk', detail: '15 menit (Speed 5.2, Incline 7%)' },
    { name: 'Stationary Bike (Zone 2)', detail: '15 menit moderate' },
    { name: 'Rowing Machine HIIT', detail: '10 menit (30s sprint / 30s rest)' },
    { name: 'Elliptical Trainer', detail: '15 menit resistance 6' },
  ],
  cooldown: [
    { name: 'Static Full-Body Stretch', detail: '5-10 menit' },
    { name: 'Foam Rolling (Quads & IT Band)', detail: '5 menit' },
    { name: 'Pigeon Pose (Hip Opener)', detail: '2 set x 30 detik / sisi' },
    { name: 'Child’s Pose & Breathing', detail: '3 menit regulasi nafas' },
  ],
  rehab: [
    { name: 'Thoracic Spine Foam Roller', detail: '3 set x 10 ekstensi' },
    { name: 'Scapular Wall Slides', detail: '3 set x 12 reps' },
    { name: 'Ankle Dorsiflexion Mobilization', detail: '2 set x 15 reps / sisi' },
  ],
}

const DEFAULT_CATEGORIES: DBCategory[] = [
  { slug: 'warmup', name: 'Pemanasan', description: 'Aktivasi Otot & Mobilitas Sendi', icon: 'flame', sort_order: 1 },
  { slug: 'resistance', name: 'Latihan Utama (Resistance)', description: 'Beban, Hipertrofi & Kekuatan', icon: 'dumbbell', sort_order: 2 },
  { slug: 'core', name: 'Core & Abdominal', description: 'Stabilitas Tulang Belakang & Postur', icon: 'activity', sort_order: 3 },
  { slug: 'cardio', name: 'Kardio / Ketahanan', description: 'Stamina & Pembakaran Kalori', icon: 'heart-pulse', sort_order: 4 },
  { slug: 'cooldown', name: 'Pendinginan & Stretching', description: 'Regulasi Nafas & Relaksasi Otot', icon: 'wind', sort_order: 5 },
  { slug: 'rehab', name: 'Rehabilitasi & Mobilitas', description: 'Pencegahan Cedera & Kesehatan Sendi', icon: 'shield-plus', sort_order: 6 },
]

const RPE_INFO: Record<number, { title: string; desc: string; color: string; badge: string }> = {
  1: { title: 'Sangat Ringan', desc: 'Aktivitas pemulihan aktif, nafas santai tanpa usaha berat.', color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30' },
  2: { title: 'Sangat Ringan', desc: 'Peregangan santai, detak jantung sedikit di atas istirahat.', color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30' },
  3: { title: 'Ringan', desc: 'Dapat berbicara kalimat penuh tanpa terengah-engah.', color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30' },
  4: { title: 'Ringan Menuju Sedang', desc: 'Mulai terasa hangat dan berkeringat tipis.', color: 'text-sky-400', badge: 'bg-sky-500/10 border-sky-500/30' },
  5: { title: 'Sedang (Aerobik)', desc: 'Latihan terasa nyaman, bisa berbicara kalimat pendek.', color: 'text-sky-400', badge: 'bg-sky-500/10 border-sky-500/30' },
  6: { title: 'Cukup Berat (4 RIR)', desc: '4 repetisi tersisa sebelum failure. Beban mulai menantang.', color: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30' },
  7: { title: 'Berat (3 RIR)', desc: '3 repetisi tersisa. Beban kerja efektif untuk stimulasi otot.', color: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30' },
  8: { title: 'Sangat Efektif (2 RIR)', desc: '2 repetisi tersisa. Zona emas hipertrofi & peningkatan kekuatan.', color: 'text-accent', badge: 'bg-accent/15 border-accent/40' },
  9: { title: 'Sangat Berat (1 RIR)', desc: '1 repetisi tersisa. Usaha sangat tinggi dengan fokus penuh.', color: 'text-orange-400', badge: 'bg-orange-500/10 border-orange-500/30' },
  10: { title: 'Maksimal / Failure (0 RIR)', desc: 'Beban batas maksimal mutlak, tidak ada repetisi tersisa.', color: 'text-rose-400', badge: 'bg-rose-500/10 border-rose-500/30' },
}

export const Route = createFileRoute('/clients/$clientId/log')({
  beforeLoad: async ({ params }) => {
    try {
      const res = await api<{ user: User }>('/auth/me')
      if (res.user.role === 'client') throw redirect({ to: '/portal' })
      if (res.user.role !== 'pt') {
        throw redirect({ to: '/clients/$clientId', params: { clientId: params.clientId } })
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'to' in e) throw e
      throw redirect({ to: '/login' })
    }
  },
  loader: async ({ params }) => {
    const [meRes, clientRes, sessionsRes, categoriesRes, exercisesRes] = await Promise.all([
      api<{ user: User }>('/auth/me').catch(() => ({ user: null })),
      api<{ client: Client }>(`/clients/${params.clientId}`),
      api<{ sessions: Session[] }>(`/clients/${params.clientId}/sessions?limit=5`).catch(() => ({ sessions: [] })),
      api<{ categories: DBCategory[] }>('/exercises/categories').catch(() => ({ categories: [] })),
      api<{ exercises: DBExercise[] }>('/exercises').catch(() => ({ exercises: [] })),
    ])

    // PT can only log sessions for their assigned clients
    if (meRes.user?.role !== 'pt' || (clientRes.client.pt_id && meRes.user && clientRes.client.pt_id !== meRes.user.id)) {
      throw redirect({ to: '/clients/$clientId', params: { clientId: params.clientId } })
    }

    return {
      user: meRes.user,
      client: clientRes.client,
      recentSessions: sessionsRes.sessions ?? [],
      dbCategories: categoriesRes.categories ?? [],
      dbExercises: exercisesRes.exercises ?? [],
    }
  },
  component: LogSession,
})

function LogSession() {
  const { user, client, recentSessions, dbCategories, dbExercises } = Route.useLoaderData() as {
    user: User | null
    client: Client
    recentSessions: Session[]
    dbCategories: DBCategory[]
    dbExercises: DBExercise[]
  }
  const navigate = useNavigate()
  const lastSession = recentSessions[0] ?? null

  // Active categories & exercises state
  const [categoriesList, setCategoriesList] = useState<DBCategory[]>(
    dbCategories.length > 0 ? dbCategories : DEFAULT_CATEGORIES
  )
  const [exercisesList, setExercisesList] = useState<DBExercise[]>(dbExercises)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)

  // Form states
  const [date, setDate] = useState(getLocalTodayString())
  const [rpe, setRpe] = useState<number>(lastSession?.rpe ?? 7)
  const [weight, setWeight] = useState<string>(lastSession?.weight != null ? String(lastSession.weight) : '')
  const [fatPct, setFatPct] = useState<string>(lastSession?.fat_pct != null ? String(lastSession.fat_pct) : '')
  const [notes, setNotes] = useState<string>('')
  const [autoOpenWa, setAutoOpenWa] = useState<boolean>(Boolean(client.phone))
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [copyNotice, setCopyNotice] = useState('')

  // Dynamic Exercise Groups State
  const [groups, setGroups] = useState<Record<string, Ex[]>>(() => {
    const init: Record<string, Ex[]> = {}
    const catsToUse = dbCategories.length > 0 ? dbCategories : DEFAULT_CATEGORIES
    for (const c of catsToUse) {
      init[c.slug] = []
    }
    return init
  })

  // Reload categories & exercises from API
  async function loadLibraryData() {
    try {
      const [catsRes, exRes] = await Promise.all([
        api<{ categories: DBCategory[] }>('/exercises/categories'),
        api<{ exercises: DBExercise[] }>('/exercises'),
      ])
      if (catsRes.categories && catsRes.categories.length > 0) {
        setCategoriesList(catsRes.categories)
      }
      if (exRes.exercises) {
        setExercisesList(exRes.exercises)
      }
    } catch {}
  }

  // Exercise manipulation helpers
  function addEx(categorySlug: string, item?: Ex) {
    setGroups((prev) => ({
      ...prev,
      [categorySlug]: [...(prev[categorySlug] || []), item ?? { name: '', detail: '' }],
    }))
  }

  function setEx(categorySlug: string, i: number, field: keyof Ex, value: string) {
    setGroups((prev) => ({
      ...prev,
      [categorySlug]: (prev[categorySlug] || []).map((e, idx) => (idx === i ? { ...e, [field]: value } : e)),
    }))
  }

  function delEx(categorySlug: string, i: number) {
    setGroups((prev) => ({
      ...prev,
      [categorySlug]: (prev[categorySlug] || []).filter((_, idx) => idx !== i),
    }))
  }

  // Quick 1-click Save Manual Exercise to Master Library
  async function handleSaveRowToLibrary(categorySlug: string, item: Ex) {
    if (!item.name.trim()) return
    try {
      await api('/exercises', {
        method: 'POST',
        body: JSON.stringify({
          category_slug: categorySlug,
          name: item.name.trim(),
          default_detail: item.detail?.trim() || undefined,
          is_global: user?.role === 'admin',
        }),
      })
      setCopyNotice(`Gerakan "${item.name}" berhasil disimpan ke Library Master!`)
      setTimeout(() => setCopyNotice(''), 3500)
      loadLibraryData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan gerakan ke library.')
    }
  }

  // Copy routine from last session
  function handleCopyFromLastSession() {
    if (!lastSession) return
    const eg = Array.isArray(lastSession.exercises) ? lastSession.exercises[0] : lastSession.exercises
    if (eg && typeof eg === 'object') {
      const nextGroups: Record<string, Ex[]> = {}
      for (const [key, list] of Object.entries(eg)) {
        if (Array.isArray(list)) {
          nextGroups[key] = list.map((x: any) => ({ name: x.name || '', detail: x.detail ?? '' }))
        }
      }
      setGroups((prev) => ({
        ...prev,
        ...nextGroups,
      }))
      if (lastSession.weight != null) setWeight(String(lastSession.weight))
      if (lastSession.fat_pct != null) setFatPct(String(lastSession.fat_pct))
      setCopyNotice('Gerakan dari sesi terakhir berhasil disalin!')
      setTimeout(() => setCopyNotice(''), 3500)
    }
  }

  // Quick evaluation note injection
  function addQuickNote(tag: string) {
    setNotes((prev) => {
      const trimmed = prev.trim()
      if (!trimmed) return tag
      if (trimmed.includes(tag)) return trimmed
      return `${trimmed} • ${tag}`
    })
  }

  // Form Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (user?.role !== 'pt') {
      setErrorMsg('Akses ditolak: Pencatatan sesi latihan hanya eksklusif untuk Personal Trainer (PT).')
      return
    }

    if (!date) {
      setErrorMsg('Tanggal latihan harus diisi.')
      return
    }

    if (rpe < 1 || rpe > 10) {
      setErrorMsg('Nilai RPE harus di antara 1 dan 10.')
      return
    }

    setSaving(true)
    try {
      const num = (val: string) => {
        const cleaned = val.trim().replace(',', '.')
        if (!cleaned) return null
        const n = Number(cleaned)
        return Number.isFinite(n) ? n : null
      }

      // Group all valid exercises by category slug
      const formattedCategoryExercises: Record<string, Array<{ name: string; detail?: string }>> = {}
      for (const [slug, list] of Object.entries(groups)) {
        const valid = list
          .filter((x) => x.name && x.name.trim().length > 0)
          .map((x) => ({
            name: x.name.trim(),
            ...(x.detail && x.detail.trim() ? { detail: x.detail.trim() } : {}),
          }))
        if (valid.length > 0) {
          formattedCategoryExercises[slug] = valid
        }
      }

      const formattedExercises = [formattedCategoryExercises]

      await api(`/clients/${client.id}/sessions`, {
        method: 'POST',
        body: JSON.stringify({
          date,
          rpe: Number(rpe),
          weight: num(weight),
          fat_pct: num(fatPct),
          notes: notes.trim() || undefined,
          exercises: formattedExercises,
        }),
      })

      // If WhatsApp option enabled and phone available, open WhatsApp with summary
      if (autoOpenWa && client.phone) {
        const categoryMap = Object.fromEntries(categoriesList.map((c) => [c.slug, c.name]))
        const waText = generateWaMessage(
          client.name,
          date,
          rpe,
          num(weight),
          num(fatPct),
          groups,
          categoryMap,
          notes
        )
        const cleanPhone = client.phone.replace(/\D/g, '')
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`, '_blank')
      }

      navigate({ to: '/clients/$clientId', params: { clientId: client.id } })
    } catch (ex) {
      const err = ex as { message?: string; status?: number }
      const detail = err.status === 400 ? ' — periksa kembali tanggal, RPE (1-10), atau input angka.' : ''
      setErrorMsg(ex instanceof Error ? `Gagal menyimpan: ${ex.message}${detail}` : 'Terjadi kesalahan saat menyimpan sesi.')
      setSaving(false)
    }
  }

  const currentRpe = RPE_INFO[rpe] ?? RPE_INFO[7]
  const currentSessionNumber = client.pkg_used + 1
  const remainingQuota = client.pkg_total - client.pkg_used
  const isUrgentRenewal = client.pkg_total > 0 && remainingQuota <= 3

  return (
    <main className="bg-bg text-text min-h-dvh p-3.5 sm:p-6 lg:p-8 selection:bg-accent/30 selection:text-text font-sans antialiased">
      <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* ── Top Navigation Bar: Back & Theme ── */}
        <div className="flex items-center justify-between gap-3 animate-fade-in">
          <Link
            to="/clients/$clientId"
            params={{ clientId: client.id }}
            className="btn-interactive px-3.5 py-2 rounded-xl bg-panel border border-line text-dim hover:text-text hover:border-accent/40 text-xs font-semibold transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Detail Klien</span>
          </Link>

          <ThemeToggle />
        </div>

        {/* ── Main Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-line/60">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text">Catat Sesi Latihan</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-accent/15 text-accent border border-accent/30 shrink-0">
                Sesi #{currentSessionNumber}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-dim mt-1">
              Klien: <strong className="text-text">{client.name}</strong> · Dokumentasikan fase latihan, metrik tubuh, dan intensitas RPE
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-start sm:justify-end flex-wrap">
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              className="btn-interactive px-3.5 py-2 rounded-xl bg-panel hover:bg-panel-elevated border border-line hover:border-accent/40 text-text text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
              title="Kelola Master Gerakan & Kategori Latihan"
            >
              <Dumbbell className="w-3.5 h-3.5 text-accent" />
              <span>Master Gerakan</span>
              {user?.role === 'admin' ? (
                <span className="text-[9px] font-mono font-bold bg-amber-400/20 text-amber-400 px-1.5 py-0.2 rounded">
                  Admin
                </span>
              ) : (
                <span className="text-[9px] font-mono bg-bg text-dim px-1.5 py-0.2 rounded border border-line">PT</span>
              )}
            </button>

            {lastSession && (
              <button
                type="button"
                onClick={handleCopyFromLastSession}
                className="btn-interactive px-3.5 py-2 rounded-xl bg-panel hover:bg-panel-elevated border border-accent/30 text-accent hover:border-accent text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                title="Salin daftar gerakan dari sesi latihan sebelumnya"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Sesi Lalu</span>
              </button>
            )}
          </div>
        </div>

        {/* Copy notification toast */}
        {copyNotice && (
          <div className="p-3.5 rounded-xl bg-accent/15 border border-accent/40 text-accent text-xs font-medium flex items-center gap-2 animate-fade-in shadow-[0_0_20px_rgba(226,232,0,0.15)]">
            <Sparkles className="w-4 h-4" />
            <span>{copyNotice}</span>
          </div>
        )}

        {/* ── Client Identity & Context Banner ── */}
        <div className="hover-gold-glow p-4 sm:p-5 rounded-2xl bg-panel border border-line shadow-[0_4px_20px_rgba(0,0,0,0.35)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#1a1b20] to-[#121316] border border-accent/40 flex items-center justify-center font-bold text-accent text-base sm:text-lg shadow-inner shrink-0">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base text-text truncate">{client.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-bg border border-line text-accent shrink-0">
                  {goalLabel(client.goal)}
                </span>
                {client.gender && (
                  <span className="text-xs text-dim capitalize">({client.gender})</span>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-dim mt-1 flex-wrap">
                <span>
                  Sisa Kuota:{' '}
                  <strong className={isUrgentRenewal ? 'text-amber-400 font-bold' : 'text-text'}>
                    {remainingQuota} sesi
                  </strong>{' '}
                  dari {client.pkg_total}
                </span>
                {lastSession && (
                  <span className="hidden sm:inline">
                    • Terakhir latihan: {formatDate(lastSession.date)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Medical / Injury Alert if present */}
          {client.problem && client.problem !== 'none' && (
            <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5 max-w-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="block font-bold">Perhatian: {injuryLabel(client.problem)}</strong>
                <span className="text-[11px] opacity-80">
                  {injuryTip(client.problem)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Main Workout Log Form ── */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 animate-fade-in-up">
          {/* Section 1: Session Metrics & Interactive RPE */}
          <div className="hover-gold-glow p-4 sm:p-6 rounded-2xl bg-panel border border-line space-y-5 sm:space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-line/60">
              <h2 className="text-sm font-bold uppercase tracking-wider text-dim flex items-center gap-2 font-mono">
                <span>01</span>
                <span className="text-text">Metrik & Parameter Sesi</span>
              </h2>
              <span className="text-[11px] text-muted font-mono">Wajib diisi</span>
            </div>

            {/* Date, Weight, Body Fat % inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-dim mb-1.5">
                  Tanggal Latihan <span className="text-accent">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-bg border border-line focus:border-accent focus:ring-1 focus:ring-accent/30 text-text rounded-xl px-3.5 py-2.5 outline-none text-base sm:text-sm font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dim mb-1.5 flex items-center justify-between">
                  <span>Berat Badan (kg)</span>
                  {lastSession?.weight != null && (
                    <span className="text-[10px] text-muted font-mono">Lalu: {lastSession.weight}kg</span>
                  )}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="misal: 68.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-bg border border-line focus:border-accent focus:ring-1 focus:ring-accent/30 text-text rounded-xl px-3.5 py-2.5 outline-none text-base sm:text-sm font-mono transition-colors placeholder:text-muted"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dim mb-1.5 flex items-center justify-between">
                  <span>Kadar Lemak Tubuh (%)</span>
                  {lastSession?.fat_pct != null && (
                    <span className="text-[10px] text-muted font-mono">Lalu: {lastSession.fat_pct}%</span>
                  )}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="misal: 18.2"
                  value={fatPct}
                  onChange={(e) => setFatPct(e.target.value)}
                  className="w-full bg-bg border border-line focus:border-accent focus:ring-1 focus:ring-accent/30 text-text rounded-xl px-3.5 py-2.5 outline-none text-base sm:text-sm font-mono transition-colors placeholder:text-muted"
                />
              </div>
            </div>

            {/* RPE Selector & Interactive Explanation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-dim flex items-center gap-1.5">
                  <span>Skala Beban & Intensitas (RPE 1-10)</span>
                  <span className="text-accent">*</span>
                </label>
                <span className="text-xs font-mono font-bold text-accent">
                  RPE {rpe}/10
                </span>
              </div>

              {/* RPE 1 to 10 Selector Buttons */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                {Array.from({ length: 10 }, (_, idx) => idx + 1).map((val) => {
                  const isSelected = rpe === val
                  let activeClass = 'bg-bg text-dim border-line hover:border-accent/40'
                  if (isSelected) {
                    if (val <= 3) activeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm font-bold scale-105'
                    else if (val <= 6) activeClass = 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm font-bold scale-105'
                    else if (val <= 8) activeClass = 'bg-accent/25 text-accent border-accent shadow-sm font-bold scale-105'
                    else activeClass = 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm font-bold scale-105'
                  }
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRpe(val)}
                      className={`btn-interactive h-11 rounded-xl border text-sm font-mono transition-all flex flex-col items-center justify-center hover:scale-105 active:scale-95 ${activeClass}`}
                    >
                      <span>{val}</span>
                      <span className="text-[9px] opacity-70">
                        {val === 10 ? 'MAX' : val >= 7 ? `${10 - val}RIR` : ''}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* RPE Live Explanation Card */}
              <div className={`mt-3 p-3.5 rounded-xl border ${currentRpe.badge} transition-all duration-300 animate-fade-in`}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                  <span className={`text-xs font-bold ${currentRpe.color}`}>
                    RPE {rpe}: {currentRpe.title}
                  </span>
                </div>
                <p className="text-xs text-dim mt-1 leading-relaxed">
                  {currentRpe.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Exercise Categories Builder */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-line/60">
              <h2 className="text-sm font-bold uppercase tracking-wider text-dim flex items-center gap-2 font-mono">
                <span>02</span>
                <span className="text-text">Struktur Gerakan Latihan (Katalog & Input Bebas)</span>
              </h2>
              <span className="text-xs text-muted">Dapat diisi manual secara bebas atau dari rekomendasi</span>
            </div>

            <div className="space-y-4">
              {categoriesList.map((cat) => {
                const list = groups[cat.slug] || []
                // Get presets for this category from database, or fallback
                const dbPresets = exercisesList.filter((e) => e.category_slug === cat.slug)
                const fallbackPresets = FALLBACK_PRESETS[cat.slug] || []
                const availablePresets = dbPresets.length > 0
                  ? dbPresets.map((e) => ({ name: e.name, detail: e.default_detail || '' }))
                  : fallbackPresets

                return (
                  <div
                    key={cat.slug}
                    className="hover-gold-glow p-4 sm:p-5 rounded-2xl bg-panel border border-line shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-300"
                  >
                    {/* Phase Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-line/60 mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-bg border border-line">
                          {getCategoryIcon(cat.slug, cat.icon)}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm text-text flex items-center gap-2">
                            <span>{cat.name}</span>
                            <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-md bg-bg border border-line text-dim">
                              {list.length} gerakan
                            </span>
                          </h3>
                          {cat.description && (
                            <p className="text-[11px] text-dim">{cat.description}</p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => addEx(cat.slug)}
                        className="btn-interactive self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg bg-bg border border-line hover:border-accent/40 text-accent font-medium transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>

                    {/* Quick Preset Chips from Library */}
                    {availablePresets.length > 0 && (
                      <div className="mb-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-muted uppercase font-mono mr-1">Rekomendasi Cepat:</span>
                          {availablePresets.slice(0, 7).map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => addEx(cat.slug, { name: preset.name, detail: preset.detail })}
                              className="btn-interactive text-[11px] px-2.5 py-1 rounded-lg bg-bg/80 border border-line/70 hover:border-accent/50 text-dim hover:text-text transition-all"
                              title={`Tambahkan ${preset.name} ${preset.detail ? `(${preset.detail})` : ''}`}
                            >
                              + {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exercise items list */}
                    {list.length === 0 ? (
                      <div className="py-4 text-center rounded-xl bg-bg/40 border border-dashed border-line/50 text-muted text-xs">
                        Belum ada gerakan di kategori {cat.name}. Klik <strong>Tambah</strong> atau pilih rekomendasi di atas.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {list.map((item, i) => (
                          <div key={i} className="animate-fade-in flex items-center gap-2 group">
                            <span className="w-6 text-center font-mono text-[11px] text-muted shrink-0">
                              {i + 1}.
                            </span>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Nama Latihan (bebas ketik manual, misal: Barbell Squat)"
                                value={item.name}
                                onChange={(e) => setEx(cat.slug, i, 'name', e.target.value)}
                                className="w-full bg-bg border border-line focus:border-accent focus:ring-1 focus:ring-accent/30 text-text rounded-xl px-3 py-2 outline-none text-base sm:text-xs transition-colors placeholder:text-muted"
                              />
                              <input
                                type="text"
                                placeholder="Detail (bebas ketik manual, misal: 3 set x 10 reps @ 60kg)"
                                value={item.detail ?? ''}
                                onChange={(e) => setEx(cat.slug, i, 'detail', e.target.value)}
                                className="w-full bg-bg border border-line focus:border-accent focus:ring-1 focus:ring-accent/30 text-text rounded-xl px-3 py-2 outline-none text-base sm:text-xs font-mono transition-colors placeholder:text-muted"
                              />
                            </div>

                            {/* Quick Save to Master Library button */}
                            {item.name.trim() && (
                              <button
                                type="button"
                                onClick={() => handleSaveRowToLibrary(cat.slug, item)}
                                className="btn-interactive w-8 h-8 rounded-xl border border-line bg-bg text-dim hover:text-accent hover:border-accent/40 flex items-center justify-center text-xs transition-all shrink-0"
                                title="Simpan gerakan ini ke Library Master agar bisa dipakai ulang"
                              >
                                <BookmarkPlus className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => delEx(cat.slug, i)}
                              className="btn-interactive w-8 h-8 rounded-xl border border-line bg-bg text-dim hover:text-rose-400 hover:border-rose-500/40 flex items-center justify-center text-xs transition-all shrink-0"
                              title="Hapus gerakan ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 3: Coach Evaluation & Notes */}
          <div className="hover-gold-glow p-4 sm:p-6 rounded-2xl bg-panel border border-line space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-line/60">
              <h2 className="text-sm font-bold uppercase tracking-wider text-dim flex items-center gap-2 font-mono">
                <span>03</span>
                <span className="text-text">Catatan & Evaluasi Coach</span>
              </h2>
              <span className="text-[11px] text-muted">Opsional</span>
            </div>

            {/* Quick Note Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-dim font-medium">Tag Cepat:</span>
              {[
                'PR Beban Baru 🏆',
                'Form Sempurna ✨',
                'Fokus Mobilitas Panggul 🎯',
                'Tingkatkan Hidrasi 💧',
                'Tidur Kurang / Lelah ⚠️',
                'Pola Nafas Terjaga 🔥',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addQuickNote(tag)}
                  className="btn-interactive text-xs px-2.5 py-1 rounded-lg bg-bg border border-line hover:border-accent/40 text-dim hover:text-text transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              maxLength={2000}
              placeholder="Tuliskan evaluasi teknik, feedback perkembangan klien, atau PR yang dicapai hari ini..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-bg border border-line focus:border-accent focus:ring-1 focus:ring-accent/30 text-text rounded-xl p-3.5 outline-none text-base sm:text-sm transition-colors placeholder:text-muted leading-relaxed"
            />
          </div>

          {/* Section 4: WhatsApp Recap Automation */}
          {client.phone && (
            <label
              htmlFor="autoWa"
              className="hover-gold-glow p-4 sm:p-5 rounded-2xl bg-panel border border-line flex items-center justify-between gap-3.5 transition-all duration-300 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-lg shrink-0">
                  <Smartphone className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-text block">
                    Kirim Rekap Sesi ke WhatsApp Klien
                  </span>
                  {/* <p className="text-xs text-dim leading-relaxed">
                    Otomatis membuka WhatsApp dengan format ringkasan sesi latihan ({client.phone})
                  </p> */}
                </div>
              </div>

              <div className="shrink-0 flex items-center pl-2">
                <input
                  id="autoWa"
                  type="checkbox"
                  checked={autoOpenWa}
                  onChange={(e) => setAutoOpenWa(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative border flex items-center px-0.5 ${
                    autoOpenWa ? 'bg-accent border-accent' : 'bg-bg border-line'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full transition-transform transform shadow-sm ${
                      autoOpenWa ? 'translate-x-5 bg-[#141414]' : 'translate-x-0 bg-muted'
                    }`}
                  />
                </div>
              </div>
            </label>
          )}

          {/* Error Message display */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 5: Action & Submission Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-4 border-t border-line/60">
            <Link
              to="/clients/$clientId"
              params={{ clientId: client.id }}
              className="btn-interactive w-full sm:w-auto px-6 py-3 rounded-xl border border-line bg-bg hover:bg-panel text-dim hover:text-text text-sm font-semibold text-center transition-all"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="btn-interactive w-full sm:w-auto px-8 py-3 rounded-xl bg-accent hover:bg-accent-hover text-[#141414] font-bold text-sm transition-all shadow-[0_0_20px_rgba(226,232,0,0.25)] hover:shadow-[0_0_28px_rgba(226,232,0,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin"></span>
                  <span>Menyimpan Sesi…</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Simpan & Selesaikan Sesi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Master Gerakan Modal */}
      <AdminExerciseModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false)
          loadLibraryData()
        }}
        userRole={user?.role}
      />
    </main>
  )
}

function getCategoryIcon(slug: string, iconName?: string | null) {
  if (iconName === 'flame' || slug === 'warmup') return <Flame className="w-4 h-4 text-emerald-400" />
  if (iconName === 'activity' || slug === 'core') return <Activity className="w-4 h-4 text-amber-400" />
  if (iconName === 'heart-pulse' || slug === 'cardio') return <HeartPulse className="w-4 h-4 text-sky-400" />
  if (iconName === 'wind' || slug === 'cooldown') return <Wind className="w-4 h-4 text-purple-400" />
  if (iconName === 'shield-plus' || slug === 'rehab') return <ShieldPlus className="w-4 h-4 text-teal-400" />
  return <Dumbbell className="w-4 h-4 text-accent" />
}

function goalLabel(g: string) {
  return { fat_loss: 'Fat Loss', muscle_gain: 'Muscle Gain', general: 'General Fitness' }[g] ?? g
}

function injuryLabel(p?: string | null) {
  if (!p || p === 'none') return 'Normal'
  if (p === 'knee') return 'Cedera Lutut'
  if (p === 'back') return 'Cedera Pinggang'
  if (p === 'shoulder') return 'Cedera Bahu'
  return p
}

function injuryTip(p?: string | null) {
  if (p === 'knee') return 'Batasi fleksi lutut dalam berlebih & hindari gerakan eksplosif tanpa pemanasan sendi.'
  if (p === 'back') return 'Jaga kurvatura lumbal netral & hindari gerakan shearing spinal.'
  if (p === 'shoulder') return 'Batasi rotasi internal bahu ekstrem dan overhead pressing berat.'
  return 'Perhatikan instruksi dan kenyamanan klien selama latihan.'
}

function generateWaMessage(
  clientName: string,
  date: string,
  rpe: number,
  weight: number | null,
  fatPct: number | null,
  groups: Record<string, Ex[]>,
  categoryMap: Record<string, string>,
  notes: string
) {
  let text = `*Halo ${clientName}!* 💪\n`
  text += `Berikut ringkasan sesi latihan kita pada tanggal *${formatDateWithDay(date)}*:\n\n`
  text += `📊 *Intensitas (RPE):* ${rpe}/10\n`
  if (weight != null) text += `⚖️ *Berat Badan:* ${weight} kg\n`
  if (fatPct != null) text += `📉 *Lemak Tubuh:* ${fatPct}%\n\n`

  for (const [slug, list] of Object.entries(groups)) {
    const valid = list.filter((x) => x.name && x.name.trim().length > 0)
    if (valid.length > 0) {
      const title = categoryMap[slug] || slug.toUpperCase()
      text += `🔹 *${title}:*\n`
      text += valid.map((x) => `• ${x.name} ${x.detail ? `(${x.detail})` : ''}`).join('\n') + '\n\n'
    }
  }

  if (notes.trim()) {
    text += `📝 *Catatan Coach:* "${notes.trim()}"\n\n`
  }

  text += `Terus jaga konsistensi, nutrisi harian, dan waktu istirahat yang cukup. Sampai jumpa di sesi latihan berikutnya! 🔥`
  return text
}
