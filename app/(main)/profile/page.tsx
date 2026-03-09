'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, MoreVertical, Star, Edit } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { PropertyCard } from '@/components/property-card'
import { useAppStore } from '@/lib/store'
import { mockProperties, mockReviews } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const tabs = ['Reviews', 'Listings', 'Closed'] as const
type Tab = typeof tabs[number]

export default function ProfilePage() {
  const router = useRouter()
  const user = useAppStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<Tab>('Listings')
  const [showMenu, setShowMenu] = useState(false)

  const userProperties = mockProperties.slice(0, 3)
  const closedProperties = mockProperties.slice(0, 2)

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background px-4 py-4 sticky top-0 z-40 border-b border-border">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
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
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-secondary mb-4">
          <Image
            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
            alt={user?.name || 'User'}
            width={112}
            height={112}
            className="object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold">{user?.name || 'Guest'}</h1>
        <p className="text-muted-foreground capitalize">{user?.type || 'Individual'}</p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="px-6 py-4 rounded-xl border border-border text-center min-w-[100px]">
            <p className="text-2xl font-bold">{userProperties.length + 27}</p>
            <p className="text-sm text-muted-foreground">Listings</p>
          </div>
          <div className="px-6 py-4 rounded-xl border border-border text-center min-w-[100px]">
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Closed</p>
          </div>
          <div className="px-6 py-4 rounded-xl border border-border text-center min-w-[100px]">
            <p className="text-2xl font-bold">4.8</p>
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
                    : 'text-muted-foreground'
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
            {mockReviews.map((review) => (
              <div key={review.id} className="p-4 rounded-xl bg-secondary">
                <div className="flex items-start gap-3">
                  <Image
                    src={review.userAvatar}
                    alt={review.userName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{review.userName}</h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(review.date, { addSuffix: true })}
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
                              : 'text-muted-foreground'
                          )} 
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Listings' && (
          <div className="space-y-3">
            {userProperties.map((property) => (
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
                    onClick={() => {
                      console.log('[v0] Close listing:', property.id)
                      alert('Listing closed!')
                    }}
                    className="px-3 py-1 bg-destructive text-destructive-foreground rounded-full text-xs font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Closed' && (
          <div className="space-y-3">
            {closedProperties.map((property) => (
              <div key={property.id} className="relative">
                <PropertyCard property={property} variant="compact" />
                <div className="absolute top-2 left-2 px-2 py-1 bg-success text-success-foreground rounded text-xs font-medium">
                  Closed
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
