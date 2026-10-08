import axios from 'axios'
import { env } from '@/config/env'
import { toApiError } from './errors'

/** Single Axios instance for the whole app. All rejections are normalised to `ApiError`. */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: { Accept: 'application/json' },
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
