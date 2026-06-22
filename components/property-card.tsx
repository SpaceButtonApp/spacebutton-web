'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Camera, Grid3X3, Bookmark, MapPin, Users, Building2, CheckCircle2, DollarSign } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { saveListing } from '@/lib/api/listings'
import { formatPrice, type Property } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  variant?: 'full' | 'compact' | 'horizontal'
}

export function PropertyCard({ property, variant = 'full' }: PropertyCardProps) {
  const router = useRouter()
  const { savedProperties } = useAppStore()
  const isSaved = savedProperties.includes(property.id)
  
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    saveListing(property.id)
  }

  const handleViewDetails = () => {
    router.push(`/property/${property.id}`)
  }

  if (variant === 'compact' || variant === 'horizontal') {
    return (
      <div 
        onClick={handleViewDetails}
        className="flex gap-3 bg-card rounded-2xl p-3 border border-border cursor-pointer hover:border-[#703BF7]/30 transition-all duration-200"
      >
        {/* Image */}
        <div className="relative w-32 h-28 flex-shrink-0 rounded-xl overflow-hidden">
          <Image
            src={property.images[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'}
            alt={property.title}
            fill
            className="object-cover"
            unoptimized
          />
          {property.isAdminPost && (
            <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#703BF7] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white rounded-lg px-2 py-1 backdrop-blur-sm">
            <Camera className="w-3 h-3" />
            <span className="text-xs font-medium">{property.photoCount}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground truncate">{property.title}</h3>
            <button
              onClick={handleSave}
              className="flex-shrink-0"
            >
              <Bookmark 
                className={cn(
                  'w-5 h-5 transition-colors',
                  isSaved ? 'fill-[#703BF7] text-[#703BF7]' : 'text-muted-foreground'
                )} 
              />
            </button>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <MapPin className="w-3 h-3" />
            <span className="text-xs truncate">{property.location}</span>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>
                {property.type === 'agent' ? 'Agent' : (property.connectRole ?? 'Landlord')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <span className="capitalize">{property.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className="capitalize">
                {property.condition === 'rent' && property.connectRole === 'Tenant'
                  ? 'Vacating'
                  : (property.condition || 'rent')}
              </span>
            </div>
          </div>

          <p className="text-[#703BF7] font-bold mt-2">{formatPrice(property.price, property.rentPeriod)}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleViewDetails}
      className="bg-card rounded-2xl overflow-hidden border border-border hover:border-[#703BF7]/30 transition-all duration-200 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-video">
        <Image
          src={property.images[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'}
          alt={property.title}
          fill
          className="object-cover"
          unoptimized
        />

        {/* Verified badge */}
        {property.isAdminPost && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#703BF7] flex items-center justify-center shadow-lg shadow-[#703BF7]/20">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Bottom badges */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-black/60 text-white rounded-md px-2 py-1 backdrop-blur-sm">
            <Camera className="w-3 h-3" />
            <span className="text-xs font-medium">{property.photoCount}</span>
          </div>
          <div className="w-7 h-7 bg-black/60 text-white rounded-md flex items-center justify-center backdrop-blur-sm">
            <Grid3X3 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-base text-foreground line-clamp-1">{property.title}</h3>
          <button onClick={(e) => { e.stopPropagation(); handleSave(e) }} className="flex-shrink-0">
            <Bookmark
              className={cn(
                'w-5 h-5 transition-colors',
                isSaved ? 'fill-[#703BF7] text-[#703BF7]' : 'text-muted-foreground'
              )}
            />
          </button>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground mb-2">
          <MapPin className="w-3.5 h-3.5 text-[#703BF7] flex-shrink-0" />
          <span className="text-xs truncate">{property.location}</span>
        </div>

        <div className="flex items-center gap-3 mb-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>
              {property.type === 'agent' ? 'Agent' : (property.connectRole ?? 'Landlord')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            <span className="capitalize">{property.category}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="capitalize">
              {property.condition === 'rent' && property.connectRole === 'Tenant'
                ? 'Vacating'
                : (property.condition || 'rent')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[#703BF7] font-bold text-base">{formatPrice(property.price, property.rentPeriod)}</p>
          <button
            onClick={(e) => { e.stopPropagation(); handleViewDetails() }}
            className="bg-[#703BF7] hover:bg-[#5f32d4] text-white rounded-lg px-4 h-8 text-sm font-medium transition-all duration-200"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  )
}
