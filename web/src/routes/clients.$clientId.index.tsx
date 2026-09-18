import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { api } from '../lib/api'
import { Sparkline, type Point } from '../components/Sparkline'
import { ThemeToggle } from '../components/ThemeToggle'
import {
  formatDate,
  formatShortDate,
  formatDateWithDay,
  formatFullDate,
  formatTime,
  getLocalTodayString,
  getLocalFutureDateString,
} from '../lib/date'
import {
  ArrowLeft,
  Printer,
  Edit3,
  Plus,
  MessageSquare,
  History,
  TrendingUp,
  Calendar,
  Camera,
  UserCheck,
  Send,
  Flame,
  Dumbbell,
  HeartPulse,
  Wind,
  Trash2,
  Upload,
  Search,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react'

export const Route = createFileRoute('/clients/$clientId/')({
  beforeLoad: async () => {
    try { await api('/auth/me') } catch { throw redirect({ to: '/login' }) }
  },
  loader: async ({ params }) => {
    const fromDate = getLocalFutureDateString(-30)
    const toDate = getLocalFutureDateString(90)

    const [clientRes, sessionsRes, photosRes, schedRes] = await Promise.all([
      api<{ client: Client }>(`/clients/${params.clientId}`),
      api<{ sessions: Session[] }>(`/clients/${params.clientId}/sessions?limit=100`),
      api<{ photos: Photo[] }>(`/photos/${params.clientId}`).catch(() => ({ photos: [] })),
      api<{ schedule: ClientSchedule[] }>(`/schedule?from=${fromDate}&to=${toDate}`).catch(() => ({ schedule: [] })),
    ])

    const clientSchedule = schedRes.schedule.filter((s: ClientSchedule) => s.client_id === params.clientId)

    return {
      client: clientRes.client,
      sessions: sessionsRes.sessions,
      photos: photosRes.photos,
      schedule: clientSchedule,
    }
  },
  component: ClientDetail,
})

export type Client = {
  id: string
  name: string
  goal: string
  pkg_total: number
  pkg_used: number
  avg_rpe?: number
  last_session_date?: string | null
  phone?: string | null
  notes?: string | null
  age_bracket?: string | null
  gender?: 'pria' | 'wanita' | null
  problem?: 'none' | 'knee' | 'back' | 'shoulder' | string | null
  is_active?: boolean
  created_at?: string
}

export type Session = {
  id: string
  date: string
  rpe: number
  weight: number | null
  fat_pct: number | null
  exercises: Array<{ warmup: Ex[]; resistance: Ex[]; cardio: Ex[]; cooldown: Ex[] }>
  notes: string | null
  created_at?: string
}

type Ex = { name: string; detail?: string }
type Photo = { id: string; session_id: string | null; created_at: string }
type ClientSchedule = { id: string; client_id: string; pt_id: string; date: string; time: string; note?: string | null }

function ClientDetail() {
  const { client: initialClient, sessions, photos: initialPhotos, schedule: initialSchedule } = Route.useLoaderData() as {
    client: Client
    sessions: Session[]
    photos: Photo[]
    schedule: ClientSchedule[]
  }

  const [client, setClient] = useState<Client>(initialClient)
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [scheduleList, setScheduleList] = useState<ClientSchedule[]>(initialSchedule)
  const [activeTab, setActiveTab] = useState<'sessions' | 'charts' | 'schedule' | 'photos' | 'info'>('sessions')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'rpe_high' | 'rpe_low'>('newest')
  const [sessionSearch, setSessionSearch] = useState('')
  const [msg, setMsg] = useState('')

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null)

  // Edit form state
  const [editName, setEditName] = useState(client.name)
  const [editGoal, setEditGoal] = useState(client.goal)
  const [editPkgTotal, setEditPkgTotal] = useState(client.pkg_total)
  const [editPhone, setEditPhone] = useState(client.phone ?? '')
  const [editProblem, setEditProblem] = useState(client.problem ?? 'none')
  const [editNotes, setEditNotes] = useState(client.notes ?? '')
  const [editSubmitting, setEditSubmitting] = useState(false)

  // New Schedule form state
  const [schedDate, setSchedDate] = useState(getLocalTodayString())
  const [schedTime, setSchedTime] = useState('08:00')
  const [schedNote, setSchedNote] = useState('')
  const [schedSubmitting, setSchedSubmitting] = useState(false)

  const remainingSessions = client.pkg_total - client.pkg_used
  const isUrgentUpsell = client.pkg_total > 0 && remainingSessions <= 3
  const progressPct = client.pkg_total > 0 ? Math.round((client.pkg_used / client.pkg_total) * 100) : 0
  const avgRpeValue = sessions.length
    ? (sessions.reduce((acc: number, s: Session) => acc + s.rpe, 0) / sessions.length).toFixed(1)
    : client.avg_rpe ? Number(client.avg_rpe).toFixed(1) : '—'

  // Photo Upload Handler
  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMsg('Mengunggah foto progress…')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(`/api/photos/${client.id}`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'gagal')
      const data = await res.json()
      setPhotos((prev) => [data.photo, ...prev])
      setMsg('Foto berhasil diunggah.')
      setTimeout(() => setMsg(''), 3000)
    } catch (ex) {
      setMsg(ex instanceof Error ? `Gagal: ${ex.message}` : 'Gagal mengunggah foto.')
    }
  }

  // Edit Client Submit Handler
  async function handleEditClient(e: React.FormEvent) {
    e.preventDefault()
    setEditSubmitting(true)
    try {
      const res = await api<{ client: Client }>(`/clients/${client.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName,
          goal: editGoal,
          pkg_total: Number(editPkgTotal),
          phone: editPhone.trim() || null,
          problem: editProblem,
          notes: editNotes.trim() || null,
        }),
      })
      setClient((prev) => ({
        ...prev,
        ...res.client,
        pkg_used: prev.pkg_used,
        avg_rpe: prev.avg_rpe,
      }))
      setIsEditModalOpen(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui klien.')
    } finally {
      setEditSubmitting(false)
    }
  }

  // Schedule Add Handler
  async function handleAddSchedule(e: React.FormEvent) {
    e.preventDefault()
    setSchedSubmitting(true)
    try {
      const res = await api<{ schedule: ClientSchedule }>('/schedule', {
        method: 'POST',
        body: JSON.stringify({
          client_id: client.id,
          date: schedDate,
          time: schedTime,
          note: schedNote.trim() || undefined,
        }),
      })
      setScheduleList((prev) => [...prev, res.schedule])
      setIsScheduleModalOpen(false)
      setSchedNote('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menambahkan jadwal.')
    } finally {
      setSchedSubmitting(false)
    }
  }

  // Schedule Delete Handler
  async function handleDeleteSchedule(schedId: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return
    try {
      await api(`/schedule/${schedId}`, { method: 'DELETE' })
      setScheduleList((prev) => prev.filter((s) => s.id !== schedId))
    } catch {
      alert('Gagal menghapus jadwal.')
    }
  }

  // WhatsApp Recap Generator
  function generateSessionWaText(s: Session) {
    const dateFormatted = formatDateWithDay(s.date)
    let text = `*Halo ${client.name}!* 💪 Berikut adalah ringkasan sesi latihan kita pada tanggal *${dateFormatted}*:\n\n`
    text += `📊 *Intensitas (RPE):* ${s.rpe}/10\n`
    if (s.weight) text += `⚖️ *Berat Badan:* ${s.weight} kg\n`
    if (s.fat_pct) text += `📉 *Lemak Tubuh:* ${s.fat_pct}%\n\n`

    const exerciseGroup = Array.isArray(s.exercises) ? s.exercises[0] : s.exercises
    if (exerciseGroup) {
      if (exerciseGroup.warmup?.length) {
        text += `🟢 *Warm-up:*\n` + exerciseGroup.warmup.map((e: Ex) => `• ${e.name} ${e.detail ? `(${e.detail})` : ''}`).join('\n') + `\n\n`
      }
      if (exerciseGroup.resistance?.length) {
        text += `🟡 *Resistance:*\n` + exerciseGroup.resistance.map((e: Ex) => `• ${e.name} ${e.detail ? `(${e.detail})` : ''}`).join('\n') + `\n\n`
      }
      if (exerciseGroup.cardio?.length) {
        text += `🔵 *Cardio:*\n` + exerciseGroup.cardio.map((e: Ex) => `• ${e.name} ${e.detail ? `(${e.detail})` : ''}`).join('\n') + `\n\n`
      }
      if (exerciseGroup.cooldown?.length) {
        text += `🟣 *Cool-down:*\n` + exerciseGroup.cooldown.map((e: Ex) => `• ${e.name} ${e.detail ? `(${e.detail})` : ''}`).join('\n') + `\n\n`
      }
    }
    if (s.notes) text += `📝 *Catatan Coach:* "${s.notes}"\n\n`
    text += `Tetap konsisten dan jaga asupan nutrisi! Sampai jumpa di sesi berikutnya. 🔥`
    return encodeURIComponent(text)
  }

  // Export PDF with Luxury Printable Layout
  function exportPdf() {
    const sorted = [...sessions].sort((a: Session, b: Session) => a.date.localeCompare(b.date))
    const rows = sorted
      .map((s: Session) => {
        const eg = Array.isArray(s.exercises) ? s.exercises[0] : s.exercises
        const exList = eg
          ? [...(eg.warmup || []), ...(eg.resistance || []), ...(eg.cardio || []), ...(eg.cooldown || [])]
              .map((e: Ex) => `${esc(e.name)}${e.detail ? ` (${esc(e.detail)})` : ''}`)
              .join('; ')
          : '—'

        return `
          <tr>
            <td style="font-weight:600">${formatDate(s.date)}</td>
            <td style="color:#d4af37;font-weight:bold">${s.rpe}/10</td>
            <td>${s.weight != null ? `${s.weight} kg` : '—'}</td>
            <td>${s.fat_pct != null ? `${s.fat_pct}%` : '—'}</td>
            <td style="font-size:11px">${exList}</td>
            <td style="font-style:italic;color:#666">${esc(s.notes ?? '—')}</td>
          </tr>`
      })
      .join('')

    const w = window.open('', '_blank', 'width=900,height=1000')
    if (!w) {
      alert('Popup diblokir oleh browser — izinkan popup untuk mencetak laporan.')
      return
    }

    w.document.write(`<!doctype html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Laporan Latihan — ${esc(client.name)}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 36px; color: #1a1a1a; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #222; padding-bottom: 16px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .logo span { color: #d4af37; }
        .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 14px; margin-bottom: 24px; }
        .meta-item { font-size: 12px; color: #6c757d; }
        .meta-value { font-size: 14px; font-weight: bold; color: #212529; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
        th { background: #1a1a1a; color: #fff; text-align: left; padding: 10px 8px; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        td { border-bottom: 1px solid #dee2e6; padding: 10px 8px; vertical-align: top; }
        tr:nth-child(even) { background: #fafafa; }
        .footer { margin-top: 36px; border-top: 1px solid #e9ecef; padding-top: 12px; font-size: 11px; color: #adb5bd; display: flex; justify-content: space-between; }
        @media print {
          body { margin: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">Train<span>Log</span></div>
          <div style="font-size: 13px; color: #6c757d; margin-top: 4px;">Laporan Riwayat Sesi &amp; Evaluasi Kebugaran</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #6c757d;">
          Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">Nama Klien<div class="meta-value">${esc(client.name)}</div></div>
        <div class="meta-item">Target Latihan<div class="meta-value">${goalLabel(client.goal)}</div></div>
        <div class="meta-item">Status Kuota Paket<div class="meta-value">${client.pkg_used} / ${client.pkg_total} Sesi</div></div>
        <div class="meta-item">Rata-rata RPE<div class="meta-value">${avgRpeValue} / 10</div></div>
      </div>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Riwayat Sesi Latihan (${sessions.length})</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 80px">Tanggal</th>
            <th style="width: 60px">RPE</th>
            <th style="width: 75px">BB (kg)</th>
            <th style="width: 75px">Lemak %</th>
            <th>Latihan (Set / Rep / Beban)</th>
            <th style="width: 140px">Catatan Coach</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="footer">
        <span>TrainLog — Sistem Manajemen Sesi Latihan Personal Trainer</span>
        <span>Halaman 1 dari 1</span>
      </div>
      <script>window.onload = () => window.print();</script>
    </body>
    </html>`)
    w.document.close()
  }

  // Filtered & Sorted Sessions
  const filteredSessions = sessions
    .filter((s: Session) => {
      if (!sessionSearch) return true
      const term = sessionSearch.toLowerCase()
      if (s.notes && s.notes.toLowerCase().includes(term)) return true
      const eg = Array.isArray(s.exercises) ? s.exercises[0] : s.exercises
      if (eg) {
        const all = [...(eg.warmup || []), ...(eg.resistance || []), ...(eg.cardio || []), ...(eg.cooldown || [])]
        return all.some((e) => e.name.toLowerCase().includes(term) || (e.detail && e.detail.toLowerCase().includes(term)))
      }
      return false
    })
    .sort((a: Session, b: Session) => {
      if (sortOrder === 'newest') return b.date.localeCompare(a.date)
      if (sortOrder === 'oldest') return a.date.localeCompare(b.date)
      if (sortOrder === 'rpe_high') return b.rpe - a.rpe
      if (sortOrder === 'rpe_low') return a.rpe - b.rpe
      return 0
    })

  return (
    <main className="bg-bg text-text min-h-dvh p-3.5 sm:p-8 md:p-10 selection:bg-accent/30 selection:text-text font-sans antialiased">
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
        {/* ── 1. Top Navigation Bar & Actions ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line/60 animate-fade-in">
          <a
            href="/"
            className="text-dim hover:text-accent text-xs font-mono flex items-center gap-1.5 transition-colors w-fit btn-interactive"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Dashboard</span>
          </a>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
            <ThemeToggle />

            <button
              onClick={exportPdf}
              className="bg-panel hover:bg-panel-elevated text-text border border-line hover:border-accent/40 text-xs px-3 sm:px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 btn-interactive"
            >
              <Printer className="w-3.5 h-3.5 text-dim" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-panel hover:bg-panel-elevated text-text border border-line hover:border-accent/40 text-xs px-3 sm:px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 btn-interactive"
            >
              <Edit3 className="w-3.5 h-3.5 text-dim" />
              <span>Edit Profil</span>
            </button>

            <a
              href={`/clients/${client.id}/log`}
              className="bg-accent hover:bg-accent/90 text-black font-semibold text-xs px-3.5 sm:px-4 py-2 rounded-xl shadow-[0_2px_12px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_18px_rgba(212,175,55,0.4)] transition-all flex items-center gap-1.5 btn-interactive"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Catat Sesi</span>
            </a>
          </div>
        </div>

        {/* ── 2. Client Profile Hero Header (Luxury Card) ── */}
        <section className="p-4 sm:p-6 md:p-8 rounded-3xl bg-panel border border-line shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden animate-fade-in-up">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mb-6">
            <div className="flex items-start sm:items-center gap-4">
              {/* Luxury Monogram Avatar */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-bg border-2 border-accent/60 flex items-center justify-center text-accent font-extrabold text-xl sm:text-2xl shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 transition-all duration-300 shrink-0 cursor-pointer">
                {client.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-text truncate">
                    {client.name}
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Aktif" />
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 shrink-0">
                    {goalLabel(client.goal)}
                  </span>
                </div>

                {/* Subtitle meta tags */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs text-dim font-mono flex-wrap">
                  {client.gender && <span>{client.gender === 'pria' ? 'Pria' : 'Wanita'}</span>}
                  {client.age_bracket && <span>&bull; {client.age_bracket}</span>}
                  {client.problem && client.problem !== 'none' && (
                    <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                      Cedera: {client.problem.toUpperCase()}
                    </span>
                  )}
                  {client.phone && (
                    <a
                      href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-text hover:text-accent underline flex items-center gap-1 transition-colors truncate"
                    >
                      <span>WA: {client.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Reminder action */}
            {client.phone && (
              <a
                href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="bg-bg hover:bg-panel-elevated border border-line hover:border-accent/50 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-text w-full sm:w-fit justify-center shrink-0 btn-interactive"
              >
                <MessageSquare className="w-3.5 h-3.5 text-accent" />
                <span>Chat WhatsApp Klien</span>
              </a>
            )}
          </div>

          {/* 4 Core Stat Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-5 sm:pt-6 border-t border-line">
            <div className="p-3 sm:p-3.5 rounded-xl bg-bg border border-line hover-gold-glow transition-all duration-300 min-w-0">
              <div className="text-[10px] sm:text-[11px] font-mono text-dim uppercase truncate">Sesi Terpakai</div>
              <div className="text-lg sm:text-2xl font-extrabold text-text mt-1 truncate">{client.pkg_used} Sesi</div>
              <div className="text-[10px] text-dim mt-0.5 truncate">{progressPct}% kuota terpakai</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-bg border border-line hover-gold-glow transition-all duration-300 min-w-0">
              <div className="text-[10px] sm:text-[11px] font-mono text-dim uppercase truncate">Total Paket</div>
              <div className="text-lg sm:text-2xl font-extrabold text-text mt-1 truncate">{client.pkg_total} Sesi</div>
              <div className="text-[10px] text-dim mt-0.5 truncate">Paket aktif</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-bg border border-line hover-gold-glow transition-all duration-300 min-w-0">
              <div className="text-[10px] sm:text-[11px] font-mono text-dim uppercase truncate">Sisa Kuota</div>
              <div className={`text-lg sm:text-2xl font-extrabold mt-1 truncate ${isUrgentUpsell ? 'text-amber-400' : 'text-accent'}`}>
                {remainingSessions <= 0 ? 'Habis (0)' : `${remainingSessions} Sesi`}
              </div>
              <div className={`text-[10px] mt-0.5 truncate ${isUrgentUpsell ? 'text-amber-400 font-semibold' : 'text-dim'}`}>
                {isUrgentUpsell ? 'Perlu Upsell!' : 'Masih aman'}
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-bg border border-line hover-gold-glow transition-all duration-300 min-w-0">
              <div className="text-[10px] sm:text-[11px] font-mono text-dim uppercase truncate">Rata-Rata RPE</div>
              <div className="text-lg sm:text-2xl font-extrabold text-text mt-1 truncate">{avgRpeValue} / 10</div>
              <div className="text-[10px] text-dim mt-0.5 truncate">Intensitas rata-rata</div>
            </div>
          </div>

          {/* Package Utilization Meter */}
          <div className="mt-4 pt-3 border-t border-line/40">
            <div className="flex items-center justify-between text-xs text-dim mb-1.5 font-mono">
              <span>Progres Sesi Paket</span>
              <span className="text-accent font-semibold">{client.pkg_used} dari {client.pkg_total} Sesi Selesai</span>
            </div>
            <div className="w-full h-2 bg-bg rounded-full overflow-hidden border border-line">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isUrgentUpsell ? 'bg-amber-400' : 'bg-accent'}`}
                style={{ width: `${Math.min(progressPct, 100)}%` }}
              />
            </div>
          </div>
        </section>

        {/* ── 3. Upsell Alert Notice (if remaining <= 3) ── */}
        {isUrgentUpsell && (
          <div className="p-4 sm:p-5 rounded-2xl bg-panel border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-panel to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                <h3 className="font-bold text-sm text-text">Peringatan: Paket Sesi Klien Ini Hampir Habis</h3>
              </div>
              <p className="text-xs text-dim">
                Klien hanya memiliki sisa <strong>{remainingSessions <= 0 ? 0 : remainingSessions} sesi</strong> latihan. Tawarkan perpanjangan paket agar ritme latihan tidak terputus.
              </p>
            </div>
            {client.phone && (
              <a
                href={`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Halo ${client.name}, sesi latihanmu di TrainLog tersisa ${remainingSessions} sesi lagi. Mau kita lanjutkan paket berikutnya untuk mencapai target kebugaranmu?`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-accent hover:bg-accent/90 text-black font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shrink-0 text-center shadow-[0_2px_10px_rgba(212,175,55,0.25)] btn-interactive"
              >
                Kirim Penawaran WA
              </a>
            )}
          </div>
        )}

        {/* ── 4. Tab Navigation (Touch-friendly Horizontal Scroll on Mobile) ── */}
        <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto text-xs font-mono no-scrollbar touch-scroll -mx-1 px-1">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 btn-interactive ${
              activeTab === 'sessions'
                ? 'bg-accent text-black font-bold shadow-[0_2px_12px_rgba(212,175,55,0.3)] scale-[1.02]'
                : 'text-dim hover:text-text bg-panel border border-line hover:border-accent/40'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Sesi ({sessions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 btn-interactive ${
              activeTab === 'charts'
                ? 'bg-accent text-black font-bold shadow-[0_2px_12px_rgba(212,175,55,0.3)] scale-[1.02]'
                : 'text-dim hover:text-text bg-panel border border-line hover:border-accent/40'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Grafik Progres (3)</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 btn-interactive ${
              activeTab === 'schedule'
                ? 'bg-accent text-black font-bold shadow-[0_2px_12px_rgba(212,175,55,0.3)] scale-[1.02]'
                : 'text-dim hover:text-text bg-panel border border-line hover:border-accent/40'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal Sesi ({scheduleList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 btn-interactive ${
              activeTab === 'photos'
                ? 'bg-accent text-black font-bold shadow-[0_2px_12px_rgba(212,175,55,0.3)] scale-[1.02]'
                : 'text-dim hover:text-text bg-panel border border-line hover:border-accent/40'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Foto Progress ({photos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 btn-interactive ${
              activeTab === 'info'
                ? 'bg-accent text-black font-bold shadow-[0_2px_12px_rgba(212,175,55,0.3)] scale-[1.02]'
                : 'text-dim hover:text-text bg-panel border border-line hover:border-accent/40'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Info &amp; Catatan Medis</span>
          </button>
        </div>

        {/* ── 5. Tab Content ── */}

        {/* TAB 1: RIWAYAT SESI */}
        {activeTab === 'sessions' && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-3.5 rounded-2xl border border-line">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari gerakan latihan atau catatan sesi..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  className="w-full bg-bg border border-line rounded-xl pl-8 pr-8 py-2 text-sm sm:text-xs text-text placeholder:text-muted outline-none focus:border-accent"
                />
                {sessionSearch && (
                  <button
                    onClick={() => setSessionSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-text text-xs p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono w-full sm:w-auto">
                <span className="text-dim">Urutkan:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                  className="bg-bg border border-line rounded-lg px-2.5 py-1.5 text-sm sm:text-xs text-text outline-none focus:border-accent font-mono"
                >
                  <option value="newest">Terbaru Dulu</option>
                  <option value="oldest">Terlama Dulu</option>
                  <option value="rpe_high">RPE Tertinggi</option>
                  <option value="rpe_low">RPE Terendah</option>
                </select>
              </div>
            </div>

            {/* Sessions Cards */}
            {filteredSessions.length === 0 ? (
              <div className="p-12 rounded-2xl bg-panel border border-line text-center">
                <p className="text-dim text-sm mb-4">
                  {sessionSearch ? 'Tidak ada sesi yang cocok dengan kata kunci pencarian.' : 'Belum ada sesi latihan yang tercatat untuk klien ini.'}
                </p>
                <a
                  href={`/clients/${client.id}/log`}
                  className="inline-block bg-accent hover:bg-accent/90 text-black text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  + Catat Sesi Latihan Pertama
                </a>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredSessions.map((s: Session, idx: number) => {
                  const eg = Array.isArray(s.exercises) ? s.exercises[0] : s.exercises
                  return (
                    <div
                      key={s.id}
                      style={{ animationDelay: `${idx * 40}ms` }}
                      className="p-5 rounded-2xl bg-panel border border-line hover-gold-glow transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.4)] animate-fade-in-up"
                    >
                      {/* Top Header of Session Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-line mb-3.5">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-bg border border-line flex items-center justify-center font-mono font-bold text-xs text-accent">
                            #{filteredSessions.length - idx}
                          </span>
                          <div>
                            <span className="font-bold text-sm text-text block">
                              {formatFullDate(s.date)}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-dim font-mono mt-0.5">
                              {s.weight != null && <span>BB: <strong className="text-text">{s.weight} kg</strong></span>}
                              {s.fat_pct != null && <span>Fat: <strong className="text-text">{s.fat_pct}%</strong></span>}
                            </div>
                          </div>
                        </div>

                        {/* RPE & WhatsApp recap button */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${
                              s.rpe >= 9
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : s.rpe >= 7
                                  ? 'bg-accent/15 text-accent border-accent/30'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            RPE {s.rpe} / 10
                          </span>

                          {client.phone && (
                            <a
                              href={`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${generateSessionWaText(s)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-dim hover:text-accent text-xs p-1.5 rounded-lg bg-bg border border-line hover:border-accent/40 transition-colors flex items-center gap-1"
                              title="Kirim Rekap Sesi via WhatsApp"
                            >
                              <Send className="w-3 h-3" />
                              <span>WA Recap</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* 4 Phase Exercises Grid */}
                      {eg && (
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                          {/* Warm-Up */}
                          <div className="p-3 rounded-xl bg-bg border border-line/60">
                            <div className="text-[10px] text-emerald-400 font-mono uppercase font-bold mb-1.5 flex items-center gap-1.5">
                              <Flame className="w-3.5 h-3.5" />
                              <span>Warm-Up</span>
                            </div>
                            {eg.warmup?.length ? (
                              <ul className="space-y-1 text-dim">
                                {eg.warmup.map((ex: Ex, i: number) => (
                                  <li key={i} className="text-[11px]">
                                    <span className="text-text font-medium">{ex.name}</span>
                                    {ex.detail && <span className="block text-[10px] opacity-75">{ex.detail}</span>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted text-[11px] italic">Tidak ada catatan</span>
                            )}
                          </div>

                          {/* Resistance */}
                          <div className="p-3 rounded-xl bg-bg border border-line/60">
                            <div className="text-[10px] text-accent font-mono uppercase font-bold mb-1.5 flex items-center gap-1.5">
                              <Dumbbell className="w-3.5 h-3.5" />
                              <span>Resistance</span>
                            </div>
                            {eg.resistance?.length ? (
                              <ul className="space-y-1 text-dim">
                                {eg.resistance.map((ex: Ex, i: number) => (
                                  <li key={i} className="text-[11px]">
                                    <span className="text-text font-medium">{ex.name}</span>
                                    {ex.detail && <span className="block text-[10px] text-accent font-mono">{ex.detail}</span>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted text-[11px] italic">Tidak ada catatan</span>
                            )}
                          </div>

                          {/* Cardio */}
                          <div className="p-3 rounded-xl bg-bg border border-line/60">
                            <div className="text-[10px] text-sky-400 font-mono uppercase font-bold mb-1.5 flex items-center gap-1.5">
                              <HeartPulse className="w-3.5 h-3.5" />
                              <span>Cardio</span>
                            </div>
                            {eg.cardio?.length ? (
                              <ul className="space-y-1 text-dim">
                                {eg.cardio.map((ex: Ex, i: number) => (
                                  <li key={i} className="text-[11px]">
                                    <span className="text-text font-medium">{ex.name}</span>
                                    {ex.detail && <span className="block text-[10px] opacity-75">{ex.detail}</span>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted text-[11px] italic">Tidak ada catatan</span>
                            )}
                          </div>

                          {/* Cool-Down */}
                          <div className="p-3 rounded-xl bg-bg border border-line/60">
                            <div className="text-[10px] text-purple-400 font-mono uppercase font-bold mb-1.5 flex items-center gap-1.5">
                              <Wind className="w-3.5 h-3.5" />
                              <span>Cool-Down</span>
                            </div>
                            {eg.cooldown?.length ? (
                              <ul className="space-y-1 text-dim">
                                {eg.cooldown.map((ex: Ex, i: number) => (
                                  <li key={i} className="text-[11px]">
                                    <span className="text-text font-medium">{ex.name}</span>
                                    {ex.detail && <span className="block text-[10px] opacity-75">{ex.detail}</span>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted text-[11px] italic">Tidak ada catatan</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Coach Notes */}
                      {s.notes && (
                        <div className="mt-3 pt-2.5 border-t border-line/50 text-xs text-dim flex items-baseline gap-2">
                          <span className="text-accent text-[11px] font-mono uppercase">Coach Note:</span>
                          <span className="italic text-text">"{s.notes}"</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GRAFIK & ANALITIK PROGRESS */}
        {activeTab === 'charts' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-panel border border-line rounded-2xl p-5 shadow-[0_6px_20px_rgba(0,0,0,0.5)] hover-gold-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-dim">Berat Badan</span>
                  <span className="text-xs font-mono text-accent">Trend (kg)</span>
                </div>
                <Sparkline data={seriesOf(sessions, 'weight')} unit=" kg" color="var(--color-accent)" />
              </div>

              <div className="bg-panel border border-line rounded-2xl p-5 shadow-[0_6px_20px_rgba(0,0,0,0.5)] hover-gold-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-dim">Lemak Tubuh</span>
                  <span className="text-xs font-mono text-accent">Fat %</span>
                </div>
                <Sparkline data={seriesOf(sessions, 'fat_pct')} unit="%" color="var(--color-accent)" />
              </div>

              <div className="bg-panel border border-line rounded-2xl p-5 shadow-[0_6px_20px_rgba(0,0,0,0.5)] hover-gold-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-dim">Intensitas (RPE)</span>
                  <span className="text-xs font-mono text-accent">Skala 1-10</span>
                </div>
                <Sparkline data={seriesOf(sessions, 'rpe')} unit=" RPE" color="var(--color-accent)" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-panel border border-line hover-gold-glow transition-all duration-300">
              <h4 className="font-bold text-sm text-text mb-2">Evaluasi Beban &amp; Periodisasi Klien</h4>
              <p className="text-xs text-dim leading-relaxed max-w-2xl">
                Grafik di atas direkonstruksi dari data sesi latihan nyata. Evaluasi grafik dilakukan untuk menjaga prinsip <em>progressive overload</em> tanpa membebani kapasitas pemulihan klien (RPE &le; 8.5).
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: JADWAL KLIEN */}
        {activeTab === 'schedule' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-4 rounded-2xl border border-line">
              <div>
                <h3 className="font-bold text-sm text-text">Jadwal Sesi Latihan Klien</h3>
                <p className="text-xs text-dim">Atur jadwal latihan berkala dengan {client.name}</p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="bg-accent hover:bg-accent/90 text-black font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 btn-interactive shadow-[0_2px_10px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)] w-full sm:w-auto shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tambah Jadwal Klien</span>
              </button>
            </div>

            {scheduleList.length === 0 ? (
              <div className="p-10 rounded-2xl bg-panel border border-line text-center text-dim text-xs animate-fade-in">
                <p className="mb-3">Belum ada janji temu latihan terjadwal untuk klien ini.</p>
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="bg-panel hover:bg-panel-elevated border border-line hover:border-accent text-xs text-text px-4 py-2 rounded-lg inline-flex items-center gap-1.5 btn-interactive"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Jadwalkan Sesi Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {scheduleList
                  .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                  .map((item, idx) => (
                    <div
                      key={item.id}
                      style={{ animationDelay: `${idx * 40}ms` }}
                      className="p-4 rounded-xl bg-panel border border-line hover-gold-glow transition-all duration-300 flex items-center justify-between gap-3 animate-fade-in-up"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 text-center py-1.5 rounded-lg bg-bg border border-line shrink-0 font-mono">
                          <div className="text-xs font-bold text-accent">{formatTime(item.time)}</div>
                          <div className="text-[10px] text-dim">{formatShortDate(item.date)}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-text">
                            {formatFullDate(item.date)}
                          </div>
                          {item.note && <p className="text-xs text-dim mt-0.5">{item.note}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {client.phone && (
                          <a
                            href={`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Halo ${client.name}, mengingatkan sesi latihan kita pada ${formatDateWithDay(item.date)} pukul ${formatTime(item.time)} WIB. Sampai jumpa!`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-mono text-dim hover:text-accent bg-bg px-2.5 py-1.5 rounded-lg border border-line flex items-center gap-1 btn-interactive"
                          >
                            <Send className="w-3 h-3" />
                            <span>WA Ingatkan</span>
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteSchedule(item.id)}
                          className="text-dim hover:text-rose-400 text-xs p-1.5 rounded-lg hover:bg-bg transition-colors btn-interactive"
                          title="Hapus jadwal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FOTO PROGRESS */}
        {activeTab === 'photos' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-4 rounded-2xl border border-line">
              <div>
                <h3 className="font-bold text-sm text-text">Galeri Foto Transformasi</h3>
                <p className="text-xs text-dim">Dokumentasikan bentuk fisik dan progres visual klien</p>
              </div>

              <label className="bg-accent hover:bg-accent/90 text-black font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-[0_2px_10px_rgba(212,175,55,0.2)] hover:shadow-[0_4px_16px_rgba(212,175,55,0.35)] flex items-center justify-center gap-1.5 btn-interactive w-full sm:w-auto shrink-0">
                <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Unggah Foto Baru</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onUpload} />
              </label>
            </div>

            {msg && <p className="text-xs text-accent font-mono px-2 animate-fade-in">{msg}</p>}

            {photos.length === 0 ? (
              <div className="p-12 rounded-2xl bg-panel border border-line text-center text-dim text-xs animate-fade-in">
                <p className="mb-2">Belum ada foto progress yang diunggah.</p>
                <p className="text-[11px] text-muted">Ambil foto bentuk tubuh klien dari depan/samping secara berkala.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {photos.map((p, idx) => (
                  <div
                    key={p.id}
                    style={{ animationDelay: `${idx * 40}ms` }}
                    onClick={() => setSelectedPhotoModal(`/api/photos/raw/${p.id}`)}
                    className="group relative rounded-2xl border border-line overflow-hidden bg-bg cursor-pointer aspect-square hover-gold-glow hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                  >
                    <img
                      src={`/api/photos/raw/${p.id}`}
                      alt={`Foto ${formatDate(p.created_at)}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-[11px] font-mono text-text">
                        {formatDate(p.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: INFORMASI & CATATAN MEDIS */}
        {activeTab === 'info' && (
          <div className="grid sm:grid-cols-2 gap-6 animate-fade-in">
            <div className="p-6 rounded-2xl bg-panel border border-line space-y-4 hover-gold-glow transition-all duration-300">
              <h3 className="font-bold text-base text-text pb-2 border-b border-line">Profil Pribadi &amp; Demografi</h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-line/40">
                  <span className="text-dim">Nama Lengkap</span>
                  <span className="font-semibold text-text">{client.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/40">
                  <span className="text-dim">Jenis Kelamin</span>
                  <span className="font-semibold text-text">{client.gender ? (client.gender === 'pria' ? 'Pria' : 'Wanita') : '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/40">
                  <span className="text-dim">Kelompok Usia</span>
                  <span className="font-semibold text-text">{client.age_bracket || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/40">
                  <span className="text-dim">Nomor Telepon</span>
                  <span className="font-semibold text-text">{client.phone || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/40">
                  <span className="text-dim">Target Utama</span>
                  <span className="font-semibold text-accent">{goalLabel(client.goal)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-dim">Tanggal Pendaftaran</span>
                  <span className="text-dim font-mono">{client.created_at ? formatDate(client.created_at) : '—'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-panel border border-line space-y-4 hover-gold-glow transition-all duration-300">
              <h3 className="font-bold text-base text-text pb-2 border-b border-line">Kondisi Fisik &amp; Catatan Medis</h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-bg border border-line">
                  <div className="text-[11px] font-mono text-dim uppercase mb-1">Riwayat Masalah / Cedera Sendi</div>
                  <div className="font-bold text-sm text-text">
                    {client.problem && client.problem !== 'none' ? (
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                        <span>Ada Masalah: {client.problem.toUpperCase()}</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                        <span>Tidak ada keluhan sendi (Aman)</span>
                      </span>
                    )}
                  </div>
                  <p className="text-dim text-[11px] mt-1">
                    Informasi ini menjadi dasar dalam penyusunan program NASM agar menghindari latihan dengan beban berlebih pada area cedera.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-bg border border-line">
                  <div className="text-[11px] font-mono text-dim uppercase mb-1">Catatan Khusus Pelatih (Coach Notes)</div>
                  <p className="text-xs text-text leading-relaxed">
                    {client.notes || 'Belum ada catatan khusus untuk klien ini.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 6. Modal: Edit Client Profile ── */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
            <div className="bg-panel border border-line rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.12)] max-h-[90dvh] overflow-y-auto animate-scale-in">
              <div className="flex items-center justify-between mb-5 border-b border-line pb-3">
                <h3 className="font-bold text-base text-text">Edit Profil Klien</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-dim hover:text-text p-1 rounded-lg transition-colors btn-interactive"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditClient} className="space-y-4 text-xs">
                <div>
                  <label className="text-dim block font-mono uppercase mb-1">Nama Klien</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-text outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Target Latihan</label>
                    <select
                      value={editGoal}
                      onChange={(e) => setEditGoal(e.target.value)}
                      className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-base sm:text-sm text-text outline-none focus:border-accent"
                    >
                      <option value="fat_loss">Fat Loss</option>
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="general">General Fitness</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Total Sesi Paket</label>
                    <input
                      type="number"
                      min={0}
                      value={editPkgTotal}
                      onChange={(e) => setEditPkgTotal(Number(e.target.value))}
                      required
                      className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-base sm:text-sm text-text outline-none focus:border-accent font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Nomor WhatsApp</label>
                    <input
                      type="text"
                      placeholder="08123456789"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-bg border border-line rounded-xl px-3.5 py-2 text-base sm:text-sm text-text outline-none focus:border-accent font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Riwayat Masalah / Cedera</label>
                    <select
                      value={editProblem}
                      onChange={(e) => setEditProblem(e.target.value)}
                      className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-base sm:text-sm text-text outline-none focus:border-accent"
                    >
                      <option value="none">Tidak Ada (Normal)</option>
                      <option value="knee">Lutut (Knee)</option>
                      <option value="back">Punggung (Back)</option>
                      <option value="shoulder">Bahu (Shoulder)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-dim block font-mono uppercase mb-1">Catatan Kebugaran</label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-text outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-line mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-dim hover:text-text text-xs btn-interactive"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-black font-semibold px-5 py-2.5 rounded-xl text-xs shadow-[0_2px_12px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)] transition-all btn-interactive"
                  >
                    {editSubmitting ? 'Menyimpan…' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── 7. Modal: Add Client Schedule ── */}
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
            <div className="bg-panel border border-line rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.12)] max-h-[90dvh] overflow-y-auto animate-scale-in">
              <div className="flex items-center justify-between mb-4 border-b border-line pb-3">
                <h3 className="font-bold text-base text-text">Jadwal Sesi: {client.name}</h3>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="text-dim hover:text-text p-1 rounded-lg transition-colors btn-interactive"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSchedule} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Tanggal</label>
                    <input
                      type="date"
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      required
                      className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-base sm:text-sm text-text outline-none focus:border-accent font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Jam (WIB)</label>
                    <input
                      type="time"
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      required
                      className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-base sm:text-sm text-text outline-none focus:border-accent font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-dim block font-mono uppercase mb-1">Catatan Sesi (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Fokus Squat, Deload Sesi, dsb."
                    value={schedNote}
                    onChange={(e) => setSchedNote(e.target.value)}
                    className="w-full bg-bg border border-line rounded-xl px-3.5 py-2 text-base sm:text-sm text-text outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-line mt-6">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-dim hover:text-text text-xs btn-interactive"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={schedSubmitting}
                    className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-black font-semibold px-5 py-2.5 rounded-xl text-xs shadow-[0_2px_12px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)] transition-all btn-interactive"
                  >
                    {schedSubmitting ? 'Menyimpan…' : 'Simpan Jadwal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── 8. Modal: Full Photo Preview ── */}
        {selectedPhotoModal && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedPhotoModal(null)}
          >
            <div className="relative max-w-2xl max-h-[90vh] animate-scale-in">
              <img src={selectedPhotoModal} alt="Preview Foto Progress" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-[0_0_50px_rgba(0,0,0,0.9)]" />
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="absolute top-3 right-3 text-white bg-black/60 hover:bg-black/80 rounded-full w-8 h-8 flex items-center justify-center transition-colors btn-interactive"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function goalLabel(g: string) {
  return { fat_loss: 'Fat Loss', muscle_gain: 'Muscle Gain', general: 'General Fitness' }[g] ?? g
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

function seriesOf(sessions: Session[], key: 'weight' | 'fat_pct' | 'rpe'): Point[] {
  return [...sessions]
    .filter((s) => s[key] != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => ({ date: s.date, value: s[key] as number }))
}
