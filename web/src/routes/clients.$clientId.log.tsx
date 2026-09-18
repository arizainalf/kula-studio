import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { api } from '../lib/api'

export const Route = createFileRoute('/clients/$clientId/log')({
  beforeLoad: async () => {
    try { await api('/auth/me') } catch { throw redirect({ to: '/login' }) }
  },
  loader: async ({ params }) =>
    api<{ client: { id: string; name: string } }>(`/clients/${params.clientId}`),
  component: LogSession,
})

type Ex = { name: string; detail?: string }
const input = 'border-line bg-bg w-full rounded-lg border px-3 py-2 outline-none focus:border-accent'

// State form: 4 grup latihan, tiap grup daftar {name, detail}
function LogSession() {
  const { client } = Route.useLoaderData()
  const [groups, setGroups] = useState<Record<string, Ex[]>>({
    warmup: [], resistance: [], cardio: [], cooldown: [],
  })
  const [saving, setSaving] = useState(false)

  function addEx(g: string) {
    setGroups((s) => ({ ...s, [g]: [...s[g], { name: '', detail: '' }] }))
  }
  function setEx(g: string, i: number, k: keyof Ex, v: string) {
    setGroups((s) => ({ ...s, [g]: s[g].map((e, j) => (j === i ? { ...e, [k]: v } : e)) }))
  }
  function delEx(g: string, i: number) {
    setGroups((s) => ({ ...s, [g]: s[g].filter((_, j) => j !== i) }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const err = document.getElementById('err')!
    err.textContent = ''
    setSaving(true)
    try {
      // exercises = [grup]; grup kosong difilter. weight/fat_pct kosong → null
      const exercises = Object.entries(groups)
        .filter(([, list]) => list.some((x) => x.name.trim()))
        .map(([g, list]) => ({
          [g]: list.filter((x) => x.name.trim()).map(({ name, detail }) => ({
            name: name.trim(), ...(detail?.trim() ? { detail: detail.trim() } : {}),
          })),
        }))
      const num = (v: FormDataEntryValue | null) => {
        const t = String(v ?? '').trim().replace(',', '.')
        if (!t) return null
        const n = Number(t)
        return Number.isFinite(n) ? n : null
      }
      const w = num(f.get('weight'))
      const fp = num(f.get('fat_pct'))
      await api(`/clients/${client.id}/sessions`, {
        method: 'POST',
        body: JSON.stringify({
          date: String(f.get('date') ?? ''),
          rpe: Number(f.get('rpe') || 0),
          weight: w,
          fat_pct: fp,
          notes: String(f.get('notes') || '').trim() || undefined,
          exercises,
        }),
      })
      location.href = `/clients/${client.id}`
    } catch (ex) {
      const detail = (ex as { status?: number }).status === 400
        ? ' — cek tanggal/RPE (1-10)/angka valid' : ''
      err.textContent = ex instanceof Error ? `Gagal: ${ex.message}${detail}` : 'Gagal menyimpan.'
      setSaving(false)
    }
  }

  const labels: Record<string, string> = {
    warmup: 'Pemanasan', resistance: 'Resistance', cardio: 'Cardio', cooldown: 'Cooldown',
  }

  return (
    <main className="bg-bg text-text min-h-dvh p-6 md:p-10">
      <form onSubmit={onSubmit} className="bg-panel border-line mx-auto max-w-md rounded-2xl border p-6">
        <h1 className="mb-1 text-lg font-semibold">Catat Sesi</h1>
        <p className="text-dim mb-6 text-sm">{client.name}</p>

        <label className="text-dim mb-1 block text-sm">Tanggal</label>
        <input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={`${input} mb-4`} />

        <div className="mb-4 grid grid-cols-3 gap-3">
          <div>
            <label className="text-dim mb-1 block text-sm">RPE (1-10)</label>
            <input name="rpe" type="number" min={1} max={10} required defaultValue={7} className={input} />
          </div>
          <div>
            <label className="text-dim mb-1 block text-sm">BB (kg)</label>
            <input name="weight" type="number" step="0.1" min={0} max={500} className={input} />
          </div>
          <div>
            <label className="text-dim mb-1 block text-sm">Lemak %</label>
            <input name="fat_pct" type="number" step="0.1" min={0} max={100} className={input} />
          </div>
        </div>

        {Object.keys(labels).map((g) => (
          <fieldset key={g} className="border-line mb-4 rounded-xl border p-3">
            <legend className="text-dim px-1 text-sm">{labels[g]}</legend>
            {groups[g].map((ex, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input placeholder="Latihan" value={ex.name} onChange={(e) => setEx(g, i, 'name', e.target.value)} className={input} />
                <input placeholder="Detail (3x10 60kg)" value={ex.detail ?? ''} onChange={(e) => setEx(g, i, 'detail', e.target.value)} className={input} />
                <button type="button" onClick={() => delEx(g, i)} className="text-dim hover:text-red-400 shrink-0">✕</button>
              </div>
            ))}
            <button type="button" onClick={() => addEx(g)} className="text-accent text-sm">+ Tambah</button>
          </fieldset>
        ))}

        <label className="text-dim mb-1 block text-sm">Catatan</label>
        <textarea name="notes" rows={2} maxLength={2000} className={`${input} mb-4`} />
        <p id="err" className="text-red-400 mb-3 min-h-5 text-sm"></p>
        <button type="submit" disabled={saving} className="bg-accent hover:opacity-90 w-full rounded-lg py-2 font-semibold text-black disabled:opacity-50">
          {saving ? 'Menyimpan…' : 'Simpan Sesi'}
        </button>
      </form>
    </main>
  )
}
