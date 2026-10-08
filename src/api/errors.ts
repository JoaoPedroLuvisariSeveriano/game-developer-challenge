import axios from 'axios'
import type { ApiErrorBody, ApiErrorCode } from './contracts'

export type ApiErrorKind = 'timeout' | 'network' | 'http' | 'canceled' | 'unknown'

interface ApiErrorInit {
  kind: ApiErrorKind
  message: string
  status?: number
  code?: ApiErrorCode
  details?: Record<string, string>
  cause?: unknown
}

/**
 * Normalised error thrown by the HTTP layer. UI and TanStack Query only ever see this type,
 * never raw Axios errors, so retry/UX decisions are made in one place.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | undefined
  readonly code: ApiErrorCode | undefined
  readonly details: Record<string, string> | undefined

  constructor(init: ApiErrorInit) {
    super(init.message, { cause: init.cause })
    this.name = 'ApiError'
    this.kind = init.kind
    this.status = init.status
    this.code = init.code
    this.details = init.details
  }

  /**
   * Whether repeating the same request may succeed. Safe for writes too because
   * `POST /history` is idempotent on `matchId`.
   */
  get retryable(): boolean {
    switch (this.kind) {
      case 'timeout':
      case 'network':
        return true
      case 'http':
        return this.status !== undefined && (this.status >= 500 || this.status === 408 || this.status === 429)
      default:
        return false
    }
  }

  /** Short, user-presentable summary. */
  get userMessage(): string {
    switch (this.kind) {
      case 'timeout':
        return 'The server took too long to respond.'
      case 'network':
        return 'Could not reach the server. Check your connection.'
      case 'canceled':
        return 'The request was canceled.'
      default:
        return this.message
    }
  }
}

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  if (typeof data !== 'object' || data === null || !('error' in data)) return false
  const { error } = data as { error: unknown }
  return typeof error === 'object' && error !== null && 'message' in error && 'code' in error
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isCancel(error)) {
    return new ApiError({ kind: 'canceled', message: 'Request canceled.', cause: error })
  }

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const body: unknown = error.response.data
      const parsed = isApiErrorBody(body) ? body.error : undefined
      return new ApiError({
        kind: 'http',
        status: error.response.status,
        message: parsed?.message ?? `Request failed with status ${error.response.status}.`,
        ...(parsed?.code !== undefined && { code: parsed.code }),
        ...(parsed?.details !== undefined && { details: parsed.details }),
        cause: error,
      })
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError({ kind: 'timeout', message: 'Request timed out.', cause: error })
    }
    return new ApiError({ kind: 'network', message: 'Network error.', cause: error })
  }

  return new ApiError({
    kind: 'unknown',
    message: error instanceof Error ? error.message : 'Unexpected error.',
    cause: error,
  })
}
