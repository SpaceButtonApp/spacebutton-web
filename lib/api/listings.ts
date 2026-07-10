import { api } from './client'
import { useAppStore } from '@/lib/store'
import type { ApiResponse } from '../types/auth'
import type {
  ListingResponse,
  ListingListResponse,
  ListingFilters,
  ListingCreatePayload,
  ListingUpdatePayload,
} from '../types/listing'
import type { Property, Agent } from '../mock-data'

// ─── Mapper: backend ListingResponse → frontend Property ──────────────────────

function mapCategory(l: ListingResponse): Property['category'] {
  switch (l.property_type) {
    case 'apartment': return 'flat'
    case 'house': return 'house'
    case 'self_contain': return 'self-con'
    case 'room_and_parlour': return 'flat'
    case 'duplex': return 'duplex'
    case 'storey': return 'storey'
    case 'penthouse': return 'penthouse'
    default: return 'flat'
  }
}

function mapCondition(l: ListingResponse): Property['condition'] {
  switch (l.category) {
    case 'for_rent': return 'rent'
    case 'need_roommate': return 'roommate'
    case 'flatmate': return 'flatmate'
    case 'subletting': return 'flatmate'
    default: return 'rent'
  }
}

function mapType(l: ListingResponse): Property['type'] {
  if (l.category === 'need_roommate' || l.category === 'flatmate') return 'connect'
  if (l.category === 'subletting') return 'shortlet'
  if (l.owner_type === 'agent') return 'agent'
  return 'properties'
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'

export function mapListing(l: ListingResponse, savedIds: Set<string> = new Set()): Property {
  const sortedImages = [...l.images]
    .sort((a, b) => a.order - b.order)
    .map((img) => img.image_url)

  let features: string[] = []
  try {
    if (l.facilities) features = JSON.parse(l.facilities) as string[]
  } catch { /* ignore parse errors */ }

  const type = mapType(l)

  const agent: Agent = {
    id: l.agent_id,
    name: 'SpaceButton User',
    avatar: '',
    type: l.owner_type === 'agent' ? 'agent' : 'individual',
    listings: 0,
    closed: 0,
    rating: 0,
    online: false,
  }

  return {
    id: l.id,
    title: l.title,
    location: `${l.city}, ${l.state}`,
    price: Number(l.price),
    rentPeriod: l.rent_period === 'monthly' ? 'monthly' : 'yearly',
    images: sortedImages.length > 0 ? sortedImages : [FALLBACK_IMAGE],
    videoUrl: l.video_tour_url ?? undefined,
    type,
    listingType: type,
    condition: mapCondition(l),
    category: mapCategory(l),
    beds: l.bedrooms,
    baths: l.bathrooms,
    reception: l.sitting_rooms ?? 1,
    features,
    description: l.description,
    verified: l.is_featured,
    saved: savedIds.has(l.id),
    photoCount: l.images.length,
    ownerId: l.agent_id,
    views: l.views_count,
    agent,
    genderNeeded: (l.gender_needed as Property['genderNeeded']) ?? undefined,
    balconies: l.balconies ?? undefined,
    rentDueDate: l.rent_due_date ?? undefined,
    totalPackage: l.total_package ? Number(l.total_package) : undefined,
    landlordPresence: (l.landlord_presence as Property['landlordPresence']) ?? undefined,
    connectRole: (l.connect_role as Property['connectRole']) ?? undefined,
  }
}

// ─── Query builder ─────────────────────────────────────────────────────────────

function buildQuery(filters: ListingFilters): string {
  const params = new URLSearchParams()
  if (filters.state) params.set('state', filters.state)
  if (filters.city) params.set('city', filters.city)
  if (filters.property_type) params.set('property_type', filters.property_type)
  if (filters.min_price != null) params.set('min_price', String(filters.min_price))
  if (filters.max_price != null) params.set('max_price', String(filters.max_price))
  if (filters.bedrooms != null) params.set('bedrooms', String(filters.bedrooms))
  if (filters.category) params.set('category', filters.category)
  if (filters.owner_type) params.set('owner_type', filters.owner_type)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.page_size) params.set('page_size', String(filters.page_size))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const listingsApi = {
  async getListings(filters: ListingFilters = {}): Promise<ListingListResponse> {
    const res = await api.get<ApiResponse<ListingListResponse>>(
      `/listings${buildQuery(filters)}`,
      { skipAuth: true },
    )
    return res.data
  },

  async search(q: string, page = 1, page_size = 20): Promise<ListingListResponse> {
    const params = new URLSearchParams({ q, page: String(page), page_size: String(page_size) })
    const res = await api.get<ApiResponse<ListingListResponse>>(
      `/listings/search?${params}`,
      { skipAuth: true },
    )
    return res.data
  },

  async getRecommended(page = 1, page_size = 10): Promise<ListingListResponse> {
    const params = new URLSearchParams({ page: String(page), page_size: String(page_size) })
    const res = await api.get<ApiResponse<ListingListResponse>>(`/listings/recommended?${params}`)
    return res.data
  },

  async getListing(id: string): Promise<ListingResponse> {
    const res = await api.get<ApiResponse<ListingResponse>>(`/listings/${id}`, { skipAuth: true })
    return res.data
  },

  async getSaved(): Promise<ListingListResponse> {
    const res = await api.get<ApiResponse<ListingListResponse>>('/listings/saved')
    return res.data
  },

  async getSavedIds(): Promise<string[]> {
    const res = await api.get<ApiResponse<{ ids: string[] }>>('/listings/saved/ids')
    return res.data.ids
  },

  async toggleSave(id: string): Promise<{ saved: boolean; listing_id: string }> {
    const res = await api.post<ApiResponse<{ saved: boolean; listing_id: string }>>(
      `/listings/${id}/save`,
    )
    return res.data
  },

  async createListing(data: ListingCreatePayload): Promise<ListingResponse> {
    const res = await api.post<ApiResponse<ListingResponse>>('/listings', data)
    return res.data
  },

  async updateListing(id: string, data: ListingUpdatePayload): Promise<ListingResponse> {
    const res = await api.put<ApiResponse<ListingResponse>>(`/listings/${id}`, data)
    return res.data
  },

  async deleteListing(id: string): Promise<void> {
    await api.delete(`/listings/${id}`)
  },

  async closeDeal(id: string): Promise<ListingResponse> {
    const res = await api.post<ApiResponse<ListingResponse>>(`/listings/${id}/close`)
    return res.data
  },

  async incrementViews(id: string): Promise<void> {
    try {
      await api.post(`/listings/${id}/view`)
    } catch { /* non-critical */ }
  },

  async getAgentListings(agentId: string, page = 1, page_size = 20): Promise<ListingListResponse> {
    const params = new URLSearchParams({ page: String(page), page_size: String(page_size) })
    const res = await api.get<ApiResponse<ListingListResponse>>(
      `/listings/agent/${agentId}?${params}`,
    )
    return res.data
  },

  async uploadImages(id: string, files: File[]): Promise<ListingResponse> {
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    const res = await api.post<ApiResponse<ListingResponse>>(`/listings/${id}/images`, form)
    return res.data
  },

  async uploadVideo(id: string, file: File): Promise<ListingResponse> {
    const form = new FormData()
    form.append('file', file)
    const res = await api.post<ApiResponse<ListingResponse>>(`/listings/${id}/video`, form)
    return res.data
  },
}

// ─── Save toggle with optimistic update ──────────────────────────────────────

export async function saveListing(id: string): Promise<void> {
  const store = useAppStore.getState()
  store.toggleSaveProperty(id) // optimistic
  try {
    await listingsApi.toggleSave(id)
  } catch {
    store.toggleSaveProperty(id) // revert on failure
  }
}
