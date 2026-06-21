'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Bookmark, Sparkles } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { PropertyCard } from '@/components/property-card'
import { ConnectBalanceButton } from '@/components/connect-balance-button'
import { useAppStore } from '@/lib/store'
import { listingsApi, mapListing } from '@/lib/api/listings'
import { cn } from '@/lib/utils'
import type { Property } from '@/lib/mock-data'
import type { ListingFilters } from '@/lib/types/listing'

const tabs = ['Connect', 'Agent', 'Shortlet', 'Properties'] as const
type Tab = typeof tabs[number]

function tabToFilters(tab: Tab): ListingFilters {
  switch (tab) {
    case 'Connect':    return { owner_type: 'user', page_size: 20 }
    case 'Agent':      return { owner_type: 'agent', page_size: 20 }
    case 'Shortlet':   return { category: 'subletting', page_size: 20 }
    case 'Properties': return { category: 'for_rent', owner_type: 'user', page_size: 20 }
  }
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-secondary" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-secondary rounded w-3/4" />
        <div className="h-3 bg-secondary rounded w-1/2" />
        <div className="h-4 bg-secondary rounded w-1/3" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { user, activeTab, setActiveTab, savedProperties, setSavedProperties } = useAppStore()
  const [currentTab, setCurrentTab] = useState<Tab>('Connect')
  const [listings, setListings] = useState<Property[]>([])
  const [forYou, setForYou] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const logoUrl = '/logo.png'

  useEffect(() => { setMounted(true) }, [])

  // Load saved IDs once on mount (auth required)
  useEffect(() => {
    if (!user) return
    listingsApi.getSavedIds()
      .then((ids) => setSavedProperties(ids))
      .catch(() => {})
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load recommended for "For You" strip (auth required)
  useEffect(() => {
    if (!user) return
    listingsApi.getRecommended(1, 6)
      .then((data) => {
        const savedSet = new Set(savedProperties)
        setForYou(data.listings.map((l) => mapListing(l, savedSet)))
      })
      .catch(() => {})
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch listings whenever tab changes
  const fetchListings = useCallback(async (tab: Tab) => {
    setLoading(true)
    setListings([])
    try {
      const data = await listingsApi.getListings(tabToFilters(tab))
      const savedSet = new Set(savedProperties)
      setListings(data.listings.map((l) => mapListing(l, savedSet)))
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [savedProperties]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mounted) fetchListings(currentTab)
  }, [currentTab, mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab)
    if (tab === 'Connect' || tab === 'Agent') {
      setActiveTab(tab.toLowerCase() as 'connect' | 'agent')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-xl px-4 py-4 sticky top-0 z-40 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/profile')}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 flex-shrink-0 hover:border-primary transition-colors"
          >
            <Image
              src={mounted && user?.avatar ? user.avatar : '/placeholder-user.jpg'}
              alt="Profile"
              width={48}
              height={48}
              className="object-cover"
            />
          </button>

          <div className="flex-1 flex items-center justify-center gap-2">
            <Image src={logoUrl} alt="SpaceButton" width={40} height={69} className="h-7 w-auto" style={{ width: 'auto' }} />
            <span className="text-lg font-bold text-foreground">SpaceButton</span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <ConnectBalanceButton />
            <button
              onClick={() => router.push('/saved')}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <Bookmark className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex bg-secondary rounded-full p-1 border border-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  currentTab === tab
                    ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Coming soon for Shortlet & Properties */}
        {(currentTab === 'Shortlet' || currentTab === 'Properties') && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">{currentTab} — Coming Soon</h2>
            <p className="text-muted-foreground text-center max-w-xs text-sm">
              We&apos;re working on something great. {currentTab} listings will be available here soon. Stay tuned!
            </p>
          </div>
        )}

        {/* For You — shown when we have recommended listings */}
        {currentTab !== 'Shortlet' && currentTab !== 'Properties' && forYou.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">For you</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {forYou.map((property) => (
                <div
                  key={property.id}
                  onClick={() => router.push(`/property/${property.id}`)}
                  className="flex-shrink-0 w-40 rounded-xl overflow-hidden bg-card border border-border cursor-pointer hover:border-primary transition-colors snap-start group"
                >
                  <div className="relative w-full h-32 bg-secondary overflow-hidden">
                    <Image
                      src={property.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'}
                      alt={property.title}
                      width={160}
                      height={128}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      unoptimized
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{property.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{property.location}</p>
                    <p className="text-primary font-bold text-sm mt-2">&#x20A6;{property.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main feed */}
        {currentTab !== 'Shortlet' && currentTab !== 'Properties' && (
          loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
                <Bookmark className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">No Listings Yet</h2>
              <p className="text-muted-foreground text-center max-w-xs">
                Be the first to post a listing in this category.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )
        )}
      </div>

      <BottomNav />
    </div>
  )
}

