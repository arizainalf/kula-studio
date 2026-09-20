import { useState, useEffect } from 'react'
import { LogOut, X, AlertTriangle, Loader2 } from 'lucide-react'

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  userName?: string
  userRole?: string
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userRole,
}: LogoutModalProps) {
  const [loading, setLoading] = useState(false)

  // ESC to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, loading, onClose])

  if (!isOpen) return null

  async function handleConfirm() {
    try {
      setLoading(true)
      await onConfirm()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Box */}
      <div
        className="relative w-full max-w-md rounded-2xl sm:rounded-3xl bg-panel border border-line p-6 shadow-2xl transition-all animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 rounded-xl text-dim hover:text-text hover:bg-bg border border-transparent hover:border-line transition-all disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            <LogOut className="w-6 h-6" />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-lg font-bold text-text tracking-tight">
              Konfirmasi Keluar Akun
            </h3>
            <p className="text-xs text-dim mt-1 leading-relaxed">
              Apakah Anda yakin ingin mengakhiri sesi login ini?
            </p>
          </div>
        </div>

        {/* Account Info Pill */}
        {userName && (
          <div className="mb-5 p-3 rounded-xl bg-bg border border-line/60 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <span className="text-dim text-[11px] block">Akun aktif saat ini:</span>
              <span className="font-semibold text-text truncate block">{userName}</span>
            </div>
            {userRole && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-panel text-accent border border-accent/30 shrink-0">
                {userRole}
              </span>
            )}
          </div>
        )}

        {/* Warning Note */}
        <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            Setelah keluar, Anda perlu memasukkan email dan password untuk mengakses kembali aplikasi.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-interactive px-4 py-2.5 rounded-xl border border-line hover:border-accent/40 bg-bg text-text text-xs font-semibold transition-all disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="btn-interactive px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-xs font-semibold shadow-[0_2px_12px_rgba(244,63,94,0.3)] transition-all flex items-center gap-2 disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Ya, Keluar Akun</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
