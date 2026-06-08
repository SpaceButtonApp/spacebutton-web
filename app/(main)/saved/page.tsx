'use client'

import { useState, useEffect } from 'react'
import { MoreVertical, Bookmark } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { BackButton } from '@/components/back-button'
import { PropertyCard } from '@/components/property-card'
import { useAppStore } from '@/lib/store'
import { listingsApi, mapListing } from '@/lib/api/listings'
import type { Property } from '@/lib/mock-data'

export default function SavedPage() {
  const { savedProperties } = useAppStore()
  const [savedItems, setSavedItems] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listingsApi.getSaved()
      .then((data) => {
        const savedSet = new Set(savedProperties)
        setSavedItems(data.listings.map((l) => mapListing(l, savedSet)))
      })
      .catch(() => setSavedItems([]))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-background px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <BackButton fallbackUrl="/home" />
          <h1 className="text-lg font-bold">Saved Properties</h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : savedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bookmark className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Saved Properties</h2>
            <p className="text-muted-foreground text-center">
              Properties you save will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedItems.map((property) => (
              <PropertyCard key={property.id} property={property} variant="compact" />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
