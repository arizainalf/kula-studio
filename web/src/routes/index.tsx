import { useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { api, type User, type PlatformSettings } from '../lib/api'
import { LandingPage } from '../components/LandingPage'
import {
  StatCard,
  GoalDistributionCard,
  RpeSpectrumCard,
  type ClientSummary,
} from '../components/DashboardCharts'
import { AppLayout } from '../components/AppLayout'
import { usePlatformSettings } from '../lib/platformSettings'
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
  MessageSquare,
  ArrowRight,
  Building2,
  ShieldCheck,
  Dumbbell,
} from 'lucide-react'
import { UserAvatar } from '../components/UserAvatar'

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
  settings: PlatformSettings | null
  studioCount: number
  activeStudioCount: number
  ptCount: number
  activePtCount: number
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

      const isPlatformAdmin = meRes.user.role === 'platform_admin'
      const canViewStaff = isPlatformAdmin || meRes.user.role === 'admin_studio' || meRes.user.role === 'manager'

      const [clientsRes, schedRes, settingsRes, studiosRes, staffRes] = await Promise.all([
        api<{ clients: Client[] }>('/clients').catch(() => ({ clients: [] })),
        api<{ schedule: ScheduleItem[] }>(`/schedule?from=${today}&to=${nextWeekDate}`).catch(() => ({ schedule: [] })),
        api<{ settings: PlatformSettings }>('/platform/settings').catch(() => ({ settings: null as any })),
        isPlatformAdmin
          ? api<{ studios: any[] }>('/platform/studios').catch(() => ({ studios: [] }))
          : Promise.resolve({ studios: [] }),
        canViewStaff
          ? api<{ staff: any[] }>('/staff?role=pt').catch(() => ({ staff: [] }))
          : Promise.resolve({ staff: [] }),
      ])

      const studios = studiosRes?.studios || []
      const staffList = staffRes?.staff || []

      return {
        me: meRes.user,
        clients: clientsRes.clients,
        schedule: schedRes.schedule,
        settings: settingsRes.settings,
        studioCount: studios.length,
        activeStudioCount: studios.filter((s: any) => s.is_active !== false).length,
        ptCount: staffList.length,
        activePtCount: staffList.filter((s: any) => s.is_active !== false).length,
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'to' in e) throw e
      const settingsRes = await api<{ settings: PlatformSettings }>('/platform/settings').catch(() => ({ settings: null as any }))
      return {
        me: null,
        clients: [],
        schedule: [],
        settings: settingsRes.settings,
        studioCount: 0,
        activeStudioCount: 0,
        ptCount: 0,
        activePtCount: 0,
      }
    }
  },
  component: RootIndex,
})

function RootIndex() {
  const { me, clients, schedule, settings, studioCount, activeStudioCount, ptCount, activePtCount } = Route.useLoaderData()

  if (!me) {
    return <LandingPage currentUser={null} initialSettings={settings} />
  }

  return (
    <Dashboard
      me={me}
      clients={clients}
      schedule={schedule}
      settings={settings}
      studioCount={studioCount}
      activeStudioCount={activeStudioCount}
      ptCount={ptCount}
      activePtCount={activePtCount}
    />
  )
}

