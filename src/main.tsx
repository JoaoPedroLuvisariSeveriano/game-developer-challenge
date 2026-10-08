import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from '@/App'
import { queryClient } from '@/lib/queryClient'
import { startMocking } from '@/mocks/browser'
import './index.css'

async function bootstrap(): Promise<void> {
  try {
    // The mock API must be live before the first query fires.
    await startMocking()
  } catch (error) {
    // Ranking/history are non-critical: the game and menus must still load without them.
    console.warn('[mocks] Could not start the mock API; ranking and history will be unavailable.', error)
  }

  const container = document.getElementById('root')
  if (!container) throw new Error('Root element #root not found.')

  createRoot(container).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()
