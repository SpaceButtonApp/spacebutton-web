const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.spacebutton.net/api/v1').replace(/\/$/, '')

function getAdminToken(): string {
  if (typeof window === 'undefined') return ''
  try { return localStorage.getItem('admin-token') || '' } catch { return '' }
}

export function getAdminLoginUrl(): string {
  if (typeof window === 'undefined') return '/admin/login'
  const key = localStorage.getItem('admin-login-key') || ''
  return key ? `/admin/login?key=${key}` : '/admin/login'
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
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin-token')
      localStorage.removeItem('admin-profile')
      window.location.href = getAdminLoginUrl()
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
  referral_code?: string
  referrals_made: number
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

export interface AdminUserFullProfile extends AdminUser {
  profile_photo_url?: string
  bio?: string
  state?: string
  city?: string
  gender?: string
  date_of_birth?: string
  agency_name?: string
  years_of_experience?: number
  id_type?: string
  id_verification_status: string
  live_verification_status: string
  is_identity_verified: boolean
  is_live_verified: boolean
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

export interface SupportTicket {
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

export interface SupportTicketMessage {
  id: string
  ticket_id: string | null
  sender: string
  sender_id: string | null
  user_name: string
  text: string
  is_admin_thread: boolean
  created_at: string
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
  category?: string
  owner_type?: string
  status?: string
  price?: string
  total_package?: string
  rent_period?: string
  state?: string
  city?: string
  address?: string
  bedrooms?: number
  bathrooms?: number
  sitting_rooms?: number
  balconies?: number
  rent_due_date?: string | null
  landlord_presence?: string | null
  facilities?: string | null
  connect_role?: string | null
  agent_id: string
  video_tour_url?: string
  images?: Array<{ image_url: string; is_cover: boolean; order?: number }>
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
  phone_number?: string
  role?: string
  id_type?: string
  /** Date the user's verification was approved, if the backend includes it */
  verified_at?: string
  created_at?: string
  updated_at?: string
}

export interface VerifiedUsersResponse {
  total: number
  page: number
  page_size: number
  users: VerifiedUser[]
}

export interface WaitlistEntry {
  id?: string
  email: string
  joined_at: string
}

export interface WaitlistResponse {
  total: number
  page: number
  page_size: number
  entries: WaitlistEntry[]
}

export interface AdminTransaction {
  id: string
  user_id: string
  user_name: string
  user_email: string
  transaction_type: string   // "purchase" | "deduction" | "bonus" | "referral"
  status: string             // "pending" | "success" | "failed" | "abandoned"
  amount_kobo: number
  connects_qty: number
  paystack_reference: string | null
  description: string | null
  channel: string            // "paystack" | "apple_iap" | "internal"
  created_at: string
}

export interface AdminTransactionListResponse {
  total: number
  page: number
  page_size: number
  transactions: AdminTransaction[]
}

export interface ListingConversation {
  chat_id: string
  user_id: string
  status: string
  last_message: string | null
  created_at: string
  user_name: string
  user_email: string | null
  user_phone: string | null
}

export interface ListingConversationsResponse {
  listing_id: string
  total: number
  conversations: ListingConversation[]
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
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const raw = body?.detail ?? body?.message
      throw new Error(typeof raw === 'string' ? raw : 'Invalid email or password.')
    }
    const data = await res.json()
    return data.data.access_token
  },

  // Stats
  async getStats(): Promise<AdminStats> {
    const res = await adminFetch<{ success: boolean; data: AdminStats }>('/admin/stats')
    return res.data
  },

  // Users
  async getUsers(page = 1, pageSize = 20, role?: string, search?: string): Promise<AdminUserListResponse> {
    const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (role) qs.set('role', role)
    if (search) qs.set('search', search)
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

  async getUserFullProfile(userId: string): Promise<AdminUserFullProfile> {
    const res = await adminFetch<{ success: boolean; data: AdminUserFullProfile }>(`/admin/users/${userId}/profile`)
    return res.data
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

  async closeListing(listingId: string): Promise<void> {
    await adminFetch(`/listings/${listingId}/close`, { method: 'POST' })
  },

  // Verification — routes are on user service, accessible via gateway with admin JWT
  async getPendingVerifications(): Promise<PendingVerification[]> {
    const res = await adminFetch<{ total: number; verifications: PendingVerification[] }>(
      '/verification/admin/pending',
    )
    return res.verifications ?? []
  },

  async getPartialVerifications(): Promise<PendingVerification[]> {
    const res = await adminFetch<{ total: number; verifications: PendingVerification[] }>(
      '/verification/admin/partial',
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

  async createStaff(data: { first_name: string; last_name: string; email: string; password: string; role?: string }): Promise<{ message: string }> {
    return adminFetch('/admin/create-staff', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getStaffAgents(): Promise<AdminUser[]> {
    const res = await adminFetch<{ success: boolean; data: AdminUserListResponse }>('/admin/users?role=support_agent&page_size=100')
    const inner = (res as any)?.data ?? res
    return (inner as AdminUserListResponse).users ?? []
  },

  async resetStaffPassword(userId: string, newPassword: string): Promise<void> {
    await adminFetch(`/admin/staff/${userId}/reset-password`, {
      method: 'PATCH',
      body: JSON.stringify({ new_password: newPassword }),
    })
  },

  async deleteStaff(userId: string): Promise<void> {
    await adminFetch(`/admin/staff/${userId}`, { method: 'DELETE' })
  },

  async deleteUser(userId: string): Promise<void> {
    await adminFetch(`/admin/users/${userId}`, { method: 'DELETE' })
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await adminFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    })
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

  // Transactions
  async getTransactions(page = 1, pageSize = 50, transactionType?: string, status?: string): Promise<AdminTransactionListResponse> {
    const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (transactionType) qs.set('transaction_type', transactionType)
    if (status) qs.set('status', status)
    const res = await adminFetch<{ success: boolean; data: AdminTransactionListResponse }>(
      `/admin/transactions?${qs}`,
    )
    const inner = (res as any)?.data ?? res
    return inner as AdminTransactionListResponse
  },

  async reconcileTransactions(): Promise<{ checked: number; results: Record<string, number> }> {
    const res = await adminFetch<{ success: boolean; data: { checked: number; results: Record<string, number> } }>(
      '/admin/reconcile-pending',
      { method: 'POST' },
    )
    return (res as any)?.data ?? res
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

  // Support tickets (admin role satisfies require_role("admin","support_agent"))
  async getSupportTickets(params?: { status?: string; page?: number }): Promise<{ tickets: SupportTicket[]; total: number }> {
    const qs = new URLSearchParams({ page_size: '50' })
    if (params?.status) qs.set('status', params.status)
    if (params?.page) qs.set('page', String(params.page))
    const res = await adminFetch<{ success: boolean; data: { tickets: SupportTicket[]; total: number } }>(
      `/support/tickets/admin/all?${qs}`
    )
    return (res as any)?.data ?? res
  },

  async getSupportTicketDetail(ticketId: string): Promise<{ ticket: SupportTicket; messages: SupportTicketMessage[]; admin_messages: SupportTicketMessage[] }> {
    const res = await adminFetch<{ success: boolean; data: any }>(`/support/tickets/admin/${ticketId}`)
    return (res as any)?.data ?? res
  },

  async replyToSupportTicket(ticketId: string, text: string): Promise<SupportTicketMessage> {
    const res = await adminFetch<{ success: boolean; data: SupportTicketMessage }>(
      `/support/tickets/admin/${ticketId}/reply`,
      { method: 'POST', body: JSON.stringify({ text }) }
    )
    return (res as any)?.data ?? res
  },

  async updateSupportTicketStatus(ticketId: string, status: string): Promise<SupportTicket> {
    const res = await adminFetch<{ success: boolean; data: SupportTicket }>(
      `/support/tickets/admin/${ticketId}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) }
    )
    return (res as any)?.data ?? res
  },

  async grantConnects(userId: string, amount: number): Promise<void> {
    await adminFetch(`/admin/users/${userId}/grant-connects`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  },

  // Notifications
  async broadcastNotification(
    title: string,
    body: string,
    targetType: NotificationTargetType = 'all',
    targetUserIds?: string[],
    targetLabel?: string,
  ): Promise<{ total_users?: number; push_sent?: number; status?: string }> {
    const res = await adminFetch<{ success: boolean; data: { total_users?: number; push_sent?: number; status?: string } }>(
      '/admin/notifications/broadcast',
      {
        method: 'POST',
        body: JSON.stringify({ title, body, target_type: targetType, target_user_ids: targetUserIds, target_label: targetLabel }),
      },
    )
    return (res as any)?.data ?? res
  },

  async getPendingNotifications(): Promise<{ requests: NotificationBroadcastRequest[] }> {
    const res = await adminFetch<{ success: boolean; data: { requests: NotificationBroadcastRequest[] } }>('/admin/notifications/pending')
    return (res as any)?.data ?? res
  },

  async getMyNotifications(): Promise<{ requests: NotificationBroadcastRequest[] }> {
    const res = await adminFetch<{ success: boolean; data: { requests: NotificationBroadcastRequest[] } }>('/admin/notifications/mine')
    return (res as any)?.data ?? res
  },

  async approveNotification(requestId: string): Promise<NotificationBroadcastRequest> {
    const res = await adminFetch<{ success: boolean; data: NotificationBroadcastRequest }>(
      `/admin/notifications/pending/${requestId}/approve`,
      { method: 'POST' },
    )
    return (res as any)?.data ?? res
  },

  async rejectNotification(requestId: string, reason: string): Promise<NotificationBroadcastRequest> {
    const res = await adminFetch<{ success: boolean; data: NotificationBroadcastRequest }>(
      `/admin/notifications/pending/${requestId}/reject`,
      { method: 'POST', body: JSON.stringify({ reason }) },
    )
    return (res as any)?.data ?? res
  },

  async getListingConversations(listingId: string): Promise<ListingConversationsResponse> {
    const res = await adminFetch<{ success: boolean; data: ListingConversationsResponse }>(
      `/admin/listings/${listingId}/conversations`,
    )
    const inner = (res as any)?.data ?? res
    return inner as ListingConversationsResponse
  },
}
