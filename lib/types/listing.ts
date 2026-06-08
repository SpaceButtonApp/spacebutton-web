export type PropertyType = 'apartment' | 'house' | 'self_contain' | 'room_and_parlour'
export type ListingStatus = 'active' | 'inactive' | 'pending' | 'rejected' | 'sold'
export type ListingOwnerType = 'agent' | 'user'
export type ListingCategory = 'for_rent' | 'need_roommate' | 'subletting'

export interface ListingImageResponse {
  id: string
  image_url: string
  is_cover: boolean
  order: number
}

export interface ListingResponse {
  id: string
  agent_id: string
  title: string
  description: string
  property_type: PropertyType
  category: ListingCategory
  owner_type: ListingOwnerType
  status: ListingStatus
  price: string
  state: string
  city: string
  address: string
  bedrooms: number
  bathrooms: number
  video_tour_url: string | null
  is_featured: boolean
  images: ListingImageResponse[]
  rent_period: string | null
  total_package: string | null
  rent_due_date: string | null
  gender_needed: string | null
  landlord_presence: string | null
  balconies: number | null
  sitting_rooms: number | null
  facilities: string | null
  connect_role: string | null
  views_count: number
}

export interface ListingListResponse {
  total: number
  page: number
  page_size: number
  listings: ListingResponse[]
}

export interface ListingFilters {
  state?: string
  city?: string
  property_type?: PropertyType
  min_price?: number
  max_price?: number
  bedrooms?: number
  category?: ListingCategory
  owner_type?: ListingOwnerType
  page?: number
  page_size?: number
}

export interface ListingCreatePayload {
  title: string
  description: string
  property_type: PropertyType
  category: ListingCategory
  price: number
  state: string
  city: string
  address: string
  bedrooms: number
  bathrooms: number
  video_tour_url?: string
  rent_period?: string
  total_package?: number
  rent_due_date?: string
  gender_needed?: string
  landlord_presence?: string
  balconies?: number
  sitting_rooms?: number
  facilities?: string
  connect_role?: string
}

export type ListingUpdatePayload = Partial<ListingCreatePayload>
