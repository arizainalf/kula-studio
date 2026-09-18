import { useState } from 'react'
import { api } from '../lib/api'
import type { Client, ScheduleItem } from '../routes/index'
import { formatShortDate, formatTime, getLocalTodayString } from '../lib/date'
import {
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  Calendar,
  Clock,
  LayoutList,
  CalendarDays,
  X,
} from 'lucide-react'

export function WeeklyScheduleSection({
  schedule: initialSchedule,
  clients,
  onScheduleChange,
}: {
  schedule: ScheduleItem[]
  clients: Client[]
  onScheduleChange?: () => void
}) {
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>(initialSchedule)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'strip' | 'all'>('strip')
  const [submitting, setSubmitting] = useState(false)
  const [modalErr, setModalErr] = useState('')

  // Generate 7 days starting from today in local timezone
  const todayStr = getLocalTodayString()
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    const dayFullNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return {
      dateStr,
      dayNumber: d.getDate(),
      dayName: dayNames[d.getDay()],
      dayFullName: dayFullNames[d.getDay()],
      monthName: monthNames[d.getMonth()],
      isToday: dateStr === todayStr,
      sessionCount: scheduleList.filter((s) => s.date.slice(0, 10) === dateStr).length,
    }
  })

  // Selected date sessions
  const currentDaySessions = scheduleList
    .filter((s) => s.date.slice(0, 10) === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time))

  // Form states for new schedule
  const [formClientId, setFormClientId] = useState(clients[0]?.id ?? '')
  const [formDate, setFormDate] = useState(selectedDate)
  const [formTime, setFormTime] = useState('08:00')
  const [formNote, setFormNote] = useState('')

  async function handleAddSchedule(e: React.FormEvent) {
    e.preventDefault()
    setModalErr('')
    if (!formClientId) {
      setModalErr('Pilih klien terlebih dahulu.')
      return
    }
    setSubmitting(true)
    try {
      const res = await api<{ schedule: ScheduleItem }>('/schedule', {
        method: 'POST',
        body: JSON.stringify({
          client_id: formClientId,
          date: formDate,
          time: formTime,
          note: formNote.trim() || undefined,
        }),
      })

      const clientObj = clients.find((c) => c.id === formClientId)
      const newEntry: ScheduleItem = {
        ...res.schedule,
        client_name: clientObj?.name ?? 'Klien',
        client_phone: clientObj?.phone ?? null,
      }

      setScheduleList((prev) => [...prev, newEntry])
      setIsModalOpen(false)
      setFormNote('')
      if (onScheduleChange) onScheduleChange()
    } catch (err) {
      setModalErr(err instanceof Error ? err.message : 'Gagal menambahkan jadwal.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteSchedule(id: string) {
    if (!confirm('Apakah Anda yakin ingin membatalkan jadwal ini?')) return
    try {
      await api(`/schedule/${id}`, { method: 'DELETE' })
      setScheduleList((prev) => prev.filter((s) => s.id !== id))
      if (onScheduleChange) onScheduleChange()
    } catch {
      alert('Gagal menghapus jadwal.')
    }
  }

  const selectedDayInfo = weekDays.find((d) => d.dateStr === selectedDate)

  return (
    <section className="rounded-2xl bg-panel border border-line p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* ── 1. Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
        <div>
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-accent" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-text">
              Jadwal Sesi Latihan Pekan Ini
            </h2>
          </div>
          <p className="text-xs text-dim font-mono mt-0.5">
            {scheduleList.length} sesi teragenda 7 hari ke depan · Pantau jam sibuk dan konfirmasi klien
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-bg p-0.5 border border-line text-xs font-mono">
            <button
              onClick={() => setViewMode('strip')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'strip' ? 'bg-panel-elevated text-accent font-semibold' : 'text-dim hover:text-text'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Per Hari</span>
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'all' ? 'bg-panel-elevated text-accent font-semibold' : 'text-dim hover:text-text'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Semua ({scheduleList.length})</span>
            </button>
          </div>

          {/* New Schedule Button */}
          <button
            onClick={() => {
              setFormDate(selectedDate)
              setIsModalOpen(true)
            }}
            className="bg-accent hover:bg-accent/90 text-black font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-[0_2px_10px_rgba(212,175,55,0.2)] flex items-center gap-1.5 shrink-0 btn-interactive hover:shadow-[0_4px_16px_rgba(212,175,55,0.35)]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* ── 2. View Mode: Interactive 7-Day Strip ── */}
      {viewMode === 'strip' && (
        <div className="pt-5 space-y-6">
          {/* Horizontal Day Strip: Touch-scrollable with snap on mobile, 7-col grid on tablet+ */}
          <div className="flex sm:grid sm:grid-cols-7 gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 touch-scroll no-scrollbar snap-x -mx-1 px-1">
            {weekDays.map((day) => {
              const isSelected = day.dateStr === selectedDate
              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`min-w-[62px] sm:min-w-0 flex-1 shrink-0 snap-center flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition-all duration-200 relative btn-interactive ${
                    isSelected
                      ? 'scale-[1.04] bg-bg border-accent shadow-[0_0_20px_rgba(212,175,55,0.2)] ring-1 ring-accent/60'
                      : 'bg-bg/60 border-line hover:border-accent/40 hover:bg-bg hover:scale-[1.02] text-dim'
                  }`}
                >
                  {/* Today Badge Indicator */}
                  {day.isToday && (
                    <span className="absolute -top-2 text-[9px] font-mono uppercase bg-accent text-black font-extrabold px-1.5 py-0.2 rounded-full shadow-[0_2px_6px_rgba(212,175,55,0.3)]">
                      Hari Ini
                    </span>
                  )}

                  <span
                    className={`text-[11px] font-mono uppercase tracking-wider mb-1 transition-colors ${
                      isSelected ? 'text-accent font-bold' : 'text-dim'
                    }`}
                  >
                    {day.dayName}
                  </span>

                  <span
                    className={`text-base sm:text-xl font-extrabold font-mono leading-none ${
                      isSelected ? 'text-text' : 'text-text/80'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  <span className="text-[10px] text-dim/70 mt-1 font-mono">{day.monthName}</span>

                  {/* Dot count badge */}
                  {day.sessionCount > 0 && (
                    <div className="mt-1.5 flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span className="text-[10px] font-mono text-accent font-semibold">
                        {day.sessionCount}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Sessions List for Selected Day */}
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-mono text-dim flex items-center gap-2">
                <span>Agenda:</span>
                <span className="text-text font-bold">
                  {selectedDayInfo?.dayFullName}, {selectedDayInfo?.dayNumber} {selectedDayInfo?.monthName}
                </span>
                {selectedDayInfo?.isToday && (
                  <span className="text-accent font-mono text-[10px] bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                    HARI INI
                  </span>
                )}
              </span>
              <span className="text-dim font-mono">
                {currentDaySessions.length} sesi terdaftar
              </span>
            </div>

            {currentDaySessions.length === 0 ? (
              <div className="rounded-xl border border-line bg-bg/50 p-8 text-center flex flex-col items-center justify-center animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-panel border border-line flex items-center justify-center text-dim mb-3">
                  <Clock className="w-5 h-5 opacity-60 text-dim" />
                </div>
                <p className="text-text font-medium text-sm">Tidak ada jadwal sesi di hari ini.</p>
                <p className="text-xs text-dim mt-1 max-w-xs mb-4">
                  Slot waktu Anda masih terbuka penuh untuk sesi latihan atau istirahat.
                </p>
                <button
                  onClick={() => {
                    setFormDate(selectedDate)
                    setIsModalOpen(true)
                  }}
                  className="bg-panel hover:bg-panel-elevated border border-line hover:border-accent/40 text-xs font-semibold text-text px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 btn-interactive"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Jadwalkan Sesi di Hari Ini</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {currentDaySessions.map((session, idx) => {
                  const clientObj = clients.find((c) => c.id === session.client_id)
                  const clientName = session.client_name || clientObj?.name || 'Klien'
                  const clientPhone = session.client_phone || clientObj?.phone
                  const remaining = clientObj ? clientObj.pkg_total - clientObj.pkg_used : null

                  const waReminderMessage = encodeURIComponent(
                    `Halo ${clientName}, mengingatkan sesi latihan personal training kita hari ini pada pukul ${formatTime(session.time)} WIB. Sampai jumpa di gym!`
                  )

                  return (
                    <div
                      key={session.id}
                      style={{ animationDelay: `${idx * 60}ms` }}
                      className="p-4 rounded-xl bg-bg border border-line hover-gold-glow flex flex-col sm:flex-row sm:items-center justify-between gap-4 group animate-fade-in-up"
                    >
                      {/* Left: Time & Client Info */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-16 sm:w-20 text-center py-2 px-1 rounded-lg bg-panel border border-line shrink-0 group-hover:border-accent/40 transition-colors">
                          <span className="text-sm sm:text-base font-extrabold font-mono text-accent leading-none block">
                            {formatTime(session.time)}
                          </span>
                          <span className="text-[10px] text-dim font-mono mt-0.5 block">WIB</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <a
                              href={`/clients/${session.client_id}`}
                              className="font-bold text-sm text-text hover:text-accent transition-colors"
                            >
                              {clientName}
                            </a>
                            {clientObj?.goal && (
                              <span className="text-[10px] font-mono text-dim bg-panel px-2 py-0.5 rounded border border-line">
                                {clientObj.goal.replace('_', ' ').toUpperCase()}
                              </span>
                            )}
                            {remaining !== null && (
                              <span
                                className={`text-[10px] font-mono ${
                                  remaining <= 3 ? 'text-amber-400 font-semibold' : 'text-dim'
                                }`}
                              >
                                Sisa {remaining} sesi
                              </span>
                            )}
                          </div>
                          {session.note ? (
                            <p className="text-xs text-dim mt-1 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-accent shrink-0" />
                              <span>{session.note}</span>
                            </p>
                          ) : (
                            <p className="text-xs text-muted mt-1 italic">Tidak ada catatan sesi khusus</p>
                          )}
                        </div>
                      </div>

                      {/* Right: Interactive Action Bar */}
                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-line/40 justify-end">
                        {clientPhone && (
                          <a
                            href={`https://wa.me/${clientPhone.replace(/\D/g, '')}?text=${waReminderMessage}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-mono text-dim hover:text-accent bg-panel px-2.5 py-1.5 rounded-lg border border-line hover:border-accent/40 transition-colors flex items-center gap-1.5 btn-interactive"
                            title="Kirim pengingat sesi ke WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WA</span>
                          </a>
                        )}

                        <a
                          href={`/clients/${session.client_id}/log`}
                          className="bg-accent hover:bg-accent/90 text-black font-semibold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-[0_2px_8px_rgba(212,175,55,0.2)] hover:shadow-[0_4px_14px_rgba(212,175,55,0.4)] btn-interactive"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                          <span>Catat</span>
                        </a>

                        <button
                          onClick={() => handleDeleteSchedule(session.id)}
                          className="text-dim hover:text-rose-400 text-xs p-1.5 rounded-lg hover:bg-panel transition-colors btn-interactive"
                          title="Batal jadwal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. View Mode: All Upcoming Sessions (Agenda View) ── */}
      {viewMode === 'all' && (
        <div className="pt-5">
          {scheduleList.length === 0 ? (
            <div className="p-8 text-center text-dim text-xs">
              <p>Belum ada jadwal latihan yang tercatat untuk 7 hari ke depan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduleList
                .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                .map((session) => {
                  const clientObj = clients.find((c) => c.id === session.client_id)
                  const clientName = session.client_name || clientObj?.name || 'Klien'
                  return (
                    <div
                      key={session.id}
                      className="p-3.5 rounded-xl bg-bg border border-line flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-mono text-xs text-accent font-bold px-2 py-1 rounded bg-panel border border-line">
                          {formatShortDate(session.date)} · {formatTime(session.time)}
                        </div>
                        <div>
                          <a
                            href={`/clients/${session.client_id}`}
                            className="text-xs font-semibold text-text hover:text-accent"
                          >
                            {clientName}
                          </a>
                          {session.note && <span className="text-dim text-xs ml-2">({session.note})</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/clients/${session.client_id}/log`}
                          className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                          <span>Catat</span>
                        </a>
                        <button
                          onClick={() => handleDeleteSchedule(session.id)}
                          className="text-dim hover:text-rose-400 p-1.5 rounded-lg hover:bg-panel transition-colors"
                          title="Batal jadwal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      )}

      {/* ── 4. Luxury Modal: Add New Schedule ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
          <div className="bg-panel border border-line rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.12)] relative max-h-[90dvh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5 border-b border-line pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <h3 className="text-base font-bold text-text">Jadwalkan Sesi Baru</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-dim hover:text-text p-1 rounded-md transition-colors btn-interactive"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-4">
              {/* Select Client */}
              <div>
                <label className="text-dim block text-xs font-mono uppercase mb-1.5">
                  Pilih Klien
                </label>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text outline-none focus:border-accent"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.pkg_used}/{c.pkg_total} sesi)
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-dim block text-xs font-mono uppercase mb-1.5">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent font-mono"
                  />
                </div>
                <div>
                  <label className="text-dim block text-xs font-mono uppercase mb-1.5">
                    Jam (WIB)
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    required
                    className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent font-mono"
                  />
                </div>
              </div>

              {/* Note / Exercise Focus */}
              <div>
                <label className="text-dim block text-xs font-mono uppercase mb-1.5">
                  Fokus Sesi / Catatan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Leg Day, Cardio Conditioning, Chest & Triceps"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  maxLength={100}
                  className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:border-accent"
                />
              </div>

              {modalErr && <p className="text-rose-400 text-xs font-medium">{modalErr}</p>}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-dim hover:text-text btn-interactive"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-black font-semibold text-xs px-5 py-2.5 rounded-xl shadow-[0_2px_12px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_18px_rgba(212,175,55,0.4)] transition-all btn-interactive"
                >
                  {submitting ? 'Menyimpan…' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
