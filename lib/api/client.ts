'use client'

import { useAppStore } from '@/lib/store'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { message?: string; detail?: unknown; errors?: unknown },
  ) {
    const msg =
      typeof body.message === 'string'
        ? body.message
        : typeof body.detail === 'string'
          ? body.detail
          : 'Request failed'
    super(msg)
    this.name = 'ApiError'
  }
}

// ─── Token helpers ─────────────────────────────────────────────

function getTokens() {
  return useAppStore.getState()
}

export function setTokens(accessToken: string, refreshToken: string) {
  useAppStore.getState().setTokens(accessToken, refreshToken)
  document.cookie = `sb_logged_in=1; path=/; SameSite=Strict; max-age=${60 * 60 * 24 * 30}`
}

export function clearAuth() {
  useAppStore.getState().clearAuth()
  document.cookie = 'sb_logged_in=; path=/; max-age=0'
  window.location.href = '/login'
}

// ─── Token refresh ─────────────────────────────────────────────

let refreshPromise: Promise<boolean> | null = null

// Tri-state: true = refreshed OK, false = token definitely expired (should logout), throws = transient error (don't logout)
async function tryRefreshTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async (): Promise<boolean> => {
    const { refreshToken } = getTokens()
    if (!refreshToken) return false

    let res: Response
    try {
      res = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    } catch (networkErr) {
      // Network/DNS failure — don't log the user out, just propagate
      throw networkErr
    }

    if (!res.ok) {
      // 401 / 403 = token genuinely invalid or expired → log out
      if (res.status === 401 || res.status === 403) return false
      // 5xx or other server error → transient, don't log out
      throw new Error(`refresh_http_${res.status}`)
    }

    const json = await res.json() as { data?: { access_token: string; refresh_token: string } }
    const data = json.data ?? (json as { access_token: string; refresh_token: string })
    setTokens(data.access_token, data.refresh_token)
    return true
  })()
    .finally(() => { refreshPromise = null })

  return refreshPromise
}

// ─── Core fetch wrapper ────────────────────────────────────────

export interface FetchOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  skipAuth?: boolean
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth = false, body, method = 'GET', headers: extraHeaders = {} } = options

  const headers: Record<string, string> = { ...extraHeaders }

  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (!skipAuth) {
    const { accessToken } = getTokens()
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
  }

  let bodyInit: BodyInit | undefined
  if (body instanceof FormData) {
    bodyInit = body
  } else if (body !== undefined) {
    bodyInit = JSON.stringify(body)
  }

  const init: RequestInit = { method, headers, body: bodyInit }

  let res = await fetch(`${BASE_URL}${endpoint}`, init)

  // Auto-refresh on 401
  if (res.status === 401 && !skipAuth) {
    let refreshed: boolean
    try {
      refreshed = await tryRefreshTokens()
    } catch {
      // Transient error (network down, server 5xx) — don't log out, just fail the request
      throw new ApiError(401, { message: 'Connection issue. Please try again.' })
    }

    if (refreshed) {
      const { accessToken: newToken } = getTokens()
      const retryHeaders: Record<string, string> = { ...headers }
      if (newToken) retryHeaders['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${BASE_URL}${endpoint}`, { ...init, headers: retryHeaders })
    } else {
      // Token definitively invalid — log out
      clearAuth()
      throw new ApiError(401, { message: 'Session expired. Please log in again.' })
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Request failed' })) as Record<string, unknown>
    throw new ApiError(res.status, errorBody)
  }

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// ─── Convenience methods ───────────────────────────────────────

export const api = {
  get<T>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return apiFetch<T>(endpoint, { ...options, method: 'GET' })
  },
  post<T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return apiFetch<T>(endpoint, { ...options, method: 'POST', body })
  },
  put<T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return apiFetch<T>(endpoint, { ...options, method: 'PUT', body })
  },
  patch<T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return apiFetch<T>(endpoint, { ...options, method: 'PATCH', body })
  },
  delete<T>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return apiFetch<T>(endpoint, { ...options, method: 'DELETE' })
  },
}
