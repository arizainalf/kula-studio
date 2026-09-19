import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ArrowLeft, Dumbbell, UserCheck, Sparkles, Shield } from 'lucide-react'
import { api, type User } from '../lib/api'
import { ThemeToggle } from '../components/ThemeToggle'
import { usePlatformSettings, formatBrandName } from '../lib/platformSettings'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    try {
      const res = await api<{ user: User }>('/auth/me')
      if (res.user.role === 'client') {
        throw redirect({ to: '/portal' })
      }
      throw redirect({ to: '/' })
    } catch (e) {
      if (e && typeof e === 'object' && 'to' in e) throw e
      return
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const [roleMode, setRoleMode] = useState<'pt' | 'client'>('pt')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const platformSettings = usePlatformSettings()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      if (roleMode === 'pt') {
        await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        window.location.href = '/'
      } else {
        await api('/auth/client-login', {
          method: 'POST',
          body: JSON.stringify({ email: email || undefined, phone: phone || undefined }),
        })
        window.location.href = '/portal'
      }
    } catch (err: any) {
      setErrorMsg(
        err.status === 401
          ? 'Email atau password salah.'
          : err.status === 404
          ? 'Akun klien tidak ditemukan dengan data tersebut.'
          : err.status === 403
          ? 'Akun Anda sedang dinonaktifkan. Hubungi admin studio.'
          : 'Terjadi kesalahan saat masuk. Coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(type: 'platform_admin' | 'admin_studio' | 'pt' | 'client1' | 'client2') {
    setErrorMsg('')
    if (type === 'platform_admin') {
      setRoleMode('pt')
      setEmail('superadmin@dev.local')
      setPassword('devpass123')
    } else if (type === 'admin_studio') {
      setRoleMode('pt')
      setEmail('admin@dev.local')
      setPassword('devpass123')
    } else if (type === 'pt') {
      setRoleMode('pt')
      setEmail('hadi@dev.local')
      setPassword('devpass123')
    } else if (type === 'client1') {
      setRoleMode('client')
      setEmail('siti@gmail.com')
      setPhone('08111111111')
    } else {
      setRoleMode('client')
      setEmail('fajar@gmail.com')
      setPhone('08122222222')
    }
  }

  return (
    <main className="relative z-10 text-text min-h-dvh flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-accent/30 selection:text-text font-sans antialiased">
      <div className="w-full max-w-sm mb-4 flex items-center justify-between animate-fade-in">
        <a
          href="/"
          className="btn-interactive inline-flex items-center gap-1.5 text-xs font-mono text-dim hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </a>

        <ThemeToggle />
      </div>

      <div className="bg-panel border border-line w-full max-w-sm rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.7)] animate-fade-in">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          {platformSettings.logo_url ? (
            <img
              src={platformSettings.logo_url}
              alt={platformSettings.app_name}
              className="w-10 h-10 object-contain rounded-xl p-1 bg-bg border border-accent/40 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-bg border border-accent/40 flex items-center justify-center text-accent font-extrabold text-sm shadow-sm shrink-0">
              {platformSettings.app_initials || 'TL'}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text leading-none">
              {formatBrandName(platformSettings.app_name)}
            </h1>
            <p className="text-[11px] text-dim font-mono mt-1">
              {roleMode === 'pt'
                ? `Portal Pelatih & Studio — ${platformSettings.app_tagline || 'Pro PT Manager'}`
                : 'Portal Klien & Progres Latihan'}
            </p>
          </div>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 p-1 bg-bg/80 border border-line rounded-xl mb-5 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setRoleMode('pt')
              setErrorMsg('')
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              roleMode === 'pt'
                ? 'bg-accent text-[#141414] font-bold shadow-sm'
                : 'text-dim hover:text-text'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Pelatih / PT</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleMode('client')
              setErrorMsg('')
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              roleMode === 'client'
                ? 'bg-accent text-[#141414] font-bold shadow-sm'
                : 'text-dim hover:text-text'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Klien Member</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-dim mb-1 block text-xs font-medium uppercase tracking-wider">
              {roleMode === 'pt' ? 'Email Akun Pelatih' : 'Email Klien'}
            </label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder={roleMode === 'pt' ? 'nama@gym.com' : 'email@klien.com'}
              className="border border-line bg-bg w-full rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-text outline-none focus:border-accent transition-colors"
            />
          </div>

          {roleMode === 'pt' ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-dim block text-xs font-medium uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[10px] text-accent font-mono">Privat Pelatih</span>
              </div>
              <input
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="border border-line bg-bg w-full rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-text outline-none focus:border-accent transition-colors"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-dim block text-xs font-medium uppercase tracking-wider">
                  Nomor HP / WhatsApp
                </label>
                <span className="text-[10px] text-accent font-mono">Verifikasi Klien</span>
              </div>
              <input
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="border border-line bg-bg w-full rounded-xl px-3.5 py-2.5 text-base sm:text-sm font-mono text-text outline-none focus:border-accent transition-colors"
              />
              <p className="text-[11px] text-dim mt-1.5 leading-tight">
                Masukkan nomor telepon yang didaftarkan oleh pelatih Anda saat sesi registrasi.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs animate-shake">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-interactive bg-accent hover:bg-accent/90 disabled:opacity-50 w-full rounded-xl py-3 sm:py-2.5 font-semibold text-[#141414] text-sm shadow-[0_2px_12px_rgba(226,232,0,0.25)] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#141414] border-t-transparent" />
            ) : roleMode === 'pt' ? (
              <>
                <Shield className="w-4 h-4" />
                <span>Masuk Portal Pelatih</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Buka Dashboard Klien</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Assist */}
        <div className="mt-6 pt-4 border-t border-line/60">
          <span className="text-[10px] font-mono text-dim block mb-2 uppercase tracking-wider text-center">
            Pilihan Cepat Akun Demo:
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center text-[11px]">
            <button
              type="button"
              onClick={() => fillDemo('platform_admin')}
              className="px-2 py-1 rounded-md bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-colors font-bold"
            >
              🛡️ Platform Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin_studio')}
              className="px-2 py-1 rounded-md bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-colors font-bold"
            >
              👑 Admin Studio
            </button>
            <button
              type="button"
              onClick={() => fillDemo('pt')}
              className="px-2 py-1 rounded-md bg-panel border border-line text-dim hover:text-text transition-colors"
            >
              Demo PT
            </button>
            <button
              type="button"
              onClick={() => fillDemo('client1')}
              className="px-2 py-1 rounded-md bg-panel border border-accent/30 text-accent hover:bg-accent/10 transition-colors"
            >
              Demo Klien (Siti)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('client2')}
              className="px-2 py-1 rounded-md bg-panel border border-line text-dim hover:text-text transition-colors"
            >
              Demo Klien (Fajar)
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
