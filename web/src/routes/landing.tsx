import { createFileRoute } from '@tanstack/react-router'
import { api, type User } from '../lib/api'
import { LandingPage } from '../components/LandingPage'

export const Route = createFileRoute('/landing')({
  loader: async () => {
    try {
      const res = await api<{ user: User }>('/auth/me')
      return { user: res.user }
    } catch {
      return { user: null }
    }
  },
  component: LandingRoute,
})

function LandingRoute() {
  const { user } = Route.useLoaderData()
  return <LandingPage currentUser={user} />
}
