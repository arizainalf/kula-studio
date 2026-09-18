export type ClientSummary = {
  id: string
  name: string
  goal: string
  pkg_total: number
  pkg_used: number
  avg_rpe?: number
  last_session_date?: string | null
  phone?: string | null
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  badge,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  badge?: { text: string; type?: 'gold' | 'amber' | 'neutral' }
}) {
  return (
    <div className="p-3.5 sm:p-5 rounded-2xl bg-panel border border-line shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex flex-col justify-between hover-gold-glow group transition-all duration-300 min-w-0">
      <div className="flex items-center justify-between mb-1.5 gap-1">
        <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-dim group-hover:text-text transition-colors truncate">
          {title}
        </span>
        {icon && (
          <div className="text-accent group-hover:scale-110 group-hover:text-accent-hover transition-transform duration-300 shrink-0">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 sm:gap-2 my-1 flex-wrap">
        <span className="text-xl sm:text-3xl font-extrabold text-text tracking-tight group-hover:text-accent transition-colors truncate">
          {value}
        </span>
        {badge && (
          <span
            className={`text-[9px] sm:text-[10px] font-mono font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border transition-all duration-300 shrink-0 ${
              badge.type === 'amber'
                ? 'bg-amber-400/10 text-amber-400 border-amber-400/30 group-hover:bg-amber-400/20'
                : badge.type === 'neutral'
                  ? 'bg-bg text-dim border-line'
                  : 'bg-accent/15 text-accent border-accent/30 group-hover:bg-accent/25 group-hover:border-accent/50'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[10px] sm:text-xs text-dim mt-1 group-hover:text-dim/90 transition-colors line-clamp-2">{subtitle}</p>}
    </div>
  )
}

export function GoalDistributionCard({ clients }: { clients: ClientSummary[] }) {
  const total = clients.length || 1
  const fatLoss = clients.filter((c) => c.goal === 'fat_loss').length
  const muscleGain = clients.filter((c) => c.goal === 'muscle_gain').length
  const general = clients.filter((c) => c.goal !== 'fat_loss' && c.goal !== 'muscle_gain').length

  const fatLossPct = Math.round((fatLoss / total) * 100)
  const muscleGainPct = Math.round((muscleGain / total) * 100)
  const generalPct = 100 - fatLossPct - muscleGainPct

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-panel border border-line flex flex-col justify-between hover-gold-glow group transition-all duration-300">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <h3 className="text-xs font-mono uppercase tracking-wider text-dim group-hover:text-text transition-colors">
          Distribusi Target Klien
        </h3>
        <span className="text-[11px] sm:text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
          {clients.length} Klien Total
        </span>
      </div>

      {/* Segmented Bar Chart */}
      <div className="h-3.5 w-full bg-bg rounded-full overflow-hidden flex gap-1 p-0.5 border border-line my-3">
        {fatLossPct > 0 && (
          <div
            className="bg-accent h-full rounded-full transition-all duration-700 ease-out hover:opacity-90 cursor-pointer"
            style={{ width: `${fatLossPct}%` }}
            title={`Fat Loss: ${fatLoss} (${fatLossPct}%)`}
          />
        )}
        {muscleGainPct > 0 && (
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-700 ease-out hover:opacity-90 cursor-pointer"
            style={{ width: `${muscleGainPct}%` }}
            title={`Muscle Gain: ${muscleGain} (${muscleGainPct}%)`}
          />
        )}
        {generalPct > 0 && (
          <div
            className="bg-slate-400 h-full rounded-full transition-all duration-700 ease-out hover:opacity-90 cursor-pointer"
            style={{ width: `${generalPct}%` }}
            title={`General Fitness: ${general} (${generalPct}%)`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-xs pt-2 border-t border-line/60">
        <div className="flex flex-col group/item hover:bg-bg/40 p-1.5 rounded-lg transition-colors min-w-0">
          <div className="flex items-center gap-1.5 text-dim text-[10px] sm:text-[11px] truncate">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent animate-pulse shrink-0" />
            <span className="truncate">Fat Loss</span>
          </div>
          <span className="font-bold text-text text-xs sm:text-sm mt-0.5 group-hover/item:text-accent transition-colors truncate">
            {fatLoss} ({fatLossPct}%)
          </span>
        </div>

        <div className="flex flex-col group/item hover:bg-bg/40 p-1.5 rounded-lg transition-colors min-w-0">
          <div className="flex items-center gap-1.5 text-dim text-[10px] sm:text-[11px] truncate">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="truncate">Muscle</span>
          </div>
          <span className="font-bold text-text text-xs sm:text-sm mt-0.5 group-hover/item:text-amber-400 transition-colors truncate">
            {muscleGain} ({muscleGainPct}%)
          </span>
        </div>

        <div className="flex flex-col group/item hover:bg-bg/40 p-1.5 rounded-lg transition-colors min-w-0">
          <div className="flex items-center gap-1.5 text-dim text-[10px] sm:text-[11px] truncate">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-400 shrink-0" />
            <span className="truncate">General</span>
          </div>
          <span className="font-bold text-text text-xs sm:text-sm mt-0.5 group-hover/item:text-accent transition-colors truncate">
            {general} ({generalPct}%)
          </span>
        </div>
      </div>
    </div>
  )
}

export function RpeSpectrumCard({ clients }: { clients: ClientSummary[] }) {
  const clientsWithRpe = clients.filter((c) => c.avg_rpe && c.avg_rpe > 0)
  const avgOverall = clientsWithRpe.length
    ? (clientsWithRpe.reduce((acc, c) => acc + Number(c.avg_rpe), 0) / clientsWithRpe.length).toFixed(1)
    : '7.8'

  const light = clientsWithRpe.filter((c) => Number(c.avg_rpe) < 6).length
  const optimal = clientsWithRpe.filter((c) => Number(c.avg_rpe) >= 6 && Number(c.avg_rpe) <= 8).length
  const heavy = clientsWithRpe.filter((c) => Number(c.avg_rpe) > 8).length

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-panel border border-line flex flex-col justify-between hover-gold-glow group transition-all duration-300">
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <h3 className="text-xs font-mono uppercase tracking-wider text-dim group-hover:text-text transition-colors">
          Spektrum Intensitas (RPE)
        </h3>
        <span className="text-[11px] sm:text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
          Rata-rata: {avgOverall} / 10
        </span>
      </div>

      <div className="my-2">
        <div className="flex items-baseline justify-between text-[11px] sm:text-xs text-dim mb-1.5">
          <span>Tingkat Beban Latihan</span>
          <span className="text-text font-medium">Zona Produktif (6.0 - 8.5)</span>
        </div>
        {/* RPE Gradient Gauge */}
        <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-emerald-500/60 via-accent to-rose-500/80 p-0.5 relative">
          {/* Indicator pin with pulse glow */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-black shadow-[0_0_12px_rgba(255,255,255,0.9)] -ml-2 transition-all duration-700 ease-out group-hover:scale-125"
            style={{
              left: `${Math.min(Math.max((Number(avgOverall) / 10) * 100, 10), 90)}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-xs pt-2 border-t border-line/60">
        <div className="p-1.5 rounded-lg hover:bg-bg/40 transition-colors min-w-0">
          <div className="text-[10px] text-dim font-mono truncate">1-5 (Ringan)</div>
          <div className="font-semibold text-text text-xs sm:text-sm truncate">{light} Klien</div>
        </div>
        <div className="p-1.5 rounded-lg hover:bg-bg/40 transition-colors min-w-0">
          <div className="text-[10px] text-accent font-mono font-semibold truncate">6-8 (Target)</div>
          <div className="font-semibold text-text text-xs sm:text-sm truncate">{optimal || clients.length} Klien</div>
        </div>
        <div className="p-1.5 rounded-lg hover:bg-bg/40 transition-colors min-w-0">
          <div className="text-[10px] text-rose-400 font-mono truncate">9-10 (Max)</div>
          <div className="font-semibold text-text text-xs sm:text-sm truncate">{heavy} Klien</div>
        </div>
      </div>
    </div>
  )
}
