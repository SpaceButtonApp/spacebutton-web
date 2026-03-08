'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bookmark, Search, MapPin, Building2, Banknote, ChevronDown, Grid } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'
import { PropertyCard } from '@/components/property-card'
import { useAppStore } from '@/lib/store'
import { mockProperties, locations, apartmentTypes, priceRanges } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    apartmentType: '',
    minPrice: '',
    maxPrice: '',
    area: '',
  })
  const [showResults, setShowResults] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const handleSearch = () => {
    setShowResults(true)
    console.log('[v0] Search with filters:', { searchQuery, ...filters })
  }

  const filteredProperties = useMemo(() => {
    return mockProperties.filter((property) => {
      if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }
      if (filters.apartmentType && property.category !== filters.apartmentType.toLowerCase()) {
        return false
      }
      if (filters.minPrice && property.price < parseInt(filters.minPrice)) {
        return false
      }
      if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) {
        return false
      }
      return true
    })
  }, [searchQuery, filters])

  const suggestedProperties = mockProperties.slice(0, 2)

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-background px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => router.push('/saved')}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
          >
            <Bookmark className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search For An Apartment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 rounded-xl border-2 border-foreground bg-background pl-4 pr-14 text-base"
          />
          <Button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-primary p-0"
          >
            <Search className="w-5 h-5 text-primary-foreground" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-4 space-y-3">
        {/* Location */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
            className="w-full h-14 rounded-xl border border-border bg-background px-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <span className={filters.location ? 'text-foreground' : 'text-muted-foreground'}>
                {filters.location || 'Location'}
              </span>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', activeDropdown === 'location' && 'rotate-180')} />
          </button>
          {activeDropdown === 'location' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => { setFilters({ ...filters, location: loc }); setActiveDropdown(null); }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary text-sm"
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Apartment Type */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
            className="w-full h-14 rounded-xl border border-border bg-background px-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <span className={filters.apartmentType ? 'text-foreground' : 'text-muted-foreground'}>
                {filters.apartmentType || 'Apartment Type'}
              </span>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', activeDropdown === 'type' && 'rotate-180')} />
          </button>
          {activeDropdown === 'type' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
              {apartmentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => { setFilters({ ...filters, apartmentType: type }); setActiveDropdown(null); }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary text-sm"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Min Price */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'minPrice' ? null : 'minPrice')}
            className="w-full h-14 rounded-xl border border-border bg-background px-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Banknote className="w-5 h-5 text-muted-foreground" />
              <span className={filters.minPrice ? 'text-foreground' : 'text-muted-foreground'}>
                {filters.minPrice ? `₦${parseInt(filters.minPrice).toLocaleString()}` : 'Min. Price'}
              </span>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', activeDropdown === 'minPrice' && 'rotate-180')} />
          </button>
          {activeDropdown === 'minPrice' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
              {priceRanges.min.map((price) => (
                <button
                  key={price}
                  onClick={() => { setFilters({ ...filters, minPrice: price.toString() }); setActiveDropdown(null); }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary text-sm"
                >
                  ₦{price.toLocaleString()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Max Price */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'maxPrice' ? null : 'maxPrice')}
            className="w-full h-14 rounded-xl border border-border bg-background px-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Banknote className="w-5 h-5 text-muted-foreground" />
              <span className={filters.maxPrice ? 'text-foreground' : 'text-muted-foreground'}>
                {filters.maxPrice ? `₦${parseInt(filters.maxPrice).toLocaleString()}` : 'Max. Price'}
              </span>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', activeDropdown === 'maxPrice' && 'rotate-180')} />
          </button>
          {activeDropdown === 'maxPrice' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
              {priceRanges.max.map((price) => (
                <button
                  key={price}
                  onClick={() => { setFilters({ ...filters, maxPrice: price.toString() }); setActiveDropdown(null); }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary text-sm"
                >
                  ₦{price.toLocaleString()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Area */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'area' ? null : 'area')}
            className="w-full h-14 rounded-xl border border-border bg-background px-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Grid className="w-5 h-5 text-muted-foreground" />
              <span className={filters.area ? 'text-foreground' : 'text-muted-foreground'}>
                {filters.area || 'Area'}
              </span>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', activeDropdown === 'area' && 'rotate-180')} />
          </button>
          {activeDropdown === 'area' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => { setFilters({ ...filters, area: loc }); setActiveDropdown(null); }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary text-sm"
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results / Suggestions */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-bold mb-4">
          {showResults ? 'Search Results' : 'Suggested Apartment'}
        </h2>
        <div className="space-y-3">
          {(showResults ? filteredProperties : suggestedProperties).map((property) => (
            <PropertyCard key={property.id} property={property} variant="compact" />
          ))}
        </div>
        
        {showResults && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No properties found matching your criteria.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
