'use client'

import { useEffect } from 'react'
import { authApi } from '@/lib/api/auth'

/**
 * Runs on every page load and checks for a `?wt=` query param.
 * When present (user opened the site from the mobile app), it exchanges
 * the one-time token for a full session so the user is automatically
 * logged in without having to sign in manually.
 */
export function WebTokenHandler() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const wt = params.get('wt')
    if (!wt) return

    // Remove the token from the URL immediately so it isn't bookmarked or shared
    params.delete('wt')
    const cleanUrl = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname
    window.history.replaceState({}, '', cleanUrl)

    authApi.exchangeWebToken(wt).catch(() => {
      // Token expired or already used — user will need to log in normally
    })
  }, [])

  return null
}
