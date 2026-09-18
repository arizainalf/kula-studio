import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { api, type User } from '../lib/api'
import { LandingPage } from '../components/LandingPage'
import {
  StatCard,
  GoalDistributionCard,
  RpeSpectrumCard,
  type ClientSummary,
} from '../components/DashboardCharts'
import { WeeklyScheduleSection } from '../components/WeeklyScheduleSection'
import {
  formatDate,
  formatShortDate,
  formatTime,
  getLocalTodayString,
  getLocalFutureDateString,
} from '../lib/date'
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Calendar,
  UserPlus,
  LogOut,
  Globe,
  MessageSquare,
  ArrowRight,
  Search,
  X,
} from 'lucide-react'

export type Client = ClientSummary & {
  notes?: string | null
  age_bracket?: string | null
  gender?: 'pria' | 'wanita' | null
  problem?: string | null
  is_active?: boolean
  created_at?: string
}

export type ScheduleItem = {
  id: string
  client_id: string
  pt_id: string
  date: string
  time: string
  note?: string | null
  client_name?: string
  client_phone?: string | null
}

type LoaderData = {
  me: User | null
  clients: Client[]
  schedule: ScheduleItem[]
}

export const Route = createFileRoute('/')({
  loader: async (): Promise<LoaderData> => {
    try {
      const meRes = await api<{ user: User }>('/auth/me')

      const today = getLocalTodayString()
      const nextWeekDate = getLocalFutureDateString(7)

      const [clientsRes, schedRes] = await Promise.all([
        api<{ clients: Client[] }>('/clients').catch(() => ({ clients: [] })),
        api<{ schedule: ScheduleItem[] }>(`/schedule?from=${today}&to=${nextWeekDate}`).catch(() => ({ schedule: [] })),
      ])

      return {
        me: meRes.user,
        clients: clientsRes.clients,
        schedule: schedRes.schedule,
      }
    } catch {
      return { me: null, clients: [], schedule: [] }
    }
  },
  component: RootIndex,
})

function RootIndex() {
  const { me, clients, schedule } = Route.useLoaderData()

  if (!me) {
    return <LandingPage currentUser={null} />
  }

  return <Dashboard me={me} clients={clients} schedule={schedule} />
}

