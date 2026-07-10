'use client'

import { useEffect, useLayoutEffect } from 'react'
import { authApi } from '@/lib/api/auth'
import { useAppStore } from '@/lib/store'

// Paths that don't require authentication
const PUBLIC_PREFIXES = ['/login', '/signup', '/verify', '/welcome', '/forgot-password']

function isProtectedPath(pathname: string): boolean {
  if (pathname === '/') return false
  return !PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
}

function getJwtExp(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    const { exp } = JSON.parse(atob(payload))
    return typeof exp === 'number' ? exp : null
  } catch {
    return null
  }
}

export function WebTokenHandler() {
  const accessToken = useAppStore((s) => s.accessToken)

  // Runs synchronously before the browser paints — prevents flash of protected content
  // when the stored token has expired.
  useLayoutEffect(() => {
    if (!accessToken) return
    const exp = getJwtExp(accessToken)
    if (exp === null || exp * 1000 < Date.now()) {
      useAppStore.getState().clearAuth()
      // Clear the logged-in cookie so server-aware checks also reflect logout
      document.cookie = 'sb_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
      if (isProtectedPath(window.location.pathname)) {
        window.location.href = '/login'
      }
    }
  }, [accessToken])

  // Exchange one-time web token from mobile app deep-link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const wt = params.get('wt')
    if (!wt) return

    params.delete('wt')
    const cleanUrl = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname
    window.history.replaceState({}, '', cleanUrl)

    authApi.exchangeWebToken(wt).catch(() => {})
  }, [])

  return null
}
