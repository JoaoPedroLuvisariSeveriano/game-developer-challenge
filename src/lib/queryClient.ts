import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/errors'
import { env } from '@/config/env'

const MAX_RETRIES = 3

/** Retry only what can plausibly succeed on a second try (timeouts, network, 5xx/408/429). */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  return error instanceof ApiError && error.retryable && failureCount < MAX_RETRIES
}

/** Exponential backoff capped at 8 s: base, 2*base, 4*base... */
export function retryDelay(attemptIndex: number): number {
  return Math.min(env.retryBaseDelayMs * 2 ** attemptIndex, 8_000)
}

/** Factory so tests / Strict Mode / HMR can always get an isolated cache. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        retryDelay,
        staleTime: 0,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: shouldRetry,
        retryDelay,
      },
    },
  })
}

export const queryClient = createQueryClient()
