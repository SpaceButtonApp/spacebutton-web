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
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('support-token')
      localStorage.removeItem('support-user')
      window.location.href = '/support/login'
    }
    throw new Error('Session expired. Please log in again.')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const raw = body?.detail ?? body?.message
    const msg = typeof raw === 'string' ? raw : raw != null ? JSON.stringify(raw) : `Request failed (${res.status})`
    throw new Error(msg)
  }
  return res.json()
}

export interface AdminUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone_number: string | null
  role: string
  status: string
  is_email_verified: boolean
  created_at: string
}

export type NotificationTargetType = 'all' | 'agent' | 'user' | 'specific'

export interface NotificationBroadcastRequest {
  id: string
  title: string
  body: string
  target_type: NotificationTargetType
  target_user_ids: string[] | null
  target_label: string | null
  status: 'pending' | 'sent' | 'rejected'
  created_by_id: string
  created_by_name: string
  created_by_role: string
  decided_by_id: string | null
  decided_by_name: string | null
  decided_at: string | null
  rejection_reason: string | null
  total_users: number | null
  push_sent: number | null
  created_at: string
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
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    })
  },

  // ── Ticket list ──────────────────────────────────────────────────────────

  async getTickets(params?: { status?: string; page?: number; page_size?: number }): Promise<{ tickets: Ticket[]; total: number }> {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.page) qs.set('page', String(params.page))
    qs.set('page_size', String(params?.page_size ?? 50))
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

  async claimTicket(ticketId: string): Promise<Ticket> {
    const res = await supportFetch<{ success: boolean; data: Ticket }>(
      `/support/tickets/admin/${ticketId}/claim`,
      { method: 'PATCH' }
    )
    return res.data
  },

  async unclaimTicket(ticketId: string): Promise<Ticket> {
    const res = await supportFetch<{ success: boolean; data: Ticket }>(
      `/support/tickets/admin/${ticketId}/unclaim`,
      { method: 'PATCH' }
    )
    return res.data
  },

  // ── Users ────────────────────────────────────────────────────────────────

  async getUsers(params?: { page?: number; page_size?: number; role?: string; search?: string }): Promise<{ users: AdminUser[]; total: number }> {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    qs.set('page_size', String(params?.page_size ?? 50))
    if (params?.role) qs.set('role', params.role)
    if (params?.search) qs.set('search', params.search)
    const res = await supportFetch<{ success: boolean; data: { users: AdminUser[]; total: number } }>(`/admin/users?${qs}`)
    return res.data
  },

  async suspendUser(userId: string): Promise<void> {
    await supportFetch(`/admin/users/${userId}/suspend`, { method: 'PATCH' })
  },

  async activateUser(userId: string): Promise<void> {
    await supportFetch(`/admin/users/${userId}/activate`, { method: 'PATCH' })
  },

  // ── Verifications ────────────────────────────────────────────────────────

  async getVerifiedUsers(page = 1): Promise<{ users: Array<{ user_id: string; first_name: string; last_name: string; email: string; phone_number: string | null; role: string; id_type: string | null; verified_at?: string; created_at?: string; updated_at?: string }>; total: number }> {
    const res = await supportFetch<{ success: boolean; data: { users: Array<{ user_id: string; first_name: string; last_name: string; email: string; phone_number: string | null; role: string; id_type: string | null; verified_at?: string; created_at?: string; updated_at?: string }>; total: number } }>(
      `/admin/verifications/verified?page=${page}&page_size=100`
    )
    return res.data
  },

  async getPendingVerifications(): Promise<Array<{ user_id: string; id_type: string | null; id_verification_status: string; live_verification_status: string; is_identity_verified: boolean; is_live_verified: boolean; created_at: string | null }>> {
    const res = await supportFetch<{ total: number; verifications: Array<{ user_id: string; id_type: string | null; id_verification_status: string; live_verification_status: string; is_identity_verified: boolean; is_live_verified: boolean; created_at: string | null }> }>(
      `/verification/admin/pending`
    )
    return res.verifications
  },

  async getPartialVerifications(): Promise<Array<{ user_id: string; id_type: string | null; id_verification_status: string; live_verification_status: string; is_identity_verified: boolean; is_live_verified: boolean; created_at: string | null }>> {
    const res = await supportFetch<{ total: number; verifications: Array<{ user_id: string; id_type: string | null; id_verification_status: string; live_verification_status: string; is_identity_verified: boolean; is_live_verified: boolean; created_at: string | null }> }>(
      `/verification/admin/partial`
    )
    return res.verifications
  },

  // ── Listings ─────────────────────────────────────────────────────────────

  async getListings(page = 1, pageSize = 100): Promise<{ listings: import('@/lib/api/admin').AdminListing[]; total: number }> {
    const res = await supportFetch<{ success: boolean; data: { listings: import('@/lib/api/admin').AdminListing[]; total: number } }>(
      `/admin/listings?page=${page}&page_size=${pageSize}`
    )
    return res.data
  },

  async getListing(id: string): Promise<import('@/lib/api/admin').AdminListing> {
    const res = await supportFetch<{ success: boolean; data: import('@/lib/api/admin').AdminListing }>(
      `/admin/listings/${id}`
    )
    return res.data
  },

  async approveListing(id: string): Promise<void> {
    await supportFetch(`/admin/listings/${id}/approve`, { method: 'PATCH' })
  },

  async rejectListing(id: string, reason: string): Promise<void> {
    await supportFetch(`/admin/listings/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    })
  },

  async closeListing(id: string): Promise<void> {
    await supportFetch(`/listings/${id}/close`, { method: 'POST' })
  },

  async deleteListing(id: string): Promise<void> {
    await supportFetch(`/admin/listings/${id}`, { method: 'DELETE' })
  },

  async getAgents(page = 1, pageSize = 100): Promise<{ agents: import('@/lib/api/admin').AdminAgent[]; total: number }> {
    const res = await supportFetch<{ success: boolean; data: { agents: import('@/lib/api/admin').AdminAgent[]; total: number } }>(
      `/admin/agents?page=${page}&page_size=${pageSize}`
    )
    return res.data
  },

  // ── Reports ──────────────────────────────────────────────────────────────

  async getUserReports(page = 1, pageSize = 50): Promise<{ reports: import('@/lib/api/admin').AdminUserReport[]; total: number }> {
    const res = await supportFetch<{ success: boolean; data: { reports: import('@/lib/api/admin').AdminUserReport[]; total: number } }>(
      `/admin/user-reports?page=${page}&page_size=${pageSize}`
    )
    return res.data
  },

  async updateUserReport(reportId: string, status: 'actioned' | 'dismissed'): Promise<void> {
    await supportFetch(`/admin/user-reports/${reportId}?status=${status}`, { method: 'PATCH' })
  },

  async getListingReports(page = 1, pageSize = 50): Promise<{ reports: import('@/lib/api/admin').AdminListingReport[]; total: number }> {
    const res = await supportFetch<{ success: boolean; data: { reports: import('@/lib/api/admin').AdminListingReport[]; total: number } }>(
      `/admin/listing-reports?page=${page}&page_size=${pageSize}`
    )
    return res.data
  },

  async updateListingReport(reportId: string, status: 'actioned' | 'dismissed'): Promise<void> {
    await supportFetch(`/admin/listing-reports/${reportId}?status=${status}`, { method: 'PATCH' })
  },

  // ── Notifications ────────────────────────────────────────────────────────

  async broadcastNotification(
    title: string,
    body: string,
    targetType: NotificationTargetType = 'all',
    targetUserIds?: string[],
    targetLabel?: string,
  ): Promise<{ total_users?: number; push_sent?: number; status?: string }> {
    const res = await supportFetch<{ success: boolean; data: { total_users?: number; push_sent?: number; status?: string } }>(
      '/admin/notifications/broadcast',
      {
        method: 'POST',
        body: JSON.stringify({ title, body, target_type: targetType, target_user_ids: targetUserIds, target_label: targetLabel }),
      },
    )
    return (res as any)?.data ?? res
  },

  async getMyNotifications(): Promise<{ requests: NotificationBroadcastRequest[] }> {
    const res = await supportFetch<{ success: boolean; data: { requests: NotificationBroadcastRequest[] } }>('/admin/notifications/mine')
    return (res as any)?.data ?? res
  },
}
