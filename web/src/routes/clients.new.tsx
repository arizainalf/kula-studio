import { createFileRoute, redirect } from '@tanstack/react-router'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { api } from '../lib/api'
import { ThemeToggle } from '../components/ThemeToggle'

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
    <main className="bg-bg text-text min-h-dvh p-4 sm:p-6 md:p-10 selection:bg-accent/30 selection:text-text font-sans antialiased">
      <div className="mx-auto max-w-md mb-4 flex items-center justify-between">
        <a
          href="/"
          className="btn-interactive inline-flex items-center gap-1.5 text-xs font-mono text-dim hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Dashboard</span>
        </a>

        <ThemeToggle />
      </div>

      <form onSubmit={onSubmit} className="bg-panel border-line mx-auto max-w-md rounded-2xl border p-5 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.7)] animate-fade-in">
        <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-line">
          <div className="w-9 h-9 rounded-xl bg-bg border border-accent/40 flex items-center justify-center text-accent">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text">Pendaftaran Klien Baru</h1>
            <p className="text-xs text-dim">Isi informasi awal profil klien untuk mulai pelacakan</p>
          </div>
        </div>

        <label className={label}>Nama Klien</label>
        <input name="name" required maxLength={100} placeholder="Nama lengkap klien" className={`${input} mb-4 text-base sm:text-sm`} />

        <label className={label}>Tujuan Utama</label>
        <select name="goal" className={`${input} mb-4 text-base sm:text-sm`}>
          <option value="fat_loss">Fat Loss (Penurunan Lemak)</option>
          <option value="muscle_gain">Muscle Gain (Peningkatan Massa Otot)</option>
          <option value="general">General Fitness &amp; Stamina</option>
        </select>

        <label className={label}>Total Kuota Sesi Paket</label>
        <input name="pkg_total" type="number" min={0} max={1000} defaultValue={12} className={`${input} mb-4 font-mono text-base sm:text-sm`} />

        <label className={label}>Nomor WhatsApp (opsional)</label>
        <input name="phone" maxLength={20} placeholder="08xxxxxxxxxx" className={`${input} mb-4 font-mono text-base sm:text-sm`} />

        <label className={label}>Catatan Tambahan (opsional)</label>
        <textarea name="notes" maxLength={500} rows={3} placeholder="Riwayat kebugaran, keluhan ringan, atau jadwal preferensi..." className={`${input} mb-4 text-base sm:text-sm`} />

        <p id="err" className="text-rose-400 mb-4 min-h-5 text-xs font-medium"></p>
        <button
          type="submit"
          className="btn-interactive bg-accent hover:bg-accent/90 w-full rounded-xl py-3 sm:py-2.5 font-semibold text-black text-sm transition-all shadow-[0_2px_14px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2"
        >
          <span>Simpan Data Klien</span>
        </button>
      </form>
    </main>
  )
}
