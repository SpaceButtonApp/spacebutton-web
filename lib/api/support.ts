const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.spacebutton.net/api/v1').replace(/\/$/, '')

function getSupportToken(): string {
  if (typeof window === 'undefined') return ''
  try { return localStorage.getItem('support-token') || '' } catch { return '' }
}

async function supportFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getSupportToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const raw = body?.detail ?? body?.message
    const msg = typeof raw === 'string' ? raw : raw != null ? JSON.stringify(raw) : `Request failed (${res.status})`
    throw new Error(msg)
  }
  return res.json()
}

export interface SupportUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
}

export const supportApi = {
  async login(email: string, password: string): Promise<{ access_token: string; user: SupportUser }> {
    const res = await fetch(`${API_BASE}/auth/support-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg = body?.detail ?? body?.message ?? `Login failed (${res.status})`
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
    const data = await res.json()
    return data?.data ?? data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await supportFetch('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    })
  },
}
