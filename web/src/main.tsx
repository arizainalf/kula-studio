import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './index.css'

const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

// Global capture for PWA installation prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).__pwaInstallPrompt = e;
  window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
});

window.addEventListener('appinstalled', () => {
  (window as any).__pwaInstallPrompt = null;
  localStorage.setItem('lubbefits_pwa_installed', 'true');
  window.dispatchEvent(new CustomEvent('pwa-installed'));
});

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)

// Service worker registration: unregister di mode development agar tidak mengganggu HMR/API
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister().catch(() => {})
      }
    }).catch(() => {})
    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const k of keys) caches.delete(k).catch(() => {})
      }).catch(() => {})
    }
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  }
}
