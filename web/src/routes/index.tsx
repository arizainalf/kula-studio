import { useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { api, type User } from '../lib/api'
import { LandingPage } from '../components/LandingPage'
import {
  StatCard,
  GoalDistributionCard,
  RpeSpectrumCard,
  type ClientSummary,
} from '../components/DashboardCharts'
import { ThemeToggle } from '../components/ThemeToggle'
import { MobileBottomNav } from '../components/MobileBottomNav'
import { ExportPdfModal } from '../components/ExportPdfModal'
import { AdminExerciseModal } from '../components/AdminExerciseModal'
import { EditProfileModal } from '../components/EditProfileModal'
import { AdminUsersModal } from '../components/AdminUsersModal'
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
  Printer,
  Dumbbell,
  UserCog,
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
      if (meRes.user.role === 'client') {
        throw redirect({ to: '/portal' })
      }

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
    } catch (e) {
      if (e && typeof e === 'object' && 'to' in e) throw e
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

function Dashboard({ me: initialMe, clients, schedule }: { me: User; clients: Client[]; schedule: ScheduleItem[] }) {
  const [currentUser, setCurrentUser] = useState<User>(initialMe)
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false)
  const [isAdminExerciseOpen, setIsAdminExerciseOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isAdminUsersOpen, setIsAdminUsersOpen] = useState(false)

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

  return (
    <div className="bg-bg text-text min-h-dvh selection:bg-accent/30 selection:text-text font-sans antialiased">
      {/* ── 1. Top Global Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-xl border-b border-line">
        <div className="mx-auto max-w-6xl px-3.5 sm:px-8 md:px-10 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-panel border border-accent/40 flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.15)] group-hover:border-accent transition-colors">
              <span className="font-extrabold text-xs tracking-tighter text-accent">TL</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base tracking-tight leading-none text-text">
                Train<span className="text-accent">Log</span>
              </span>
              <span className="text-[9px] text-dim tracking-wider uppercase font-mono mt-0.5">
                Pro PT Manager
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-mono text-dim">
            <Link to="/" className="text-accent font-bold">
              Dashboard
            </Link>
            <Link to="/clients" className="hover:text-accent transition-colors">
              Klien
            </Link>
            <Link to="/schedule" className="hover:text-accent transition-colors">
              Jadwal
            </Link>
            {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
              <button
                type="button"
                onClick={() => setIsAdminUsersOpen(true)}
                className="hover:text-accent transition-colors flex items-center gap-1.5 text-dim cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-accent" />
                <span>Kelola Akun</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAdminExerciseOpen(true)}
              className="hover:text-accent transition-colors flex items-center gap-1.5 text-dim cursor-pointer"
            >
              <Dumbbell className="w-3.5 h-3.5 text-accent" />
              <span>Master Gerakan</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExportPdfOpen(true)}
              className="hover:text-accent transition-colors flex items-center gap-1.5 text-dim cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-accent" />
              <span>Laporan PDF</span>
            </button>
          </nav>

          {/* Quick Actions (Theme Toggle, Public Landing & Logout) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle showLabel={false} />

            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="btn-interactive text-dim hover:text-accent p-2 sm:px-3 sm:py-1.5 rounded-lg border border-line hover:border-accent/40 transition-colors flex items-center gap-1.5 text-xs font-mono"
              title="Edit Profil Akun Saya"
            >
              <UserCog className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Edit Akun</span>
            </button>

            <a
              href="/landing"
              className="btn-interactive text-dim hover:text-accent p-2 sm:px-3 sm:py-1.5 rounded-lg border border-line hover:border-accent/40 transition-colors flex items-center gap-1.5 text-xs font-mono"
              title="Buka Beranda Publik"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Beranda Publik</span>
            </a>

            <button
              onClick={logout}
              className="btn-interactive text-dim hover:text-rose-400 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-line hover:border-rose-500/40 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Keluar dari Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Dashboard Body ── */}
      <main className="p-3.5 sm:p-8 md:p-10 pt-4 sm:pt-6 pb-24 sm:pb-10">
        <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
          {/* ── 2. Coach Greeting & Hero Action Card ── */}
          <div className="hover-gold-glow p-4 sm:p-6 rounded-2xl bg-panel border border-line shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 animate-fade-in">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Coach Avatar with Online Badge */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-bg border border-accent/40 flex items-center justify-center text-accent font-extrabold text-base sm:text-lg shadow-[0_0_20px_rgba(212,175,55,0.18)]">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-panel animate-pulse"
                  title="Akun Aktif"
                />
              </div>

              {/* Coach Information & Plan */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-mono text-dim uppercase tracking-wider">
                    Portal Pelatih
                  </span>
                  <span className="text-muted text-[10px] font-mono hidden sm:inline">&bull;</span>
                  <span className="text-[10px] font-mono text-emerald-400 hidden sm:inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online
                  </span>
                </div>
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-text truncate mt-0.5">
                  Selamat Datang, {currentUser.name}
                </h1>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/30 uppercase">
                    {currentUser.role}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-bg text-text border border-line">
                    {currentUser.plan_tier ? `${currentUser.plan_tier.toUpperCase()} TIER` : 'STANDARD'}
                  </span>
                  {currentUser.expires_at && (
                    <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-dim" />
                      <span>Aktif s/d {formatDate(currentUser.expires_at)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-line/60 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="btn-interactive flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-panel hover:bg-panel-elevated border border-line hover:border-accent/40 text-text text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                title="Edit Profil dan Password Akun Saya"
              >
                <UserCog className="w-4 h-4 text-accent" />
                <span>Edit Profil</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAdminExerciseOpen(true)}
                className="btn-interactive flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-panel hover:bg-panel-elevated border border-line hover:border-accent/40 text-text text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                title="Kelola Master Gerakan & Kategori Latihan"
              >
                <Dumbbell className="w-4 h-4 text-accent" />
                <span>Master Gerakan</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                    : 'bg-bg text-dim border border-line'
                }`}>
                  {currentUser.role}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsExportPdfOpen(true)}
                className="btn-interactive flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-panel hover:bg-panel-elevated border border-line hover:border-accent/40 text-text text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                title="Cetak dan Ekspor Laporan Sesi Latihan ke PDF"
              >
                <Printer className="w-4 h-4 text-accent" />
                <span>Cetak Laporan PDF</span>
              </button>

              <a
                href="/clients/new"
                className="btn-interactive w-full sm:w-auto bg-accent hover:bg-accent/90 rounded-xl px-4 py-2.5 sm:px-5 text-sm font-bold text-black shadow-[0_2px_14px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Klien Baru</span>
              </a>
            </div>
          </div>

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

        {/* ── 5. Visual Analytics Row ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-fade-in-up">
          <GoalDistributionCard clients={clients} />
          <RpeSpectrumCard clients={clients} />
        </section>

        {/* ── 6. Executive Overview & Fast Navigation Hub ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-fade-in-up">
          {/* Card A: Upcoming Schedule Snapshot */}
          <div className="hover-gold-glow p-5 sm:p-6 rounded-2xl bg-panel border border-line flex flex-col justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-line mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-bg border border-accent/40 flex items-center justify-center text-accent">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text">Agenda Latihan Terdekat</h3>
                    <p className="text-[11px] text-dim">Sesi personal training pekan ini</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-accent bg-accent/10 px-2.5 py-0.5 rounded-lg border border-accent/20">
                  {schedule.length} Sesi
                </span>
              </div>

              {schedule.length === 0 ? (
                <div className="py-6 text-center text-xs text-dim bg-bg/40 rounded-xl border border-dashed border-line/60">
                  Belum ada sesi latihan terjadwal dalam waktu dekat.
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {schedule.slice(0, 3).map((item) => (
                    <li
                      key={item.id}
                      className="p-2.5 rounded-xl bg-bg border border-line/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                        <span className="font-semibold text-text truncate">{item.client_name || 'Klien'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-dim font-mono text-[11px] shrink-0">
                        <span>{formatShortDate(item.date)}</span>
                        <span>&bull;</span>
                        <span className="text-accent font-bold">{formatTime(item.time)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-2 border-t border-line/50 flex items-center justify-between">
              <span className="text-[11px] text-dim font-mono">Kelola agenda lengkap</span>
              <Link
                to="/schedule"
                className="btn-interactive text-xs font-semibold text-accent hover:underline flex items-center gap-1.5"
              >
                <span>Buka Jadwal Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card B: Clients Directory Snapshot */}
          <div className="hover-gold-glow p-5 sm:p-6 rounded-2xl bg-panel border border-line flex flex-col justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-line mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-bg border border-accent/40 flex items-center justify-center text-accent">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text">Status Direktori Klien</h3>
                    <p className="text-[11px] text-dim">Total {clients.length} klien terdaftar di studio</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-accent bg-accent/10 px-2.5 py-0.5 rounded-lg border border-accent/20">
                  {clients.length} Klien
                </span>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2 text-center my-2">
                <div className="p-2.5 rounded-xl bg-bg border border-line">
                  <div className="text-base sm:text-lg font-bold text-text">
                    {clients.filter((c) => c.goal === 'fat_loss').length}
                  </div>
                  <div className="text-[10px] text-dim font-mono uppercase mt-0.5">Fat Loss</div>
                </div>
                <div className="p-2.5 rounded-xl bg-bg border border-line">
                  <div className="text-base sm:text-lg font-bold text-text">
                    {clients.filter((c) => c.goal === 'muscle_gain').length}
                  </div>
                  <div className="text-[10px] text-dim font-mono uppercase mt-0.5">Muscle</div>
                </div>
                <div className="p-2.5 rounded-xl bg-bg border border-line">
                  <div className="text-base sm:text-lg font-bold text-text">
                    {clients.filter((c) => c.goal !== 'fat_loss' && c.goal !== 'muscle_gain').length}
                  </div>
                  <div className="text-[10px] text-dim font-mono uppercase mt-0.5">General</div>
                </div>
              </div>

              {upsellClients.length > 0 && (
                <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] flex items-center justify-between px-3 mt-2">
                  <span>Perlu perpanjangan paket:</span>
                  <span className="font-bold font-mono">{upsellClients.length} Klien</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-line/50 flex items-center justify-between">
              <span className="text-[11px] text-dim font-mono">Daftar &amp; riwayat</span>
              <Link
                to="/clients"
                className="btn-interactive text-xs font-semibold text-accent hover:underline flex items-center gap-1.5"
              >
                <span>Buka Direktori Klien</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>

    {/* ── Mobile Bottom Navigation Bar (App Experience) ── */}
    <MobileBottomNav />

    {/* ── Modals ── */}
    <ExportPdfModal
      isOpen={isExportPdfOpen}
      onClose={() => setIsExportPdfOpen(false)}
      clientsList={clients.map((c) => ({ id: c.id, name: c.name }))}
    />

    <AdminExerciseModal
      isOpen={isAdminExerciseOpen}
      onClose={() => setIsAdminExerciseOpen(false)}
      userRole={currentUser.role}
      onRoleChanged={() => location.reload()}
    />

    <EditProfileModal
      isOpen={isEditProfileOpen}
      onClose={() => setIsEditProfileOpen(false)}
      currentUser={currentUser}
      onProfileUpdated={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
    />

    <AdminUsersModal
      isOpen={isAdminUsersOpen}
      onClose={() => setIsAdminUsersOpen(false)}
      currentUser={currentUser}
    />
  </div>
  )
}
