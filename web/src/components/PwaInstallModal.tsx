import { useState, useEffect } from 'react'
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  X,
  Sparkles,
  Zap,
  Maximize2,
  ShieldCheck,
  Check,
} from 'lucide-react'

export interface PwaInstallModalProps {
  isOpen?: boolean
  onClose?: () => void
  autoPrompt?: boolean
  delayMs?: number
}

// Utility: check if the app is currently running in standalone PWA mode
export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

export function PwaInstallModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  autoPrompt = true,
  delayMs = 1800,
}: PwaInstallModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIos, setIsIos] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installSuccess, setInstallSuccess] = useState(false)
  const [showManualGuide, setShowManualGuide] = useState(false)

  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalOpen

  useEffect(() => {
    // 1. Check if already running in standalone PWA
    if (isRunningStandalone()) {
      setIsInstalled(true)
      return
    }

    // 2. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
    setIsIos(isIosDevice)

    // 3. Retrieve pre-captured prompt event if exists
    if ((window as any).__pwaInstallPrompt) {
      setDeferredPrompt((window as any).__pwaInstallPrompt)
    }

    // 4. Listen for beforeinstallprompt event
    const handlePrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      ;(window as any).__pwaInstallPrompt = e
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallSuccess(true)
      ;(window as any).__pwaInstallPrompt = null
      localStorage.setItem('lubbefits_pwa_installed', 'true')
      setTimeout(() => {
        handleClose()
      }, 2500)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('pwa-prompt-available', () => {
      if ((window as any).__pwaInstallPrompt) {
        setDeferredPrompt((window as any).__pwaInstallPrompt)
      }
    })
    window.addEventListener('appinstalled', handleAppInstalled)

    // 5. Auto-prompt trigger after login
    if (autoPrompt && !isControlled) {
      const alreadyInstalled = localStorage.getItem('lubbefits_pwa_installed') === 'true'
      const dismissedUntil = localStorage.getItem('lubbefits_pwa_dismissed_until')
      const isCooldown = dismissedUntil && Number(dismissedUntil) > Date.now()

      if (!alreadyInstalled && !isCooldown) {
        const timer = setTimeout(() => {
          setInternalOpen(true)
        }, delayMs)
        return () => clearTimeout(timer)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [autoPrompt, isControlled, delayMs])

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleClose = () => {
    if (isControlled && controlledOnClose) {
      controlledOnClose()
    } else {
      setInternalOpen(false)
    }
  }

  const handleDismissLater = () => {
    // Dismiss for 7 days
    localStorage.setItem(
      'lubbefits_pwa_dismissed_until',
      String(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )
    handleClose()
  }

  const handleInstallClick = async () => {
    if (isIos) {
      setShowManualGuide(true)
      return
    }

    const promptEvent = deferredPrompt || (window as any).__pwaInstallPrompt
    if (promptEvent) {
      try {
        await promptEvent.prompt()
        const choiceResult = await promptEvent.userChoice
        if (choiceResult.outcome === 'accepted') {
          setInstallSuccess(true)
          localStorage.setItem('lubbefits_pwa_installed', 'true')
          setTimeout(() => {
            handleClose()
          }, 2000)
        }
      } catch (err) {
        console.warn('PWA install prompt error:', err)
        setShowManualGuide(true)
      }
    } else {
      // If browser hasn't fired beforeinstallprompt or on desktop/unsupported browser
      setShowManualGuide(true)
    }
  }

  if (!isOpen || isInstalled) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Dark Ambient Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={handleDismissLater}
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-dialog-title"
        className="relative w-full max-w-md bg-panel border border-accent/40 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_-12px_45px_rgba(0,0,0,0.85)] sm:shadow-[0_16px_50px_rgba(226,232,0,0.2)] transition-all animate-slide-up sm:animate-scale-in max-h-[92vh] overflow-y-auto"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-line/60 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Aplikasi Resmi
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismissLater}
            className="p-1.5 rounded-xl text-dim hover:text-text hover:bg-panel-elevated transition-colors btn-interactive"
            title="Tutup Popup"
            aria-label="Tutup Popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logo & Headline */}
        <div className="pt-4 pb-3 flex items-center gap-3.5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-bg border border-accent/40 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(226,232,0,0.3)] shrink-0">
            <img
              src="/lubbefits-removebg-preview.png"
              alt="Lubbe Fits Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 id="pwa-dialog-title" className="text-base sm:text-lg font-extrabold text-text tracking-tight leading-tight">
              Pasang Aplikasi <span className="text-accent">Lubbe Fits</span>
            </h2>
            <p className="text-xs text-dim mt-0.5">
              Instal ke layar utama HP untuk akses cepat &amp; performa maksimal
            </p>
          </div>
        </div>

        {/* Success State */}
        {installSuccess ? (
          <div className="my-4 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-scale-in">
            <Check className="w-6 h-6 shrink-0 stroke-[3]" />
            <div>
              <div className="font-bold text-sm text-text">Berhasil Terpasang!</div>
              <div className="text-xs text-emerald-400/90">Ikon Lubbe Fits telah ditambahkan ke layar utama Anda.</div>
            </div>
          </div>
        ) : (
          <>
            {/* Value Highlights List */}
            <div className="my-3.5 space-y-2 relative z-10">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-bg/60 border border-line/60">
                <div className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-text">Akses 1-Klik dari Layar Beranda</div>
                  <div className="text-[11px] text-dim">Buka aplikasi langsung tanpa perlu mengetik alamat URL di browser.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-bg/60 border border-line/60">
                <div className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-text">Mode Layar Penuh (App-Like)</div>
                  <div className="text-[11px] text-dim">Tampilan bersih tanpa bilah pencarian &amp; tombol browser yang mengganggu.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-bg/60 border border-line/60">
                <div className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-text">Performa Lebih Cepat &amp; Hemat Kuota</div>
                  <div className="text-[11px] text-dim">Aset web tersimpan aman di memori lokal ponsel Anda.</div>
                </div>
              </div>
            </div>

            {/* iOS Guidance Card (When on iOS Safari or when manual guide requested) */}
            {(isIos || showManualGuide) && (
              <div className="my-3 p-3.5 rounded-2xl bg-panel-elevated border border-accent/30 space-y-2 animate-fade-in text-xs">
                <div className="font-bold text-accent flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>Petunjuk Pasang di {isIos ? 'iPhone / iPad (Safari)' : 'Browser Anda'}:</span>
                </div>

                {isIos ? (
                  <ol className="space-y-1.5 text-dim text-[11px] list-decimal list-inside pl-1">
                    <li>
                      Ketuk tombol <strong className="text-text">Bagikan (Share)</strong> <Share2 className="w-3.5 h-3.5 inline mx-1 text-accent" /> di bilah navigasi bawah Safari.
                    </li>
                    <li>
                      Gulir ke bawah dan pilih <strong className="text-text">Tambah ke Layar Utama</strong> (<em>Add to Home Screen</em>) <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-accent" />.
                    </li>
                    <li>
                      Ketuk <strong className="text-text">Tambah</strong> (<em>Add</em>) di pojok kanan atas layar.
                    </li>
                  </ol>
                ) : (
                  <ol className="space-y-1.5 text-dim text-[11px] list-decimal list-inside pl-1">
                    <li>
                      Ketuk menu titik tiga <strong className="text-text">(⋮)</strong> di sudut kanan atas browser Chrome.
                    </li>
                    <li>
                      Pilih menu <strong className="text-text">"Pasang aplikasi"</strong> atau <strong className="text-text">"Tambahkan ke Layar utama"</strong>.
                    </li>
                    <li>
                      Konfirmasi dengan memilih <strong className="text-text">Install</strong>.
                    </li>
                  </ol>
                )}
              </div>
            )}

            {/* Action Buttons Bar */}
            <div className="pt-3 border-t border-line/60 flex flex-col sm:flex-row items-center gap-2 relative z-10">
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(226,232,0,0.35)] hover:shadow-[0_6px_25px_rgba(226,232,0,0.5)] transition-all flex items-center justify-center gap-2 btn-interactive"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{isIos ? 'Lihat Cara Pasang di iPhone' : 'Pasang Aplikasi Sekarang'}</span>
              </button>

              <button
                type="button"
                onClick={handleDismissLater}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-semibold text-dim hover:text-text hover:bg-panel-elevated transition-all btn-interactive"
              >
                Nanti Saja
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
