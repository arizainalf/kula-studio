import { useLocation, Link } from '@tanstack/react-router'
import { LayoutDashboard, Users, Calendar, Plus, Sun, Moon, Dumbbell } from 'lucide-react'
import { useTheme } from './ThemeToggle'

export function MobileBottomNav({
  clientId,
}: {
  clientId?: string
  onScheduleClick?: () => void
}) {
  const location = useLocation()
  const pathname = location.pathname
  const { theme, toggleTheme } = useTheme()

  const isDashboard = pathname === '/'
  const isClients = pathname === '/clients' || pathname === '/clients/'
  const isSchedule = pathname === '/schedule'
  const isClientDetail = pathname.startsWith('/clients/') && !pathname.endsWith('/log') && !pathname.endsWith('/new')

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-panel/95 backdrop-blur-xl border-t border-line shadow-[0_-4px_25px_rgba(0,0,0,0.35)] px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-all duration-300"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Tab 1: Dashboard */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] ${
            isDashboard
              ? 'text-accent font-bold scale-105'
              : 'text-dim hover:text-text'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight leading-none">Dashboard</span>
          {isDashboard && (
            <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />
          )}
        </Link>

        {/* Tab 2: Klien */}
        <Link
          to="/clients"
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] ${
            isClients
              ? 'text-accent font-bold scale-105'
              : 'text-dim hover:text-text'
          }`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight leading-none">Klien</span>
          {isClients && (
            <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />
          )}
        </Link>

        {/* Tab 3: Prominent Elevated Gold FAB Button (+) */}
        <div className="flex flex-col items-center -mt-6">
          {isClientDetail && clientId ? (
            <Link
              to="/clients/$clientId/log"
              params={{ clientId }}
              className="w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-[#141414] flex items-center justify-center shadow-[0_0_20px_rgba(226,232,0,0.45)] border-[3px] border-panel hover:scale-105 active:scale-95 transition-all btn-interactive"
              title="Catat Sesi Latihan"
            >
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </Link>
          ) : (
            <Link
              to="/clients/new"
              className="w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-[#141414] flex items-center justify-center shadow-[0_0_20px_rgba(226,232,0,0.45)] border-[3px] border-panel hover:scale-105 active:scale-95 transition-all btn-interactive"
              title="Daftarkan Klien Baru"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </Link>
          )}
          <span className="text-[9px] font-mono font-bold text-accent mt-1 tracking-tight">
            {isClientDetail ? 'Catat Sesi' : 'Klien Baru'}
          </span>
        </div>

        {/* Tab 4: Jadwal */}
        <Link
          to="/schedule"
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] ${
            isSchedule
              ? 'text-accent font-bold scale-105'
              : 'text-dim hover:text-text'
          }`}
        >
          <Calendar className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight leading-none">Jadwal</span>
          {isSchedule && (
            <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />
          )}
        </Link>

        {/* Tab 5: Dark/Light Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all btn-interactive min-w-[54px] text-dim hover:text-text"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 mb-1 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 mb-1 text-sky-400" />
          )}
          <span className="text-[10px] tracking-tight leading-none">
            {theme === 'dark' ? 'Terang' : 'Gelap'}
          </span>
        </button>
      </div>
    </nav>
  )
}
