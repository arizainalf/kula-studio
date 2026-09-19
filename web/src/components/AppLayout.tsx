import React, { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Dumbbell,
  Printer,
  Globe,
  Building2,
  ShieldCheck,
  UserCheck,
  UserCog,
  LogOut,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { api, type User } from '../lib/api'
import { ThemeToggle } from './ThemeToggle'
import { EditProfileModal } from './EditProfileModal'
import { PlatformAdminModal } from './PlatformAdminModal'
import { AdminUsersModal } from './AdminUsersModal'
import { AdminExerciseModal } from './AdminExerciseModal'
import { ExportPdfModal } from './ExportPdfModal'
import { UserAvatar } from './UserAvatar'
import { usePlatformSettings, formatBrandName } from '../lib/platformSettings'
import { MobileBottomNav } from './MobileBottomNav'

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
  activeRoute?:
    | 'dashboard'
    | 'clients'
    | 'schedule'
    | 'new_client'
    | 'client_detail'
    | 'studios'
    | 'users'
    | 'exercises'
    | 'settings'
    | 'other'
  clientId?: string
  canLogSession?: boolean
  onScheduleClick?: () => void
  onAddStudioClick?: () => void
}

export function AppLayout({
  currentUser,
  children,
  onProfileUpdated,
  activeRoute,
  clientId,
  canLogSession,
  onScheduleClick,
  onAddStudioClick,
}: AppLayoutProps) {
  const location = useLocation()
  const pathname = location.pathname

  const [user, setUser] = useState<User>(currentUser)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('trainlog_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('trainlog_sidebar_collapsed', String(next))
      } catch {}
      return next
    })
  }

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isPlatformAdminOpen, setIsPlatformAdminOpen] = useState(false)
  const [isAdminUsersOpen, setIsAdminUsersOpen] = useState(false)
  const [isAdminExerciseOpen, setIsAdminExerciseOpen] = useState(false)
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false)
  const platformSettings = usePlatformSettings()

  // Active status determinations
  const isDashboard = activeRoute ? activeRoute === 'dashboard' : pathname === '/'
  const isClients = activeRoute
    ? activeRoute === 'clients'
    : (pathname === '/clients' || pathname === '/clients/') || (pathname.startsWith('/clients/') && pathname !== '/clients/new')
  const isSchedule = activeRoute ? activeRoute === 'schedule' : pathname === '/schedule'
  const isStudios = activeRoute ? activeRoute === 'studios' : pathname === '/studios' || pathname.startsWith('/studios')
  const isUsers = activeRoute ? activeRoute === 'users' : pathname === '/users' || pathname.startsWith('/users')
  const isExercises = activeRoute ? activeRoute === 'exercises' : pathname === '/exercises' || pathname.startsWith('/exercises')
  const isSettings = activeRoute ? activeRoute === 'settings' : pathname === '/settings' || pathname.startsWith('/settings')

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
  const renderSidebarContent = (isCollapsedDesktop: boolean = false) => (
    <div className="flex flex-col h-full justify-between">
      {/* Top Part: Brand + Studio Badge + Navigation Links */}
      <div className="space-y-4">
        {/* Brand Header */}
        {isCollapsedDesktop ? (
          <div className="p-3 pb-3 border-b border-line/40 flex flex-col items-center gap-3">
            <Link
              to="/"
              className="flex items-center justify-center group"
              title={`${formatBrandName(platformSettings.app_name)} — ${platformSettings.app_tagline || 'Pro PT Manager'}`}
            >
              {platformSettings.logo_url ? (
                <img
                  src={platformSettings.logo_url}
                  alt={platformSettings.app_name}
                  className="w-10 h-10 object-contain rounded-xl p-1 bg-panel border border-accent/40 shadow-[0_0_12px_rgba(226,232,0,0.2)] group-hover:border-accent transition-colors shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-panel border border-accent/40 flex items-center justify-center shadow-[0_0_12px_rgba(226,232,0,0.2)] group-hover:border-accent transition-colors shrink-0">
                  <span className="font-extrabold text-sm tracking-tighter text-accent">
                    {platformSettings.app_initials || 'TL'}
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Expand Button */}
            <button
              type="button"
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg hover:bg-panel-elevated text-dim hover:text-accent border border-transparent hover:border-line transition-all shrink-0"
              title="Perbesar Sidebar (Expand)"
              aria-label="Perbesar Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 pb-3 border-b border-line/40 flex items-center justify-between gap-2">
            <Link
              to="/"
              className="flex items-center gap-2.5 group min-w-0"
            >
              {platformSettings.logo_url ? (
                <img
                  src={platformSettings.logo_url}
                  alt={platformSettings.app_name}
                  className="w-9 h-9 object-contain rounded-xl p-1 bg-panel border border-accent/40 shadow-[0_0_12px_rgba(226,232,0,0.2)] group-hover:border-accent transition-colors shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-panel border border-accent/40 flex items-center justify-center shadow-[0_0_12px_rgba(226,232,0,0.2)] group-hover:border-accent transition-colors shrink-0">
                  <span className="font-extrabold text-sm tracking-tighter text-accent">
                    {platformSettings.app_initials || 'TL'}
                  </span>
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base tracking-tight leading-none text-text truncate">
                  {formatBrandName(platformSettings.app_name)}
                </span>
                <span className="text-[9px] text-dim tracking-wider uppercase font-mono mt-1 truncate">
                  {platformSettings.app_tagline || 'Pro PT Manager'}
                </span>
              </div>
            </Link>

            {/* Desktop Shrink Button */}
            <button
              type="button"
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg hover:bg-panel-elevated text-dim hover:text-accent border border-transparent hover:border-line transition-all shrink-0"
              title="Kecilkan Sidebar (Shrink)"
              aria-label="Kecilkan Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Studio / Tenant Context Card */}
        {isCollapsedDesktop ? (
          <div className="px-2 flex justify-center">
            <div
              className="w-10 h-10 rounded-xl bg-bg/50 backdrop-blur-md border border-line/50 flex items-center justify-center cursor-default shrink-0"
              title={
                user.role === 'platform_admin'
                  ? 'Platform SaaS Superadmin'
                  : `${user.studio_name || 'Studio Gym'} (${user.studio_plan_tier ? user.studio_plan_tier.toUpperCase() : 'PRO'} STUDIO)`
              }
            >
              {user.role === 'platform_admin' ? (
                <ShieldCheck className="w-4 h-4 text-accent" />
              ) : (
                <Building2 className="w-4 h-4 text-accent" />
              )}
            </div>
          </div>
        ) : (
          <div className="px-3">
            <div className="p-2.5 rounded-xl bg-bg/50 backdrop-blur-md border border-line/50">
              {user.role === 'platform_admin' ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-text truncate">Platform SaaS</div>
                    <div className="text-[9px] font-mono text-accent font-bold uppercase tracking-wider">
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
        )}

        {/* Navigation Sections */}
        <div className={`space-y-4 overflow-y-auto max-h-[calc(100vh-270px)] ${isCollapsedDesktop ? 'px-2' : 'px-3'}`}>
          {/* Section 1: Menu Utama */}
          <div className="space-y-1.5">
            {!isCollapsedDesktop && (
              <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-wider text-dim uppercase">
                Menu Utama
              </div>
            )}

            <Link
              to="/"
              title="Dashboard"
              className={`${
                isCollapsedDesktop
                  ? 'w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all btn-interactive'
                  : 'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-interactive'
              } ${
                isDashboard
                  ? 'bg-accent text-[#141414] font-bold shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                  : 'text-dim hover:text-text hover:bg-panel-elevated/70'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${isDashboard ? 'text-[#141414]' : 'text-dim'}`} />
              {!isCollapsedDesktop && <span>Dashboard</span>}
            </Link>

            <Link
              to="/clients"
              title="Daftar Klien"
              className={`${
                isCollapsedDesktop
                  ? 'w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all btn-interactive'
                  : 'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-interactive'
              } ${
                isClients
                  ? 'bg-accent text-[#141414] font-bold shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                  : 'text-dim hover:text-text hover:bg-panel-elevated/70'
              }`}
            >
              <Users className={`w-4 h-4 shrink-0 ${isClients ? 'text-[#141414]' : 'text-dim'}`} />
              {!isCollapsedDesktop && <span>Daftar Klien</span>}
            </Link>

            <Link
              to="/schedule"
              title="Jadwal Sesi"
              className={`${
                isCollapsedDesktop
                  ? 'w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all btn-interactive'
                  : 'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-interactive'
              } ${
                isSchedule
                  ? 'bg-accent text-[#141414] font-bold shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                  : 'text-dim hover:text-text hover:bg-panel-elevated/70'
              }`}
            >
              <Calendar className={`w-4 h-4 shrink-0 ${isSchedule ? 'text-[#141414]' : 'text-dim'}`} />
              {!isCollapsedDesktop && <span>Jadwal Sesi</span>}
            </Link>
          </div>

          {/* Section 2: Manajemen & Alat */}
          <div className="space-y-1.5 pt-1 border-t border-line/30">
            {!isCollapsedDesktop && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-bold tracking-wider text-dim uppercase">
                Manajemen &amp; Alat
              </div>
            )}

            {user.role === 'platform_admin' && (
              <>
                <Link
                  to="/studios"
                  title="Kelola Studio (SaaS)"
                  className={`${
                    isCollapsedDesktop
                      ? 'w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all btn-interactive'
                      : 'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-interactive'
                  } ${
                    isStudios
                      ? 'bg-accent text-[#141414] font-bold shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                      : 'text-dim hover:text-text hover:bg-panel-elevated/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={`w-4 h-4 shrink-0 ${isStudios ? 'text-[#141414]' : 'text-accent'}`} />
                    {!isCollapsedDesktop && <span>Kelola Studio</span>}
                  </div>
                  {!isCollapsedDesktop && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${isStudios ? 'bg-[#141414]/20 text-[#141414]' : 'bg-accent/15 text-accent border border-accent/25'}`}>
                      SAAS
                    </span>
                  )}
                </Link>

                <Link
                  to="/settings"
                  title="Identitas & SaaS (Config)"
                  className={`${
                    isCollapsedDesktop
                      ? 'w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all btn-interactive'
                      : 'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-interactive'
                  } ${
                    isSettings
                      ? 'bg-accent text-[#141414] font-bold shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                      : 'text-dim hover:text-text hover:bg-panel-elevated/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sliders className={`w-4 h-4 shrink-0 ${isSettings ? 'text-[#141414]' : 'text-accent'}`} />
                    {!isCollapsedDesktop && <span>Identitas &amp; SaaS</span>}
                  </div>
                  {!isCollapsedDesktop && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${isSettings ? 'bg-[#141414]/20 text-[#141414]' : 'bg-accent/15 text-accent border border-accent/25'}`}>
                      CONFIG
                    </span>
                  )}
                </Link>
              </>
            )}

            {(user.role === 'admin_studio' || user.role === 'manager' || user.role === 'platform_admin') && (
              <Link
                to="/users"
                title="Kelola Akun Staf"
                className={`${
                  isCollapsedDesktop
                    ? 'w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all btn-interactive'
                    : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-interactive'
                } ${
                  isUsers
                    ? 'bg-accent text-[#141414] font-bold shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                    : 'text-dim hover:text-text hover:bg-panel-elevated/70'
                }`}
              >
                <UserCheck className={`w-4 h-4 ${isUsers ? 'text-[#141414]' : 'text-accent'} shrink-0`} />
                {!isCollapsedDesktop && <span>Kelola Akun Staf</span>}
              </Link>
            )}

            <Link
              to="/exercises"
              title="Master Gerakan"
              className={`${
                isCollapsedDesktop
                  ? 'w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all btn-interactive'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-interactive'
              } ${
                isExercises
                  ? 'bg-accent text-[#141414] font-bold shadow-[0_2px_12px_rgba(226,232,0,0.25)]'
                  : 'text-dim hover:text-text hover:bg-panel-elevated/70'
              }`}
            >
              <Dumbbell className={`w-4 h-4 ${isExercises ? 'text-[#141414]' : 'text-accent'} shrink-0`} />
              {!isCollapsedDesktop && <span>Master Gerakan</span>}
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsExportPdfOpen(true)
              }}
              title="Cetak Laporan PDF"
              className={`${
                isCollapsedDesktop
                  ? 'w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-dim hover:text-text hover:bg-panel-elevated/70 transition-all btn-interactive'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-dim hover:text-text hover:bg-panel-elevated/70 transition-all btn-interactive text-left'
              }`}
            >
              <Printer className="w-4 h-4 text-accent shrink-0" />
              {!isCollapsedDesktop && <span>Cetak Laporan PDF</span>}
            </button>
          </div>

          {/* Section 3: Web Publik */}
          <div className="space-y-1.5 pt-1 border-t border-line/30">
            {!isCollapsedDesktop && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-bold tracking-wider text-dim uppercase">
                Lainnya
              </div>
            )}

            <a
              href="/landing"
              title="Beranda Publik"
              className={`${
                isCollapsedDesktop
                  ? 'w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-dim hover:text-text hover:bg-panel-elevated/70 transition-all btn-interactive'
                  : 'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-dim hover:text-text hover:bg-panel-elevated/70 transition-all btn-interactive'
              }`}
            >
              <Globe className="w-4 h-4 text-dim shrink-0" />
              {!isCollapsedDesktop && <span>Beranda Publik</span>}
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Part: User Profile Card & Quick Actions */}
      {isCollapsedDesktop ? (
        <div className="p-2 m-2 rounded-2xl bg-bg border border-line/60 shadow-sm flex flex-col items-center gap-2">
          <div
            title={`${user.name} (${user.email})`}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <UserAvatar
              name={user.name}
              avatarUrl={user.avatar_url}
              role={user.role}
              size="sm"
              showRoleBadge
            />
          </div>

          <div className="w-full border-t border-line/40 pt-1.5 flex flex-col items-center gap-1.5">
            <ThemeToggle showLabel={false} />

            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
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
      ) : (
        <div className="p-3 m-3 rounded-2xl bg-bg border border-line/60 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0 mb-2.5">
            <UserAvatar
              name={user.name}
              avatarUrl={user.avatar_url}
              role={user.role}
              size="md"
              showRoleBadge
            />
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
                  ? 'bg-accent/20 text-accent border-accent/30'
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
              onClick={() => setIsEditProfileOpen(true)}
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
      )}
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
      <div className="relative z-10 text-text min-h-dvh flex font-sans antialiased selection:bg-accent/30 selection:text-text">
        {/* ── 1. Desktop Fixed Left Sidebar ── */}
        <aside
          className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-panel/80 backdrop-blur-2xl border-r border-line shadow-[4px_0_30px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {renderSidebarContent(isCollapsed)}
        </aside>

        {/* ── 2. Mobile Compact Top Navigation Bar (Clean & Focused) ── */}
        <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-panel/85 backdrop-blur-2xl border-b border-line px-4 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
          <Link to="/" className="flex items-center gap-2.5">
            {platformSettings.logo_url ? (
              <img
                src={platformSettings.logo_url}
                alt={platformSettings.app_name}
                className="w-8 h-8 object-contain rounded-xl p-0.5 bg-bg border border-accent/40 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-bg border border-accent/40 flex items-center justify-center text-accent font-bold text-xs shadow-sm shrink-0">
                {platformSettings.app_initials || 'TL'}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-text leading-none">
                {formatBrandName(platformSettings.app_name)}
              </span>
              <span className="text-[9px] text-dim tracking-wider uppercase font-mono mt-0.5">
                {platformSettings.app_tagline || 'Pro PT Manager'}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle showLabel={false} />
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="btn-interactive"
              title="Edit Profil"
            >
              <UserAvatar
                name={user.name}
                avatarUrl={user.avatar_url}
                role={user.role}
                size="sm"
                shape="rounded-lg"
              />
            </button>
          </div>
        </div>

        {/* ── 3. Main View Content Area ── */}
        <div
          className={`flex-1 flex flex-col min-h-screen w-full min-w-0 max-w-full overflow-x-hidden pt-14 md:pt-0 pb-16 md:pb-0 transition-all duration-300 ease-in-out ${
            isCollapsed ? 'md:pl-20' : 'md:pl-64'
          }`}
        >
          {children}
        </div>

        {/* ── 4. Mobile Bottom Navigation Bar (With Slide-up Menu Sheet) ── */}
        <MobileBottomNav
          currentUser={user}
          clientId={clientId}
          canLogSession={canLogSession !== undefined ? canLogSession : user.role === 'pt'}
          onScheduleClick={onScheduleClick}
          onAddStudioClick={onAddStudioClick}
          openExportPdf={() => setIsExportPdfOpen(true)}
          openEditProfile={() => setIsEditProfileOpen(true)}
          handleLogout={handleLogout}
        />

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
