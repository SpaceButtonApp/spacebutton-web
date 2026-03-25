'use client'

import { useState, use } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Bookmark, ChevronLeft, ChevronRight, Bed, Bath, 
  Sofa, MapPin, Calendar, AlertTriangle, Users, Building2
} from 'lucide-react'
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
        <Image
          src={property.images[currentImageIndex]}
          alt={property.title}
          fill
          className="object-cover cursor-pointer"
          onClick={() => setShowFullScreen(true)}
        />
        
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
        {/* Title & Price */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{property.title}</h1>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold text-primary">{formatPrice(property.price)}</span>
            {property.bonus && (
              <span className="text-sm text-success">{property.bonus}</span>
            )}
            {property.totalPackage && (
              <span className="text-sm text-primary font-medium">Total Package: ₦{property.totalPackage.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">{property.location}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm">
            <Users className="w-4 h-4" />
            <span>{property.type === 'connect' 
              ? (property.connectRole === 'Landlord' ? 'Landlord' : 'Tenant') 
              : 'Agent'}</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm">
            <Users className="w-4 h-4" />
            <span className="capitalize">{property.condition}</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm">
            <Building2 className="w-4 h-4" />
            <span className="capitalize">{property.category}</span>
          </div>
        </div>

        {/* Room details */}
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

        {/* Landlord Presence */}
        {property.landlordPresence && (
          <div>
            <h2 className="text-lg font-bold mb-3">Landlord Presence</h2>
            <p className="text-sm text-muted-foreground">
              {property.landlordPresence === 'stays' 
                ? 'Landlord stays in the compound' 
                : 'Landlord does not stay in the compound'}
            </p>
          </div>
        )}

        {/* Features */}
        <div>
          <h2 className="text-lg font-bold mb-3">Features</h2>
          <ul className="space-y-2">
            {property.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-bold mb-3">Description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Rent due date */}
        {property.rentDueDate && (
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

        {/* Agent info */}
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
            <p className="text-sm text-muted-foreground capitalize">{property.agent.type}</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleInterested}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
        >
          {user?.isPremium || (user?.connectsRemaining && user.connectsRemaining > 0) 
            ? 'Connect' 
            : 'Interested'
          }
        </Button>
      </div>

      {/* Fullscreen image modal */}
      {showFullScreen && (
        <div 
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setShowFullScreen(false)}
        >
          <button
            onClick={() => setShowFullScreen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <Image
            src={property.images[currentImageIndex]}
            alt={property.title}
            fill
            className="object-contain"
          />
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
            className="absolute left-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
            className="absolute right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
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
      />
    </div>
  )
}
