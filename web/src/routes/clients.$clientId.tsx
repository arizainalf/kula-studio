import { createFileRoute, redirect } from '@tanstack/react-router'
import { api } from '../lib/api'

export const Route = createFileRoute('/clients/$clientId')({
  beforeLoad: async () => {
    try { await api('/auth/me') } catch { throw redirect({ to: '/login' }) }
  },
  loader: async ({ params }) => {
    const [client, sessions] = await Promise.all([
      api<{ client: Client }>(`/clients/${params.clientId}`),
      api<{ sessions: Session[] }>(`/clients/${params.clientId}/sessions`),
    ])
    return { client: client.client, sessions: sessions.sessions }
  },
  component: ClientDetail,
})

type Client = { id: string; name: string; goal: string; pkg_total: number; pkg_used: number }
type Session = {
  id: string; date: string; rpe: number; weight: number | null; fat_pct: number | null;
  exercises: Array<{ warmup: Ex[]; resistance: Ex[]; cardio: Ex[]; cooldown: Ex[] }>; notes: string | null;
}
type Ex = { name: string; detail?: string }

function ClientDetail() {
  const { client, sessions } = Route.useLoaderData()

  return (
    <main className="bg-bg text-text min-h-dvh p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-dim hover:text-text mb-6 inline-block text-sm">← Kembali</a>
        <header className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight">{client.name}</h1>
          <p className="text-dim text-sm">
            {client.pkg_used}/{client.pkg_total} sesi · RPE rata-rata{' '}
            {sessions.length ? (sessions.reduce((s, x) => s + x.rpe, 0) / sessions.length).toFixed(1) : '—'}
          </p>
        </header>

        <h2 className="text-dim mb-3 text-sm font-medium uppercase tracking-wide">Riwayat Sesi</h2>
        {sessions.length === 0 && <p className="text-dim text-sm">Belum ada sesi.</p>}
        <ol className="space-y-3">
          {sessions.map((s) => (
            <li key={s.id} className="bg-panel border-line rounded-2xl border p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-medium">{s.date.slice(0, 10)}</span>
                <span className="text-dim text-sm">
                  RPE {s.rpe}
                  {s.weight != null && ` · ${s.weight}kg`}
                  {s.fat_pct != null && ` · ${s.fat_pct}%`}
                </span>
              </div>
              {s.exercises.map((g, i) => {
                const all = [...g.warmup, ...g.resistance, ...g.cardio, ...g.cooldown]
                if (!all.length) return null
                return (
                  <p key={i} className="text-dim text-sm">
                    {all.map((e) => `${e.name}${e.detail ? ` (${e.detail})` : ''}`).join(' · ')}
                  </p>
                )
              })}
              {s.notes && <p className="text-dim mt-2 text-sm italic">{s.notes}</p>}
            </li>
          ))}
        </ol>
      </div>
    </main>
  )
}
