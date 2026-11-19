import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@zakisheriff/liquid-glass/styles.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

const updateServiceWorker = registerSW({
  immediate: true,
  onRegisteredSW: (_serviceWorkerUrl, registration) => {
    if (!registration) return
    const checkForUpdate = () => { if (document.visibilityState === 'visible') void registration.update() }
    window.addEventListener('visibilitychange', checkForUpdate)
    window.setInterval(checkForUpdate, 60 * 60 * 1000)
  },
  onOfflineReady: () => window.dispatchEvent(new Event('mytasky:offline-ready')),
  onNeedRefresh: () => window.dispatchEvent(new Event('mytasky:update-ready')),
})

window.addEventListener('mytasky:apply-update', () => void updateServiceWorker(true))
