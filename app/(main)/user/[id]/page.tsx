'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MoreVertical, Building2, Bookmark, Star, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import { BottomNav } from '@/components/bottom-nav'
import { PropertyCard } from '@/components/property-card'
import { userApi, agentApi, reviewApi } from '@/lib/api/users'
import { listingsApi, mapListing } from '@/lib/api/listings'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { Property } from '@/lib/mock-data'
import type { UserProfile, AgentProfile, ReviewListResponse } from '@/lib/types/user'

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'reviews' | 'listings' | 'closed'>('listings')

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null)
  const [listings, setListings] = useState<Property[]>([])
  const [reviewData, setReviewData] = useState<ReviewListResponse | null>(null)

  useEffect(() => {
    // Try agent profile first (has richer data), fall back to user profile
    agentApi.getAgentProfile(id)
      .then((p) => {
        if (p.profile_photo_url || p.agency_name || p.total_reviews > 0) {
          setAgentProfile(p)
        } else {
          return userApi.getPublicProfile(id).then(setUserProfile)
        }
      })
      .catch(() => {
        userApi.getPublicProfile(id)
          .then(setUserProfile)
          .catch(() => {})
      })

    // Listings
    listingsApi.getAgentListings(id)
      .then((data) => {
        setListings(data.listings.map((l) => mapListing(l, new Set())))
      })
      .catch(() => {})

    // Reviews
    reviewApi.getAgentReviews(id)
      .then(setReviewData)
      .catch(() => {})
  }, [id])

  const profile = agentProfile ?? userProfile
  const avatarUrl = profile?.profile_photo_url
    || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  const displayName = agentProfile?.agency_name
    ? agentProfile.agency_name
    : `User ${id.slice(0, 8)}`
  const isVerified = (userProfile?.is_identity_verified || userProfile?.is_live_verified) ?? false

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 flex items-center justify-between border-b border-border">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Profile</h1>
        <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4">
        <div className="flex flex-col items-center mb-6 pt-6">
          <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4">
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" unoptimized />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            {isVerified && <ShieldCheck className="w-5 h-5 text-primary" />}
          </div>
          <p className="text-muted-foreground capitalize">
            {agentProfile ? 'Agent' : 'Individual'}
          </p>
          {agentProfile?.bio && (
            <p className="text-sm text-muted-foreground text-center mt-2 px-4">{agentProfile.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 text-center p-4 rounded-2xl border border-border">
            <p className="text-2xl font-bold">{listings.length}</p>
            <p className="text-sm text-muted-foreground">Listings</p>
          </div>
          <div className="flex-1 text-center p-4 rounded-2xl border border-border">
            <p className="text-2xl font-bold">{agentProfile?.total_closed_deals ?? 0}</p>
            <p className="text-sm text-muted-foreground">Closed</p>
          </div>
          <div className="flex-1 text-center p-4 rounded-2xl border border-border">
            <p className="text-2xl font-bold">{agentProfile?.avg_rating?.toFixed(1) ?? '0.0'}</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-secondary rounded-full p-1 flex mb-6">
          {(['reviews', 'listings', 'closed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-full text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'bg-background shadow-sm' : ''
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'listings' && (
          <div className="space-y-4">
            {listings.length > 0 ? (
              listings.map((property) => (
                <PropertyCard key={property.id} property={property} variant="horizontal" />
              ))
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No listings yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {!reviewData || reviewData.reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No reviews yet</p>
              </div>
            ) : (
              reviewData.reviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-secondary">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-xs">
                        {review.reviewer_id.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          User {review.reviewer_id.slice(0, 8)}...
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'w-3.5 h-3.5',
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground',
                            )}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'closed' && (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No closed deals</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
