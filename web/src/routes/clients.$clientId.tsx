import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { api } from '../lib/api'

export const Route = createFileRoute('/clients/$clientId')({
  beforeLoad: async () => {
    try { await api('/auth/me') } catch { throw redirect({ to: '/login' }) }
  },
  component: () => <Outlet />,
})
