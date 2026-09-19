import { createFileRoute } from '@tanstack/react-router'
import { api, type User, type PlatformSettings } from '../lib/api'
import { LandingPage } from '../components/LandingPage'

export const Route = createFileRoute('/landing')({
  loader: async () => {
    const [userRes, settingsRes] = await Promise.all([
      api<{ user: User }>('/auth/me').catch(() => ({ user: null })),
      api<{ settings: PlatformSettings }>('/platform/settings').catch(() => ({ settings: null })),
    ])

    return {
      user: userRes.user,
      settings: settingsRes.settings,
    }
  },
  component: LandingRoute,
})

function LandingRoute() {
  const { user, settings } = Route.useLoaderData()
  return <LandingPage currentUser={user} initialSettings={settings} />
}

