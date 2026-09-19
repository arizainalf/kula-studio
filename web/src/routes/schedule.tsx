import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { api, type User } from '../lib/api'
import { WeeklyScheduleSection } from '../components/WeeklyScheduleSection'
import { MobileBottomNav } from '../components/MobileBottomNav'
import { AppLayout } from '../components/AppLayout'
import { getLocalTodayString, getLocalFutureDateString } from '../lib/date'
import type { Client, ScheduleItem } from './index'
import { Calendar } from 'lucide-react'

export const Route = createFileRoute('/schedule')({
  beforeLoad: async () => {
    try {
      const res = await api<{ user: User }>('/auth/me')
      if (res.user.role === 'client') throw redirect({ to: '/portal' })
    } catch (e) {
      if (e && typeof e === 'object' && 'to' in e) throw e
      throw redirect({ to: '/login' })
    }
  },
  loader: async () => {
    const today = getLocalTodayString()
    const nextWeekDate = getLocalFutureDateString(14)

    const [meRes, clientsRes, schedRes] = await Promise.all([
      api<{ user: User }>('/auth/me'),
      api<{ clients: Client[] }>('/clients').catch(() => ({ clients: [] })),
      api<{ schedule: ScheduleItem[] }>(`/schedule?from=${today}&to=${nextWeekDate}`).catch(() => ({ schedule: [] })),
    ])

    return {
      me: meRes.user,
      clients: clientsRes.clients,
      schedule: schedRes.schedule,
    }
  },
  component: SchedulePage,
})

function SchedulePage() {
  const { me: initialMe, clients, schedule } = Route.useLoaderData()
  const [currentUser, setCurrentUser] = useState<User>(initialMe)

  return (
    <AppLayout
      currentUser={currentUser}
      activeRoute="schedule"
      onProfileUpdated={(updated) => setCurrentUser((prev: User) => ({ ...prev, ...updated }))}
    >
      {/* ── Main Schedule Body ── */}
      <main className="flex-1 w-full p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-12">
        <div className="w-full space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-panel border border-accent/40 flex items-center justify-center text-accent shadow-sm shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-text">
                  Jadwal Sesi Latihan
                </h1>
                <p className="text-xs text-dim">
                  Kelola slot waktu dan agenda sesi latihan personal training
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-accent bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20">
                {schedule.length} Sesi Terjadwal
              </span>
            </div>
          </div>

          {/* Weekly Schedule Interactive Module */}
          <div className="animate-fade-in-up">
            <WeeklyScheduleSection
              schedule={schedule}
              clients={clients}
              currentUser={currentUser}
              onScheduleChange={() => {
                location.reload()
              }}
            />
          </div>
        </div>
      </main>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <MobileBottomNav canLogSession={currentUser.role === 'pt'} />
    </AppLayout>
  )
}
