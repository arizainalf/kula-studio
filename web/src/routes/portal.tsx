import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { api, type User } from '../lib/api'
import { ThemeToggle, useTheme } from '../components/ThemeToggle'
import { formatDateWithDay, formatTime } from '../lib/date'
import { EditProfileModal } from '../components/EditProfileModal'
import {
  Trophy,
  Dumbbell,
  Calendar,
  Flame,
  TrendingDown,
  TrendingUp,
  Activity,
  HeartPulse,
  LogOut,
  MessageCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Sun,
  Moon,
  UserCog,
} from 'lucide-react'
import { UserAvatar } from '../components/UserAvatar'
import { usePlatformSettings, formatBrandName } from '../lib/platformSettings'

export type ClientProfile = {
  id: string
  name: string
  goal: string
  pkg_total: number
  pkg_used: number
  pkg_remaining: number
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
  notes?: string | null
  age_bracket?: string | null
  gender?: string | null
  problem?: string | null
  pt_name: string
  pt_email: string
  pt_avatar_url?: string | null
}

export type ClientStats = {
  total_sessions: number
  this_month_sessions: number
  avg_rpe: number
  current_weight: number | null
  start_weight: number | null
  weight_change: number | null
  current_fat_pct: number | null
  start_fat_pct: number | null
  fat_pct_change: number | null
}

export type SessionExerciseGroup = {
  warmup?: Array<{ name: string; detail?: string }>
  resistance?: Array<{ name: string; detail?: string }>
  cardio?: Array<{ name: string; detail?: string }>
  cooldown?: Array<{ name: string; detail?: string }>
}

export type PortalSession = {
  id: string
  date: string
  rpe: number
  weight?: number | string | null
  fat_pct?: number | string | null
  exercises?: SessionExerciseGroup[]
  notes?: string | null
  created_at: string
}

export type UpcomingScheduleItem = {
  id: string
  date: string
  time: string
  note?: string | null
}

export type PersonalRanking = {
  rank: number
  total_clients: number
  points: number
  tier: string
  tier_badge: string
  tier_color: string
  percentile: string
  points_to_next: number
  is_top_3: boolean
}

export type LeaderboardEntry = {
  rank: number
  id: string
  name: string
  avatar_url?: string | null
  is_me: boolean
  goal: string
  total_sessions: number
  this_month_sessions: number
  avg_rpe: number
  points: number
  tier: string
  tier_badge: string
  tier_color: string
}

export type PortalDashboardData = {
  client: ClientProfile
  stats: ClientStats
  recent_sessions: PortalSession[]
  upcoming_schedule: UpcomingScheduleItem[]
  my_ranking: PersonalRanking
  leaderboard: LeaderboardEntry[]
}

