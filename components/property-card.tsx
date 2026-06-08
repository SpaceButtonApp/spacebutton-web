'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Camera, Grid3X3, Bookmark, MapPin, Users, Building2, CheckCircle2, Home, DollarSign, Maximize, Play } from 'lucide-react'
import { useState, useRef } from 'react'
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
  
  // Check if this is a Properties listing type
  const isPropertyType = property.type === 'properties' || property.listingType === 'properties'

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    saveListing(property.id)
  }

  const handleViewDetails = () => {
    router.push(`/property/${property.id}`)
  }

  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayVideo = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  if (variant === 'compact' || variant === 'horizontal') {
    return (
      <div 
        onClick={handleViewDetails}
        className="flex gap-3 bg-card rounded-2xl p-3 border border-border cursor-pointer hover:border-[#703BF7]/30 transition-all duration-200"
      >
        {/* Image/Video */}
        <div className="relative w-32 h-28 flex-shrink-0 rounded-xl overflow-hidden">
          {property.images[0]?.startsWith('data:video') ? (
            <>
              <video 
                ref={videoRef}
                src={property.images[0]} 
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                poster={property.images[1] || ''}
              />
              {!isPlaying && (
                <div className="video-play-overlay" onClick={handlePlayVideo}>
                  <div className="video-play-button">
                    <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover"
            />
          )}
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
            {isPropertyType ? (
              <>
                <div className="flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  <span className="capitalize">{property.propertyCategory || property.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span className="capitalize">{property.propertyType || 'Sale'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Grid3X3 className="w-3 h-3" />
                  <span className="capitalize">{property.locationCategory || 'Estate'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{property.type === 'connect' 
                    ? (property.connectRole === 'Landlord' ? 'Landlord' : 'Tenant') 
                    : 'Agent'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span className="capitalize">
                    {property.condition === 'rent' && property.connectRole === 'Tenant' 
                      ? 'Vacating' 
                      : (property.condition || 'rent')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span className="capitalize">{property.category}</span>
                </div>
              </>
            )}
          </div>

          <p className="text-[#703BF7] font-bold mt-2">{formatPrice(property.price, property.rentPeriod)}</p>
        </div>
      </div>
    )
  }

  const [isPlayingFull, setIsPlayingFull] = useState(false)
  const videoRefFull = useRef<HTMLVideoElement>(null)

  const handlePlayVideoFull = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRefFull.current) {
      videoRefFull.current.play()
      setIsPlayingFull(true)
    }
  }

  return (
    <div className="bg-card rounded-3xl overflow-hidden border border-border hover:border-[#703BF7]/30 transition-all duration-200">
      {/* Image/Video */}
      <div className="relative aspect-[4/3]">
        {property.images[0]?.startsWith('data:video') ? (
          <>
            <video 
              ref={videoRefFull}
              src={property.images[0]} 
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              poster={property.images[1] || ''}
            />
            {!isPlayingFull && (
              <div className="video-play-overlay" onClick={handlePlayVideoFull}>
                <div className="video-play-button">
                  <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
                </div>
              </div>
            )}
          </>
        ) : (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
          />
        )}
        
        {/* Verified badge - Only for admin posts */}
        {property.isAdminPost && (
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#703BF7] flex items-center justify-center shadow-lg shadow-[#703BF7]/20">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Bottom badges */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/60 text-white rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">{property.photoCount}</span>
          </div>
          <div className="w-9 h-9 bg-black/60 text-white rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Grid3X3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg text-foreground">{property.title}</h3>
          <button onClick={handleSave}>
            <Bookmark 
              className={cn(
                'w-6 h-6 transition-colors',
                isSaved ? 'fill-[#703BF7] text-[#703BF7]' : 'text-muted-foreground'
              )} 
            />
          </button>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 text-[#703BF7]" />
          <span className="text-sm">{property.location}</span>
        </div>

        {/* Different info display for Properties vs Connect/Agent */}
        {isPropertyType ? (
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span className="capitalize">{property.propertyCategory || property.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span className="capitalize">{property.propertyType || 'Sale'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Grid3X3 className="w-4 h-4" />
              <span className="capitalize">{property.locationCategory || 'Estate'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              <span>{property.propertySize?.toLocaleString() || '0'} sqft</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{property.type === 'connect' 
                ? (property.connectRole === 'Landlord' ? 'Landlord' : 'Tenant') 
                : 'Agent'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="capitalize">
                {property.condition === 'rent' && property.connectRole === 'Tenant' 
                  ? 'Vacating' 
                  : (property.condition || 'rent')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              <span className="capitalize">{property.category}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[#703BF7] font-bold text-xl">{formatPrice(property.price, property.rentPeriod)}</p>
          <button 
            onClick={handleViewDetails}
            className="bg-[#703BF7] hover:bg-[#5f32d4] text-white rounded-xl px-6 h-10 font-medium transition-all duration-200 shadow-lg shadow-[#703BF7]/20"
          >
            Full Details
          </button>
        </div>
      </div>
    </div>
  )
}
