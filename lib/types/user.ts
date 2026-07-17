// Types matching user-service schemas (user_service/schemas/user.py & agent.py & review.py)

export interface UserProfile {
  id: string
  user_id: string
  profile_photo_url: string | null
  bio: string | null
  date_of_birth: string | null
  state: string | null
  city: string | null
  gender: string | null
  is_identity_verified: boolean
  is_live_verified: boolean
}

export interface AgentProfile {
  id: string
  user_id: string
  profile_photo_url: string | null
  bio: string | null
  state: string | null
  city: string | null
  agency_name: string | null
  years_of_experience: number | null
  business_address: string | null
  avg_rating: number
  total_reviews: number
  total_closed_deals: number
}

export interface UserProfileUpdate {
  bio?: string
  date_of_birth?: string
  state?: string
  city?: string
  gender?: string
}

export interface AgentProfileUpdate {
  bio?: string
  state?: string
  city?: string
  agency_name?: string
  years_of_experience?: number
  business_address?: string
}

export interface ReviewCreate {
  rating: number
  comment?: string
  is_verified_deal?: boolean
  chat_id?: string
}

export interface ReviewResponse {
  id: string
  reviewer_id: string
  agent_id: string
  chat_id: string | null
  rating: number
  comment: string | null
  is_verified_deal: boolean
  created_at: string
}

export interface ReviewListResponse {
  total: number
  average_rating: number
  reviews: ReviewResponse[]
}

export interface VerificationStatus {
  id_verification_status: string
  live_verification_status: string
  is_identity_verified: boolean
  is_live_verified: boolean
  is_fully_verified: boolean
  id_rejection_reason: string | null
  live_rejection_reason: string | null
  has_id_document: boolean
  has_selfie: boolean
  id_type: string | null
}
