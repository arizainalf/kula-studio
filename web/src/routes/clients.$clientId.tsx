import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { api } from '../lib/api'
import { Sparkline, type Point } from '../components/Sparkline'

export const Route = createFileRoute('/clients/$clientId')({
  beforeLoad: async () => {
    try { await api('/auth/me') } catch { throw redirect({ to: '/login' }) }
  },
  loader: async ({ params }) => {
    const [client, sessions, photos] = await Promise.all([
      api<{ client: Client }>(`/clients/${params.clientId}`),
      api<{ sessions: Session[] }>(`/clients/${params.clientId}/sessions`),
      api<{ photos: Photo[] }>(`/photos/${params.clientId}`).catch(() => ({ photos: [] })),
    ])
    return { client: client.client, sessions: sessions.sessions, photos: photos.photos }
  },
  component: ClientDetail,
})

type Client = { id: string; name: string; goal: string; pkg_total: number; pkg_used: number }
type Session = {
  id: string; date: string; rpe: number; weight: number | null; fat_pct: number | null;
  exercises: Array<{ warmup: Ex[]; resistance: Ex[]; cardio: Ex[]; cooldown: Ex[] }>; notes: string | null;
}
type Ex = { name: string; detail?: string }
type Photo = { id: string; session_id: string | null; created_at: string }

function ClientDetail() {
  const { client, sessions, photos } = Route.useLoaderData()
  const [msg, setMsg] = useState('')

  function exportPdf() {
    const rows = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
      .map((s) => `
        <tr>
          <td>${s.date.slice(0, 10)}</td>
          <td>${s.rpe}</td>
          <td>${s.weight ?? '—'}</td>
          <td>${s.fat_pct ?? '—'}</td>
          <td>${esc(s.notes ?? '')}</td>
        </tr>`).join('')
    const w = window.open('', '_blank', 'width=800,height=900')
    if (!w) { setMsg('Popup diblokir — izinkan popup untuk export.'); return }
    w.document.write(`<!doctype html><html><head><title>Laporan ${esc(client.name)}</title>
      <style>
        body{font-family:system-ui;margin:32px;color:#111}
        h1{font-size:20px;margin:0 0 4px}
        .sub{color:#555;font-size:13px;margin-bottom:24px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
        th{background:#f3f4f6}
      </style></head><body>
      <h1>Laporan Latihan — ${esc(client.name)}</h1>
      <div class="sub">${sessions.length} sesi · ${client.pkg_used}/${client.pkg_total} paket · dicetak ${new Date().toLocaleDateString('id-ID')}</div>
      <table><thead><tr><th>Tanggal</th><th>RPE</th><th>BB (kg)</th><th>Lemak %</th><th>Catatan</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.onload=()=>window.print()</` + `script>
    </body></html>`)
    w.document.close()
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMsg('Mengunggah…')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(`/api/photos/${client.id}`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'gagal')
      location.reload()
    } catch (ex) {
      setMsg(ex instanceof Error ? `Gagal: ${ex.message}` : 'Gagal upload.')
    }
  }

  return (
    <main className="bg-bg text-text min-h-dvh p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <a href="/" className="text-dim hover:text-text text-sm">← Kembali</a>
          <div className="flex gap-2">
            <button onClick={exportPdf} className="border-line rounded-lg border px-3 py-1.5 text-sm">Export PDF</button>
            <a href={`/clients/${client.id}/log`} className="bg-accent rounded-lg px-3 py-1.5 text-sm font-semibold text-black">+ Catat Sesi</a>
          </div>
        </div>
        <header className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight">{client.name}</h1>
          <p className="text-dim text-sm">
            {client.pkg_used}/{client.pkg_total} sesi · RPE rata-rata{' '}
            {sessions.length ? (sessions.reduce((s, x) => s + x.rpe, 0) / sessions.length).toFixed(1) : '—'}
          </p>
        </header>

        <h2 className="text-dim mb-3 mt-8 text-sm font-medium uppercase tracking-wide">Progres</h2>
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <div className="bg-panel border-line rounded-2xl border p-4">
            <p className="text-dim mb-2 text-xs uppercase tracking-wide">Berat Badan</p>
            <Sparkline data={seriesOf(sessions, 'weight')} unit="kg" />
          </div>
          <div className="bg-panel border-line rounded-2xl border p-4">
            <p className="text-dim mb-2 text-xs uppercase tracking-wide">Lemak Tubuh</p>
            <Sparkline data={seriesOf(sessions, 'fat_pct')} unit="%" />
          </div>
          <div className="bg-panel border-line rounded-2xl border p-4">
            <p className="text-dim mb-2 text-xs uppercase tracking-wide">RPE</p>
            <Sparkline data={seriesOf(sessions, 'rpe')} unit="" color="oklch(0.7 0.15 250)" />
          </div>
        </div>

        <h2 className="text-dim mb-3 text-sm font-medium uppercase tracking-wide">Foto</h2>
        <div className="mb-8">
          <label className="bg-accent inline-block cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold text-black">
            + Upload Foto
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onUpload} />
          </label>
          {msg && <span className="text-dim ml-3 text-sm">{msg}</span>}
          {photos.length > 0 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {photos.map((p) => (
                <img key={p.id} src={`/api/photos/raw/${p.id}`} alt={`Foto ${p.created_at.slice(0, 10)}`}
                  className="border-line h-24 w-24 shrink-0 rounded-xl border object-cover" loading="lazy" />
              ))}
            </div>
          )}
        </div>

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
              {(Array.isArray(s.exercises) ? s.exercises : [s.exercises]).map((g, i) => {
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

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

// sessions urut desc (terbaru dulu) → balik urut + buang null, untuk sparkline
function seriesOf(sessions: Session[], key: 'weight' | 'fat_pct' | 'rpe'): Point[] {
  return [...sessions]
    .filter((s) => s[key] != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => ({ date: s.date, value: s[key] as number }))
}
