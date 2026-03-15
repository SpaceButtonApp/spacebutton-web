'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PropertyCard } from '@/components/property-card'
import { Property } from '@/lib/mock-data'

interface SuggestedApartmentsProps {
  apartments: Property[]
  currentPropertyId: string
}

export function SuggestedApartments({ apartments, currentPropertyId }: SuggestedApartmentsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const filteredApartments = apartments.filter((apt) => apt.id !== currentPropertyId).slice(0, 5)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = 300
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (filteredApartments.length === 0) return null

  return (
    <div className="mt-8 px-4">
      <h2 className="text-xl font-bold mb-4">Suggested Apartments</h2>
      
      <div className="relative">
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}
        >
          {filteredApartments.map((apartment) => (
            <div key={apartment.id} className="flex-shrink-0 w-64">
              <PropertyCard property={apartment} variant="compact" />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-primary/80 hover:bg-primary flex items-center justify-center shadow-md"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-primary/80 hover:bg-primary flex items-center justify-center shadow-md"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>
    </div>
  )
}
