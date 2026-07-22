'use client'

import { api, setTokens, clearAuth, ApiError } from './client'
import { useAppStore } from '@/lib/store'
import type {
  ApiResponse, TokenResponse, CheckEmailResponse, CheckPhoneResponse,
  SignupRequest, LoginRequest, ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/lib/types/auth'

// ─── Helpers ──────────────────────────────────────────────────

function getDeviceId(): string {
  let id = localStorage.getItem('sb_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('sb_device_id', id)
  }
  return id
}

function mapUserFromToken(user: TokenResponse['user']) {
  return {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    phone: user.phone_number,
    avatar: '',
    type: (user.role === 'agent' ? 'agent' : 'individual') as 'individual' | 'agent',
    isLoggedIn: true,
    referralCode: user.referral_code ?? '',
    referredCount: user.referrals_made,
    walletBalance: 0,
    isPremium: false,
    connectsRemaining: 0,
  }
}

// ─── Auth API ─────────────────────────────────────────────────

export const authApi = {
  async checkEmail(email: string): Promise<CheckEmailResponse> {
    const res = await api.get<ApiResponse<CheckEmailResponse>>(
      `/auth/check-email?email=${encodeURIComponent(email)}`,
      { skipAuth: true }
    )
    return res.data
  },

  async checkPhone(phone: string): Promise<CheckPhoneResponse> {
    const res = await api.get<ApiResponse<CheckPhoneResponse>>(
      `/auth/check-phone?phone=${encodeURIComponent(phone)}`,
      { skipAuth: true }
    )
    return res.data
  },

  async signup(data: SignupRequest): Promise<void> {
    await api.post('/auth/signup', data, { skipAuth: true })
  },

  async verifyEmail(email: string, otpCode: string): Promise<void> {
    await api.post('/auth/verify-email', {
      email,
      purpose: 'email_verification',
      otp_code: otpCode,
    }, { skipAuth: true })
  },

  async resendOtp(email: string): Promise<void> {
    await api.post('/auth/resend-otp', { email }, { skipAuth: true })
  },

  async sendPhoneOtpSignup(email: string): Promise<void> {
    await api.post('/auth/send-phone-otp-signup', { email }, { skipAuth: true })
  },

  async verifyPhoneSignup(email: string, otpCode: string): Promise<void> {
    await api.post('/auth/verify-phone-signup', {
      email,
      otp_code: otpCode,
    }, { skipAuth: true })
  },

  async changePhoneSignup(email: string, newPhone: string): Promise<void> {
    await api.post('/auth/change-phone-signup', {
      email,
      new_phone_number: newPhone,
    }, { skipAuth: true })
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    const res = await api.post<ApiResponse<TokenResponse>>(
      '/auth/login',
      { email, password } satisfies LoginRequest,
      {
        skipAuth: true,
        headers: { 'x-device-id': getDeviceId() },
      }
    )
    const data = res.data
    setTokens(data.access_token, data.refresh_token)
    useAppStore.getState().setUser(mapUserFromToken(data.user))
    return data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      clearAuth()
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email } satisfies ForgotPasswordRequest, { skipAuth: true })
  },

  async verifyResetOtp(email: string, otpCode: string): Promise<void> {
    await api.post('/auth/verify-reset-otp', { email, otp_code: otpCode }, { skipAuth: true })
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await api.post('/auth/reset-password', data, { skipAuth: true })
  },

  async exchangeWebToken(webToken: string): Promise<void> {
    const res = await api.post<ApiResponse<TokenResponse>>(
      '/auth/exchange-web-token',
      { web_token: webToken },
      { skipAuth: true }
    )
    const data = res.data
    setTokens(data.access_token, data.refresh_token)
    useAppStore.getState().setUser(mapUserFromToken(data.user))
  },
}

// ─── Error message extractor ──────────────────────────────────

export function getAuthErrorMessage(err: unknown): string {
  // No connection / request never left the device
  if (err instanceof TypeError || (err instanceof Error && err.message.toLowerCase().includes('fetch'))) {
    return 'Connection failed. Please check your internet and try again.'
  }
  if (err instanceof ApiError) {
    // FastAPI validation error array
    const detail = (err.body as { detail?: unknown }).detail
    if (Array.isArray(detail) && detail.length > 0) {
      return (detail[0] as { msg: string }).msg ?? 'Validation error'
    }
    // Generic fallback — add network hint since slow connections often cause this
    if (!err.message || err.message === 'Request failed') {
      return 'Request failed. This may be a network issue — please try again.'
    }
    return err.message
  }
  return 'Something went wrong. Please try again.'
}
