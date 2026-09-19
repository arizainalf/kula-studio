import React, { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserPlus,
  Dumbbell,
  Printer,
  Globe,
  Building2,
  ShieldCheck,
  UserCheck,
  UserCog,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { api, type User } from '../lib/api'
import { ThemeToggle } from './ThemeToggle'
import { EditProfileModal } from './EditProfileModal'
import { PlatformAdminModal } from './PlatformAdminModal'
import { AdminUsersModal } from './AdminUsersModal'
import { AdminExerciseModal } from './AdminExerciseModal'
import { ExportPdfModal } from './ExportPdfModal'

export interface AppLayoutContextValue {
  openEditProfile: () => void
  openPlatformAdmin: () => void
  openAdminUsers: () => void
  openAdminExercise: () => void
  openExportPdf: () => void
}

export const AppLayoutContext = React.createContext<AppLayoutContextValue>({
  openEditProfile: () => {},
  openPlatformAdmin: () => {},
  openAdminUsers: () => {},
  openAdminExercise: () => {},
  openExportPdf: () => {},
})

export function useAppLayout() {
  return React.useContext(AppLayoutContext)
}

export interface AppLayoutProps {
  currentUser: User
  children: React.ReactNode
  onProfileUpdated?: (updated: Partial<User>) => void
  activeRoute?: 'dashboard' | 'clients' | 'schedule' | 'new_client' | 'client_detail' | 'other'
}

export function AppLayout({
  currentUser,
  children,
  onProfileUpdated,
  activeRoute,
}: AppLayoutProps) {
  const location = useLocation()
  const pathname = location.pathname

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [user, setUser] = useState<User>(currentUser)

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isPlatformAdminOpen, setIsPlatformAdminOpen] = useState(false)
  const [isAdminUsersOpen, setIsAdminUsersOpen] = useState(false)
  const [isAdminExerciseOpen, setIsAdminExerciseOpen] = useState(false)
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false)

  // Active status determinations
  const isDashboard = activeRoute ? activeRoute === 'dashboard' : pathname === '/'
  const isClients = activeRoute
    ? activeRoute === 'clients'
    : (pathname === '/clients' || pathname === '/clients/') || (pathname.startsWith('/clients/') && pathname !== '/clients/new')
  const isSchedule = activeRoute ? activeRoute === 'schedule' : pathname === '/schedule'
  const isNewClient = activeRoute ? activeRoute === 'new_client' : pathname === '/clients/new'

  async function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
      try {
        await api('/auth/logout', { method: 'POST' })
      } catch {}
      window.location.href = '/login'
    }
  }

  function handleProfileUpdated(updated: Partial<User>) {
    setUser((prev) => ({ ...prev, ...updated }))
    if (onProfileUpdated) {
      onProfileUpdated(updated)
    }
  }

  // Sidebar content (rendered both on desktop fixed sidebar and mobile drawer)
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      {/* Top Part: Brand + Studio Badge + Navigation Links */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-line/40 flex items-center justify-between">
          <Link
            to="/"
            onClick={() => setMobileDrawerOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-panel border border-accent/40 flex items-center justify-center shadow-[0_0_12px_rgba(226,232,0,0.2)] group-hover:border-accent transition-colors">
              <span className="font-extrabold text-sm tracking-tighter text-accent">TL</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-none text-text">
                Train<span className="text-accent">Log</span>
              </span>
              <span className="text-[9px] text-dim tracking-wider uppercase font-mono mt-1">
                Pro PT Manager
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-panel-elevated text-dim hover:text-text transition-colors"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio / Tenant Context Card */}
        <div className="px-3">
          <div className="p-2.5 rounded-xl bg-bg border border-line/50">
            {user.role === 'platform_admin' ? (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-text truncate">Platform SaaS</div>
                  <div className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    Superadmin
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-text truncate" title={user.studio_name || 'Studio Gym'}>
                    {user.studio_name || 'Studio Gym'}
                  </div>
                  <div className="text-[9px] font-mono text-dim uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{user.studio_plan_tier ? user.studio_plan_tier.toUpperCase() : 'PRO'} STUDIO</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)]">
          {/* Section 1: Menu Utama */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-wider text-dim uppercase">
              Menu Utama
            </div>

            <Link
              to="/"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-interactive ${
                isDashboard
                  ? 'bg-accent text-[#141414] font-bold shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                  : 'text-dim hover:text-text hover:bg-panel-elevated/70'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${isDashboard ? 'text-[#141414]' : 'text-dim'}`} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/clients"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-interactive ${
                isClients
                  ? 'bg-accent text-[#141414] font-bold shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                  : 'text-dim hover:text-text hover:bg-panel-elevated/70'
              }`}
            >
              <Users className={`w-4 h-4 ${isClients ? 'text-[#141414]' : 'text-dim'}`} />
              <span>Daftar Klien</span>
            </Link>

            <Link
              to="/schedule"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-interactive ${
                isSchedule
                  ? 'bg-accent text-[#141414] font-bold shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                  : 'text-dim hover:text-text hover:bg-panel-elevated/70'
              }`}
            >
              <Calendar className={`w-4 h-4 ${isSchedule ? 'text-[#141414]' : 'text-dim'}`} />
              <span>Jadwal Sesi</span>
            </Link>

            <Link
              to="/clients/new"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-interactive ${
                isNewClient
                  ? 'bg-accent text-[#141414] font-bold shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                  : 'text-dim hover:text-text hover:bg-panel-elevated/70'
              }`}
            >
              <UserPlus className={`w-4 h-4 ${isNewClient ? 'text-[#141414]' : 'text-dim'}`} />
              <span>Tambah Klien</span>
            </Link>
          </div>

          {/* Section 2: Manajemen & Alat */}
          <div className="space-y-1 pt-1 border-t border-line/30">
            <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-bold tracking-wider text-dim uppercase">
              Manajemen &amp; Alat
            </div>

            {user.role === 'platform_admin' && (
              <button
                type="button"
                onClick={() => {
                  setIsPlatformAdminOpen(true)
                  setMobileDrawerOpen(false)
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-amber-400/10 border border-amber-400/20 transition-all btn-interactive text-left"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Kelola Studio</span>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-400">
                  SAAS
                </span>
              </button>
            )}

            {(user.role === 'admin_studio' || user.role === 'manager' || user.role === 'platform_admin') && (
              <button
                type="button"
                onClick={() => {
                  setIsAdminUsersOpen(true)
                  setMobileDrawerOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-dim hover:text-text hover:bg-panel-elevated/70 transition-all btn-interactive text-left"
              >
                <UserCheck className="w-4 h-4 text-accent shrink-0" />
                <span>Kelola Akun Staf</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsAdminExerciseOpen(true)
                setMobileDrawerOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-dim hover:text-text hover:bg-panel-elevated/70 transition-all btn-interactive text-left"
            >
              <Dumbbell className="w-4 h-4 text-accent shrink-0" />
              <span>Master Gerakan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsExportPdfOpen(true)
                setMobileDrawerOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-dim hover:text-text hover:bg-panel-elevated/70 transition-all btn-interactive text-left"
            >
              <Printer className="w-4 h-4 text-accent shrink-0" />
              <span>Cetak Laporan PDF</span>
            </button>
          </div>

          {/* Section 3: Web Publik */}
          <div className="space-y-1 pt-1 border-t border-line/30">
            <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-bold tracking-wider text-dim uppercase">
              Lainnya
            </div>

            <a
              href="/landing"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-dim hover:text-text hover:bg-panel-elevated/70 transition-all btn-interactive"
            >
              <Globe className="w-4 h-4 text-dim shrink-0" />
              <span>Beranda Publik</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Part: User Profile Card & Quick Actions */}
      <div className="p-3 m-3 rounded-2xl bg-bg border border-line/60 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0 mb-2.5">
          <div className="w-9 h-9 rounded-xl bg-panel border border-accent/40 flex items-center justify-center text-accent font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(226,232,0,0.15)]">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-text truncate">{user.name}</div>
            <div className="text-[10px] text-dim truncate font-mono">{user.email}</div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-2.5">
          <span
            className={`inline-block w-full text-center text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase border ${
              user.role === 'platform_admin'
                ? 'bg-amber-400/20 text-amber-400 border-amber-400/30'
                : user.role === 'admin_studio'
                  ? 'bg-accent/20 text-accent border-accent/30'
                  : user.role === 'manager'
                    ? 'bg-sky-400/20 text-sky-400 border-sky-400/30'
                    : 'bg-panel text-dim border-line'
            }`}
          >
            {user.role === 'admin_studio'
              ? 'Admin Studio'
              : user.role === 'platform_admin'
                ? 'Platform Admin'
                : user.role.toUpperCase()}
          </span>
        </div>

        {/* Toolbar: Theme Toggle, Edit Profile, Logout */}
        <div className="flex items-center justify-between pt-2 border-t border-line/40">
          <ThemeToggle showLabel={false} />

          <button
            type="button"
            onClick={() => {
              setIsEditProfileOpen(true)
              setMobileDrawerOpen(false)
            }}
            className="p-2 rounded-xl hover:bg-panel text-dim hover:text-accent border border-transparent hover:border-line transition-all btn-interactive"
            title="Edit Profil Akun"
          >
            <UserCog className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-rose-500/15 text-dim hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-all btn-interactive"
            title="Keluar dari Akun"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  const contextValue = React.useMemo(
    () => ({
      openEditProfile: () => setIsEditProfileOpen(true),
      openPlatformAdmin: () => setIsPlatformAdminOpen(true),
      openAdminUsers: () => setIsAdminUsersOpen(true),
      openAdminExercise: () => setIsAdminExerciseOpen(true),
      openExportPdf: () => setIsExportPdfOpen(true),
    }),
    []
  )

  return (
    <AppLayoutContext.Provider value={contextValue}>
      <div className="bg-bg text-text min-h-dvh flex font-sans antialiased selection:bg-accent/30 selection:text-text">
        {/* ── 1. Desktop Fixed Left Sidebar ── */}
        <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-30 bg-panel border-r border-line shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
          {renderSidebarContent()}
        </aside>

        {/* ── 2. Mobile Compact Top Navigation Bar ── */}
        <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-panel border-b border-line px-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 rounded-xl bg-bg border border-line text-dim hover:text-text transition-colors btn-interactive"
              title="Buka Navigasi Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-bg border border-accent/40 flex items-center justify-center text-accent font-bold text-xs shadow-sm">
                TL
              </div>
              <span className="font-bold text-sm tracking-tight text-text">
                Train<span className="text-accent">Log</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle showLabel={false} />
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="w-8 h-8 rounded-lg bg-bg border border-accent/40 flex items-center justify-center text-accent font-bold text-xs"
              title="Edit Profil"
            >
              {user.name.slice(0, 2).toUpperCase()}
            </button>
          </div>
        </div>

        {/* ── 3. Mobile Slide-over Drawer ── */}
        {mobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 animate-fade-in">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />

            {/* Drawer Panel */}
            <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-panel border-r border-line shadow-2xl flex flex-col justify-between animate-scale-in">
              {renderSidebarContent()}
            </aside>
          </div>
        )}

        {/* ── 4. Main View Content Area ── */}
        <div className="flex-1 md:pl-64 flex flex-col min-h-screen w-full pt-14 md:pt-0">
          {children}
        </div>

        {/* ── Global Modals (Accessible from anywhere in AppLayout) ── */}
        <PlatformAdminModal
          isOpen={isPlatformAdminOpen}
          onClose={() => setIsPlatformAdminOpen(false)}
          currentUser={user}
        />

        <AdminUsersModal
          isOpen={isAdminUsersOpen}
          onClose={() => setIsAdminUsersOpen(false)}
          currentUser={user}
        />

        <AdminExerciseModal
          isOpen={isAdminExerciseOpen}
          onClose={() => setIsAdminExerciseOpen(false)}
          userRole={user.role}
          onRoleChanged={() => window.location.reload()}
        />

        <ExportPdfModal
          isOpen={isExportPdfOpen}
          onClose={() => setIsExportPdfOpen(false)}
        />

        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUser={user}
          onProfileUpdated={handleProfileUpdated}
        />
      </div>
    </AppLayoutContext.Provider>
  )
}
