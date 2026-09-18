import { createFileRoute, redirect } from '@tanstack/react-router'
import { api, type User } from '../lib/api'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    try { await api('/auth/me') } catch { throw redirect({ to: '/login' }) }
  },
  loader: async () => {
    const [me, clients] = await Promise.all([
      api<{ user: User }>('/auth/me'),
      api<{ clients: Client[] }>('/clients'),
    ])
    return { me: me.user, clients: clients.clients }
  },
  component: Dashboard,
})

type Client = {
  id: string; name: string; goal: string; pkg_total: number; pkg_used: number;
}

function Dashboard() {
  const { me, clients } = Route.useLoaderData()

  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    location.href = '/login'
  }

  return (
    <main className="bg-bg text-text min-h-dvh p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Halo, {me.name}</h1>
            <p className="text-dim text-sm">
              {me.role.toUpperCase()} · {me.plan_tier.toUpperCase()}
              {me.expires_at && ` · exp ${me.expires_at.slice(0, 10)}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/clients/new" className="bg-accent rounded-lg px-3 py-1.5 text-sm font-semibold text-black">+ Klien</a>
            <button onClick={logout} className="text-dim hover:text-text text-sm">Keluar</button>
          </div>
        </header>

        <h2 className="text-dim mb-3 text-sm font-medium uppercase tracking-wide">
          Klien ({clients.length})
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {clients.map((cl) => {
            const pct = cl.pkg_total ? Math.round((cl.pkg_used / cl.pkg_total) * 100) : 0
            return (
              <li key={cl.id}>
                <a href={`/clients/${cl.id}`} className="bg-panel border-line block rounded-2xl border p-4 transition hover:border-accent">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="font-medium">{cl.name}</span>
                    <span className="text-dim text-sm">{cl.pkg_used}/{cl.pkg_total} sesi</span>
                  </div>
                  <div className="bg-line h-1.5 overflow-hidden rounded-full">
                    <div className="bg-accent h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-dim mt-2 text-xs">{goalLabel(cl.goal)}</p>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}

function goalLabel(g: string) {
  return { fat_loss: 'Fat Loss', muscle_gain: 'Muscle Gain', general: 'General Fitness' }[g] ?? g
}
