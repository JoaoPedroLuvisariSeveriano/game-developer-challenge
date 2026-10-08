import { setupWorker } from 'msw/browser'
import { env } from '@/config/env'
import './control' // registers `window.__PIRATE_MOCK__` before the first request
import { handlers } from './handlers'

const worker = setupWorker(...handlers)

/**
 * Starts the mock API. Must be awaited *before* rendering so the very first query cannot race
 * the service worker. Works the same in dev, preview and the deployed build.
 */
export async function startMocking(): Promise<void> {
  if (!env.mocksEnabled) return

  await worker.start({
    // Assets, HMR, fonts... pass straight through; only `/api/*` is mocked.
    onUnhandledFrame: 'bypass',
    quiet: !import.meta.env.DEV,
    serviceWorker: { url: `${env.baseUrl}mockServiceWorker.js` },
  })
}
