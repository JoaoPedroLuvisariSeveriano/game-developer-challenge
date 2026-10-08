/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the REST API. Defaults to `/api` (served by MSW). */
  readonly VITE_API_BASE_URL?: string
  /** Axios request timeout in milliseconds. Defaults to 8000. */
  readonly VITE_API_TIMEOUT_MS?: string
  /** Base delay (ms) of the exponential retry backoff. Defaults to 500. */
  readonly VITE_RETRY_BASE_DELAY_MS?: string
  /** Set to `false` to skip starting MSW (e.g. when pointing at a real backend). */
  readonly VITE_ENABLE_MOCKS?: string
}
