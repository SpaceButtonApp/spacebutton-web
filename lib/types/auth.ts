// Types matching auth-service schemas (auth_service/schemas/auth.py)

export type UserRole = 'user' | 'agent'
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification'

export interface AuthUser {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  role: UserRole
  status: UserStatus
  is_email_verified: boolean
  is_phone_verified: boolean
  referral_code: string | null
  referrals_made: number
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: AuthUser
}

// ─── Request bodies ────────────────────────────────────────────

export interface SignupRequest {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  password: string
  role: UserRole
  referral_code?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface VerifyOTPRequest {
  email: string
  purpose: string
  otp_code: string
}

export interface VerifyPhoneSignupRequest {
  email: string
  otp_code: string
}

export interface ChangePhoneRequest {
  email: string
  new_phone_number: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyResetOTPRequest {
  email: string
  otp_code: string
}

export interface ResetPasswordRequest {
  email: string
  otp_code: string
  new_password: string
  confirm_password: string
}

// ─── Shared API envelope ───────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface CheckEmailResponse {
  exists: boolean
  is_email_verified: boolean
  is_phone_verified: boolean
}

export interface CheckPhoneResponse {
  exists: boolean
}
