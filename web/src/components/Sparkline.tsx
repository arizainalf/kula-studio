// Sparkline SVG mini — tanpa lib chart. Data urut menaik (terlama→terbaru).
// ponytail: tanpa sumbu/tooltip; upgrade ke recharts kalau butuh interaksi.
import { formatDate } from '../lib/date'

export type Point = { date: string; value: number }

export function Sparkline({ data, unit, color = 'var(--color-accent)' }: {
  data: Point[]; unit: string; color?: string
}) {
  if (data.length < 2) {
    return (
      <p className="text-dim text-sm">
        {data.length === 1 ? `${data[0].value}${unit} — butuh ≥2 titik untuk grafik` : 'Belum ada data.'}
      </p>
    )
  }

  const W = 280, H = 80, PAD = 6
  const vals = data.map((d) => d.value)
  const min = Math.min(...vals), max = Math.max(...vals)
  const span = max - min || 1
  const x = (i: number) => PAD + (i / (data.length - 1)) * (W - PAD * 2)
  const y = (v: number) => PAD + (1 - (v - min) / span) * (H - PAD * 2)
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ')
  const area = `${line} L${x(data.length - 1).toFixed(1)},${H - PAD} L${PAD},${H - PAD} Z`
  const first = vals[0], last = vals[vals.length - 1]
  const delta = last - first

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-lg font-semibold">{last}{unit}</span>
        <span className={delta <= 0 ? 'text-sm text-accent' : 'text-red-400 text-sm'}>
          {delta > 0 ? '+' : ''}{delta.toFixed(1)}{unit} sejak awal
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-20 w-full" role="img"
        aria-label={`Grafik ${data.length} titik dari ${first}${unit} ke ${last}${unit}`}>
        <path d={area} fill={color} opacity={0.12} />
        <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(data.length - 1)} cy={y(last)} r={3} fill={color} />
      </svg>
      <p className="text-dim text-xs">{formatDate(data[0].date)} → {formatDate(data[data.length - 1].date)} · {data.length} sesi tercatat</p>
    </div>
  )
}
