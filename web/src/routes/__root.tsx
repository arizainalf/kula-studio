import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AmbientBackground } from '../components/AmbientBackground'

export const Route = createRootRoute({
  component: () => (
    <>
      <AmbientBackground />
      <Outlet />
    </>
  ),
})
