import { useState } from 'react'
import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { api, type User } from '../lib/api'
import { WeeklyScheduleSection } from '../components/WeeklyScheduleSection'
import { ThemeToggle } from '../components/ThemeToggle'
import { MobileBottomNav } from '../components/MobileBottomNav'
import { EditProfileModal } from '../components/EditProfileModal'
import { getLocalTodayString, getLocalFutureDateString } from '../lib/date'
import type { Client, ScheduleItem } from './index'
import { Calendar, Globe, LogOut, UserCog } from 'lucide-react'

export const Route = createFileRoute('/schedule')({
  beforeLoad: async () => {
    try {
      const res = await api<{ user: User }>('/auth/me')
      if (res.user.role === 'client') throw redirect({ to: '/portal' })
    } catch (e) {
      if (e && typeof e === 'object' && 'to' in e) throw e
      throw redirect({ to: '/login' })
    }
  },
  loader: async () => {
    const today = getLocalTodayString()
    const nextWeekDate = getLocalFutureDateString(14)

    const [meRes, clientsRes, schedRes] = await Promise.all([
      api<{ user: User }>('/auth/me'),
      api<{ clients: Client[] }>('/clients').catch(() => ({ clients: [] })),
      api<{ schedule: ScheduleItem[] }>(`/schedule?from=${today}&to=${nextWeekDate}`).catch(() => ({ schedule: [] })),
    ])

    return {
      me: meRes.user,
      clients: clientsRes.clients,
      schedule: schedRes.schedule,
    }
  },
  component: SchedulePage,
})

function SchedulePage() {
  const { me: initialMe, clients, schedule } = Route.useLoaderData()
  const [currentUser, setCurrentUser] = useState<User>(initialMe)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    location.href = '/'
  }

  return (
    <div className="bg-bg text-text min-h-dvh selection:bg-accent/30 selection:text-text font-sans antialiased">
      {/* ── 1. Top Global Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-panel backdrop-blur-xl border-b border-line">
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
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-dim">
            <Link to="/" className="hover:text-accent transition-colors">
              Dashboard
            </Link>
            <Link to="/clients" className="hover:text-accent transition-colors">
              Klien
            </Link>
            <Link to="/schedule" className="text-accent font-bold">
              Jadwal
            </Link>
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

      {/* ── Main Schedule Body ── */}
      <main className="p-3.5 sm:p-8 md:p-10 pt-4 sm:pt-6 pb-24 sm:pb-10">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-panel border border-accent/40 flex items-center justify-center text-accent shadow-sm shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-text">
                  Jadwal Sesi Latihan
                </h1>
                <p className="text-xs text-dim">
                  Kelola slot waktu dan agenda sesi latihan personal training
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-accent bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20">
                {schedule.length} Sesi Terjadwal
              </span>
            </div>
          </div>

          {/* Weekly Schedule Interactive Module */}
          <div className="animate-fade-in-up">
            <WeeklyScheduleSection
              schedule={schedule}
              clients={clients}
              onScheduleChange={() => {
                location.reload()
              }}
            />
          </div>
        </div>
      </main>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <MobileBottomNav />

      {/* ── Edit Profile Modal ── */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={(updated) => setCurrentUser((prev: User) => ({ ...prev, ...updated }))}
      />
    </div>
  )
}
