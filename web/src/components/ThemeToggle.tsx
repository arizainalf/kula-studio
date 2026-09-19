import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'kulastudio-theme'
const LEGACY_THEME_STORAGE_KEY = 'trainlog-theme'
const THEME_EVENT_NAME = 'kulastudio-theme-change'

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const val = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_THEME_STORAGE_KEY)
    if (val === 'light' || val === 'dark') return val
  } catch {}
  return 'dark'
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.add('light')
    root.setAttribute('data-theme', 'light')
  } else {
    root.classList.remove('light')
    root.removeAttribute('data-theme')
  }

  // Update mobile status bar theme color
  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'light' ? '#F4F5F7' : '#141414')
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    window.dispatchEvent(new CustomEvent(THEME_EVENT_NAME, { detail: theme }))
  } catch {}
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    // Synchronize initial state
    const current = getStoredTheme()
    setThemeState(current)
    applyTheme(current)

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>
      if (customEvent.detail === 'light' || customEvent.detail === 'dark') {
        setThemeState(customEvent.detail)
      } else {
        setThemeState(getStoredTheme())
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY || e.key === LEGACY_THEME_STORAGE_KEY) {
        const next = e.newValue === 'light' ? 'light' : 'dark'
        setThemeState(next)
        applyTheme(next)
      }
    }

    window.addEventListener(THEME_EVENT_NAME, handleThemeChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(THEME_EVENT_NAME, handleThemeChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setThemeState(nextTheme)
    applyTheme(nextTheme)
  }

  return {
    theme,
    toggleTheme,
    setTheme: (t: Theme) => {
      setThemeState(t)
      applyTheme(t)
    },
  }
}

export function ThemeToggle({
  className = '',
  showLabel = false,
}: {
  className?: string
  showLabel?: boolean
}) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn-interactive p-2 sm:px-2.5 sm:py-1.5 rounded-lg border border-line hover:border-accent/40 text-dim hover:text-text transition-colors flex items-center gap-1.5 text-xs font-mono shrink-0 ${className}`}
      title={theme === 'dark' ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
      aria-label={theme === 'dark' ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-3.5 h-3.5 text-accent shrink-0 transition-transform duration-300 hover:rotate-45" />
          {showLabel && <span>Mode Terang</span>}
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-sky-400 shrink-0 transition-transform duration-300 hover:-rotate-12" />
          {showLabel && <span>Mode Gelap</span>}
        </>
      )}
    </button>
  )
}
