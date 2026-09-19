import { createFileRoute } from '@tanstack/react-router'
import { api, type User, type PlatformSettings, type TrainerShowcase } from '../lib/api'
import { LandingPage } from '../components/LandingPage'

export const Route = createFileRoute('/landing')({
  loader: async () => {
    const [userRes, settingsRes, trainersRes] = await Promise.all([
      api<{ user: User }>('/auth/me').catch(() => ({ user: null })),
      api<{ settings: PlatformSettings }>('/platform/settings').catch(() => ({ settings: null })),
      api<{ trainers: TrainerShowcase[] }>('/platform/trainers').catch(() => ({ trainers: [] })),
    ])

    return {
      user: userRes.user,
      settings: settingsRes.settings,
      trainers: trainersRes.trainers || [],
    }
  },
  component: LandingRoute,
})

function LandingRoute() {
  const { user, settings, trainers } = Route.useLoaderData()
  return <LandingPage currentUser={user} initialSettings={settings} initialTrainers={trainers} />
}

