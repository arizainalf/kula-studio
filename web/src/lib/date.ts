/**
 * Utility untuk memformat tanggal dan waktu secara konsisten ke zona waktu lokal
 * dan format bahasa Indonesia (id-ID), mencegah tampilan raw string UTC.
 */

export function parseDateSafe(val?: string | null): Date | null {
  if (!val) return null
  const str = String(val).trim()
  if (!str) return null

  // Tangani format YYYY-MM-DD atau YYYY-MM-DDT00:00:00(.000)Z agar tetap menggunakan waktu lokal tanpa pergeseran zona
  const dateMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:T00:00:00(?:\.000)?Z?)?$/)
  if (dateMatch) {
    return new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]))
  }

  const d = new Date(str)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Format tanggal: "18 Sep 2026"
 */
export function formatDate(val?: string | null, fallback = '—'): string {
  const d = parseDateSafe(val)
  if (!d) return fallback
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format tanggal pendek: "18 Sep"
 */
export function formatShortDate(val?: string | null, fallback = '—'): string {
  const d = parseDateSafe(val)
  if (!d) return fallback
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Format tanggal lengkap dengan nama hari: "Jumat, 18 Sep 2026"
 */
export function formatDateWithDay(val?: string | null, fallback = '—'): string {
  const d = parseDateSafe(val)
  if (!d) return fallback
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format tanggal resmi penuh: "Jumat, 18 September 2026"
 */
export function formatFullDate(val?: string | null, fallback = '—'): string {
  const d = parseDateSafe(val)
  if (!d) return fallback
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format waktu: "07:00"
 */
export function formatTime(val?: string | null, fallback = '—'): string {
  if (!val) return fallback
  const str = String(val).trim()
  const timeMatch = str.match(/^(\d{1,2}):(\d{2})/)
  if (timeMatch) {
    return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`
  }
  const d = new Date(str)
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }
  return str
}

/**
 * Format tanggal dan waktu: "18 Sep 2026, 20:45"
 */
export function formatDateTime(val?: string | null, fallback = '—'): string {
  if (!val) return fallback
  const d = parseDateSafe(val)
  if (!d) return fallback
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Mendapatkan string YYYY-MM-DD hari ini berdasarkan waktu lokal perangkat
 */
export function getLocalTodayString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Menghitung string YYYY-MM-DD untuk N hari ke depan berdasarkan waktu lokal
 */
export function getLocalFutureDateString(daysAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format tanggal relatif atau ringkas: "Hari ini", "Kemarin", "Besok", atau "18 Sep"
 */
export function formatRelativeDate(val?: string | null, fallback = '—'): string {
  const d = parseDateSafe(val)
  if (!d) return fallback

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Besok'
  if (diffDays === -1) return 'Kemarin'

  return formatShortDate(val, fallback)
}
