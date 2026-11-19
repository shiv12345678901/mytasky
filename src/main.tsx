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
  onOfflineReady: () => window.dispatchEvent(new Event('mytasky:offline-ready')),
  onNeedRefresh: () => window.dispatchEvent(new Event('mytasky:update-ready')),
})

window.addEventListener('mytasky:apply-update', () => void updateServiceWorker(true))
