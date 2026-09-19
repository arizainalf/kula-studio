
/**
 * AmbientBackground creates subtle, animated, drifting colored orbs in the background.
 * This dynamically showcases the translucency, frosted blur, and bevel highlights
 * of Glassmorphic cards, sidebars, headers, and modal dialogs.
 */
export function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* ── Orb 1: Volt Yellow / Brand Accent Glow (Top-Left to Center) ── */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[520px] h-[520px] sm:w-[650px] sm:h-[650px] rounded-full blur-[90px] sm:blur-[130px] opacity-70 animate-float-orb-1 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle, rgba(226, 232, 0, 0.14) 0%, rgba(226, 232, 0, 0.05) 50%, transparent 75%)',
        }}
      />

      {/* ── Orb 2: Electric Cyan / Sky Blue Glow (Top-Right to Center-Right) ── */}
      <div
        className="absolute top-[10%] -right-[12%] w-[480px] h-[480px] sm:w-[600px] sm:h-[600px] rounded-full blur-[90px] sm:blur-[120px] opacity-65 animate-float-orb-2 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle, rgba(56, 189, 248, 0.13) 0%, rgba(56, 189, 248, 0.04) 55%, transparent 75%)',
        }}
      />

      {/* ── Orb 3: Violet / Royal Purple Glow (Bottom-Left to Center) ── */}
      <div
        className="absolute bottom-[5%] left-[10%] w-[500px] h-[500px] sm:w-[680px] sm:h-[680px] rounded-full blur-[100px] sm:blur-[140px] opacity-60 animate-float-orb-3 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle, rgba(168, 85, 247, 0.11) 0%, rgba(168, 85, 247, 0.03) 55%, transparent 75%)',
        }}
      />

      {/* ── Orb 4: Soft Coral Rose Glow (Bottom-Right / Floating) ── */}
      <div
        className="absolute -bottom-[10%] right-[15%] w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] rounded-full blur-[85px] sm:blur-[120px] opacity-55 animate-float-orb-4 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle, rgba(244, 63, 94, 0.09) 0%, rgba(244, 63, 94, 0.03) 50%, transparent 75%)',
        }}
      />
    </div>
  )
}
