import { createFileRoute, redirect } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { api } from '../lib/api'
import { ThemeToggle } from '../components/ThemeToggle'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    try { await api('/auth/me') } catch { return }
    throw redirect({ to: '/' })
  },
  component: LoginPage,
})

function LoginPage() {
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const err = document.getElementById('login-err')!
    err.textContent = ''
    try {
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: f.get('email'), password: f.get('password') }),
      })
      location.href = '/'
    } catch (ex) {
      err.textContent = ex instanceof Error && ex.message === 'invalid_credentials'
        ? 'Email atau password salah.' : 'Login gagal, coba lagi.'
    }
  }

  return (
    <main className="bg-bg text-text min-h-dvh flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-accent/30 selection:text-text font-sans antialiased">
      <div className="w-full max-w-sm mb-4 flex items-center justify-between">
        <a href="/" className="btn-interactive inline-flex items-center gap-1.5 text-xs font-mono text-dim hover:text-accent transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </a>

        <ThemeToggle />
      </div>
      <form onSubmit={onSubmit} className="bg-panel border border-line w-full max-w-sm rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.7)] animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-bg border border-accent/40 flex items-center justify-center text-accent font-extrabold text-sm">
            TL
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text leading-none">
              Train<span className="text-accent">Log</span>
            </h1>
            <p className="text-[11px] text-dim font-mono mt-1">Masuk ke Portal Pelatih</p>
          </div>
        </div>

        <label className="text-dim mb-1 block text-xs font-medium uppercase tracking-wider">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="nama@domain.com"
          className="border border-line bg-bg mb-4 w-full rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-text outline-none focus:border-accent transition-colors"
        />

        <label className="text-dim mb-1 block text-xs font-medium uppercase tracking-wider">Password</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="border border-line bg-bg mb-4 w-full rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-text outline-none focus:border-accent transition-colors"
        />

        <p id="login-err" className="text-red-400 mb-4 min-h-5 text-xs"></p>
        <button
          type="submit"
          className="btn-interactive bg-accent hover:bg-accent/90 w-full rounded-xl py-3 sm:py-2.5 font-semibold text-black text-sm shadow-[0_2px_12px_rgba(212,175,55,0.25)] transition-all"
        >
          Masuk
        </button>
      </form>
    </main>
  )
}
