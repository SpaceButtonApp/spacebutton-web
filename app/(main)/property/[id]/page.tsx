'use client'

import { useState, use } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Bookmark, ChevronLeft, ChevronRight, Bed, Bath, 
  Sofa, MapPin, Calendar, AlertTriangle, Users, Building2, ArrowLeft, X, Clock,
  Home, DollarSign, Grid3X3, Maximize
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'
import { BackButton } from '@/components/back-button'
import { ConnectCostModal } from '@/components/connect-cost-modal'
import { SuggestedApartments } from '@/components/suggested-apartments'
import { useAppStore } from '@/lib/store'
import { formatPrice, safetyTips } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { savedProperties, toggleSaveProperty, user, connectsRemaining, deductConnect, properties } = useAppStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  
  const property = properties.find((p) => p.id === id)
  const isSaved = savedProperties.includes(id)
  
  // Check if this is a Properties listing type
  const isPropertyType = property?.type === 'properties' || property?.listingType === 'properties'
  
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Property not found</p>
      </div>
    )
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    )
  }

  const handleInterested = () => {
    setShowConnectModal(true)
  }

  const handleConnectConfirm = () => {
    if (connectsRemaining > 0) {
      deductConnect()
      setShowConnectModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 flex items-center justify-between">
        <BackButton 
          fallbackUrl="/home"
          className="bg-background/80 backdrop-blur-sm"
        />
        
        <button 
          onClick={() => toggleSaveProperty(id)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm"
        >
          <Bookmark className={cn('w-5 h-5', isSaved && 'fill-primary text-primary')} />
        </button>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-[4/3]">
        {property.images[currentImageIndex]?.startsWith('data:video') ? (
          <video 
            src={property.images[currentImageIndex]} 
            className="w-full h-full object-cover cursor-pointer"
            muted
            autoPlay
            loop
            playsInline
            onClick={() => setShowFullScreen(true)}
          />
        ) : (
          <Image
            src={property.images[currentImageIndex]}
            alt={property.title}
            fill
            className="object-cover cursor-pointer"
            onClick={() => setShowFullScreen(true)}
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

        {/* Image indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1">
          {property.images.map((_, index) => (
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
      <div className="px-4 py-6 space-y-6">
        {/* Date Posted - Just below photos */}
        {property.createdAt && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Posted {formatDistanceToNow(new Date(property.createdAt), { addSuffix: true })}</span>
          </div>
        )}

        {/* Title & Price */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{property.title}</h1>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold text-primary">{formatPrice(property.price, property.rentPeriod)}</span>
            {property.bonus && (
              <span className="text-sm text-success">{property.bonus}</span>
            )}
            {property.totalPackage && !isPropertyType && (
              <span className="text-sm text-primary font-medium">Total Package: ₦{property.totalPackage.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">{property.location}</span>
          </div>
        </div>

        {/* Tags - Different for Property type */}
        {isPropertyType ? (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <Home className="w-4 h-4" />
              <span className="capitalize">{property.propertyCategory || property.category}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <DollarSign className="w-4 h-4" />
              <span className="capitalize">{property.propertyType || 'Sale'}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <Grid3X3 className="w-4 h-4" />
              <span className="capitalize">{property.locationCategory || 'Estate'}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <Maximize className="w-4 h-4" />
              <span>{property.propertySize?.toLocaleString() || '0'} sqft</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <Users className="w-4 h-4" />
              <span>{property.type === 'connect' 
                ? (property.connectRole === 'Landlord' ? 'Landlord' : 'Individual') 
                : 'Agent'}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <Users className="w-4 h-4" />
              <span className="capitalize">
                {property.condition === 'rent' && property.connectRole === 'Tenant' 
                  ? 'Vacating' 
                  : property.condition}
              </span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <Building2 className="w-4 h-4" />
              <span className="capitalize">{property.category}</span>
            </div>
          </div>
        )}

        {/* Property Size for Property type */}
        {isPropertyType && property.propertySize && (
          <div>
            <h2 className="text-lg font-bold mb-3">Property Size</h2>
            <p className="text-sm text-muted-foreground">
              {property.propertySize.toLocaleString()} sqft
            </p>
          </div>
        )}

        {/* Building Year for Property type (House only) */}
        {isPropertyType && property.buildingYear && (
          <div>
            <h2 className="text-lg font-bold mb-3">Building Year</h2>
            <p className="text-sm text-muted-foreground">
              {property.buildingYear}
            </p>
          </div>
        )}

        {/* Room details - Show for Connect/Agent or Property type with House category */}
        {(!isPropertyType || (isPropertyType && (property.propertyCategory === 'house' || property.category === 'house'))) && property.beds > 0 && (
          <div className="flex items-center justify-start gap-4 flex-wrap">
            <div className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl bg-secondary">
              <Bed className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium">{property.beds} Beds</span>
            </div>
            <div className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl bg-secondary">
              <Bath className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium">{property.baths} Bath</span>
            </div>
            <div className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl bg-secondary">
              <Sofa className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium">{property.reception} reception</span>
            </div>
            {property.balconies && property.balconies > 0 && (
              <div className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl bg-secondary">
                <Building2 className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm font-medium">{property.balconies} Balcony</span>
              </div>
            )}
          </div>
        )}

        {/* Gender Needed - Only for Connect/Agent */}
        {!isPropertyType && property.genderNeeded && (
          <div>
            <h2 className="text-lg font-bold mb-3">Gender Needed</h2>
            <p className="text-sm text-muted-foreground capitalize">
              {property.genderNeeded}
            </p>
          </div>
        )}

        {/* Landlord Presence - Only for Connect/Agent */}
        {!isPropertyType && property.landlordPresence && (
          <div>
            <h2 className="text-lg font-bold mb-3">Landlord Presence</h2>
            <p className="text-sm text-muted-foreground">
              {property.landlordPresence === 'stays' 
                ? 'Landlord stays in the compound' 
                : 'Landlord does not stay in the compound'}
            </p>
          </div>
        )}

        {/* Location Category for Property type */}
        {isPropertyType && property.locationCategory && (
          <div>
            <h2 className="text-lg font-bold mb-3">Location Category</h2>
            <p className="text-sm text-muted-foreground capitalize">
              {property.locationCategory}
            </p>
          </div>
        )}

        {/* Features / Environment / Facilities */}
        {property.features && property.features.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-3">{isPropertyType ? 'Environment / Facilities' : 'Features'}</h2>
            <ul className="space-y-2">
              {property.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Description */}
        <div>
          <h2 className="text-lg font-bold mb-3">{isPropertyType ? 'Additional Description' : 'Description'}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Rent due date - Only for Connect/Agent */}
        {!isPropertyType && property.rentDueDate && (
          <div>
            <h2 className="text-lg font-bold mb-3">Current rent due date</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{new Date(property.rentDueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        )}

        {/* Safety Tips - Hidden for admin posts */}
        {!property.isAdminPost && (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-destructive">
              Safety Tips <AlertTriangle className="w-5 h-5 text-destructive" />
            </h2>
            <ol className="space-y-3">
              {safetyTips.map((tip, index) => (
                <li key={index} className="flex gap-2 text-sm text-destructive/80">
                  <span className="font-semibold text-destructive">{index + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Posted by info - Only visible for admin posts */}
        {property.isAdminPost && (
          <div className="flex items-center gap-3">
            <Image
              src={property.agent.avatar}
              alt={property.agent.name}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
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
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
        >
          {property.isFreeConnect ? 'Connect' : (user?.isPremium || (user?.connectsRemaining && user.connectsRemaining > 0) 
            ? 'Connect' 
            : 'Interested')
          }
        </Button>
      </div>

      {/* Fullscreen image/video modal */}
      {showFullScreen && property.images && property.images.length > 0 && (
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
            {property.images[currentImageIndex]?.startsWith('data:video') ? (
              <video
                src={property.images[currentImageIndex]}
                className="max-w-full max-h-full object-contain"
                autoPlay
                loop
                muted
                playsInline
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Image
                src={property.images[currentImageIndex]}
                alt={property.title}
                fill
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
          {property.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        </div>
      )}

      <BottomNav />

      {/* Suggested Apartments */}
      <div className="px-4 pb-8">
        <SuggestedApartments apartments={properties} currentPropertyId={id} />
      </div>

      {/* Connect Cost Modal */}
      <ConnectCostModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConfirm={handleConnectConfirm}
        propertyTitle={property.title}
        agentId={property.agent.id}
        propertyId={property.id}
        isFreeConnect={property.isFreeConnect}
      />
    </div>
  )
}
