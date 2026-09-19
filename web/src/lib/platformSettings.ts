import React, { useState, useEffect } from 'react'
import { api, type PlatformSettings } from './api'

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 'default',
  app_name: 'Kula Studio',
  app_tagline: 'Pro PT Manager',
  app_initials: 'KS',
  logo_url: null,
  hero_pill: 'Eksklusif untuk Personal Trainer & Studio',
  hero_headline: 'Catat Sesi. Susun Program NASM.',
  hero_gradient: 'Pantau Progress Klien.',
  hero_subheadline:
    'Tinggalkan buku catatan kertas dan spreadsheet yang tercecer. Satu platform terpadu untuk mengatur jadwal, mencatat beban & RPE, merancang program berbasis sains, dan membagikan rekap sesi ke WhatsApp klien.',
  features: [],
  how_it_works: [],
  pricing_plans: [],
  long_term_plans: [],
  contact_whatsapp: '6287884241516',
  contact_email: 'support@kula-studio.my.id',
  cta_headline: 'Mulai Catat Sesi Latihan Hari Ini.',
  cta_subheadline:
    'Daftarkan akun Anda, verifikasi melalui admin studio, dan rasakan kemudahan pengelolaan latihan berstandar internasional.',
  footer_copyright: 'Kula Studio. Hak Cipta Dilindungi.',
}

const SETTINGS_EVENT = 'kulastudio-settings-change'
const STORAGE_KEY = 'kulastudio-platform-settings-cache'
const LEGACY_STORAGE_KEY = 'trainlog-platform-settings-cache'

let memoryCachedSettings: PlatformSettings | null = null

export function getCachedPlatformSettings(): PlatformSettings {
  if (memoryCachedSettings) return memoryCachedSettings
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.app_name) {
        // Sanitize legacy TrainLog name if cached
        if (parsed.app_name.toLowerCase().includes('trainlog')) {
          parsed.app_name = 'Kula Studio'
          parsed.app_initials = 'KS'
          if (parsed.contact_email?.includes('trainlog')) {
            parsed.contact_email = 'support@kula-studio.my.id'
          }
          if (parsed.footer_copyright?.includes('TrainLog')) {
            parsed.footer_copyright = 'Kula Studio. Hak Cipta Dilindungi.'
          }
        }
        memoryCachedSettings = parsed
        return parsed
      }
    }
  } catch {}
  return DEFAULT_PLATFORM_SETTINGS
}

export function updateDocumentFavicon(logoUrl?: string | null) {
  if (typeof document === 'undefined') return
  try {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }

    let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']")
    if (!appleLink) {
      appleLink = document.createElement('link')
      appleLink.rel = 'apple-touch-icon'
      document.head.appendChild(appleLink)
    }

    if (logoUrl) {
      link.href = logoUrl
      link.type = logoUrl.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png'
      appleLink.href = logoUrl
    } else {
      link.href = '/favicon.svg'
      link.type = 'image/svg+xml'
      appleLink.href = '/favicon.svg'
    }
  } catch {}
}

export function dispatchPlatformSettingsChange(newSettings: PlatformSettings) {
  memoryCachedSettings = newSettings
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
  } catch {}
  if (typeof document !== 'undefined') {
    if (newSettings.app_name) {
      document.title = `${newSettings.app_name} — ${newSettings.app_tagline || 'Pro PT Manager'}`
    }
    updateDocumentFavicon(newSettings.logo_url)
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: newSettings }))
  }
}

/**
 * Formats a brand name with luxury accent styling:
 * e.g. "Kula Studio" -> "Kula" + <span className="text-accent">"Studio"</span>
 * e.g. "Gym Master" -> "Gym" + <span className="text-accent">"Master"</span>
 */
export function formatBrandName(name?: string | null): React.ReactNode {
  if (!name) return 'Kula Studio'
  const trimmed = name.trim()

  // Case 1: Multiple words (e.g. "Gym Master" or "Fit Club Pro")
  const parts = trimmed.split(' ')
  if (parts.length > 1) {
    const last = parts.pop()
    return React.createElement(
      React.Fragment,
      null,
      parts.join(' '),
      ' ',
      React.createElement('span', { className: 'text-accent' }, last)
    )
  }

  // Case 2: CamelCase single word (e.g. "TrainLog", "FitTrack", "GymPro")
  const camelMatch = trimmed.match(/^([A-Z][a-z0-9]+)([A-Z][A-Za-z0-9]+)$/)
  if (camelMatch) {
    return React.createElement(
      React.Fragment,
      null,
      camelMatch[1],
      React.createElement('span', { className: 'text-accent' }, camelMatch[2])
    )
  }

  return trimmed
}

export function usePlatformSettings(initialSettings?: PlatformSettings | null): PlatformSettings {
  const [settings, setSettings] = useState<PlatformSettings>(() => {
    if (initialSettings) {
      memoryCachedSettings = initialSettings
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSettings))
      } catch {}
      return initialSettings
    }
    return getCachedPlatformSettings()
  })

  useEffect(() => {
    let active = true

    // Sync initial favicon on mount
    updateDocumentFavicon(settings.logo_url)

    function handleSettingsUpdate(e: Event) {
      const ce = e as CustomEvent<PlatformSettings>
      if (ce.detail && active) {
        setSettings(ce.detail)
        updateDocumentFavicon(ce.detail.logo_url)
      }
    }

    window.addEventListener(SETTINGS_EVENT, handleSettingsUpdate)

    // Background fetch fresh settings from database API
    api<{ settings: PlatformSettings }>('/platform/settings')
      .then((res) => {
        if (!active || !res.settings) return
        memoryCachedSettings = res.settings
        setSettings(res.settings)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.settings))
        } catch {}
        if (res.settings.app_name) {
          document.title = `${res.settings.app_name} — ${res.settings.app_tagline || 'Pro PT Manager'}`
        }
        updateDocumentFavicon(res.settings.logo_url)
      })
      .catch(() => {
        // Fallback silently to cached/default settings
      })

    return () => {
      active = false
      window.removeEventListener(SETTINGS_EVENT, handleSettingsUpdate)
    }
  }, [])

  return settings
}
