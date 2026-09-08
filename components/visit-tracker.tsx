'use client'

import { useEffect } from 'react'

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.spacebutton.net/api/v1').replace(/\/$/, '')

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem('sb_session_id')
    if (existing) return existing
    const id = crypto.randomUUID()
    sessionStorage.setItem('sb_session_id', id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

/** Fires one non-blocking beacon per browser session — records a unique
 * "website visit" for the admin dashboard chart. Never throws, never blocks
 * rendering, and is mounted only on the public site (not the admin app). */
export function VisitTracker() {
  useEffect(() => {
    try {
      const sessionId = getSessionId()
      const payload = JSON.stringify({ session_id: sessionId, path: window.location.pathname })
      const url = `${API_BASE}/track/visit`
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon(url, blob)
      } else {
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {})
      }
    } catch {
      // tracking must never break the page
    }
  }, [])

  return null
}
