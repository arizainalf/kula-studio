import { createFileRoute, redirect } from '@tanstack/react-router'
import { api } from '../lib/api'

export const Route = createFileRoute('/clients/new')({
  beforeLoad: async () => {
    try { await api('/auth/me') } catch { throw redirect({ to: '/login' }) }
  },
  component: NewClient,
})

const input = 'border-line bg-bg w-full rounded-lg border px-3 py-2 outline-none focus:border-accent'
const label = 'text-dim mb-1 block text-sm'

function NewClient() {
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const err = document.getElementById('err')!
    err.textContent = ''
    try {
      const r = await api<{ client: { id: string } }>('/clients', {
        method: 'POST',
        body: JSON.stringify({
          name: f.get('name'), goal: f.get('goal'),
          pkg_total: Number(f.get('pkg_total') || 0),
          phone: f.get('phone') || undefined,
          notes: f.get('notes') || undefined,
        }),
      })
      location.href = `/clients/${r.client.id}`
    } catch (ex) {
      err.textContent = ex instanceof Error ? `Gagal: ${ex.message}` : 'Gagal menyimpan.'
    }
  }

  return (
    <main className="bg-bg text-text min-h-dvh p-6 md:p-10">
      <form onSubmit={onSubmit} className="bg-panel border-line mx-auto max-w-md rounded-2xl border p-6">
        <h1 className="mb-6 text-lg font-semibold">Klien Baru</h1>
        <label className={label}>Nama</label>
        <input name="name" required maxLength={100} className={`${input} mb-4`} />
        <label className={label}>Tujuan</label>
        <select name="goal" className={`${input} mb-4`}>
          <option value="fat_loss">Fat Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
          <option value="general">General Fitness</option>
        </select>
        <label className={label}>Total Sesi Paket</label>
        <input name="pkg_total" type="number" min={0} max={1000} defaultValue={12} className={`${input} mb-4`} />
        <label className={label}>No. WA (opsional)</label>
        <input name="phone" maxLength={20} className={`${input} mb-4`} />
        <label className={label}>Catatan (opsional)</label>
        <textarea name="notes" maxLength={500} rows={3} className={`${input} mb-4`} />
        <p id="err" className="text-red-400 mb-3 min-h-5 text-sm"></p>
        <button type="submit" className="bg-accent hover:opacity-90 w-full rounded-lg py-2 font-semibold text-black">
          Simpan
        </button>
      </form>
    </main>
  )
}
