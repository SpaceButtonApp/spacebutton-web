const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.spacebutton.net/api/v1').replace(/\/$/, '')

function getAdminToken(): string {
  if (typeof window === 'undefined') return ''
  try { return localStorage.getItem('admin-token') || '' } catch { return '' }
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken()
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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  role: string
  /** "active" | "suspended" | "inactive" — normalise with .toLowerCase() */
  status: string
  is_email_verified: boolean
  created_at: string
}

export interface AdminUserListResponse {
  total: number
  page: number
  page_size: number
  users: AdminUser[]
}

export interface AdminAgent {
  id: string
  user_id: string
  first_name?: string
  last_name?: string
  email?: string
  status?: string
  agency_name?: string
  state?: string
  city?: string
  average_rating?: number
  total_reviews?: number
  years_of_experience?: number
  business_address?: string
  created_at: string
}

export interface AdminAgentListResponse {
  total: number
  agents: AdminAgent[]
}

export interface AdminUserReport {
  id: string
  reporter_id: string
  reported_user_id: string
  reason: string
  details?: string
  chat_id?: string
  status: string
  created_at: string
}

export interface AdminUserReportListResponse {
  total: number
  page: number
  page_size: number
  reports: AdminUserReport[]
}

export interface AdminListingReport {
  id: string
  reporter_id: string
  listing_id: string
  listing_title?: string
  reason: string
  details?: string
  status: string
  created_at: string
}

export interface AdminListingReportListResponse {
  total: number
  page: number
  page_size: number
  reports: AdminListingReport[]
}

export interface AdminChatMessage {
  id: string
  sender_id: string
  content: string
  status: string
  created_at: string
}

export interface AdminChatMessagesResponse {
  chat_id: string
  chat_info?: { user_id?: string; agent_id?: string; listing_id?: string }
  total: number
  page: number
  page_size: number
  messages: AdminChatMessage[]
}

export interface AdminListing {
  id: string
  title: string
  description?: string
  property_type?: string
  status?: string
  price?: string
  total_package?: string
  rent_period?: string
  state?: string
  city?: string
  address?: string
  bedrooms?: number
  bathrooms?: number
  agent_id: string
  video_tour_url?: string
  images?: Array<{ url: string; is_cover: boolean }>
  created_at: string
}

export interface AdminListingListResponse {
  total: number
  page: number
  page_size: number
  listings: AdminListing[]
}

export interface AdminStats {
  users: {
    total_users?: number
    total_agents?: number
    total_suspended?: number
  }
  listings: {
    total_listings?: number
    active_listings?: number
    pending_listings?: number
    rejected_listings?: number
  }
}

export interface PendingVerification {
  user_id: string
  id_type?: string
  id_document_number?: string
  id_verification_status: string   // "pending" | "approved" | "rejected" | "none"
  live_verification_status: string
  is_identity_verified: boolean
  is_live_verified: boolean
  id_document_url?: string
  selfie_url?: string
  created_at?: string
}

export interface VerifiedUser {
  user_id: string
  first_name: string
  last_name: string
  email: string
  id_type?: string
}

export interface VerifiedUsersResponse {
  total: number
  page: number
  page_size: number
  users: VerifiedUser[]
}

export interface WaitlistEntry {
  id: string
  email: string
  created_at: string
}

export interface WaitlistResponse {
  total: number
  page: number
  page_size: number
  entries: WaitlistEntry[]
}

export interface SupportChat {
  user_id: string
  user_name: string
  last_message: string
  last_message_time: string
  unread: number
}

