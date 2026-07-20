import { api } from './client'
import { useAppStore } from '@/lib/store'
import type { ApiResponse } from '../types/auth'
import type { UserProfile } from '../types/user'
import type {
  AgentProfile,
  UserProfileUpdate,
  AgentProfileUpdate,
  ReviewCreate,
  ReviewListResponse,
  VerificationStatus,
} from '../types/user'

// ─── User profile endpoints (/users) ─────────────────────────────────────────
// NOTE: GET /users/me and GET /users/{id} return the profile DIRECTLY (no envelope)

export const userApi = {
  async getMyProfile(): Promise<UserProfile> {
    return api.get<UserProfile>('/users/me')
  },

  async updateMyProfile(data: UserProfileUpdate): Promise<UserProfile> {
    return api.put<UserProfile>('/users/me', data)
  },

  async uploadMyPhoto(file: File): Promise<UserProfile> {
    const form = new FormData()
    form.append('file', file)
    return api.post<UserProfile>('/users/me/photo', form)
  },

  async getPublicProfile(userId: string): Promise<UserProfile> {
    return api.get<UserProfile>(`/users/${userId}`, { skipAuth: true })
  },

  async deleteMyAccount(): Promise<void> {
    await api.delete('/users/me')
  },
}

// ─── Agent profile endpoints (/agents) ───────────────────────────────────────
// NOTE: All agent endpoints return AgentProfileResponse DIRECTLY (no envelope)

export const agentApi = {
  async getMyAgentProfile(): Promise<AgentProfile> {
    return api.get<AgentProfile>('/agents/me')
  },

  async updateMyAgentProfile(data: AgentProfileUpdate): Promise<AgentProfile> {
    return api.put<AgentProfile>('/agents/me', data)
  },

  async uploadMyAgentPhoto(file: File): Promise<AgentProfile> {
    const form = new FormData()
    form.append('file', file)
    return api.post<AgentProfile>('/agents/me/photo', form)
  },

  async getAgentProfile(agentId: string): Promise<AgentProfile> {
    return api.get<AgentProfile>(`/agents/${agentId}`, { skipAuth: true })
  },
}

// ─── Reviews (/reviews) ───────────────────────────────────────────────────────

export const reviewApi = {
  async createReview(agentId: string, data: ReviewCreate): Promise<void> {
    await api.post<ApiResponse<unknown>>(`/reviews/agents/${agentId}`, data)
  },

  async getAgentReviews(agentId: string): Promise<ReviewListResponse> {
    const res = await api.get<ApiResponse<ReviewListResponse>>(
      `/reviews/agents/${agentId}`,
      { skipAuth: true },
    )
    return res.data
  },

  async deleteReview(reviewId: string): Promise<void> {
    await api.delete(`/reviews/${reviewId}`)
  },
}

// ─── Verification (/verification) ────────────────────────────────────────────

export const verificationApi = {
  async getStatus(): Promise<VerificationStatus> {
    const res = await api.get<ApiResponse<VerificationStatus>>('/verification/status')
    return res.data
  },

  async submitId(idType: string, file: File, documentNumber?: string): Promise<string> {
    const form = new FormData()
    form.append('id_type', idType)
    form.append('file', file)
    if (documentNumber) form.append('document_number', documentNumber)
    const res = await api.post<ApiResponse<null>>('/verification/id', form)
    return res.message
  },

  async submitSelfie(file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const res = await api.post<ApiResponse<null>>('/verification/live', form)
    return res.message
  },
}

// ─── Display info helper (name from auth svc + avatar from user svc) ─────────

interface UserDisplayInfo { name: string; avatar: string | null; role: string; isAvailable: boolean }

export async function getUserDisplayInfo(userId: string): Promise<UserDisplayInfo> {
  const [authRes, profileRes] = await Promise.allSettled([
    api.get<ApiResponse<{ first_name: string; last_name: string; role: string }>>(
      `/auth/users/${userId}`,
    ),
    api.get<UserProfile>(`/users/${userId}`, { skipAuth: true }),
  ])

  const isAvailable = authRes.status === 'fulfilled'

  const name = isAvailable
    ? `${authRes.value.data.first_name} ${authRes.value.data.last_name}`.trim() || 'User'
    : 'User'

  const avatar =
    profileRes.status === 'fulfilled'
      ? profileRes.value.profile_photo_url ?? null
      : null

  const role = isAvailable ? authRes.value.data.role : 'user'

  return { name, avatar, role, isAvailable }
}

// ─── Sync profile to Zustand store ───────────────────────────────────────────

export async function syncMyProfile(): Promise<void> {
  try {
    const { user } = useAppStore.getState()
    if (!user) return

    // Sync avatar / bio / location from user/agent profile
    if (user.type === 'agent') {
      const profile = await agentApi.getMyAgentProfile()
      useAppStore.getState().updateUser({
        avatar: profile.profile_photo_url ?? user.avatar,
        bio: profile.bio ?? undefined,
        state: profile.state ?? undefined,
        city: profile.city ?? undefined,
      })
    } else {
      const profile = await userApi.getMyProfile()
      useAppStore.getState().updateUser({
        avatar: profile.profile_photo_url ?? user.avatar,
        bio: profile.bio ?? undefined,
        state: profile.state ?? undefined,
        city: profile.city ?? undefined,
        gender: (profile.gender as 'Male' | 'Female' | 'Other' | undefined) ?? undefined,
      })
    }

    // Sync connects balance from payment service
    try {
      const { paymentsApi } = await import('./payments')
      const { balance } = await paymentsApi.getBalance()
      useAppStore.getState().updateUser({ connectsRemaining: balance })
    } catch { /* payment service may not be reachable */ }
  } catch { /* non-critical */ }
}
