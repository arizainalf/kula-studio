import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Dumbbell,
  Plus,
  Printer,
  Globe,
  Sliders,
  LogOut,
  X,
  Menu,
  ChevronRight,
  Sun,
  Moon,
  UserPlus,
  UserCheck,
  UserCog,
} from 'lucide-react'
import { type User } from '../lib/api'
import { useTheme } from './ThemeToggle'
import { UserAvatar } from './UserAvatar'

export interface MobileBottomNavProps {
  currentUser?: User
  clientId?: string
  canLogSession?: boolean
  onScheduleClick?: () => void
  onAddStudioClick?: () => void
  openExportPdf?: () => void
  openEditProfile?: () => void
  handleLogout?: () => void
}

export function MobileBottomNav({
  currentUser,
  clientId,
  canLogSession,
  onScheduleClick,
  openExportPdf,
  openEditProfile,
  handleLogout,
}: MobileBottomNavProps) {
  const location = useLocation()
  const pathname = location.pathname
  const { theme, toggleTheme } = useTheme()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  const role = currentUser?.role || 'pt'
  const isAdmin = role === 'admin'
  const isPT = role === 'pt'

  // Route active states
  const isDashboard = pathname === '/'
  const isSettings = pathname.startsWith('/settings')
  const isUsers = pathname.startsWith('/users')
  const isExercises = pathname.startsWith('/exercises')
  const isClients =
    pathname === '/clients' ||
    pathname === '/clients/' ||
    (pathname.startsWith('/clients/') && !pathname.endsWith('/new'))
  const isSchedule = pathname === '/schedule'

  // PT-specific contextual action: show "Catat Sesi" on client detail page
  const isClientDetail = pathname.startsWith('/clients/') && !pathname.endsWith('/log') && !pathname.endsWith('/new')
  const showCatatSesi = isPT && isClientDetail && Boolean(clientId) && Boolean(canLogSession)

  const isSecondaryRouteActive =
    (isAdmin && (isSchedule || isExercises || isSettings)) ||
    (isPT && isExercises)

  return (
    <>
      {/* ── Fixed Mobile Bottom Navigation Bar (md:hidden) ── */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-panel/85 backdrop-blur-2xl border-t border-line shadow-[0_-4px_25px_rgba(0,0,0,0.35)] px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-all duration-300"
      >
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {/* ══════════ ROLE: ADMIN ══════════ */}
          {isAdmin ? (
            <>
              {/* Tab 1: Dashboard */}
              <Link
                to="/"
                onClick={() => setIsMoreOpen(false)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] ${
                  isDashboard ? 'text-accent font-bold scale-105' : 'text-dim hover:text-text'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mb-1" />
                <span className="text-[10px] tracking-tight leading-none">Dashboard</span>
                {isDashboard && <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />}
              </Link>

              {/* Tab 2: Klien */}
              <Link
                to="/clients"
                onClick={() => setIsMoreOpen(false)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] ${
                  isClients ? 'text-accent font-bold scale-105' : 'text-dim hover:text-text'
                }`}
              >
                <Users className="w-5 h-5 mb-1" />
                <span className="text-[10px] tracking-tight leading-none">Klien</span>
                {isClients && <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />}
              </Link>

              {/* Tab 3: FAB Center Action (+ Klien Baru) */}
              <div className="flex flex-col items-center -mt-6">
                <Link
                  to="/clients/new"
                  onClick={() => setIsMoreOpen(false)}
                  className="w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-[#141414] flex items-center justify-center shadow-[0_0_20px_rgba(226,232,0,0.45)] border-[3px] border-panel hover:scale-105 active:scale-95 transition-all btn-interactive"
                  title="Daftarkan Klien Baru"
                >
                  <UserPlus className="w-6 h-6 stroke-[2.5]" />
                </Link>
                <span className="text-[9px] font-mono font-bold text-accent mt-1 tracking-tight">
                  + Klien
                </span>
              </div>

              {/* Tab 4: Kelola Akun Staf PT */}
              <Link
                to="/users"
                onClick={() => setIsMoreOpen(false)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] ${
                  isUsers ? 'text-accent font-bold scale-105' : 'text-dim hover:text-text'
                }`}
              >
                <UserCheck className="w-5 h-5 mb-1" />
                <span className="text-[10px] tracking-tight leading-none">Staf PT</span>
                {isUsers && <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />}
              </Link>

              {/* Tab 5: Menu / Lainnya */}
              <button
                type="button"
                onClick={() => setIsMoreOpen((prev) => !prev)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] ${
                  isMoreOpen || isSecondaryRouteActive
                    ? 'text-accent font-bold scale-105'
                    : 'text-dim hover:text-text'
                }`}
                title="Menu Lengkap"
                aria-label="Menu Lengkap"
              >
                <Menu className="w-5 h-5 mb-1" />
                <span className="text-[10px] tracking-tight leading-none">Menu</span>
                {(isMoreOpen || isSecondaryRouteActive) && (
                  <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />
                )}
              </button>
            </>
          ) : (
            /* ══════════ ROLE: PERSONAL TRAINER (PT) ══════════ */
            <>
              {/* Tab 1: Dashboard */}
              <Link
                to="/"
                onClick={() => setIsMoreOpen(false)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] ${
                  isDashboard ? 'text-accent font-bold scale-105' : 'text-dim hover:text-text'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mb-1" />
                <span className="text-[10px] tracking-tight leading-none">Dashboard</span>
                {isDashboard && <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />}
              </Link>

              {/* Tab 2: Klien */}
              <Link
                to="/clients"
                onClick={() => setIsMoreOpen(false)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] ${
                  isClients ? 'text-accent font-bold scale-105' : 'text-dim hover:text-text'
                }`}
              >
                <Users className="w-5 h-5 mb-1" />
                <span className="text-[10px] tracking-tight leading-none">Klien</span>
                {isClients && <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />}
              </Link>

              {/* Tab 3: FAB Center Action (Catat Sesi / + Klien Baru) */}
              <div className="flex flex-col items-center -mt-6">
                {showCatatSesi ? (
                  <Link
                    to="/clients/$clientId/log"
                    params={{ clientId: clientId! }}
                    onClick={() => setIsMoreOpen(false)}
                    className="w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-[#141414] flex items-center justify-center shadow-[0_0_20px_rgba(226,232,0,0.45)] border-[3px] border-panel hover:scale-105 active:scale-95 transition-all btn-interactive"
                    title="Catat Sesi Latihan"
                  >
                    <Dumbbell className="w-5 h-5 stroke-[2.5]" />
                  </Link>
                ) : (
                  <Link
                    to="/clients/new"
                    onClick={() => setIsMoreOpen(false)}
                    className="w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-[#141414] flex items-center justify-center shadow-[0_0_20px_rgba(226,232,0,0.45)] border-[3px] border-panel hover:scale-105 active:scale-95 transition-all btn-interactive"
                    title="Daftarkan Klien Baru"
                  >
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </Link>
                )}
                <span className="text-[9px] font-mono font-bold text-accent mt-1 tracking-tight">
                  {showCatatSesi ? 'Catat Sesi' : '+ Klien'}
                </span>
              </div>

              {/* Tab 4: Jadwal */}
              {onScheduleClick ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false)
                    onScheduleClick()
                  }}
                  className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] ${
                    isSchedule ? 'text-accent font-bold scale-105' : 'text-dim hover:text-text'
                  }`}
                  title="Jadwal Sesi"
                >
                  <Calendar className="w-5 h-5 mb-1" />
                  <span className="text-[10px] tracking-tight leading-none">Jadwal</span>
                  {isSchedule && <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />}
                </button>
              ) : (
                <Link
                  to="/schedule"
                  onClick={() => setIsMoreOpen(false)}
                  className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] ${
                    isSchedule ? 'text-accent font-bold scale-105' : 'text-dim hover:text-text'
                  }`}
                >
                  <Calendar className="w-5 h-5 mb-1" />
                  <span className="text-[10px] tracking-tight leading-none">Jadwal</span>
                  {isSchedule && <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />}
                </Link>
              )}

              {/* Tab 5: Menu / Lainnya */}
              <button
                type="button"
                onClick={() => setIsMoreOpen((prev) => !prev)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] ${
                  isMoreOpen || isSecondaryRouteActive
                    ? 'text-accent font-bold scale-105'
                    : 'text-dim hover:text-text'
                }`}
                title="Menu Lengkap"
                aria-label="Menu Lengkap"
              >
                <Menu className="w-5 h-5 mb-1" />
                <span className="text-[10px] tracking-tight leading-none">Menu</span>
                {(isMoreOpen || isSecondaryRouteActive) && (
                  <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />
                )}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Slide-up More Sheet Modal (Clean Full Menu) ── */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="w-full bg-panel border-t border-line rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.8)] max-h-[85vh] flex flex-col overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div className="pt-3 pb-2 px-5 border-b border-line/60 flex items-center justify-between">
              <div className="w-12 h-1.5 rounded-full bg-line/80 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />

              {currentUser ? (
                <div className="flex items-center gap-3 min-w-0 flex-1 pt-2">
                  <UserAvatar
                    name={currentUser.name}
                    avatarUrl={currentUser.avatar_url}
                    role={currentUser.role}
                    size="md"
                    showRoleBadge
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-text truncate">{currentUser.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                          currentUser.role === 'admin'
                            ? 'bg-accent/20 text-accent border border-accent/30'
                            : 'bg-panel-elevated text-dim border border-line'
                        }`}
                      >
                        {currentUser.role === 'admin' ? 'Admin' : 'Personal Trainer'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-bold text-text pt-2">Menu &amp; Fitur Lengkap</div>
              )}

              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-xl text-dim hover:text-text hover:bg-panel-elevated transition-colors btn-interactive shrink-0 mt-2"
                title="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Navigation List */}
            <div className="p-4 space-y-4 overflow-y-auto pb-[max(2rem,env(safe-area-inset-bottom))]">
              {/* ══════════ SECTION 1: ROLE-SPECIFIC FEATURES ══════════ */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono font-bold tracking-wider text-dim uppercase px-1 pb-0.5">
                  {isAdmin ? 'Manajemen & Operasional' : 'Alat & Fitur Pelatih'}
                </div>

                {isAdmin && (
                  <>
                    <Link
                      to="/schedule"
                      onClick={() => setIsMoreOpen(false)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl bg-bg border transition-all btn-interactive ${
                        isSchedule ? 'border-accent/60 bg-accent/5' : 'border-line/60 hover:border-accent/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-xs text-text">Jadwal Sesi</div>
                          <div className="text-[10px] text-dim">Kalender &amp; agenda jadwal latihan</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-dim" />
                    </Link>

                    <Link
                      to="/exercises"
                      onClick={() => setIsMoreOpen(false)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl bg-bg border transition-all btn-interactive ${
                        isExercises ? 'border-accent/60 bg-accent/5' : 'border-line/60 hover:border-accent/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-xs text-text">Master Gerakan</div>
                          <div className="text-[10px] text-dim">Katalog latihan &amp; kategori gerak</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-dim" />
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setIsMoreOpen(false)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl bg-bg border transition-all btn-interactive ${
                        isSettings ? 'border-accent/60 bg-accent/5' : 'border-line/60 hover:border-accent/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                          <Sliders className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-xs text-text">Identitas &amp; Pengaturan</div>
                          <div className="text-[10px] text-dim">Konfigurasi landing page dan profil aplikasi</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
                        CONFIG
                      </span>
                    </Link>
                  </>
                )}

                {isPT && (
                  <Link
                    to="/exercises"
                    onClick={() => setIsMoreOpen(false)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl bg-bg border transition-all btn-interactive ${
                      isExercises ? 'border-accent/60 bg-accent/5' : 'border-line/60 hover:border-accent/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xs text-text">Master Gerakan</div>
                        <div className="text-[10px] text-dim">Katalog latihan &amp; perpustakaan gerakan</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-dim" />
                  </Link>
                )}

                {/* Export PDF (Available to all) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false)
                    openExportPdf?.()
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-bg border border-line/60 hover:border-accent/40 text-xs font-semibold text-text transition-all btn-interactive text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-panel border border-line flex items-center justify-center text-accent shrink-0">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs text-text">Cetak Laporan PDF</div>
                      <div className="text-[10px] text-dim">Ekspor riwayat latihan ke format dokumen</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-dim" />
                </button>
              </div>

              {/* ══════════ SECTION 2: SISTEM & AKUN ══════════ */}
              <div className="space-y-1.5 pt-2 border-t border-line/30">
                <div className="text-[10px] font-mono font-bold tracking-wider text-dim uppercase px-1 pb-0.5">
                  Sistem &amp; Akun
                </div>

                <a
                  href="/landing"
                  onClick={() => setIsMoreOpen(false)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-bg border border-line/60 hover:border-line text-xs font-semibold text-text transition-all btn-interactive"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-panel border border-line flex items-center justify-center text-dim shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs text-text">Beranda Publik</div>
                      <div className="text-[10px] text-dim">Halaman depan pemasaran aplikasi</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-dim" />
                </a>

                {/* Theme Mode Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-bg border border-line/60 hover:border-line text-xs font-semibold text-text transition-all btn-interactive"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-panel border border-line flex items-center justify-center shrink-0">
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4 text-accent" />
                      ) : (
                        <Moon className="w-4 h-4 text-sky-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs text-text">Tema Tampilan</div>
                      <div className="text-[10px] text-dim">
                        Saat ini: {theme === 'dark' ? 'Mode Gelap (Dark)' : 'Mode Terang (Light)'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-panel border border-line text-text">
                    Ganti
                  </span>
                </button>

                {/* Edit Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false)
                    openEditProfile?.()
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-bg border border-line/60 hover:border-accent/40 text-xs font-semibold text-text transition-all btn-interactive"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                      <UserCog className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs text-text">Edit Profil &amp; Password</div>
                      <div className="text-[10px] text-dim">Ubah data akun dan sandi login</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-dim" />
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false)
                    handleLogout?.()
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 transition-all btn-interactive"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs text-rose-300">Keluar dari Akun</div>
                      <div className="text-[10px] text-rose-300/70">Akhiri sesi login akun ini</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
