import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ArrowLeft, UserPlus, Dumbbell, ShieldCheck } from 'lucide-react'
import { api, type User } from '../lib/api'
import { AppLayout } from '../components/AppLayout'

export type TrainerOption = {
  id: string
  name: string
  email: string
  role?: string
}

export const Route = createFileRoute('/clients/new')({
  beforeLoad: async () => {
    try {
      const res = await api<{ user: User }>('/auth/me')
      if (res.user.role === 'client') throw redirect({ to: '/portal' })
    } catch (e) {
      if (e && typeof e === 'object' && 'to' in e) throw e
      throw redirect({ to: '/login' })
    }
  },
  loader: async () => {
    const meRes = await api<{ user: User }>('/auth/me')
    let trainers: TrainerOption[] = []
    if (meRes.user.role === 'admin_studio' || meRes.user.role === 'manager' || meRes.user.role === 'platform_admin') {
      const staffRes = await api<{ staff: Array<{ id: string; name: string; email: string }> }>('/staff').catch(() => ({ staff: [] }))
      trainers = (staffRes.staff || []).map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
      }))
      // Pastikan ada akun trainer yang bisa dipilih
      if (trainers.length === 0) {
        trainers = [{ id: meRes.user.id, name: meRes.user.name, email: meRes.user.email }]
      }
    }
    return {
      currentUser: meRes.user,
      trainers,
    }
  },
  component: NewClient,
})

const input = 'border-line bg-bg w-full rounded-xl border px-3.5 py-2.5 outline-none focus:border-accent transition-colors'
const label = 'text-dim mb-1.5 block text-xs font-semibold'

function NewClient() {
  const { currentUser, trainers } = Route.useLoaderData()
  const [selectedPtId, setSelectedPtId] = useState<string>(trainers[0]?.id || currentUser.id)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const isAdminOrManager = currentUser.role === 'admin_studio' || currentUser.role === 'manager' || currentUser.role === 'platform_admin'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg('')
    setSubmitting(true)

    const f = new FormData(e.currentTarget)
    try {
      const r = await api<{ client: { id: string } }>('/clients', {
        method: 'POST',
        body: JSON.stringify({
          name: f.get('name'),
          goal: f.get('goal'),
          pkg_total: Number(f.get('pkg_total') || 0),
          email: f.get('email') || undefined,
          phone: f.get('phone') || undefined,
          notes: f.get('notes') || undefined,
          pt_id: isAdminOrManager && selectedPtId ? selectedPtId : undefined,
        }),
      })
      window.location.href = `/clients/${r.client.id}`
    } catch (ex) {
      setErrorMsg(ex instanceof Error ? `Gagal: ${ex.message}` : 'Gagal menyimpan data klien.')
      setSubmitting(false)
    }
  }

  return (
    <AppLayout currentUser={currentUser} activeRoute="new_client">
      <main className="flex-1 w-full p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-12">
        <div className="w-full max-w-3xl space-y-4">
          <div className="flex items-center justify-between">
            <a
              href="/clients"
              className="btn-interactive inline-flex items-center gap-1.5 text-xs font-mono text-dim hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Direktori Klien</span>
            </a>
          </div>

          <form onSubmit={onSubmit} className="bg-panel border border-line rounded-2xl p-5 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.7)] animate-fade-in space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-line">
              <div className="w-10 h-10 rounded-xl bg-bg border border-accent/40 flex items-center justify-center text-accent">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-text">Pendaftaran Klien Baru</h1>
                <p className="text-xs text-dim">Isi informasi awal profil klien untuk mulai pelacakan</p>
              </div>
            </div>

            {/* ── Admin / Manager Dedicated Trainer Selection ── */}
            {isAdminOrManager && (
              <div className="p-4 rounded-xl bg-bg border border-accent/40 shadow-sm animate-fade-in space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Dumbbell className="w-3.5 h-3.5 text-accent" />
                    <span>Pilih PT Penanggung Jawab</span>
                    <span className="text-accent">*</span>
                  </label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-accent/15 text-accent border border-accent/25">
                    Fitur {currentUser.role.toUpperCase()}
                  </span>
                </div>

                {trainers.length > 0 ? (
                  <select
                    name="pt_id"
                    required
                    value={selectedPtId}
                    onChange={(e) => setSelectedPtId(e.target.value)}
                    className="w-full bg-panel border border-line focus:border-accent text-text rounded-xl px-3.5 py-2.5 outline-none text-base sm:text-sm font-semibold transition-colors"
                  >
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs text-dim py-1 font-mono">
                    Belum ada pelatih terdaftar di studio. Klien akan ditautkan ke akun Anda.
                  </div>
                )}

                <p className="text-[11px] text-dim leading-relaxed">
                  Sebagai <strong>{currentUser.role.toUpperCase()}</strong>, Anda dapat mendaftarkan klien dan menunjuk pelatih (PT) yang akan bertanggung jawab.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Nama Lengkap Klien <span className="text-accent">*</span></label>
                <input
                  name="name"
                  required
                  maxLength={100}
                  placeholder="misal: Rian Pratama"
                  className={`${input} text-base sm:text-sm`}
                />
              </div>

              <div>
                <label className={label}>Tujuan Utama Latihan <span className="text-accent">*</span></label>
                <select name="goal" className={`${input} text-base sm:text-sm`}>
                  <option value="fat_loss">Fat Loss (Penurunan Lemak)</option>
                  <option value="muscle_gain">Muscle Gain (Peningkatan Massa Otot)</option>
                  <option value="general">General Fitness &amp; Stamina</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Total Kuota Sesi Paket <span className="text-accent">*</span></label>
                <input
                  name="pkg_total"
                  type="number"
                  min={0}
                  max={1000}
                  defaultValue={12}
                  className={`${input} font-mono text-base sm:text-sm`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={label}>Email Klien (opsional)</label>
                  <span className="text-[10px] text-accent font-mono">Untuk Login Portal</span>
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="klien@gmail.com"
                  className={`${input} text-base sm:text-sm`}
                />
              </div>
            </div>

            <div>
              <label className={label}>Nomor WhatsApp / HP (opsional)</label>
              <input
                name="phone"
                maxLength={20}
                placeholder="08xxxxxxxxxx"
                className={`${input} font-mono text-base sm:text-sm`}
              />
            </div>

            <div>
              <label className={label}>Catatan Tambahan (opsional)</label>
              <textarea
                name="notes"
                maxLength={500}
                rows={3}
                placeholder="Riwayat kebugaran, preferensi jadwal, atau keluhan cedera..."
                className={`${input} text-base sm:text-sm`}
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-shake">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-interactive bg-accent hover:bg-accent/90 disabled:opacity-50 w-full rounded-xl py-3 sm:py-2.5 font-bold text-[#141414] text-sm transition-all shadow-[0_2px_14px_rgba(226,232,0,0.25)] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin"></span>
                  <span>Menyimpan Klien...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Simpan Data Klien</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </AppLayout>
  )
}
