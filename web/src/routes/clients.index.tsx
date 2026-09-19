import { useState } from 'react'
import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { api, type User } from '../lib/api'
import { ThemeToggle } from '../components/ThemeToggle'
import { MobileBottomNav } from '../components/MobileBottomNav'
import { EditProfileModal } from '../components/EditProfileModal'
import { formatDate } from '../lib/date'
import type { Client } from './index'
import {
  Users,
  UserPlus,
  Search,
  X,
  Plus,
  ArrowRight,
  MessageSquare,
  Globe,
  LogOut,
  UserCog,
} from 'lucide-react'

export const Route = createFileRoute('/clients/')({
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
    const [meRes, clientsRes] = await Promise.all([
      api<{ user: User }>('/auth/me'),
      api<{ clients: Client[] }>('/clients').catch(() => ({ clients: [] })),
    ])

    return {
      me: meRes.user,
      clients: clientsRes.clients,
    }
  },
  component: ClientsDirectoryPage,
})

function ClientsDirectoryPage() {
  const { me: initialMe, clients } = Route.useLoaderData()
  const [currentUser, setCurrentUser] = useState<User>(initialMe)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'fat_loss' | 'muscle_gain' | 'general' | 'upsell'>('all')

  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    location.href = '/'
  }

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
            <Link to="/clients" className="text-accent font-bold">
              Klien
            </Link>
            <Link to="/schedule" className="hover:text-accent transition-colors">
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

      {/* ── Main Clients Directory Body ── */}
      <main className="p-3.5 sm:p-8 md:p-10 pt-4 sm:pt-6 pb-24 sm:pb-10">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header & CTA Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-panel border border-accent/40 flex items-center justify-center text-accent shadow-sm shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-text">
                  Direktori Klien
                </h1>
                <p className="text-xs text-dim">
                  Kelola data kebugaran, progres kuota paket, dan program latihan klien
                </p>
              </div>
            </div>

            <a
              href="/clients/new"
              className="btn-interactive self-start sm:self-auto bg-accent hover:bg-accent/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-[#141414] shadow-[0_2px_14px_rgba(226,232,0,0.25)] hover:shadow-[0_4px_20px_rgba(226,232,0,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Tambah Klien Baru</span>
            </a>
          </div>

          {/* Search & Filter Header Bar */}
          <div className="space-y-3.5 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-dim">Filter Kategori:</span>
                <span className="text-xs font-mono text-accent bg-panel px-2.5 py-0.5 rounded-lg border border-line">
                  {filteredClients.length} Klien Ditemukan
                </span>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari nama, nomor HP, atau catatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-panel border border-line rounded-xl pl-8.5 pr-8 py-2.5 text-sm sm:text-xs text-text placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200"
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
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar touch-scroll -mx-1 px-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 btn-interactive ${
                  activeFilter === 'all'
                    ? 'bg-accent text-[#141414] font-semibold shadow-[0_2px_10px_rgba(226,232,0,0.25)]'
                    : 'bg-panel text-dim hover:text-text border border-line hover:border-line-subtle'
                }`}
              >
                Semua ({clients.length})
              </button>
              <button
                onClick={() => setActiveFilter('fat_loss')}
                className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 btn-interactive ${
                  activeFilter === 'fat_loss'
                    ? 'bg-accent text-[#141414] font-semibold shadow-[0_2px_10px_rgba(226,232,0,0.25)]'
                    : 'bg-panel text-dim hover:text-text border border-line hover:border-line-subtle'
                }`}
              >
                Fat Loss
              </button>
              <button
                onClick={() => setActiveFilter('muscle_gain')}
                className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 btn-interactive ${
                  activeFilter === 'muscle_gain'
                    ? 'bg-accent text-[#141414] font-semibold shadow-[0_2px_10px_rgba(226,232,0,0.25)]'
                    : 'bg-panel text-dim hover:text-text border border-line hover:border-line-subtle'
                }`}
              >
                Muscle Gain
              </button>
              <button
                onClick={() => setActiveFilter('general')}
                className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 btn-interactive ${
                  activeFilter === 'general'
                    ? 'bg-accent text-[#141414] font-semibold shadow-[0_2px_10px_rgba(226,232,0,0.25)]'
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
                      ? 'bg-amber-400 text-[#141414] font-semibold shadow-[0_2px_10px_rgba(251,191,36,0.3)]'
                      : 'bg-panel text-amber-400/90 hover:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  Perlu Upsell ({upsellClients.length})
                </button>
              )}
            </div>
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
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 animate-fade-in-up">
              {filteredClients.map((cl, idx) => {
                const pct = cl.pkg_total ? Math.round(((cl.pkg_used || 0) / cl.pkg_total) * 100) : 0
                const remaining = cl.pkg_total - (cl.pkg_used || 0)
                const isUrgent = cl.pkg_total > 0 && remaining <= 3
                return (
                  <li key={cl.id} style={{ animationDelay: `${idx * 40}ms` }} className="animate-fade-in-up">
                    <div className="hover-gold-glow group rounded-2xl bg-panel border border-line p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(212,175,55,0.2)] transition-all duration-300">
                      <div>
                        {/* Top Client Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-bg border border-accent/30 group-hover:border-accent flex items-center justify-center font-bold text-accent text-sm shrink-0 transition-colors">
                              {cl.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <a
                                href={`/clients/${cl.id}`}
                                className="font-bold text-text text-sm sm:text-base group-hover:text-accent transition-colors truncate block"
                              >
                                {cl.name}
                              </a>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg text-dim border border-line capitalize">
                                  {goalLabel(cl.goal)}
                                </span>
                                {cl.pt_name && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                                    PT: {cl.pt_name}
                                  </span>
                                )}
                                {isUrgent && (
                                  <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 font-bold">
                                    Sisa {remaining}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quota Progress Bar */}
                        <div className="my-3 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-dim">Kuota Paket</span>
                            <span className="text-text font-bold">
                              {cl.pkg_used || 0} / {cl.pkg_total || 0} Sesi
                            </span>
                          </div>
                          <div className="w-full bg-bg h-2 rounded-full overflow-hidden border border-line/60">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isUrgent
                                  ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                                  : 'bg-accent shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Metrics Row */}
                        <div className="flex items-center justify-between text-xs text-dim border-t border-line/60 pt-2.5">
                          <span className="text-[11px]">
                            {cl.last_session_date
                              ? `Sesi terakhir: ${formatDate(cl.last_session_date)}`
                              : 'Belum ada riwayat sesi'}
                          </span>
                          {cl.avg_rpe ? (
                            <span className="text-text font-mono font-bold text-xs bg-bg px-2 py-0.5 rounded border border-line">
                              RPE {cl.avg_rpe}
                            </span>
                          ) : (
                            <span className="font-mono text-[11px]">{pct}% terpakai</span>
                          )}
                        </div>
                      </div>

                      {/* Action Links Bar */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-line/50">
                        <a
                          href={`/clients/${cl.id}`}
                          className="text-xs text-dim hover:text-text font-medium flex items-center gap-1 transition-colors btn-interactive py-1"
                        >
                          <span>Lihat Profil</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>

                        <div className="flex items-center gap-1.5">
                          {cl.phone && (
                            <a
                              href={`https://wa.me/${cl.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat WhatsApp Klien"
                              className="w-7 h-7 rounded-lg bg-bg border border-line hover:border-emerald-500/40 text-dim hover:text-emerald-400 flex items-center justify-center transition-colors btn-interactive"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <a
                            href={`/clients/${cl.id}/log`}
                            className="text-xs font-semibold text-[#141414] bg-accent hover:bg-accent-hover px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all btn-interactive shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Catat Sesi</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
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

function goalLabel(g: string) {
  return { fat_loss: 'Fat Loss', muscle_gain: 'Muscle Gain', general: 'General Fitness' }[g] ?? g
}
