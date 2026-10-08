function readNonNegativeNumber(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

/** Typed, validated access to build-time environment variables. */
export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, ''),
  apiTimeoutMs: readNonNegativeNumber(import.meta.env.VITE_API_TIMEOUT_MS, 8_000),
  /** Base delay of the exponential retry backoff (500 -> 1000 -> 2000 ...). */
  retryBaseDelayMs: readNonNegativeNumber(import.meta.env.VITE_RETRY_BASE_DELAY_MS, 500),
  mocksEnabled: import.meta.env.VITE_ENABLE_MOCKS !== 'false',
  /** Vite base path, needed to locate the MSW service worker when deployed under a subpath. */
  baseUrl: import.meta.env.BASE_URL,
} as const
