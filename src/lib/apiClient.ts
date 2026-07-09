import { env, ensureEnv } from '../config/env'

export type ApiValidationErrors = Record<string, string[]>

export class ApiError extends Error {
  status: number
  code?: string
  validationErrors?: ApiValidationErrors

  constructor(message: string, status: number, options?: { code?: string; validationErrors?: ApiValidationErrors }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = options?.code
    this.validationErrors = options?.validationErrors
  }
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = {
  method?: RequestMethod
  headers?: HeadersInit
  body?: unknown
  signal?: AbortSignal
  skipAuth?: boolean
}

let getAuthToken: (() => string | null) | null = null
let onUnauthorized: (() => void) | null = null

export function setApiAuthTokenResolver(resolver: (() => string | null) | null) {
  getAuthToken = resolver
}

export function setApiUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

type LaravelLikeError = {
  message?: string
  error?: string
  errors?: ApiValidationErrors
  code?: string
}

function normalizeErrorBody(body: unknown): LaravelLikeError {
  if (body && typeof body === 'object') {
    return body as LaravelLikeError
  }
  return {}
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${env.apiBaseUrl}${normalizedPath}`
}

function buildHeaders(customHeaders?: HeadersInit, body?: unknown, skipAuth = false): Headers {
  const headers = new Headers(customHeaders)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  const token = skipAuth ? null : getAuthToken?.()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (body !== undefined && body !== null && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return headers
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null
  const raw = await response.text()
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function normalizeApiError(response: Response, body: unknown): ApiError {
  const normalized = normalizeErrorBody(body)
  const message = normalized.message ?? normalized.error ?? `Error HTTP ${response.status}`

  return new ApiError(message, response.status, {
    code: normalized.code,
    validationErrors: normalized.errors,
  })
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  ensureEnv()
  const { method = 'GET', headers: customHeaders, body, signal, skipAuth = false } = options
  const headers = buildHeaders(customHeaders, body, skipAuth)

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  const parsedBody = await parseResponseBody(response)

  if (!response.ok) {
    const error = normalizeApiError(response, parsedBody)
    if (response.status === 401) onUnauthorized?.()
    throw error
  }

  return parsedBody as T
}
