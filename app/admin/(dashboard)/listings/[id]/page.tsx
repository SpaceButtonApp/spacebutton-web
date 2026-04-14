'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Sofa, 
  MapPin, 
  CheckCircle, 
  XCircle,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  Calendar,
  Home,
  Fence,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'

export default function AdminPropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { properties, closedProperties } = useAppStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const propertyId = params.id as string
  const property = properties.find(p => p.id === propertyId)
  const isClosed = closedProperties.includes(propertyId)

  if (!property) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <AdminHeader title="Property Details" />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Property Not Found</h2>
            <p className="text-gray-400 mb-4">The property you are looking for does not exist.</p>
            <Button 
              onClick={() => router.push('/admin/listings')}
              className="bg-[#703BF7] hover:bg-[#5f32d4]"
            >
              Back to Listings
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleMessageOwner = () => {
    // Navigate to messages page with the property owner's chat
    // Using the property agent's ID to start a chat (like user chat does)
    const agentId = property.agent?.id || property.ownerId || '1'
    router.push(`/chat/${agentId}?propertyId=${property.id}`)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <AdminHeader title="Property Details" />
      
      <div className="p-6 max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to listings</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image/Video */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-800">
              {property.images.length > 0 && (
                <>
                  {property.images[currentImageIndex]?.startsWith('data:video') ? (
                    <video
                      src={property.images[currentImageIndex]}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <Image
                      src={property.images[currentImageIndex]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  
                  {/* Navigation Arrows */}
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                      isClosed ? 'bg-gray-900/90 text-gray-400' : 'bg-green-500/90 text-white'
                    }`}>
                      {isClosed ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      {isClosed ? 'Closed' : 'Active'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden ${
                      currentImageIndex === index 
                        ? 'ring-2 ring-[#703BF7]' 
                        : 'opacity-60 hover:opacity-100'
                    } transition-all`}
                  >
                    {image?.startsWith('data:video') ? (
                      <>
                        <video
                          src={image}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
                          Video
                        </div>
                      </>
                    ) : (
                      <Image
                        src={image}
                        alt={`${property.title} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium mb-2 ${
                    property.type === 'connect' 
                      ? 'bg-purple-500/20 text-purple-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {property.type === 'connect' ? 'Connect' : 'Agent'}
                  </span>
                  <h1 className="text-2xl font-bold text-white">{property.title}</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-gray-400 mb-4">
                <MapPin className="w-4 h-4 text-[#703BF7]" />
                <span>{property.location}</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#703BF7]">
                  N{property.price?.toLocaleString()}
                </span>
                {property.rentPeriod && (
                  <span className="text-gray-400">
                    /{property.rentPeriod === 'monthly' ? 'month' : 'year'}
                  </span>
                )}
              </div>

              {property.totalPackage && (
                <p className="text-gray-400 mt-2">
                  Total Package: <span className="text-white font-medium">N{property.totalPackage.toLocaleString()}</span>
                </p>
              )}
            </div>

            {/* Property Features */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4">Property Features</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-[#1a1a24] rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-[#703BF7]/10 flex items-center justify-center">
                    <Bed className="w-5 h-5 text-[#703BF7]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Bedrooms</p>
                    <p className="text-white font-medium">{property.beds || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#1a1a24] rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-[#703BF7]/10 flex items-center justify-center">
                    <Bath className="w-5 h-5 text-[#703BF7]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Bathrooms</p>
                    <p className="text-white font-medium">{property.baths || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#1a1a24] rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-[#703BF7]/10 flex items-center justify-center">
                    <Sofa className="w-5 h-5 text-[#703BF7]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Sitting Rooms</p>
                    <p className="text-white font-medium">{property.reception || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#1a1a24] rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-[#703BF7]/10 flex items-center justify-center">
                    <Fence className="w-5 h-5 text-[#703BF7]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Balconies</p>
                    <p className="text-white font-medium">{property.balconies || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4">Additional Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Building2 className="w-4 h-4" />
                    <span>Category</span>
                  </div>
                  <span className="text-white capitalize">{property.category}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>Condition</span>
                  </div>
                  <span className="text-white capitalize">{property.condition}</span>
                </div>
                {property.type === 'connect' && property.connectRole && (
                  <div className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>Posted By</span>
                    </div>
                    <span className="text-white">{property.connectRole}</span>
                  </div>
                )}
                {property.genderNeeded && (
                  <div className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>Gender Needed</span>
                    </div>
                    <span className="text-white capitalize">{property.genderNeeded}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Home className="w-4 h-4" />
                    <span>Landlord Presence</span>
                  </div>
                  <span className="text-white">
                    {property.landlordPresence === 'stays' ? 'Lives in compound' : 'Does not live in compound'}
                  </span>
                </div>
                {property.rentDueDate && (
                  <div className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Rent Due Date</span>
                    </div>
                    <span className="text-white">
                      {new Date(property.rentDueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {property.createdAt && (
                  <div className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Time Posted</span>
                    </div>
                    <span className="text-white">
                      {formatDistanceToNow(new Date(property.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Facilities */}
            {property.features && property.features.length > 0 && (
              <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-4">Facilities & Environment</h3>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-full bg-[#703BF7]/10 text-[#703BF7] text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-400 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Posted By Info */}
            {property.agent && (
              <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-4">Posted By</h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden">
                    <Image
                      src={property.agent.avatar}
                      alt={property.agent.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium text-lg">{property.agent.name}</p>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${
                      property.agent.type === 'agent' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : property.agent.type === 'admin'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {property.agent.type === 'admin' ? 'Admin' : property.agent.type === 'agent' ? 'Agent' : 'Individual'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Message Button */}
            <Button
              onClick={handleMessageOwner}
              className="w-full h-14 bg-[#703BF7] hover:bg-[#5f32d4] text-white rounded-xl text-base font-semibold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Message Owner
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
