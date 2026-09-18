import { createFileRoute, redirect } from '@tanstack/react-router'
import { api } from '../lib/api'

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
    <main className="bg-bg text-text min-h-dvh flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="bg-panel border-line w-full max-w-sm rounded-2xl border p-8">
        <h1 className="mb-6 text-xl font-semibold tracking-tight">TrainLog</h1>
        <label className="text-dim mb-1 block text-sm">Email</label>
        <input name="email" type="email" required autoComplete="username"
          className="border-line bg-bg mb-4 w-full rounded-lg border px-3 py-2 outline-none focus:border-accent" />
        <label className="text-dim mb-1 block text-sm">Password</label>
        <input name="password" type="password" required autoComplete="current-password"
          className="border-line bg-bg mb-4 w-full rounded-lg border px-3 py-2 outline-none focus:border-accent" />
        <p id="login-err" className="text-red-400 mb-3 min-h-5 text-sm"></p>
        <button type="submit" className="bg-accent hover:opacity-90 w-full rounded-lg py-2 font-semibold text-black">
          Masuk
        </button>
      </form>
    </main>
  )
}
