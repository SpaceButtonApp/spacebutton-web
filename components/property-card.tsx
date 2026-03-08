'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Camera, Grid3X3, Bookmark, MapPin, Users, Building2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { formatPrice, type Property } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  variant?: 'full' | 'compact' | 'horizontal'
}

export function PropertyCard({ property, variant = 'full' }: PropertyCardProps) {
  const router = useRouter()
  const { savedProperties, toggleSaveProperty } = useAppStore()
  const isSaved = savedProperties.includes(property.id)

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleSaveProperty(property.id)
  }

  const handleViewDetails = () => {
    router.push(`/property/${property.id}`)
  }

  if (variant === 'compact' || variant === 'horizontal') {
    return (
      <div 
        onClick={handleViewDetails}
        className="flex gap-3 bg-background rounded-2xl p-3 border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      >
        {/* Image */}
        <div className="relative w-32 h-28 flex-shrink-0 rounded-xl overflow-hidden">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
          />
          {property.verified && (
            <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-foreground/80 text-background rounded-lg px-2 py-1">
            <Camera className="w-3 h-3" />
            <span className="text-xs font-medium">{property.photoCount}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm truncate">{property.title}</h3>
            <button
              onClick={handleSave}
              className="flex-shrink-0"
            >
              <Bookmark 
                className={cn(
                  'w-5 h-5 transition-colors',
                  isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'
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
              <span>{property.type === 'connect' ? 'Connect' : 'Agent'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{property.condition === 'roommate' ? 'Roommate' : 'Flatmate'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <span className="capitalize">{property.category}</span>
            </div>
          </div>

          <p className="text-primary font-bold mt-2">{formatPrice(property.price)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background rounded-3xl overflow-hidden shadow-sm border border-border">
      {/* Image */}
      <div className="relative aspect-[4/3]">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          className="object-cover"
        />
        
        {/* Verified badge */}
        {property.verified && (
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
          </div>
        )}

        {/* Bottom badges */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-foreground/80 text-background rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">{property.photoCount}</span>
          </div>
          <div className="w-9 h-9 bg-foreground/80 text-background rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Grid3X3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg">{property.title}</h3>
          <button onClick={handleSave}>
            <Bookmark 
              className={cn(
                'w-6 h-6 transition-colors',
                isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'
              )} 
            />
          </button>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{property.type === 'connect' ? 'Connect' : 'Agent'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{property.condition === 'roommate' ? 'Roommate' : 'Flatmate'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            <span className="capitalize">{property.category}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-primary font-bold text-xl">{formatPrice(property.price)}</p>
          <Button 
            onClick={handleViewDetails}
            className="bg-primary text-primary-foreground rounded-xl px-6 h-10 font-medium"
          >
            Full Details
          </Button>
        </div>
      </div>
    </div>
  )
}