export const Route = createFileRoute('/portal')({
  beforeLoad: async () => {
    try {
      await api<{ user: User }>('/auth/me')
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  loader: async (): Promise<PortalDashboardData> => {
    return await api<PortalDashboardData>('/portal/dashboard')
  },
  component: ClientPortalPage,
})

function ClientPortalPage() {
  const data = Route.useLoaderData()
  const { client: initialClient, stats, recent_sessions, upcoming_schedule, my_ranking, leaderboard } = data
  const [client, setClient] = useState<ClientProfile>(initialClient)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'progress' | 'leaderboard'>('progress')
  const { theme, toggleTheme } = useTheme()
  const platformSettings = usePlatformSettings()

  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    location.href = '/login'
  }

  const clientUser: User = {
    id: client.id,
    clientId: client.id,
    name: client.name,
    email: client.email || '',
    phone: client.phone || '',
    avatar_url: client.avatar_url,
    role: 'client',
    gender: (client.gender as any) || null,
    age_bracket: client.age_bracket || null,
    problem: client.problem || 'none',
    notes: client.notes || null,
    pt_name: client.pt_name,
    pkg_total: client.pkg_total,
  }

  const pkgPercentage =
    client.pkg_total > 0 ? Math.min(100, Math.round((client.pkg_used / client.pkg_total) * 100)) : 0

  return (
    <div className="relative z-10 text-text min-h-dvh selection:bg-accent/30 selection:text-text font-sans antialiased pb-24 sm:pb-12">
      {/* ── 1. Top Global Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-panel/80 backdrop-blur-2xl border-b border-line shadow-sm">
        <div className="mx-auto max-w-5xl px-3.5 sm:px-8 md:px-10 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-panel border border-accent/40 flex items-center justify-center shadow-[0_0_12px_rgba(226,232,0,0.2)]">
              <span className="font-extrabold text-xs tracking-tighter text-accent">
                {platformSettings.app_initials || 'TL'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base tracking-tight leading-none text-text">
                {formatBrandName(platformSettings.app_name)}{' '}
                <span className="text-xs font-normal text-dim font-mono">Member</span>
              </span>
              <span className="text-[10px] text-accent font-mono mt-0.5 flex items-center gap-1.5">
                {client.pt_name && (
                  <>
                    <UserAvatar
                      name={client.pt_name}
                      avatarUrl={client.pt_avatar_url}
                      role="pt"
                      size="xs"
                      shape="rounded-full"
                    />
                    <span>Coach: {client.pt_name}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Quick Actions (Edit Profile, Theme & Logout) */}
          <div className="flex items-center gap-2">
            <ThemeToggle showLabel={false} />

            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="btn-interactive text-dim hover:text-accent p-2 sm:px-3 sm:py-1.5 rounded-lg border border-line hover:border-accent/40 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Edit Profil Akun Klien"
            >
              <UserCog className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Edit Profil</span>
            </button>

            <button
              onClick={logout}
              className="btn-interactive text-dim hover:text-rose-400 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-line hover:border-rose-500/40 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Keluar dari Akun Klien"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Main Content Container ── */}
      <main className="mx-auto max-w-5xl px-3.5 sm:px-8 md:px-10 pt-5 space-y-6">
        {/* ── Personal Ranking Hero Highlight Card (Ranking Pribadi) ── */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-panel via-panel to-accent/10 border border-line p-5 sm:p-7 shadow-[0_12px_35px_rgba(0,0,0,0.5)] animate-fade-in">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            {/* Left: Greeting & Rank Badge */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Portal Progres Klien</span>
              </div>

              <div className="flex items-center gap-3.5">
                <UserAvatar
                  name={client.name}
                  avatarUrl={client.avatar_url}
                  role="client"
                  size="xl"
                  shape="rounded-2xl"
                  className="shrink-0 shadow-md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-text truncate">
                      Halo, <span className="text-accent">{client.name}</span>!
                    </h1>
                    <button
                      onClick={() => setIsEditProfileOpen(true)}
                      className="text-xs text-accent hover:underline font-mono inline-flex items-center gap-1 btn-interactive shrink-0"
                      title="Edit Data Profil Saya"
                    >
                      <UserCog className="w-3.5 h-3.5" />
                      <span>Edit Profil</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-dim max-w-xl leading-relaxed mt-1">
                    {my_ranking.is_top_3
                      ? 'Performa luar biasa! Anda menduduki 3 besar klasemen keaktifan latihan di gym kami.'
                      : 'Pantau kemajuan latihan, jadwal sesi, dan terus tingkatkan konsistensi mingguan Anda!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Personal Rank Highlight Box */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-bg/80 border border-line/80 shadow-inner shrink-0">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0"
                style={{
                  background:
                    my_ranking.rank === 1
                      ? 'linear-gradient(135deg, #eab308, #ca8a04)'
                      : my_ranking.rank === 2
                        ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                        : my_ranking.rank === 3
                          ? 'linear-gradient(135deg, #d97706, #b45309)'
                          : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                }}
              >
                <div className="flex flex-col items-center leading-none">
                  <Trophy className="w-6 h-6 mb-0.5 text-white stroke-[2.2]" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    #{my_ranking.rank}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-bold font-mono text-text">
                    Peringkat #{my_ranking.rank}
                  </span>
                  <span className="text-xs text-dim">/ {my_ranking.total_clients}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-[11px] font-semibold text-accent font-mono">
                    {my_ranking.points.toLocaleString('id-ID')} Poin
                  </span>
                  <span className="text-dim">•</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: my_ranking.tier_color }}
                  >
                    {my_ranking.tier_badge}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {my_ranking.percentile}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Quick KPI Cards (Kuota Paket, Berat, Fat, RPE) ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in-up">
          {/* Card 1: Kuota Sesi Paket */}
          <div className="bg-panel border border-line rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-dim mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Kuota Paket</span>
              <Dumbbell className="w-4 h-4 text-accent" />
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-text">
                  {client.pkg_remaining}
                </span>
                <span className="text-xs text-dim">Sesi Tersisa</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-bg rounded-full h-2 mt-3 overflow-hidden border border-line/40">
                <div
                  className="bg-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pkgPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-dim font-mono mt-1.5">
                <span>{client.pkg_used} Terpakai</span>
                <span>Total: {client.pkg_total}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Berat Badan & Transformasi */}
          <div className="bg-panel border border-line rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-dim mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Berat Badan</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-text">
                  {stats.current_weight ? `${stats.current_weight}` : '—'}
                </span>
                <span className="text-xs text-dim">kg</span>
              </div>

              <div className="flex items-center gap-1 mt-2 text-xs font-mono">
                {stats.weight_change !== null ? (
                  stats.weight_change < 0 ? (
                    <span className="inline-flex items-center text-emerald-400">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      {stats.weight_change} kg
                    </span>
                  ) : stats.weight_change > 0 ? (
                    <span className="inline-flex items-center text-amber-400">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      +{stats.weight_change} kg
                    </span>
                  ) : (
                    <span className="text-dim">Stabil (0 kg)</span>
                  )
                ) : (
                  <span className="text-dim text-[11px]">Belum ada sesi</span>
                )}
                {stats.start_weight && (
                  <span className="text-[10px] text-dim"> (Awal: {stats.start_weight} kg)</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Body Fat % */}
          <div className="bg-panel border border-line rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-dim mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Kadar Lemak</span>
              <HeartPulse className="w-4 h-4 text-rose-400" />
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-text">
                  {stats.current_fat_pct ? `${stats.current_fat_pct}` : '—'}
                </span>
                <span className="text-xs text-dim">%</span>
              </div>

              <div className="flex items-center gap-1 mt-2 text-xs font-mono">
                {stats.fat_pct_change !== null ? (
                  stats.fat_pct_change < 0 ? (
                    <span className="inline-flex items-center text-emerald-400">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      {stats.fat_pct_change}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-amber-400">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      +{stats.fat_pct_change}%
                    </span>
                  )
                ) : (
                  <span className="text-dim text-[11px]">Belum diukur</span>
                )}
                {stats.start_fat_pct && (
                  <span className="text-[10px] text-dim"> (Awal: {stats.start_fat_pct}%)</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Rata-Rata RPE & Total Sesi */}
          <div className="bg-panel border border-line rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-dim mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Intensitas (RPE)</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-text">
                  {stats.avg_rpe}
                </span>
                <span className="text-xs text-dim">/ 10</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-dim font-mono mt-2">
                <span>{stats.total_sessions} Total Sesi</span>
                <span className="text-accent font-semibold">
                  {stats.this_month_sessions} Bulan Ini
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Main Tab Navigation ── */}
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <button
            onClick={() => setActiveTab('progress')}
            className={`btn-interactive flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'progress'
                ? 'bg-accent text-[#141414] font-bold shadow-sm'
                : 'text-dim hover:text-text bg-panel/50'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Progres & Riwayat Latihan</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`btn-interactive flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-accent text-[#141414] font-bold shadow-sm'
                : 'text-dim hover:text-text bg-panel/50'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Klasemen Seluruh Klien</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-mono">
              #{my_ranking.rank}
            </span>
          </button>
        </div>

        {/* ── TAB 1: PROGRES & RIWAYAT LATIHAN ── */}
        {activeTab === 'progress' && (
          <div className="space-y-6 animate-fade-in">
            {/* Section A: Sesi Mendatang (Upcoming Schedule) */}
            <section className="bg-panel border border-line rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-bg border border-accent/40 flex items-center justify-center text-accent">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text">Jadwal Sesi Berikutnya</h2>
                    <p className="text-xs text-dim">Slot waktu latihan yang telah diagendakan oleh pelatih</p>
                  </div>
                </div>

                {client.phone && (
                  <a
                    href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-interactive hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Konfirmasi via WhatsApp</span>
                  </a>
                )}
              </div>

              {upcoming_schedule.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-bg/50 border border-line/60">
                  <Calendar className="w-8 h-8 text-dim mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-dim">
                    Belum ada jadwal sesi mendatang yang dijadwalkan oleh pelatih.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcoming_schedule.map((sch) => (
                    <div
                      key={sch.id}
                      className="p-4 rounded-xl bg-bg border border-accent/20 flex items-start justify-between gap-3 shadow-sm hover:border-accent/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                          {formatDateWithDay(sch.date)}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-mono text-accent">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTime(sch.time)} WIB</span>
                        </div>
                        {sch.note && (
                          <p className="text-xs text-dim italic pt-1">"{sch.note}"</p>
                        )}
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-accent/15 text-accent border border-accent/30 shrink-0">
                        Terjadwal
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section B: Riwayat Sesi Latihan (Recent Sessions) */}
            <section className="bg-panel border border-line rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-bg border border-accent/40 flex items-center justify-center text-accent">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text">Riwayat Sesi Latihan Terkini</h2>
                    <p className="text-xs text-dim">
                      Rincian beban, intensitas (RPE), dan menu latihan dari coach
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono text-dim">
                  {recent_sessions.length} Sesi Terakhir
                </span>
              </div>

              {recent_sessions.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-bg/50 border border-line/60">
                  <Dumbbell className="w-8 h-8 text-dim mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-dim">Belum ada catatan sesi latihan untuk akun ini.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recent_sessions.map((sess, idx) => {
                    const exGroup = sess.exercises?.[0] || {}
                    const warmupCount = exGroup.warmup?.length || 0
                    const resistanceCount = exGroup.resistance?.length || 0
                    const cardioCount = exGroup.cardio?.length || 0
                    const cooldownCount = exGroup.cooldown?.length || 0

                    return (
                      <div
                        key={sess.id}
                        className="p-4 sm:p-5 rounded-xl bg-bg border border-line/80 hover:border-line transition-all space-y-3"
                      >
                        {/* Session Header Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-text">
                              {formatDateWithDay(sess.date)}
                            </span>
                            {idx === 0 && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
                                Sesi Terkini
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span
                              className={`px-2 py-0.5 rounded font-bold ${
                                sess.rpe >= 8
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : sess.rpe >= 6
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              RPE {sess.rpe} / 10
                            </span>

                            {sess.weight && (
                              <span className="text-dim">
                                BB: <strong className="text-text">{sess.weight} kg</strong>
                              </span>
                            )}
                            {sess.fat_pct && (
                              <span className="text-dim">
                                Lemak: <strong className="text-text">{sess.fat_pct}%</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Coach Notes */}
                        {sess.notes && (
                          <div className="p-2.5 rounded-lg bg-panel/70 border border-line/60 text-xs text-text flex items-start gap-2">
                            <span className="font-semibold text-accent shrink-0">Catatan Coach:</span>
                            <span className="italic">"{sess.notes}"</span>
                          </div>
                        )}

                        {/* Exercise Items Group */}
                        {(warmupCount > 0 || resistanceCount > 0 || cardioCount > 0 || cooldownCount > 0) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {/* Resistance / Beban */}
                            {resistanceCount > 0 && (
                              <div className="p-2.5 rounded-lg bg-panel/40 border border-line/40">
                                <span className="font-bold text-accent text-[11px] block mb-1">
                                  Latihan Beban ({resistanceCount})
                                </span>
                                <ul className="space-y-1 text-dim">
                                  {exGroup.resistance?.map((ex, i) => (
                                    <li key={i} className="flex items-center justify-between">
                                      <span className="text-text">{ex.name}</span>
                                      {ex.detail && (
                                        <span className="font-mono text-[10px] text-dim">{ex.detail}</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Cardio */}
                            {cardioCount > 0 && (
                              <div className="p-2.5 rounded-lg bg-panel/40 border border-line/40">
                                <span className="font-bold text-blue-400 text-[11px] block mb-1">
                                  Cardio ({cardioCount})
                                </span>
                                <ul className="space-y-1 text-dim">
                                  {exGroup.cardio?.map((ex, i) => (
                                    <li key={i} className="flex items-center justify-between">
                                      <span className="text-text">{ex.name}</span>
                                      {ex.detail && (
                                        <span className="font-mono text-[10px] text-dim">{ex.detail}</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── TAB 2: KLASEMEN SELURUH KLIEN (LEADERBOARD) ── */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top 3 Podium Visual */}
            <section className="bg-panel border border-line rounded-2xl p-5 sm:p-7 shadow-sm">
              <div className="text-center max-w-md mx-auto mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold mb-2">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Komunitas & Klasemen Latihan</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-text">Podium Keaktifan Klien</h2>
                <p className="text-xs text-dim mt-1">
                  Poin dihitung dari kehadiran sesi, intensitas RPE, dan konsistensi bulanan.
                </p>
              </div>

              {/* Podium Display (Rank 2, Rank 1, Rank 3) */}
              <div className="flex items-end justify-center gap-2 sm:gap-6 pt-4 pb-2">
                {/* 2nd Place */}
                {leaderboard[1] && (
                  <div className="flex flex-col items-center flex-1 max-w-[130px]">
                    <div className="w-12 h-12 rounded-full bg-slate-400/20 border-2 border-slate-400 flex items-center justify-center text-slate-300 font-bold mb-2 shadow-md">
                      🥈
                    </div>
                    <span className="text-xs font-bold text-text truncate max-w-full text-center">
                      {leaderboard[1].name}
                    </span>
                    <span className="text-[10px] text-accent font-mono">
                      {leaderboard[1].points} Pts
                    </span>
                    <div className="w-full bg-slate-400/15 border border-slate-400/40 rounded-t-xl h-24 flex items-center justify-center font-bold text-slate-300 text-lg mt-2">
                      #2
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {leaderboard[0] && (
                  <div className="flex flex-col items-center flex-1 max-w-[140px] -mt-4">
                    <div className="w-14 h-14 rounded-full bg-yellow-400/25 border-2 border-yellow-400 flex items-center justify-center text-yellow-300 font-bold mb-2 shadow-lg shadow-yellow-500/20 animate-bounce-slow">
                      🥇
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-text truncate max-w-full text-center">
                      {leaderboard[0].name}
                    </span>
                    <span className="text-[11px] text-accent font-mono font-bold">
                      {leaderboard[0].points} Pts
                    </span>
                    <div className="w-full bg-yellow-400/20 border border-yellow-400/50 rounded-t-xl h-32 flex items-center justify-center font-black text-yellow-400 text-2xl mt-2 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                      #1
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {leaderboard[2] && (
                  <div className="flex flex-col items-center flex-1 max-w-[130px]">
                    <div className="w-12 h-12 rounded-full bg-amber-600/20 border-2 border-amber-600 flex items-center justify-center text-amber-500 font-bold mb-2 shadow-md">
                      🥉
                    </div>
                    <span className="text-xs font-bold text-text truncate max-w-full text-center">
                      {leaderboard[2].name}
                    </span>
                    <span className="text-[10px] text-accent font-mono">
                      {leaderboard[2].points} Pts
                    </span>
                    <div className="w-full bg-amber-600/15 border border-amber-600/40 rounded-t-xl h-20 flex items-center justify-center font-bold text-amber-500 text-lg mt-2">
                      #3
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Complete Leaderboard Table */}
            <section className="bg-panel border border-line rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text">Daftar Peringkat Lengkap Seluruh Klien</h3>
                <span className="text-xs font-mono text-dim">{leaderboard.length} Klien Terdaftar</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line text-[11px] font-mono text-dim uppercase tracking-wider">
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Nama Klien</th>
                      <th className="py-2.5 px-3 text-center">Total Sesi</th>
                      <th className="py-2.5 px-3 text-center">Bulan Ini</th>
                      <th className="py-2.5 px-3 text-center">Avg RPE</th>
                      <th className="py-2.5 px-3 text-right">Poin &amp; Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40 text-xs">
                    {leaderboard.map((item) => {
                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            item.is_me
                              ? 'bg-accent/15 border-y-2 border-accent/50 font-semibold'
                              : 'hover:bg-bg/40'
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-3 px-3 font-mono">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                                item.rank === 1
                                  ? 'bg-yellow-400 text-black'
                                  : item.rank === 2
                                    ? 'bg-slate-300 text-black'
                                    : item.rank === 3
                                      ? 'bg-amber-600 text-white'
                                      : 'text-dim'
                              }`}
                            >
                              {item.rank}
                            </span>
                          </td>

                          {/* Client Name & Avatar & You Badge */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar
                                name={item.name}
                                avatarUrl={item.avatar_url}
                                role="client"
                                size="xs"
                                shape="rounded-lg"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-text font-medium truncate">{item.name}</span>
                                  {item.is_me && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent text-[#141414] uppercase shrink-0">
                                      Kamu
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-dim capitalize font-mono block truncate">
                                  {item.goal.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Total Sessions */}
                          <td className="py-3 px-3 text-center font-mono">{item.total_sessions}</td>

                          {/* This Month Sessions */}
                          <td className="py-3 px-3 text-center font-mono text-accent">
                            {item.this_month_sessions}
                          </td>

                          {/* Avg RPE */}
                          <td className="py-3 px-3 text-center font-mono text-dim">
                            {item.avg_rpe ? item.avg_rpe : '—'}
                          </td>

                          {/* Points & Tier */}
                          <td className="py-3 px-3 text-right font-mono">
                            <div className="font-bold text-accent">
                              {item.points.toLocaleString('id-ID')}
                            </div>
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5 text-white"
                              style={{ backgroundColor: item.tier_color }}
                            >
                              {item.tier_badge}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ── 5. Mobile Bottom Navigation Bar (Tailored for Client) ── */}
      <nav
        aria-label="Client Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-panel/85 backdrop-blur-2xl border-t border-line shadow-[0_-4px_25px_rgba(0,0,0,0.35)] px-4 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Tab 1: Progres */}
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'progress' ? 'text-accent font-bold scale-105' : 'text-dim hover:text-text'
            }`}
          >
            <Dumbbell className="w-5 h-5 mb-1" />
            <span className="text-[10px] tracking-tight">Progres Saya</span>
            {activeTab === 'progress' && (
              <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />
            )}
          </button>

          {/* Tab 2: Klasemen */}
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'leaderboard'
                ? 'text-accent font-bold scale-105'
                : 'text-dim hover:text-text'
            }`}
          >
            <Trophy className="w-5 h-5 mb-1" />
            <span className="text-[10px] tracking-tight">Klasemen Klien</span>
            {activeTab === 'leaderboard' && (
              <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />
            )}
          </button>

          {/* Tab 3: Tema */}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-dim hover:text-text transition-all"
            title="Ubah Tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 mb-1 text-accent" />
            ) : (
              <Moon className="w-5 h-5 mb-1 text-indigo-400" />
            )}
            <span className="text-[10px] tracking-tight">Tema</span>
          </button>

          {/* Tab 4: Keluar */}
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-dim hover:text-rose-400 transition-all"
            title="Keluar Akun"
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span className="text-[10px] tracking-tight">Keluar</span>
          </button>
        </div>
      </nav>

      {/* ── Edit Profile Modal for Client ── */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={clientUser}
        onProfileUpdated={(updated) => {
          setClient((prev) => ({
            ...prev,
            name: updated.name,
            email: updated.email,
            phone: updated.phone,
            avatar_url: updated.avatar_url ?? prev.avatar_url,
            gender: (updated.gender as any) || prev.gender,
            age_bracket: updated.age_bracket || prev.age_bracket,
            problem: updated.problem || prev.problem,
            notes: updated.notes || prev.notes,
          }))
        }}
      />
    </div>
  )
}