function Dashboard({
  me: initialMe,
  clients,
  schedule,
  settings,
  studioCount,
  activeStudioCount,
  ptCount,
  activePtCount,
}: {
  me: User
  clients: Client[]
  schedule: ScheduleItem[]
  settings: PlatformSettings | null
  studioCount: number
  activeStudioCount: number
  ptCount: number
  activePtCount: number
}) {
  const [currentUser, setCurrentUser] = useState<User>(initialMe)
  const platformSettings = usePlatformSettings(settings)

  return (
    <AppLayout
      currentUser={currentUser}
      activeRoute="dashboard"
      onProfileUpdated={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
    >
      <DashboardContent
        currentUser={currentUser}
        clients={clients}
        schedule={schedule}
        platformSettings={platformSettings}
        studioCount={studioCount}
        activeStudioCount={activeStudioCount}
        ptCount={ptCount}
        activePtCount={activePtCount}
      />
    </AppLayout>
  )
}

function DashboardContent({
  currentUser,
  clients,
  schedule,
  platformSettings,
  studioCount = 0,
  activeStudioCount = 0,
  ptCount = 0,
  activePtCount = 0,
}: {
  currentUser: User
  clients: Client[]
  schedule: ScheduleItem[]
  platformSettings: PlatformSettings
  studioCount?: number
  activeStudioCount?: number
  ptCount?: number
  activePtCount?: number
}) {
  const isPlatformAdmin = currentUser.role === 'platform_admin'
  const isAdminStudio = currentUser.role === 'admin_studio'

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

  const gridColsClass = isPlatformAdmin
    ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6'
    : isAdminStudio
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
      : 'grid-cols-2 lg:grid-cols-4'

  return (
    <main className="flex-1 w-full p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-12">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* ── 2. Coach Greeting & Hero Action Card ── */}
          <div className="hover-gold-glow p-4 sm:p-6 rounded-2xl bg-panel border border-line shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 animate-fade-in">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Coach Avatar with Online Badge */}
              <div className="relative shrink-0">
                <UserAvatar
                  name={currentUser.name}
                  avatarUrl={currentUser.avatar_url}
                  role={currentUser.role}
                  size="xl"
                  shape="rounded-2xl"
                  showRoleBadge
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-panel animate-pulse"
                  title="Akun Aktif"
                />
              </div>

              {/* Coach Information & Plan */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-mono text-dim uppercase tracking-wider">
                    {currentUser.role === 'platform_admin'
                      ? 'Portal Platform Admin'
                      : currentUser.role === 'admin_studio'
                        ? 'Portal Admin Studio'
                        : currentUser.role === 'manager'
                          ? 'Portal Manager Studio'
                          : 'Portal Pelatih'}
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
                  {currentUser.role === 'platform_admin' ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-400 border border-amber-400/40 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      PLATFORM ADMIN (SAAS)
                    </span>
                  ) : (
                    <>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/30 uppercase">
                        {currentUser.role === 'admin_studio' ? 'Admin Studio' : currentUser.role}
                      </span>
                      {currentUser.studio_name && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-bg text-text border border-line flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-accent" />
                          <span>{currentUser.studio_name}</span>
                        </span>
                      )}
                    </>
                  )}
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

            {/* Executive Live Summary Info */}
            <div className="w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-line/60 flex items-center sm:flex-col sm:items-end justify-between gap-1 text-right">
              <div className="text-xs font-mono text-dim flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ringkasan Real-Time</span>
              </div>
              <div className="text-xs sm:text-sm font-medium text-text">
                {formatDate(getLocalTodayString())}
              </div>
            </div>
          </div>

        {/* ── Executive KPI Stat Cards ── */}
        <section className={`grid ${gridColsClass} gap-2.5 sm:gap-4 animate-fade-in-up`}>
          {/* Platform Admin: Total Studio */}
          {isPlatformAdmin && (
            <StatCard
              title="Total Studio"
              value={studioCount}
              subtitle={studioCount > 0 ? `${activeStudioCount} studio aktif di platform` : 'Belum ada studio'}
              badge={{ text: 'SAAS', type: 'gold' }}
              icon={<Building2 className="w-5 h-5 text-accent opacity-80" />}
              href="/studios"
            />
          )}

          {/* Platform Admin & Admin Studio: Total PT */}
          {(isPlatformAdmin || isAdminStudio) && (
            <StatCard
              title="Total PT"
              value={ptCount}
              subtitle={
                isPlatformAdmin
                  ? (ptCount > 0 ? `${activePtCount} pelatih di seluruh studio` : 'Belum ada pelatih')
                  : (ptCount > 0 ? `${activePtCount} pelatih di studio ini` : 'Belum ada pelatih')
              }
              badge={{ text: isPlatformAdmin ? 'PLATFORM' : 'STUDIO', type: 'gold' }}
              icon={<Dumbbell className="w-5 h-5 text-accent opacity-80" />}
              href="/users"
            />
          )}

          <StatCard
            title="Total Klien"
            value={totalClients}
            subtitle={`${clients.filter((c) => c.is_active !== false).length} klien berstatus aktif`}
            badge={{ text: 'TERDAFTAR', type: 'gold' }}
            icon={<Users className="w-5 h-5 text-accent opacity-80" />}
            href="/clients"
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
            href="/schedule"
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
                const appName = platformSettings.app_name || 'TrainLog'
                const waMessage = encodeURIComponent(
                  `Halo ${cl.name}, sesi latihan personal training kamu di ${appName} tersisa ${remaining} sesi lagi. Yuk kita amankan slot jadwal untuk paket berikutnya!`
                )
                return (
                  <div
                    key={cl.id}
                    className="p-3.5 rounded-xl bg-panel border border-line hover-gold-glow flex items-center justify-between gap-2 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar
                        name={cl.name}
                        avatarUrl={cl.avatar_url}
                        role="client"
                        size="sm"
                        shape="rounded-xl"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-text truncate">{cl.name}</div>
                        <div className="text-[11px] font-mono text-amber-400 font-medium">
                          {remaining <= 0 ? 'Habis (0 sesi)' : `Sisa ${remaining} sesi (${cl.pkg_used}/${cl.pkg_total})`}
                        </div>
                      </div>
                    </div>
                    {cl.phone ? (
                      <a
                        href={`https://wa.me/${cl.phone.replace(/\D/g, '')}?text=${waMessage}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#141414] bg-accent hover:bg-accent/90 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 shrink-0 btn-interactive hover:shadow-[0_4px_12px_rgba(226,232,0,0.35)]"
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
                      className="p-2.5 rounded-xl bg-panel-elevated border border-line flex items-center justify-between text-xs"
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
                    <p className="text-[11px] text-dim">
                      Total {clients.length} klien terdaftar {isPlatformAdmin ? 'di platform' : 'di studio'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-accent bg-accent/10 px-2.5 py-0.5 rounded-lg border border-accent/20">
                  {clients.length} Klien
                </span>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2 text-center my-2">
                <div className="p-2.5 rounded-xl bg-panel-elevated border border-line">
                  <div className="text-base sm:text-lg font-bold text-text">
                    {clients.filter((c) => c.goal === 'fat_loss').length}
                  </div>
                  <div className="text-[10px] text-dim font-mono uppercase mt-0.5">Fat Loss</div>
                </div>
                <div className="p-2.5 rounded-xl bg-panel-elevated border border-line">
                  <div className="text-base sm:text-lg font-bold text-text">
                    {clients.filter((c) => c.goal === 'muscle_gain').length}
                  </div>
                  <div className="text-[10px] text-dim font-mono uppercase mt-0.5">Muscle</div>
                </div>
                <div className="p-2.5 rounded-xl bg-panel-elevated border border-line">
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
  )
}
