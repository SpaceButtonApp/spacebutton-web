'use client'

import { useState, use, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Bookmark, ChevronLeft, ChevronRight, ChevronDown, Bed, Bath, 
  Sofa, MapPin, Calendar, AlertTriangle, Users, Building2, ArrowLeft, X, Clock,
  Home, DollarSign, Grid3X3, Maximize, Eye, Play
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'
import { BackButton } from '@/components/back-button'
import { ConnectCostModal } from '@/components/connect-cost-modal'
import { SuggestedApartments } from '@/components/suggested-apartments'
import { useAppStore } from '@/lib/store'
import { listingsApi, mapListing, saveListing } from '@/lib/api/listings'
import { chatApi } from '@/lib/api/chat'
import { formatPrice, safetyTips } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { Property } from '@/lib/mock-data'

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { savedProperties, user } = useAppStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [existingChatId, setExistingChatId] = useState<string | null>(null)
  const [safetyTipsExpanded, setSafetyTipsExpanded] = useState(false)
  const [property, setProperty] = useState<Property | null>(null)
  const [fetchError, setFetchError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayVideo = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.play()
      setIsVideoPlaying(true)
    }
  }

  // Reset play state when switching media items
  useEffect(() => {
    setIsVideoPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [currentImageIndex])

  // Fetch listing from API
  useEffect(() => {
    setFetchError(false)
    listingsApi.getListing(id)
      .then((listing) => {
        const savedSet = new Set(savedProperties)
        setProperty(mapListing(listing, savedSet))
      })
      .catch(() => setFetchError(true))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Increment views (fire-and-forget)
  useEffect(() => {
    if (user) listingsApi.incrementViews(id)
  }, [id, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Check if user already has a chat for this listing
  useEffect(() => {
    if (!user) return
    chatApi.getMyChatForListing(id).then((chat) => {
      if (chat) setExistingChatId(chat.id)
    }).catch(() => {})
  }, [id, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const isSaved = savedProperties.includes(id)

  // Check if this is a Properties listing type
  const isPropertyType = property?.type === 'properties' || property?.listingType === 'properties'

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const mediaItems = [...property.images, ...(property.videoUrl ? [property.videoUrl] : [])]
  const isVideoItem = (url: string) => !!property.videoUrl && url === property.videoUrl

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? mediaItems.length - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === mediaItems.length - 1 ? 0 : prev + 1
    )
  }

  const handleInterested = () => {
    if (existingChatId) {
      router.push(`/chat/${existingChatId}`)
      return
    }
    setShowConnectModal(true)
  }

  const handleConnectConfirm = async () => {
    if (!property) return
    const chat = await chatApi.createChat(
      property.ownerId,
      id,
      `Hi, I'm interested in ${property.title}`,
    )
    setExistingChatId(chat.id)
    setShowConnectModal(false)
    router.push(`/chat/${chat.id}`)
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:max-w-2xl md:mx-auto md:border-x md:border-border">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 flex items-center justify-between">
        <BackButton 
          fallbackUrl="/home"
          className="bg-background/80 backdrop-blur-sm"
        />
        
        <button
          onClick={() => saveListing(id)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm"
        >
          <Bookmark className={cn('w-5 h-5', isSaved && 'fill-primary text-primary')} />
        </button>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-[4/3] md:aspect-auto md:h-80">
        {isVideoItem(mediaItems[currentImageIndex]) ? (
          <>
            <video
              ref={videoRef}
              src={mediaItems[currentImageIndex]}
              className="w-full h-full object-cover cursor-pointer"
              muted
              loop
              playsInline
              poster={property.images[0] || ''}
              onClick={() => setShowFullScreen(true)}
            />
            {!isVideoPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                onClick={handlePlayVideo}
              >
                <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-7 h-7 text-white ml-1" fill="white" />
                </div>
              </div>
            )}
          </>
        ) : (
          <Image
            src={mediaItems[currentImageIndex] || '/placeholder.jpg'}
            alt={property.title}
            fill
            className="object-cover cursor-pointer"
            onClick={() => setShowFullScreen(true)}
            unoptimized
          />
        )}

        {/* Navigation arrows */}
        <button
          onClick={handlePrevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground/50 flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-background" />
        </button>
        <button
          onClick={handleNextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground/50 flex items-center justify-center"
        >
          <ChevronRight className="w-6 h-6 text-background" />
        </button>

        {/* Media indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1">
          {mediaItems.map((item, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentImageIndex ? 'bg-background w-4' : 'bg-background/50'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        {/* Title, Price & Location Card */}
        <div className="bg-secondary rounded-2xl p-6 border border-border">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-2xl font-bold flex-1">{property.title}</h1>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                {property.views !== undefined && (
                  <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">
                    <Eye className="w-3 h-3" />
                    <span className="font-medium">{property.views}</span>
                  </div>
                )}
              </div>
              {property.createdAt && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(property.createdAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-baseline gap-2 flex-wrap mb-2">
              <span className="text-3xl font-bold text-primary">{formatPrice(property.price, property.rentPeriod)}</span>
              {property.bonus && (
                <span className="text-sm text-success">{property.bonus}</span>
              )}
            </div>
            {property.totalPackage && !isPropertyType && (
              <div className="text-sm text-primary font-medium bg-primary/10 w-fit px-3 py-1 rounded-lg">
                Total Package: ₦{property.totalPackage.toLocaleString()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">{property.location}</span>
          </div>
        </div>

        {/* Tags Card */}
        <div className="bg-secondary rounded-2xl p-6 border border-border">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Details</h3>
          <div className="flex items-center gap-3 flex-wrap">
            {isPropertyType ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border">
                  <Home className="w-4 h-4 text-primary" />
                  <span className="text-sm capitalize">{property.propertyCategory || property.category}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-sm capitalize">{property.propertyType || 'Sale'}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border">
                  <Grid3X3 className="w-4 h-4 text-primary" />
                  <span className="text-sm capitalize">{property.locationCategory || 'Estate'}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border">
                  <Maximize className="w-4 h-4 text-primary" />
                  <span className="text-sm">{property.propertySize?.toLocaleString() || '0'} sqft</span>
                </div>
              </>
            ) : (
              <>
                {property.type === 'connect' && property.connectRole && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm">{property.connectRole}</span>
                  </div>
                )}
                {property.type === 'agent' && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm">Agent</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm capitalize">
                    {property.condition === 'rent' && property.connectRole === 'Tenant' 
                      ? 'Vacating' 
                      : property.condition}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="text-sm capitalize">{property.category}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Room details Card - Show for Connect/Agent or Property type with House category */}
        {(!isPropertyType || (isPropertyType && (property.propertyCategory === 'house' || property.category === 'house'))) && property.beds > 0 && (
          <div className="bg-secondary rounded-2xl p-6 border border-border">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Specifications</h3>
            <div className="flex items-center justify-start gap-4 flex-wrap">
              <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-background border border-border">
                <Bed className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">{property.beds}</span>
                <span className="text-xs text-muted-foreground">Beds</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-background border border-border">
                <Bath className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">{property.baths}</span>
                <span className="text-xs text-muted-foreground">Bath</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-background border border-border">
                <Sofa className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">{property.reception}</span>
                <span className="text-xs text-muted-foreground">Reception</span>
              </div>
              {property.balconies && property.balconies > 0 && (
                <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-background border border-border">
                  <Building2 className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">{property.balconies}</span>
                  <span className="text-xs text-muted-foreground">Balcony</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Info Card */}
        {(
          (isPropertyType && property.propertySize) ||
          (isPropertyType && property.buildingYear) ||
          (!isPropertyType && property.genderNeeded) ||
          (!isPropertyType && property.landlordPresence) ||
          (isPropertyType && property.locationCategory) ||
          (!isPropertyType && property.rentDueDate)
        ) && (
          <div className="bg-secondary rounded-2xl p-6 border border-border space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Information</h3>
            {isPropertyType && property.propertySize && (
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-2 text-gray-400">
                  <Maximize className="w-4 h-4" />
                  <span>Property Size</span>
                </div>
                <span className="font-medium">{property.propertySize.toLocaleString()} sqft</span>
              </div>
            )}
            {isPropertyType && property.buildingYear && (
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Building Year</span>
                </div>
                <span className="font-medium">{property.buildingYear}</span>
              </div>
            )}
            {!isPropertyType && property.genderNeeded && (
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>Gender Needed</span>
                </div>
                <span className="font-medium capitalize">{property.genderNeeded}</span>
              </div>
            )}
            {!isPropertyType && property.landlordPresence && (
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-2 text-gray-400">
                  <Home className="w-4 h-4" />
                  <span>Landlord Presence</span>
                </div>
                <span className="font-medium">
                  {property.landlordPresence === 'stays' ? 'In Compound' : 'Not In Compound'}
                </span>
              </div>
            )}
            {isPropertyType && property.locationCategory && (
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>Location Category</span>
                </div>
                <span className="font-medium capitalize">{property.locationCategory}</span>
              </div>
            )}
            {!isPropertyType && property.rentDueDate && (
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Rent Due Date</span>
                </div>
                <span className="font-medium">{new Date(property.rentDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
              </div>
            )}
          </div>
        )}

        {/* Features / Environment / Facilities */}
        {property.features && property.features.length > 0 && (
          <div className="bg-secondary rounded-2xl p-6 border border-border">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{isPropertyType ? 'Environment / Facilities' : 'Features'}</h3>
            <ul className="grid grid-cols-2 gap-2">
              {property.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm p-2 bg-background rounded-lg border border-border">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="line-clamp-2">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Description Card */}
        <div className="bg-secondary rounded-2xl p-6 border border-border">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{isPropertyType ? 'Additional Description' : 'Description'}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Safety Tips Card - Hidden for admin posts */}
        {!property.isAdminPost && (
          <div className="bg-destructive/5 rounded-2xl border border-destructive/20 overflow-hidden">
            <button
              onClick={() => setSafetyTipsExpanded(!safetyTipsExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-destructive/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-semibold text-destructive uppercase tracking-wide">Safety Tips</span>
              </div>
              <ChevronDown 
                className={cn(
                  "w-5 h-5 text-destructive transition-transform duration-300",
                  safetyTipsExpanded && "rotate-180"
                )} 
              />
            </button>
            <div 
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                safetyTipsExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <ol className="space-y-3 px-6 pb-6 pt-2">
                  {safetyTips.map((tip, index) => (
                    <li key={index} className="flex gap-3 text-sm text-destructive/80">
                      <span className="font-semibold text-destructive flex-shrink-0">{index + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Posted by info Card - Only visible for admin posts */}
        {property.isAdminPost && (
          <div className="bg-secondary rounded-2xl p-6 border border-border flex items-center gap-4">
            <Image
              src={property.agent.avatar}
              alt={property.agent.name}
              width={56}
              height={56}
              className="rounded-full"
            />
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Posted by</h3>
              <p className="font-semibold">{property.agent.name}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {property.type === 'connect' 
                  ? (property.connectRole === 'Landlord' ? 'Landlord' : 'Individual')
                  : property.agent.type}
              </p>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={handleInterested}
          className="w-full h-14 rounded-xl font-semibold text-base"
        >
          {existingChatId ? 'Open Conversation' : 'Connect'}
        </Button>
      </div>

      {/* Fullscreen image/video modal */}
      {showFullScreen && mediaItems.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setShowFullScreen(false)}
        >
          <button
            onClick={() => setShowFullScreen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            {isVideoItem(mediaItems[currentImageIndex]) ? (
              <video
                src={mediaItems[currentImageIndex]}
                className="max-w-full max-h-full object-contain"
                controls
                loop
                playsInline
                poster={property.images[0] || ''}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Image
                src={mediaItems[currentImageIndex]}
                alt={property.title}
                fill
                className="object-contain"
                unoptimized
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevImage() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNextImage() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
            {currentImageIndex + 1} / {mediaItems.length}
          </div>
        </div>
      )}

      <BottomNav />

      {/* Suggested Apartments */}
      <div className="px-4 pb-8">
        <SuggestedApartments apartments={[]} currentPropertyId={id} />
      </div>

      {/* Connect Cost Modal */}
      <ConnectCostModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConfirm={handleConnectConfirm}
        propertyTitle={property.title}
        propertyId={property.id}
        isFreeConnect={property.isFreeConnect}
      />
    </div>
  )
}