function Dashboard({ me, clients, schedule }: { me: User; clients: Client[]; schedule: ScheduleItem[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'fat_loss' | 'muscle_gain' | 'general' | 'upsell'>('all')

  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    location.href = '/'
  }

  // Analytics Computations
  const totalClients = clients.length
  const totalSessionsCompleted = clients.reduce((acc, c) => acc + (c.pkg_used || 0), 0)
  const totalPackageQuota = clients.reduce((acc, c) => acc + (c.pkg_total || 0), 0)
  const overallUtilizationPct = totalPackageQuota > 0 ? Math.round((totalSessionsCompleted / totalPackageQuota) * 100) : 0

  // Upsell candidates: clients with remaining sessions <= 3 (and has a package)
  const upsellClients = clients.filter((c) => {
    const remaining = c.pkg_total - c.pkg_used
    return c.pkg_total > 0 && remaining <= 3
  })

  // Filtered Clients list
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase()))

    if (!matchesSearch) return false

    if (activeFilter === 'all') return true
    if (activeFilter === 'upsell') {
      const remaining = c.pkg_total - c.pkg_used
      return c.pkg_total > 0 && remaining <= 3
    }
    return c.goal === activeFilter
  })

  return (
    <main className="bg-bg text-text min-h-dvh p-3.5 sm:p-8 md:p-10 selection:bg-accent/30 selection:text-white font-sans antialiased">
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        {/* ── Top Header & Profile ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5 sm:pb-6 animate-fade-in">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-panel border border-accent/40 flex items-center justify-center text-accent font-extrabold text-base shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.35)] hover:scale-105 transition-all duration-300 cursor-pointer shrink-0">
              {me.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-text truncate">
                  Selamat Datang, {me.name}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Akun Aktif" />
              </div>
              <p className="text-dim text-xs font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="text-accent uppercase font-bold tracking-wider">{me.role}</span>
                <span>&bull;</span>
                <span className="text-text bg-panel px-2 py-0.5 rounded border border-line">
                  {me.plan_tier ? `${me.plan_tier.toUpperCase()} TIER` : 'STANDARD'}
                </span>
                {me.expires_at && (
                  <>
                    <span>&bull;</span>
                    <span className="text-dim">Masa Aktif: {formatDate(me.expires_at)}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
            <a
              href="/landing"
              className="text-dim hover:text-accent text-xs font-mono px-3 py-2 rounded-lg border border-line hover:border-accent/40 transition-colors hidden sm:flex items-center gap-1.5 btn-interactive"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Beranda Publik</span>
            </a>
            <a
              href="/clients/new"
              className="bg-accent hover:bg-accent/90 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-black shadow-[0_2px_14px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_20px_rgba(212,175,55,0.4)] transition-all flex items-center gap-1.5 btn-interactive"
            >
              <UserPlus className="w-4 h-4" />
              <span>Klien Baru</span>
            </a>
            <button
              onClick={logout}
              className="text-dim hover:text-text text-xs sm:text-sm font-medium px-3 py-2 rounded-lg border border-line/40 hover:border-line transition-colors flex items-center gap-1.5 btn-interactive"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* ── 4 Executive KPI Stat Cards ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 animate-fade-in-up">
          <StatCard
            title="Total Klien"
            value={totalClients}
            subtitle={`${clients.filter((c) => c.is_active !== false).length} klien berstatus aktif`}
            badge={{ text: 'TERDAFTAR', type: 'gold' }}
            icon={<Users className="w-5 h-5 text-accent opacity-80" />}
          />
          <StatCard
            title="Sesi Selesai"
            value={totalSessionsCompleted}
            subtitle={`Dari total ${totalPackageQuota} kuota paket`}
            badge={{ text: `${overallUtilizationPct}% KELAR`, type: 'gold' }}
            icon={<CheckCircle2 className="w-5 h-5 text-accent opacity-80" />}
          />
          <StatCard
            title="Utilisasi Paket"
            value={`${overallUtilizationPct}%`}
            subtitle="Rasio sesi selesai vs kuota total"
            badge={{ text: 'OPTIMAL', type: 'gold' }}
            icon={<TrendingUp className="w-5 h-5 text-accent opacity-80" />}
          />
          <StatCard
            title="Jadwal 7 Hari"
            value={schedule.length}
            subtitle={schedule.length ? `Terdekat: ${formatShortDate(schedule[0].date)} (${formatTime(schedule[0].time)})` : 'Belum ada agenda'}
            badge={{ text: schedule.length ? 'TERJADWAL' : 'KOSONG', type: schedule.length ? 'amber' : 'neutral' }}
            icon={<Calendar className="w-5 h-5 text-accent opacity-80" />}
          />
        </section>

        {/* ── Upsell Alert Banner (Mirroring Live TrainLog Feature) ── */}
        {upsellClients.length > 0 && (
          <section className="p-5 rounded-2xl bg-panel border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-panel to-transparent animate-fade-in hover:border-amber-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <h3 className="font-bold text-sm text-text">Perhatian: Kuota Sesi Hampir Habis</h3>
              </div>
              <span className="text-xs font-mono text-amber-400 font-semibold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                {upsellClients.length} Klien Siap Diperpanjang
              </span>
            </div>
            <p className="text-xs text-dim mb-4 max-w-2xl">
              Klien berikut memiliki sisa kuota sesi &le; 3 kali. Hubungi klien untuk memperbarui paket sesi latihan.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {upsellClients.map((cl) => {
                const remaining = cl.pkg_total - cl.pkg_used
                const waMessage = encodeURIComponent(
                  `Halo ${cl.name}, sesi latihan personal training kamu di TrainLog tersisa ${remaining} sesi lagi. Yuk kita amankan slot jadwal untuk paket berikutnya!`
                )
                return (
                  <div
                    key={cl.id}
                    className="p-3.5 rounded-xl bg-bg border border-line hover-gold-glow flex items-center justify-between gap-2 transition-all duration-300"
                  >
                    <div>
                      <div className="font-semibold text-xs text-text">{cl.name}</div>
                      <div className="text-[11px] font-mono text-amber-400 font-medium">
                        {remaining <= 0 ? 'Habis (0 sesi)' : `Sisa ${remaining} sesi (${cl.pkg_used}/${cl.pkg_total})`}
                      </div>
                    </div>
                    {cl.phone ? (
                      <a
                        href={`https://wa.me/${cl.phone.replace(/\D/g, '')}?text=${waMessage}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-black bg-accent hover:bg-accent/90 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 shrink-0 btn-interactive hover:shadow-[0_4px_12px_rgba(212,175,55,0.35)]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WA Upsell</span>
                      </a>
                    ) : (
                      <a
                        href={`/clients/${cl.id}`}
                        className="text-xs text-accent hover:underline shrink-0 font-mono flex items-center gap-1 btn-interactive"
                      >
                        <span>Lihat</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── 5. Prominent Weekly Schedule Section (Interactive 7-Day Strip & Timeline) ── */}
        <WeeklyScheduleSection
          schedule={schedule}
          clients={clients}
          onScheduleChange={() => {
            // Soft-refresh or reload data
            location.reload()
          }}
        />

        {/* ── 6. Visual Analytics Row ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-fade-in-up">
          <GoalDistributionCard clients={clients} />
          <RpeSpectrumCard clients={clients} />
        </section>

        {/* ── 7. Client Directory with Filters & Search ── */}
        <section className="space-y-4 pt-2 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-dim flex items-center gap-2">
              <span>Daftar Klien Pelatihan</span>
              <span className="text-xs font-mono text-accent bg-panel px-2 py-0.5 rounded border border-line">
                {filteredClients.length} Klien
              </span>
            </h2>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama atau telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-panel border border-line rounded-xl pl-8.5 pr-8 py-2 text-sm sm:text-xs text-text placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-text p-1 rounded transition-colors btn-interactive"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs: Horizontal scrollable with shrink-0 chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs no-scrollbar touch-scroll -mx-1 px-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 btn-interactive ${
                activeFilter === 'all'
                  ? 'bg-accent text-black font-semibold shadow-[0_2px_10px_rgba(212,175,55,0.25)]'
                  : 'bg-panel text-dim hover:text-text border border-line hover:border-line-subtle'
              }`}
            >
              Semua ({clients.length})
            </button>
            <button
              onClick={() => setActiveFilter('fat_loss')}
              className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 btn-interactive ${
                activeFilter === 'fat_loss'
                  ? 'bg-accent text-black font-semibold shadow-[0_2px_10px_rgba(212,175,55,0.25)]'
                  : 'bg-panel text-dim hover:text-text border border-line hover:border-line-subtle'
              }`}
            >
              Fat Loss
            </button>
            <button
              onClick={() => setActiveFilter('muscle_gain')}
              className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 btn-interactive ${
                activeFilter === 'muscle_gain'
                  ? 'bg-accent text-black font-semibold shadow-[0_2px_10px_rgba(212,175,55,0.25)]'
                  : 'bg-panel text-dim hover:text-text border border-line hover:border-line-subtle'
              }`}
            >
              Muscle Gain
            </button>
            <button
              onClick={() => setActiveFilter('general')}
              className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 btn-interactive ${
                activeFilter === 'general'
                  ? 'bg-accent text-black font-semibold shadow-[0_2px_10px_rgba(212,175,55,0.25)]'
                  : 'bg-panel text-dim hover:text-text border border-line hover:border-line-subtle'
              }`}
            >
              General Fitness
            </button>
            {upsellClients.length > 0 && (
              <button
                onClick={() => setActiveFilter('upsell')}
                className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 btn-interactive ${
                  activeFilter === 'upsell'
                    ? 'bg-amber-400 text-black font-semibold shadow-[0_2px_10px_rgba(251,191,36,0.3)]'
                    : 'bg-panel text-amber-400/90 hover:text-amber-400 border border-amber-500/30'
                }`}
              >
                Perlu Upsell ({upsellClients.length})
              </button>
            )}
          </div>

          {/* Clients Grid */}
          {filteredClients.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-panel border border-line text-center animate-fade-in">
              <p className="text-dim text-sm mb-3">Tidak ada klien yang cocok dengan kriteria pencarian.</p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setActiveFilter('all')
                  }}
                  className="text-accent text-xs hover:underline font-mono btn-interactive"
                >
                  Reset Filter &amp; Pencarian
                </button>
              )}
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredClients.map((cl, idx) => {
                const pct = cl.pkg_total ? Math.round(((cl.pkg_used || 0) / cl.pkg_total) * 100) : 0
                const remaining = cl.pkg_total - (cl.pkg_used || 0)
                return (
                  <li key={cl.id} style={{ animationDelay: `${idx * 40}ms` }} className="animate-fade-in-up">
                    <a
                      href={`/clients/${cl.id}`}
                      className="bg-panel border border-line hover-gold-glow block rounded-2xl p-4.5 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] group flex flex-col justify-between h-full"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-bg border border-line group-hover:border-accent/70 group-hover:scale-110 flex items-center justify-center text-xs font-bold text-accent transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                              {cl.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-text text-sm group-hover:text-accent transition-colors block">
                                {cl.name}
                              </span>
                              <span className="text-[11px] text-dim">{goalLabel(cl.goal)}</span>
                            </div>
                          </div>
                          <span className="text-dim text-xs font-mono shrink-0">
                            {cl.pkg_used || 0}/{cl.pkg_total} sesi
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-line h-1.5 overflow-hidden rounded-full my-2.5">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              remaining <= 3 ? 'bg-amber-400' : 'bg-accent'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-dim pt-2 border-t border-line/50 mt-2">
                        <span>
                          {cl.last_session_date
                            ? `Sesi: ${formatDate(cl.last_session_date)}`
                            : 'Belum ada sesi'}
                        </span>
                        {cl.avg_rpe ? (
                          <span className="text-text font-mono font-medium group-hover:text-accent transition-colors">
                            RPE {cl.avg_rpe}
                          </span>
                        ) : (
                          <span className="font-mono">{pct}% terpakai</span>
                        )}
                      </div>
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

function goalLabel(g: string) {
  return { fat_loss: 'Fat Loss', muscle_gain: 'Muscle Gain', general: 'General Fitness' }[g] ?? g
}