export interface SupportMessage {
  id: string
  user_id: string
  user_name: string
  sender: 'user' | 'admin'
  text: string
  timestamp: string
}

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  // Auth
  async loginAdmin(email: string, password: string): Promise<string> {
    const res = await adminFetch<{ success: boolean; data: { access_token: string } }>(
      '/admin/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    )
    return res.data.access_token
  },

  // Stats
  async getStats(): Promise<AdminStats> {
    const res = await adminFetch<{ success: boolean; data: AdminStats }>('/admin/stats')
    return res.data
  },

  // Users
  async getUsers(page = 1, pageSize = 20, role?: string): Promise<AdminUserListResponse> {
    const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (role) qs.set('role', role)
    const res = await adminFetch<{ success: boolean; data: AdminUserListResponse }>(
      `/admin/users?${qs}`,
    )
    // The admin service proxies to auth service which returns raw JSON (no envelope wrap)
    const inner = (res as any)?.data ?? res
    return inner as AdminUserListResponse
  },

  async getUser(userId: string): Promise<AdminUser> {
    const res = await adminFetch<{ success: boolean; data: AdminUser }>(`/admin/users/${userId}`)
    const inner = (res as any)?.data ?? res
    return inner as AdminUser
  },

  async suspendUser(userId: string): Promise<void> {
    await adminFetch(`/admin/users/${userId}/suspend`, { method: 'PATCH' })
  },

  async activateUser(userId: string): Promise<void> {
    await adminFetch(`/admin/users/${userId}/activate`, { method: 'PATCH' })
  },

  // Agents
  async getAgents(page = 1, pageSize = 20): Promise<AdminAgentListResponse> {
    const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    const res = await adminFetch<{ success: boolean; data: AdminAgentListResponse }>(
      `/admin/agents?${qs}`,
    )
    const inner = (res as any)?.data ?? res
    return inner as AdminAgentListResponse
  },

  // Listings
  async getListings(page = 1, pageSize = 20, status?: string): Promise<AdminListingListResponse> {
    const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (status) qs.set('status', status)
    const res = await adminFetch<{ success: boolean; data: AdminListingListResponse }>(
      `/admin/listings?${qs}`,
    )
    const inner = (res as any)?.data ?? res
    return inner as AdminListingListResponse
  },

  async getListing(listingId: string): Promise<AdminListing> {
    const res = await adminFetch<{ success: boolean; data: AdminListing }>(
      `/admin/listings/${listingId}`,
    )
    const inner = (res as any)?.data ?? res
    return inner as AdminListing
  },

  async approveListing(listingId: string): Promise<void> {
    await adminFetch(`/admin/listings/${listingId}/approve`, { method: 'PATCH' })
  },

  async rejectListing(listingId: string, reason: string): Promise<void> {
    await adminFetch(`/admin/listings/${listingId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    })
  },

  async deleteListing(listingId: string): Promise<void> {
    await adminFetch(`/admin/listings/${listingId}`, { method: 'DELETE' })
  },

  // Verification — routes are on user service, accessible via gateway with admin JWT
  async getPendingVerifications(): Promise<PendingVerification[]> {
    const res = await adminFetch<{ total: number; verifications: PendingVerification[] }>(
      '/verification/admin/pending',
    )
    return res.verifications ?? []
  },

  async approveIdVerification(userId: string): Promise<void> {
    await adminFetch(`/verification/admin/${userId}/id/approve`, { method: 'PATCH' })
  },

  async rejectIdVerification(userId: string, reason: string): Promise<void> {
    await adminFetch(`/verification/admin/${userId}/id/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    })
  },

  async approveLiveVerification(userId: string): Promise<void> {
    await adminFetch(`/verification/admin/${userId}/live/approve`, { method: 'PATCH' })
  },

  async rejectLiveVerification(userId: string, reason: string): Promise<void> {
    await adminFetch(`/verification/admin/${userId}/live/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    })
  },

  async getVerifiedUsers(page = 1, pageSize = 50): Promise<VerifiedUsersResponse> {
    const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    const res = await adminFetch<{ success: boolean; data: VerifiedUsersResponse }>(
      `/admin/verifications/verified?${qs}`,
    )
    const inner = (res as any)?.data ?? res
    return inner as VerifiedUsersResponse
  },

  // Support / Customer Service
  async getSupportChats(): Promise<SupportChat[]> {
    const res = await adminFetch<{ success: boolean; data: SupportChat[] }>('/support/admin/chats')
    return res.data ?? []
  },

  async getSupportMessages(userId: string): Promise<SupportMessage[]> {
    const res = await adminFetch<{ success: boolean; data: SupportMessage[] }>(
      `/support/admin/messages/${userId}`,
    )
    return res.data ?? []
  },

  async replyToUser(userId: string, text: string): Promise<SupportMessage> {
    const res = await adminFetch<{ success: boolean; data: SupportMessage }>(
      `/support/admin/reply/${userId}`,
      { method: 'POST', body: JSON.stringify({ text }) },
    )
    return res.data
  },

  // User Reports
  async getUserReports(page = 1, pageSize = 20): Promise<AdminUserReportListResponse> {
    const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    const res = await adminFetch<{ success: boolean; data: AdminUserReportListResponse }>(
      `/admin/user-reports?${qs}`,
    )
    const inner = (res as any)?.data ?? res
    return inner as AdminUserReportListResponse
  },

  async updateUserReport(reportId: string, status: 'actioned' | 'dismissed'): Promise<void> {
    await adminFetch(`/admin/user-reports/${reportId}?status=${status}`, { method: 'PATCH' })
  },

  // Listing Reports
  async getListingReports(page = 1, pageSize = 20): Promise<AdminListingReportListResponse> {
    const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    const res = await adminFetch<{ success: boolean; data: AdminListingReportListResponse }>(
      `/admin/listing-reports?${qs}`,
    )
    const inner = (res as any)?.data ?? res
    return inner as AdminListingReportListResponse
  },

  async updateListingReport(reportId: string, status: 'actioned' | 'dismissed'): Promise<void> {
    await adminFetch(`/admin/listing-reports/${reportId}?status=${status}`, { method: 'PATCH' })
  },

  // Waitlist
  async getWaitlist(page = 1, pageSize = 50): Promise<WaitlistResponse> {
    const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    const res = await adminFetch<{ success: boolean; data: WaitlistResponse }>(
      `/admin/waitlist?${qs}`,
    )
    const inner = (res as any)?.data ?? res
    return inner as WaitlistResponse
  },

  // Chat Evidence
  async getChatMessages(chatId: string): Promise<AdminChatMessagesResponse> {
    const res = await adminFetch<{ success: boolean; data: AdminChatMessagesResponse }>(
      `/admin/chats/${chatId}/messages`,
    )
    const inner = (res as any)?.data ?? res
    return inner as AdminChatMessagesResponse
  },
}
