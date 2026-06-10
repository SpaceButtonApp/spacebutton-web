'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Star, Edit, Trash2, X } from 'lucide-react'
import { VerifiedBadge } from '@/components/verified-badge'
import { BottomNav } from '@/components/bottom-nav'
import { BackButton } from '@/components/back-button'
import { PropertyCard } from '@/components/property-card'
import { useAppStore } from '@/lib/store'
import { userApi, agentApi, reviewApi } from '@/lib/api/users'
import { listingsApi, mapListing } from '@/lib/api/listings'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { Property } from '@/lib/mock-data'
import type { AgentProfile, UserProfile, ReviewListResponse } from '@/lib/types/user'

const tabs = ['Reviews', 'Listings', 'Closed'] as const
type Tab = typeof tabs[number]

export default function ProfilePage() {
  const router = useRouter()
  const { user, closedProperties, deleteProperty, closeProperty } = useAppStore()
  const [activeTab, setActiveTab] = useState<Tab>('Listings')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)

  const [profile, setProfile] = useState<UserProfile | AgentProfile | null>(null)
  const [listings, setListings] = useState<Property[]>([])
  const [closedListings, setClosedListings] = useState<Property[]>([])
  const [reviewData, setReviewData] = useState<ReviewListResponse | null>(null)

  const isAgent = user?.type === 'agent'

  useEffect(() => {
    if (!user?.id) return

    // Load profile
    const profilePromise = isAgent
      ? agentApi.getMyAgentProfile()
      : userApi.getMyProfile()
    profilePromise
      .then((p) => setProfile(p))
      .catch(() => {})

    // Load all listings for this user
    listingsApi.getAgentListings(user.id)
      .then((data) => {
        const savedSet = new Set<string>()
        const allMapped = data.listings.map((l) => mapListing(l, savedSet))
        setListings(allMapped.filter((p) => !closedProperties.includes(p.id)))
        setClosedListings(allMapped.filter((p) => closedProperties.includes(p.id)))
      })
      .catch(() => {})

    // Load reviews (agents only)
    if (isAgent) {
      reviewApi.getAgentReviews(user.id)
        .then((data) => setReviewData(data))
        .catch(() => {})
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const avatarUrl = profile?.profile_photo_url
    || user?.avatar
    || '/placeholder-user.jpg'

  const agentProfile = isAgent ? (profile as AgentProfile | null) : null
  const averageRating = agentProfile?.avg_rating?.toFixed(1) ?? '0.0'
  const closedCount = agentProfile?.total_closed_deals ?? closedListings.length
  const isVerified = (profile as UserProfile)?.is_identity_verified
    || (profile as UserProfile)?.is_live_verified

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background px-4 py-4 sticky top-0 z-40 border-b border-border">
        <div className="flex items-center justify-between">
          <BackButton fallbackUrl="/home" />
          <h1 className="text-lg font-bold">Profile</h1>
          <button
            onClick={() => router.push('/profile/edit')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-6 py-6 flex flex-col items-center">
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-secondary mb-4">
          <Image
            src={avatarUrl}
            alt={user?.name || 'User'}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{user?.name || 'Guest'}</h1>
          {isVerified && <VerifiedBadge size={22} />}
        </div>
        <p className="text-muted-foreground capitalize">{user?.type || 'Individual'}</p>
        {agentProfile?.agency_name && (
          <p className="text-sm text-muted-foreground mt-1">{agentProfile.agency_name}</p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="px-6 py-4 rounded-xl border border-border text-center min-w-[100px]">
            <p className="text-2xl font-bold">{listings.length}</p>
            <p className="text-sm text-muted-foreground">Listings</p>
          </div>
          <div className="px-6 py-4 rounded-xl border border-border text-center min-w-[100px]">
            <p className="text-2xl font-bold">{closedCount}</p>
            <p className="text-sm text-muted-foreground">Closed</p>
          </div>
          <div className="px-6 py-4 rounded-xl border border-border text-center min-w-[100px]">
            <p className="text-2xl font-bold">{averageRating}</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-center">
          <div className="inline-flex bg-secondary rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-6 py-2.5 rounded-full text-sm font-medium transition-all',
                  activeTab === tab
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {activeTab === 'Reviews' && (
          <div className="space-y-4">
            {!reviewData || reviewData.reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No reviews yet.</p>
              </div>
            ) : (
              reviewData.reviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-secondary">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">
                        {review.reviewer_id.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">
                          User {review.reviewer_id.slice(0, 8)}...
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'w-4 h-4',
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground',
                            )}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Listings' && (
          <div className="space-y-3">
            {listings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>You haven&apos;t posted any listings yet.</p>
              </div>
            ) : (
              listings.map((property) => (
                <div key={property.id} className="relative">
                  <PropertyCard property={property} variant="compact" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => router.push(`/edit-post/${property.id}`)}
                      className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => closeProperty(property.id)}
                      className="px-3 py-1 bg-destructive text-destructive-foreground rounded-full text-xs font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Closed' && (
          <div className="space-y-3">
            {closedListings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No closed listings yet.</p>
              </div>
            ) : (
              closedListings.map((property) => (
                <div key={property.id} className="relative">
                  <PropertyCard property={property} variant="compact" />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-success text-success-foreground rounded text-xs font-medium">
                    Closed
                  </div>
                  <button
                    onClick={() => {
                      setPropertyToDelete(property.id)
                      setShowDeleteModal(true)
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-bold text-lg">Delete Property</h3>
              </div>
              <button onClick={() => { setShowDeleteModal(false); setPropertyToDelete(null) }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setPropertyToDelete(null) }}
                className="flex-1 h-12 bg-secondary text-foreground rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (propertyToDelete) {
                    try {
                      await listingsApi.deleteListing(propertyToDelete)
                    } catch { /* if API fails, still remove locally */ }
                    deleteProperty(propertyToDelete)
                    setListings((prev) => prev.filter((p) => p.id !== propertyToDelete))
                  }
                  setShowDeleteModal(false)
                  setPropertyToDelete(null)
                }}
                className="flex-1 h-12 bg-destructive text-destructive-foreground rounded-xl font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

