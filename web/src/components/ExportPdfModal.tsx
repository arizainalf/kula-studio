import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { formatDateWithDay, formatDate, getLocalTodayString, getLocalFutureDateString } from '../lib/date'
import { Printer, X, Users, FileText, CheckCircle2 } from 'lucide-react'
import { usePlatformSettings } from '../lib/platformSettings'

export type ExportSessionItem = {
  id: string
  client_id: string
  client_name: string
  client_goal?: string
  client_phone?: string | null
  client_pkg_total?: number | null
  client_pkg_used?: number | null
  session_number?: number | null
  pt_name?: string
  date: string
  rpe: number
  weight?: number | string | null
  fat_pct?: number | string | null
  exercises?: Array<Record<string, Array<{ name: string; detail?: string }>>>
  notes?: string | null
}

export type ClientOption = {
  id: string
  name: string
}

interface ExportPdfModalProps {
  isOpen: boolean
  onClose: () => void
  initialClientId?: string
  initialClientName?: string
  clientsList?: ClientOption[]
}

export function ExportPdfModal({
  isOpen,
  onClose,
  initialClientId,
  initialClientName,
  clientsList = [],
}: ExportPdfModalProps) {
  const [scope, setScope] = useState<'single' | 'all'>(initialClientId ? 'single' : 'all')
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || '')
  const [dateFilter, setDateFilter] = useState<'this_month' | 'last_30' | 'last_90' | 'all' | 'custom'>('this_month')
  const [fromDate, setFromDate] = useState(getLocalFutureDateString(-30))
  const [toDate, setToDate] = useState(getLocalTodayString())
  const [minRpe, setMinRpe] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [filteredSessions, setFilteredSessions] = useState<ExportSessionItem[]>([])
  const [clients, setClients] = useState<ClientOption[]>(clientsList)
  const platformSettings = usePlatformSettings()

  // Load clients if not passed
  useEffect(() => {
    if (clientsList.length > 0) {
      setClients(clientsList)
    } else if (isOpen) {
      api<{ clients: Array<{ id: string; name: string }> }>('/clients')
        .then((res) => setClients(res.clients || []))
        .catch(() => {})
    }
  }, [isOpen, clientsList])

  // Sync initial client when prop changes
  useEffect(() => {
    if (initialClientId) {
      setSelectedClientId(initialClientId)
      setScope('single')
    }
  }, [initialClientId])

  // Calculate actual from/to dates based on preset
  function getDateRange() {
    const today = getLocalTodayString()
    if (dateFilter === 'this_month') {
      const yearMonth = today.slice(0, 7)
      return { from: `${yearMonth}-01`, to: today, label: 'Bulan Ini' }
    }
    if (dateFilter === 'last_30') {
      return { from: getLocalFutureDateString(-30), to: today, label: '30 Hari Terakhir' }
    }
    if (dateFilter === 'last_90') {
      return { from: getLocalFutureDateString(-90), to: today, label: '3 Bulan Terakhir' }
    }
    if (dateFilter === 'all') {
      return { from: '2020-01-01', to: today, label: 'Semua Waktu' }
    }
    return { from: fromDate, to: toDate, label: `${fromDate} s/d ${toDate}` }
  }

  // Fetch preview data when filter changes
  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    const { from, to } = getDateRange()
    const targetId = scope === 'single' ? selectedClientId : undefined

    let url = `/sessions?from=${from}&to=${to}`
    if (targetId) url += `&clientId=${targetId}`
    if (minRpe > 0) url += `&minRpe=${minRpe}`

    api<{ sessions: ExportSessionItem[] }>(url)
      .then((res) => setFilteredSessions(res.sessions || []))
      .catch(() => setFilteredSessions([]))
      .finally(() => setLoading(false))
  }, [isOpen, scope, selectedClientId, dateFilter, fromDate, toDate, minRpe])

  function esc(s?: string | null) {
    if (!s) return ''
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
  }

  function handlePrint() {
    const { label: dateLabel } = getDateRange()
    const clientTitle =
      scope === 'single'
        ? (clients.find((c) => c.id === selectedClientId)?.name || initialClientName || 'Klien')
        : 'Semua Klien Studio'

    const totalSessions = filteredSessions.length
    const avgRpe =
      totalSessions > 0
        ? (filteredSessions.reduce((acc, s) => acc + (s.rpe || 0), 0) / totalSessions).toFixed(1)
        : '—'

    const uniqueClientsCount = new Set(filteredSessions.map((s) => s.client_id)).size

    const rowsHtml = filteredSessions
      .map((s, idx) => {
        // Collect all exercise categories
        const exGroup = s.exercises?.[0] || {}
        const exerciseList: string[] = []

        Object.entries(exGroup).forEach(([category, list]) => {
          if (Array.isArray(list) && list.length > 0) {
            const validItems = list.filter((x) => x.name && x.name.trim())
            if (validItems.length > 0) {
              const formatted = validItems.map((x) => `${esc(x.name)}${x.detail ? ` (${esc(x.detail)})` : ''}`).join(', ')
              exerciseList.push(`<strong>${esc(category.toUpperCase())}:</strong> ${formatted}`)
            }
          }
        })

        return `
          <tr>
            <td style="text-align: center; font-family: monospace; font-size: 11px;">${idx + 1}</td>
            <td style="white-space: nowrap; font-size: 11px;">${formatDateWithDay(s.date)}</td>
            <td>
              <div style="font-weight: 700; font-size: 12px; color: #0f172a;">${esc(s.client_name)}</div>
              ${s.client_goal ? `<div style="font-size: 10px; color: #64748b; text-transform: capitalize;">Target: ${esc(s.client_goal.replace('_', ' '))}</div>` : ''}
            </td>
            <td style="text-align: center; font-size: 11px; vertical-align: top;">
              <div style="font-weight: 700; font-family: monospace; color: #0f172a; font-size: 11.5px;">
                ${s.session_number != null ? `Sesi ${s.session_number}` : `Sesi ${s.client_pkg_used ?? '—'}`} dari ${s.client_pkg_total ?? '—'}
              </div>
              <div style="font-size: 9.5px; color: #64748b; font-family: monospace; margin-top: 1px;">
                ${s.client_pkg_total && s.client_pkg_used != null ? `(Total: ${s.client_pkg_used}/${s.client_pkg_total})` : ''}
              </div>
            </td>
            <td style="text-align: center; font-family: monospace; font-weight: bold; font-size: 11px;">RPE ${s.rpe}</td>
            <td style="text-align: center; font-size: 11px; font-family: monospace;">${s.weight ? `${s.weight} kg` : '—'}</td>
            <td style="font-size: 11px; line-height: 1.4;">${exerciseList.length > 0 ? exerciseList.join('<br>') : '<span style="color: #999;">—</span>'}</td>
            <td style="font-size: 11px; font-style: italic; color: #444;">${esc(s.notes) || '—'}</td>
          </tr>
        `
      })
      .join('')

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up terblokir. Izinkan pop-up browser untuk mencetak PDF.')
      return
    }

    printWindow.document.write(`<!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Laporan Sesi Latihan — ${esc(clientTitle)}</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111; margin: 0; padding: 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 2px solid #222; margin-bottom: 16px; }
        .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
        .brand span { color: #d97706; }
        .doc-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #333; margin-top: 2px; }
        .meta-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; }
        .meta-item { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
        .meta-val { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #0f172a; color: #fff; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 6px; text-align: left; }
        td { border-bottom: 1px solid #e2e8f0; padding: 7px 6px; vertical-align: top; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .footer { margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        .signature-box { text-align: center; width: 180px; }
        .signature-line { border-bottom: 1px solid #000; margin-top: 50px; margin-bottom: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">${esc(platformSettings.app_name || 'Kula Studio')} PRO</div>
          <div class="doc-title">Laporan Rekapitulasi Sesi Latihan</div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #475569;">
          <div>Tanggal Cetak: <strong>${formatDate(getLocalTodayString())}</strong></div>
          <div>Cakupan: <strong>${esc(clientTitle)}</strong></div>
        </div>
      </div>

      <div class="meta-box">
        <div class="meta-item">Periode Laporan<div class="meta-val">${esc(dateLabel)}</div></div>
        <div class="meta-item">Total Sesi Terlaksana<div class="meta-val">${totalSessions} Sesi</div></div>
        <div class="meta-item">Klien Terlibat<div class="meta-val">${uniqueClientsCount} Klien</div></div>
        <div class="meta-item">Rata-Rata RPE<div class="meta-val">${avgRpe} / 10</div></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 28px; text-align: center;">No</th>
            <th style="width: 110px;">Tanggal</th>
            <th style="width: 130px;">Nama Klien</th>
            <th style="width: 120px; text-align: center;">Sesi Paket</th>
            <th style="width: 55px; text-align: center;">RPE</th>
            <th style="width: 55px; text-align: center;">BB</th>
            <th>Menu Gerakan Latihan</th>
            <th style="width: 130px;">Catatan Coach</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #999;">Tidak ada sesi latihan yang cocok dengan kriteria filter.</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        <div>
          <span>Dokumen resmi hasil cetak otomatis dari ${esc(platformSettings.app_name || 'Kula Studio')} ${esc(platformSettings.app_tagline || 'Pro PT Manager')}.</span>
        </div>
        <div class="signature-box">
          <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Pelatih Penanggung Jawab</div>
          <div class="signature-line"></div>
          <div style="font-weight: 700; color: #0f172a;">Coach / Head PT</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>`)

    printWindow.document.close()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
      <div className="bg-panel border border-line w-full max-w-xl rounded-2xl p-5 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.8)] space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text">Export &amp; Cetak PDF Laporan Sesi</h2>
              <p className="text-xs text-dim">Cetak laporan sesi latihan resmi untuk evaluasi klien atau studio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-bg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Scope: Klien Ini vs Semua Klien */}
        <div>
          <label className="text-xs font-mono text-dim uppercase tracking-wider block mb-1.5">
            1. Cakupan Klien
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-bg rounded-xl border border-line">
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                scope === 'all'
                  ? 'bg-accent text-[#141414] font-bold shadow-sm'
                  : 'text-dim hover:text-text'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Semua Klien Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setScope('single')}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                scope === 'single'
                  ? 'bg-accent text-[#141414] font-bold shadow-sm'
                  : 'text-dim hover:text-text'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Klien Tertentu</span>
            </button>
          </div>
        </div>

        {/* Dropdown Klien jika Scope Single */}
        {scope === 'single' && (
          <div className="animate-fade-in">
            <label className="text-xs font-mono text-dim uppercase tracking-wider block mb-1">
              Pilih Klien
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text outline-none focus:border-accent"
            >
              {clients.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 2. Filter Rentang Tanggal */}
        <div>
          <label className="text-xs font-mono text-dim uppercase tracking-wider block mb-1.5">
            2. Periode Tanggal
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setDateFilter('this_month')}
              className={`py-2 px-2.5 rounded-lg border transition-all ${
                dateFilter === 'this_month'
                  ? 'bg-accent/20 border-accent text-accent font-bold'
                  : 'bg-bg border-line text-dim hover:text-text'
              }`}
            >
              Bulan Ini
            </button>

            <button
              type="button"
              onClick={() => setDateFilter('last_30')}
              className={`py-2 px-2.5 rounded-lg border transition-all ${
                dateFilter === 'last_30'
                  ? 'bg-accent/20 border-accent text-accent font-bold'
                  : 'bg-bg border-line text-dim hover:text-text'
              }`}
            >
              30 Hari Terakhir
            </button>

            <button
              type="button"
              onClick={() => setDateFilter('last_90')}
              className={`py-2 px-2.5 rounded-lg border transition-all ${
                dateFilter === 'last_90'
                  ? 'bg-accent/20 border-accent text-accent font-bold'
                  : 'bg-bg border-line text-dim hover:text-text'
              }`}
            >
              3 Bulan Terakhir
            </button>

            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`py-2 px-2.5 rounded-lg border transition-all ${
                dateFilter === 'all'
                  ? 'bg-accent/20 border-accent text-accent font-bold'
                  : 'bg-bg border-line text-dim hover:text-text'
              }`}
            >
              Semua Waktu
            </button>
          </div>

          {/* Custom Date Range if chosen */}
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDateFilter('custom')}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                dateFilter === 'custom'
                  ? 'bg-accent/20 border-accent text-accent font-bold'
                  : 'bg-bg border-line text-dim hover:text-text'
              }`}
            >
              Tanggal Kustom
            </button>

            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 flex-1 animate-fade-in">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-bg border border-line rounded-lg px-2.5 py-1 text-xs text-text font-mono outline-none focus:border-accent w-full"
                />
                <span className="text-dim text-xs">s/d</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-bg border border-line rounded-lg px-2.5 py-1 text-xs text-text font-mono outline-none focus:border-accent w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. Filter Minimal RPE (Intensitas) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono text-dim uppercase tracking-wider">
              3. Filter Intensitas (Minimal RPE)
            </label>
            <span className="text-xs font-mono text-accent">
              {minRpe === 0 ? 'Semua RPE (1-10)' : `≥ RPE ${minRpe}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[0, 6, 7, 8, 9].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setMinRpe(val)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  minRpe === val
                    ? 'bg-accent text-[#141414] font-bold border-accent'
                    : 'bg-bg border-line text-dim hover:text-text'
                }`}
              >
                {val === 0 ? 'Semua' : `RPE ${val}+`}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Sample Sessions Preview */}
        {filteredSessions.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-dim px-1">
              <span>Preview Sesi ({Math.min(3, filteredSessions.length)} dari {filteredSessions.length}):</span>
              <span className="text-accent font-bold">Siap Cetak</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {filteredSessions.slice(0, 3).map((s) => (
                <div key={s.id} className="p-2.5 rounded-xl bg-bg border border-line flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-text truncate">{s.client_name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-panel text-accent border border-accent/30 font-bold">
                        {s.session_number != null ? `Sesi ${s.session_number}` : `Sesi ${s.client_pkg_used ?? '—'}`} dari {s.client_pkg_total ?? '—'}
                      </span>
                    </div>
                    <span className="text-[10px] text-dim font-mono block mt-0.5">
                      {formatDate(s.date)} • RPE {s.rpe}/10 {s.weight ? `• ${s.weight}kg` : ''}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted shrink-0">
                    {s.exercises?.[0] ? `${Object.values(s.exercises[0]).flat().length} gerakan` : '0 gerakan'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Preview Bar */}
        <div className="p-3.5 rounded-xl bg-bg border border-line/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-text">
              {loading ? (
                <span className="text-dim">Menghitung sesi...</span>
              ) : (
                <>
                  Ditemukan <strong>{filteredSessions.length} sesi</strong> yang siap dicetak
                </>
              )}
            </span>
          </div>

          <span className="font-mono text-dim text-[11px]">Format: A4 Landscape</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-line text-xs font-medium text-dim hover:text-text transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={filteredSessions.length === 0 || loading}
            className="btn-interactive px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-50 text-[#141414] font-bold text-xs sm:text-sm shadow-[0_2px_14px_rgba(226,232,0,0.25)] flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}
