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

export interface Ticket {
  id: string
  user_id: string
  user_name: string
  subject: string
  category: string
  priority: string
  status: string
  assigned_to: string | null
  escalated_to_admin: boolean
  last_message: string | null
  unread_count: number
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string | null
  sender: string
  sender_id: string | null
  user_name: string
  text: string
  is_admin_thread: boolean
  created_at: string
}

export interface TicketDetail {
  ticket: Ticket
  messages: TicketMessage[]
  admin_messages: TicketMessage[]
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

  // ── Ticket list ──────────────────────────────────────────────────────────

  async getTickets(params?: { status?: string; page?: number }): Promise<{ tickets: Ticket[]; total: number }> {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.page) qs.set('page', String(params.page))
    qs.set('page_size', '50')
    const res = await supportFetch<{ success: boolean; data: { tickets: Ticket[]; total: number } }>(
      `/support/tickets/admin/all?${qs}`
    )
    return res.data
  },

  // ── Ticket detail ────────────────────────────────────────────────────────

  async getTicketDetail(ticketId: string): Promise<TicketDetail> {
    const res = await supportFetch<{ success: boolean; data: TicketDetail }>(
      `/support/tickets/admin/${ticketId}`
    )
    return res.data
  },

  // ── Agent reply ──────────────────────────────────────────────────────────

  async sendReply(ticketId: string, text: string): Promise<TicketMessage> {
    const res = await supportFetch<{ success: boolean; data: TicketMessage }>(
      `/support/tickets/admin/${ticketId}/reply`,
      { method: 'POST', body: JSON.stringify({ text }) }
    )
    return res.data
  },

  // ── Admin escalation thread ──────────────────────────────────────────────

  async sendAdminReply(ticketId: string, text: string): Promise<TicketMessage> {
    const res = await supportFetch<{ success: boolean; data: TicketMessage }>(
      `/support/tickets/admin/${ticketId}/admin-reply`,
      { method: 'POST', body: JSON.stringify({ text }) }
    )
    return res.data
  },

  // ── Status + escalate ────────────────────────────────────────────────────

  async updateStatus(ticketId: string, status: string): Promise<Ticket> {
    const res = await supportFetch<{ success: boolean; data: Ticket }>(
      `/support/tickets/admin/${ticketId}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) }
    )
    return res.data
  },

  async escalate(ticketId: string): Promise<Ticket> {
    const res = await supportFetch<{ success: boolean; data: Ticket }>(
      `/support/tickets/admin/${ticketId}/escalate`,
      { method: 'PATCH' }
    )
    return res.data
  },
}
