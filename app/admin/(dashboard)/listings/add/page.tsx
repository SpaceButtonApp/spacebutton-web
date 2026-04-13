'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'
import { ChevronDown, MapPin, X, Plus, ArrowLeft, Home, DollarSign, Grid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LocationInput } from '@/components/location-input'
import Image from 'next/image'

const listingConditionsLandlord = ['Rent', 'Roommate', 'Flatmate']
const listingConditionsTenant = ['Vacating', 'Roommate', 'Flatmate']
const genderOptions = ['Male', 'Female', 'Both']
const propertyCategories = ['Flat', 'Self Con', 'Duplex', 'Storey', 'Penthouse']
const facilities = ['Parking Lot', 'Gym', 'Security', 'Garden', 'Estate', "Kid's Friendly", 'Home theatre', 'Other']

// Property-specific options
const propertyTypes = ['Sale', 'Lease']
const propertyCategoriesForProperty = ['Land', 'House']
const locationCategories = ['Open', 'Estate']

export default function AdminAddPostPage() {
  const router = useRouter()
  const { addProperty } = useAppStore()
  
  const [listingType, setListingType] = useState<'Connect' | 'Agent' | 'Property'>('Connect')
  const [connectRole, setConnectRole] = useState<'Tenant' | 'Landlord'>('Landlord')
  const [listingTitle, setListingTitle] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('Rent')
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | 'Both'>('Both')
  const [selectedCategory, setSelectedCategory] = useState('Flat')
  const [descriptions, setDescriptions] = useState('')
  const [location, setLocation] = useState({
    country: 'Nigeria',
    state: '',
    lga: '',
    nearestBusStop: '',
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [rentPrice, setRentPrice] = useState('')
  const [rentPeriod, setRentPeriod] = useState<'monthly' | 'yearly'>('yearly')
  const [showRentPeriodDropdown, setShowRentPeriodDropdown] = useState(false)
  const [totalPackage, setTotalPackage] = useState('')
  const [bedrooms, setBedrooms] = useState(3)
  const [bathrooms, setBathrooms] = useState(2)
  const [sittingRooms, setSittingRooms] = useState(2)
  const [balconies, setBalconies] = useState(1)
  const [landlordPresence, setLandlordPresence] = useState<'stays' | 'not-stays'>('not-stays')
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  
  // Property-specific state
  const [propertyTypeSelected, setPropertyTypeSelected] = useState<'Sale' | 'Lease'>('Sale')
  const [propertyCategorySelected, setPropertyCategorySelected] = useState<'Land' | 'House'>('Land')
  const [locationCategorySelected, setLocationCategorySelected] = useState<'Open' | 'Estate'>('Open')
  const [propertySize, setPropertySize] = useState('')
  const [buildingYear, setBuildingYear] = useState('')

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    )
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotos((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const validateForm = () => {
    if (!listingTitle.trim()) {
      setValidationMessage('Please enter a property title')
      setShowValidationModal(true)
      return false
    }
    
    if (!location.state?.trim()) {
      setValidationMessage('Please enter the state')
      setShowValidationModal(true)
      return false
    }
    if (!location.lga?.trim()) {
      setValidationMessage('Please enter the LGA')
      setShowValidationModal(true)
      return false
    }
    if (!location.nearestBusStop?.trim()) {
      setValidationMessage('Please enter the nearest bus stop')
      setShowValidationModal(true)
      return false
    }
    
    if (photos.length < 3) {
      setValidationMessage('Please add at least 3 photos/videos of the property')
      setShowValidationModal(true)
      return false
    }
    
    if (photos.length > 5) {
      setValidationMessage('Maximum 5 photos/videos allowed')
      setShowValidationModal(true)
      return false
    }
    
    const hasVideo = photos.some(p => p.startsWith('data:video'))
    if (!hasVideo) {
      setValidationMessage('Please upload at least one video of the property')
      setShowValidationModal(true)
      return false
    }
    
    if (!rentPrice || parseInt(rentPrice.replace(/,/g, '')) <= 0) {
      setValidationMessage('Please enter a valid property price')
      setShowValidationModal(true)
      return false
    }
    
    // Property-specific validations
    if (listingType === 'Property') {
      if (!propertySize || parseInt(propertySize.replace(/,/g, '')) <= 0) {
        setValidationMessage('Please enter a valid property size')
        setShowValidationModal(true)
        return false
      }
      
      if (propertyCategorySelected === 'House') {
        if (bedrooms <= 0) {
          setValidationMessage('Please specify at least one bedroom')
          setShowValidationModal(true)
          return false
        }
        
        if (bathrooms <= 0) {
          setValidationMessage('Please specify at least one bathroom')
          setShowValidationModal(true)
          return false
        }
        
        if (!buildingYear || parseInt(buildingYear) <= 1900 || parseInt(buildingYear) > new Date().getFullYear()) {
          setValidationMessage('Please enter a valid building year')
          setShowValidationModal(true)
          return false
        }
      }
      
      if (selectedFacilities.length === 0) {
        setValidationMessage('Please select at least one facility/environment feature')
        setShowValidationModal(true)
        return false
      }
      
      return true
    }
    
    // Connect/Agent validations
    if (bedrooms <= 0) {
      setValidationMessage('Please specify at least one bedroom')
      setShowValidationModal(true)
      return false
    }
    
    if (bathrooms <= 0) {
      setValidationMessage('Please specify at least one bathroom')
      setShowValidationModal(true)
      return false
    }
    
    if (selectedFacilities.length === 0) {
      setValidationMessage('Please select at least one facility/environment feature')
      setShowValidationModal(true)
      return false
    }
    
    if (!totalPackage || parseInt(totalPackage.replace(/,/g, '')) <= 0) {
      setValidationMessage('Please enter the total package amount')
      setShowValidationModal(true)
      return false
    }
    
    // Total package must be >= rent price
    const rentAmount = parseInt(rentPrice.replace(/,/g, '') || '0')
    const packageAmount = parseInt(totalPackage.replace(/,/g, '') || '0')
    if (packageAmount < rentAmount) {
      setValidationMessage('Total package must be equal to or greater than the rent price')
      setShowValidationModal(true)
      return false
    }
    
    return true
  }

  const handleFinishClick = () => {
    if (validateForm()) {
      setShowReviewModal(true)
    }
  }

  const handlePublish = () => {
    const propertyTypeValue = listingType.toLowerCase() as 'connect' | 'agent' | 'properties'
    const propertyCondition = selectedCondition.toLowerCase() as 'rent' | 'roommate' | 'flatmate'
    
    // Build the property object based on listing type
    const newProperty: Record<string, unknown> = {
      id: `admin-${Date.now()}`,
      title: listingTitle,
      location: `${location.nearestBusStop}, ${location.lga}, ${location.state}`,
      price: parseInt(rentPrice.replace(/,/g, '') || '0'),
      images: photos,
      // Admin posts show SpaceButton as the poster
      agent: {
        id: 'admin',
        name: 'SpaceButton',
        phone: '',
        email: 'support@spacebutton.com',
        avatar: logoUrl,
        verified: true,
        isVerified: true,
        properties: 0,
        sold: 0,
        rating: 5.0,
        reviews: 0,
        type: 'admin' as const,
        listings: 0,
        closed: 0,
        online: true,
      },
      ownerId: 'admin',
      verified: true,
      isVerified: true,
      isAdminPost: true,
      isFeatured: true,
      saved: false,
      photoCount: photos.length,
      createdAt: new Date().toISOString(),
    }
    
    if (listingType === 'Property') {
      // Property-specific fields
      Object.assign(newProperty, {
        type: 'properties',
        listingType: 'properties',
        propertyType: propertyTypeSelected.toLowerCase() as 'sale' | 'lease',
        propertyCategory: propertyCategorySelected.toLowerCase() as 'land' | 'house',
        category: propertyCategorySelected.toLowerCase() as 'land' | 'house',
        locationCategory: locationCategorySelected.toLowerCase() as 'open' | 'estate',
        propertySize: parseInt(propertySize.replace(/,/g, '') || '0'),
        condition: propertyTypeSelected.toLowerCase() === 'sale' ? 'rent' : 'rent', // Default condition
        description: descriptions || `Beautiful ${propertyCategorySelected.toLowerCase()} available for ${propertyTypeSelected.toLowerCase()}.`,
        amenities: selectedFacilities,
        features: selectedFacilities,
        isFreeConnect: true,
        // Only include house-specific fields if category is House
        ...(propertyCategorySelected === 'House' ? {
          beds: bedrooms,
          baths: bathrooms,
          reception: sittingRooms,
          balconies: balconies,
          buildingYear: parseInt(buildingYear || '0'),
          bedrooms,
          bathrooms,
        } : {
          beds: 0,
          baths: 0,
          reception: 0,
          balconies: 0,
        }),
      })
    } else {
      // Connect/Agent fields
      Object.assign(newProperty, {
        rentPeriod: rentPeriod,
        type: propertyTypeValue,
        listingType: propertyTypeValue,
        condition: propertyCondition,
        category: selectedCategory.toLowerCase() as 'flat' | 'self-con' | 'duplex' | 'storey' | 'penthouse',
        bedrooms,
        bathrooms,
        beds: bedrooms,
        baths: bathrooms,
        reception: sittingRooms,
        balconies: balconies,
        size: bedrooms * 400,
        rating: 5.0,
        reviews: 0,
        description: descriptions || `Beautiful ${bedrooms} bedroom ${selectedCategory.toLowerCase()} available for ${selectedCondition.toLowerCase()}.`,
        amenities: selectedFacilities,
        features: selectedFacilities,
        isFreeConnect: false,
        totalPackage: parseInt(totalPackage.replace(/,/g, '') || '0'),
        landlordPresence: landlordPresence,
        connectRole: listingType === 'Connect' ? connectRole : undefined,
        genderNeeded: selectedGender.toLowerCase() as 'male' | 'female' | 'both',
      })
    }
    
    addProperty(newProperty as any)
    router.push('/admin/listings')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <AdminHeader title="Add New Listing" />
      
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to listings</span>
        </button>

        {/* Listing Type */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
          <h3 className="font-medium text-white mb-3">Listing Type</h3>
          <div className="flex flex-wrap gap-3">
            {['Connect', 'Agent', 'Property'].map((type) => (
              <button
                key={type}
                onClick={() => setListingType(type as 'Connect' | 'Agent' | 'Property')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  listingType === type
                    ? 'bg-[#703BF7] text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {listingType === 'Property' && (
            <p className="mt-3 text-sm text-green-400">Property listings are free to connect - no connect required for users to chat.</p>
          )}
        </div>

        {/* CONNECT/AGENT FORM */}
        {listingType !== 'Property' && (
          <>
            {/* I am section - Only visible for Connect listing type */}
            {listingType === 'Connect' && (
              <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                <h3 className="font-medium text-white mb-3">I am a</h3>
                <div className="flex gap-3">
                  {['Tenant', 'Landlord'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setConnectRole(role as 'Tenant' | 'Landlord')}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                        connectRole === role
                          ? 'bg-[#703BF7] text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 space-y-5">
              <div>
                <h3 className="font-medium text-white mb-3">Listing Title</h3>
                <Input
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  placeholder="Two Bedroom Flat"
                  className="h-12 bg-[#1a1a24] border-gray-800 text-white rounded-xl"
                />
              </div>

              <div>
                <h3 className="font-medium text-white mb-3">Listing Condition</h3>
                <div className="flex flex-wrap gap-3">
                  {(listingType === 'Connect' && connectRole === 'Tenant' ? listingConditionsTenant : listingConditionsLandlord).map((condition) => (
                    <button
                      key={condition}
                      onClick={() => setSelectedCondition(condition)}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCondition === condition
                          ? 'bg-[#703BF7] text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-white mb-3">Property Category</h3>
                <div className="flex flex-wrap gap-3">
                  {propertyCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#703BF7] text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <LocationInput value={location} onChange={setLocation} />
            </div>

            {/* Photos & Videos */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Listing Photos & Videos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    {photo.startsWith('data:video') ? (
                      <video src={photo} className="w-full h-full object-cover" muted />
                    ) : (
                      <Image src={photo} alt="" fill className="object-cover" />
                    )}
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {photo.startsWith('data:video') && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">Video</div>
                    )}
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*,video/*'
                    input.multiple = true
                    input.onchange = (e) => handlePhotoUpload(e as any)
                    input.click()
                  }}
                  className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center hover:bg-gray-800/50 transition-colors"
                >
                  <Plus className="w-8 h-8 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 space-y-5">
              <div>
                <h3 className="font-medium text-white mb-3">Rent Price</h3>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={rentPrice}
                      onChange={(e) => setRentPrice(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="1500000"
                      className="h-12 bg-[#1a1a24] border-gray-800 text-white rounded-xl pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">NGN</span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowRentPeriodDropdown(!showRentPeriodDropdown)}
                      className="h-12 px-4 rounded-xl bg-[#1a1a24] border border-gray-800 flex items-center gap-2 min-w-[120px] justify-between text-white"
                    >
                      <span className="text-sm capitalize">{rentPeriod}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showRentPeriodDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showRentPeriodDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a24] border border-gray-800 rounded-xl overflow-hidden z-10 shadow-lg">
                        {(['monthly', 'yearly'] as const).map((period) => (
                          <button
                            key={period}
                            onClick={() => {
                              setRentPeriod(period)
                              setShowRentPeriodDropdown(false)
                            }}
                            className={`w-full px-4 py-3 text-left text-sm capitalize hover:bg-gray-800 transition-colors ${
                              rentPeriod === period ? 'bg-[#703BF7]/20 text-[#703BF7]' : 'text-white'
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-white mb-3">Total Package</h3>
                <div className="relative">
                  <Input
                    value={totalPackage}
                    onChange={(e) => setTotalPackage(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter total package amount"
                    className="h-12 bg-[#1a1a24] border-gray-800 text-white rounded-xl pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">NGN</span>
                </div>
              </div>
            </div>

            {/* Property Features */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Property Features</h3>
              <div className="space-y-3">
                {[
                  { label: 'Bedroom', value: bedrooms, setValue: setBedrooms },
                  { label: 'Bathroom', value: bathrooms, setValue: setBathrooms },
                  { label: 'Sitting Room', value: sittingRooms, setValue: setSittingRooms },
                  { label: 'Balcony', value: balconies, setValue: setBalconies },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-xl"
                  >
                    <span className="text-white">{feature.label}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => feature.setValue(Math.max(0, feature.value - 1))}
                        className="w-8 h-8 rounded-lg bg-gray-800 text-[#703BF7] flex items-center justify-center hover:bg-gray-700 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-white">{feature.value}</span>
                      <button
                        onClick={() => feature.setValue(feature.value + 1)}
                        className="w-8 h-8 rounded-lg bg-[#703BF7] text-white flex items-center justify-center hover:bg-[#5f32d4] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender Needed */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Gender Needed</h3>
              <div className="flex flex-wrap gap-3">
                {genderOptions.map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSelectedGender(gender as 'Male' | 'Female' | 'Both')}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                      selectedGender === gender
                        ? 'bg-[#703BF7] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            {/* Landlord Presence */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Landlord Presence</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={landlordPresence === 'stays'}
                    onChange={() => setLandlordPresence('stays')}
                    className="w-5 h-5 rounded border-gray-700 accent-[#703BF7]"
                  />
                  <span className="text-sm text-gray-300">Landlord Stays in the Compound</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={landlordPresence === 'not-stays'}
                    onChange={() => setLandlordPresence('not-stays')}
                    className="w-5 h-5 rounded border-gray-700 accent-[#703BF7]"
                  />
                  <span className="text-sm text-gray-300">Landlord Does not stay in the Compound</span>
                </label>
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Environment / Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {facilities.map((facility) => (
                  <button
                    key={facility}
                    onClick={() => toggleFacility(facility)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFacilities.includes(facility)
                        ? 'bg-[#703BF7] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {facility}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Additional Description</h3>
              <textarea
                value={descriptions}
                onChange={(e) => setDescriptions(e.target.value)}
                placeholder="Write other descriptions if available..."
                className="w-full h-32 px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50 resize-none"
              />
            </div>
          </>
        )}

        {/* PROPERTY FORM */}
        {listingType === 'Property' && (
          <>
            {/* Property Title */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Property Title</h3>
              <div className="relative">
                <Input
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  placeholder="Enter Title"
                  className="h-12 bg-[#1a1a24] border-gray-800 text-white rounded-xl pr-12"
                />
                <Home className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              </div>
            </div>

            {/* Property Type */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Property Type</h3>
              <div className="flex flex-wrap gap-3">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setPropertyTypeSelected(type as 'Sale' | 'Lease')}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                      propertyTypeSelected === type
                        ? 'bg-[#703BF7] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Category */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Property Category</h3>
              <div className="flex flex-wrap gap-3">
                {propertyCategoriesForProperty.map((category) => (
                  <button
                    key={category}
                    onClick={() => setPropertyCategorySelected(category as 'Land' | 'House')}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                      propertyCategorySelected === category
                        ? 'bg-[#703BF7] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Category */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Location Category</h3>
              <div className="flex flex-wrap gap-3">
                {locationCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setLocationCategorySelected(category as 'Open' | 'Estate')}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                      locationCategorySelected === category
                        ? 'bg-[#703BF7] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <LocationInput value={location} onChange={setLocation} />
            </div>

            {/* Photos & Videos */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Property Photos and Videos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    {photo.startsWith('data:video') ? (
                      <video src={photo} className="w-full h-full object-cover" muted />
                    ) : (
                      <Image src={photo} alt="" fill className="object-cover" />
                    )}
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {photo.startsWith('data:video') && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">Video</div>
                    )}
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*,video/*'
                    input.multiple = true
                    input.onchange = (e) => handlePhotoUpload(e as any)
                    input.click()
                  }}
                  className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center hover:bg-gray-800/50 transition-colors gap-2"
                >
                  <Plus className="w-8 h-8 text-gray-500" />
                  <span className="text-xs text-gray-500">photos/videos</span>
                </button>
              </div>
            </div>

            {/* Property Size */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Property Size</h3>
              <div className="relative">
                <Input
                  value={propertySize}
                  onChange={(e) => setPropertySize(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter property size"
                  className="h-12 bg-[#1a1a24] border-gray-800 text-white rounded-xl pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">sqft</span>
              </div>
            </div>

            {/* Property Price */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Property Price</h3>
              <div className="relative">
                <Input
                  value={rentPrice}
                  onChange={(e) => setRentPrice(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter property price"
                  className="h-12 bg-[#1a1a24] border-gray-800 text-white rounded-xl pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">NGN</span>
              </div>
            </div>

            {/* Building Year - Only visible when House is selected */}
            {propertyCategorySelected === 'House' && (
              <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                <h3 className="font-medium text-white mb-3">Building Year</h3>
                <Input
                  value={buildingYear}
                  onChange={(e) => setBuildingYear(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 2020"
                  className="h-12 bg-[#1a1a24] border-gray-800 text-white rounded-xl"
                  maxLength={4}
                />
              </div>
            )}

            {/* Property Features - Only visible when House is selected */}
            {propertyCategorySelected === 'House' && (
              <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                <h3 className="font-medium text-white mb-3">Property Features</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Bedroom', value: bedrooms, setValue: setBedrooms },
                    { label: 'Bathroom', value: bathrooms, setValue: setBathrooms },
                    { label: 'Sitting Room', value: sittingRooms, setValue: setSittingRooms },
                    { label: 'Balcony', value: balconies, setValue: setBalconies },
                  ].map((feature) => (
                    <div
                      key={feature.label}
                      className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-xl"
                    >
                      <span className="text-white">{feature.label}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => feature.setValue(Math.max(0, feature.value - 1))}
                          className="w-8 h-8 rounded-lg bg-gray-800 text-[#703BF7] flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-white">{feature.value}</span>
                        <button
                          onClick={() => feature.setValue(feature.value + 1)}
                          className="w-8 h-8 rounded-lg bg-[#703BF7] text-white flex items-center justify-center hover:bg-[#5f32d4] transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Environment / Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {facilities.map((facility) => (
                  <button
                    key={facility}
                    onClick={() => toggleFacility(facility)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFacilities.includes(facility)
                        ? 'bg-[#703BF7] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {facility}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="font-medium text-white mb-3">Additional Description</h3>
              <textarea
                value={descriptions}
                onChange={(e) => setDescriptions(e.target.value)}
                placeholder="Write other descriptions if available..."
                className="w-full h-32 px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50 resize-none"
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleFinishClick}
          className="w-full h-14 text-base font-semibold bg-[#703BF7] hover:bg-[#5f32d4] text-white rounded-xl"
        >
          {listingType === 'Property' ? 'Finish' : 'Publish Listing'}
        </Button>
      </div>

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#12121a] border border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-2 text-red-400">Incomplete Details</h2>
            <p className="text-gray-400 mb-6">{validationMessage}</p>
            <Button
              onClick={() => setShowValidationModal(false)}
              className="w-full h-12 rounded-xl bg-[#703BF7] hover:bg-[#5f32d4]"
            >
              Okay
            </Button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#12121a] border border-gray-800 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 w-20 h-20 rounded-full bg-[#703BF7]/20 flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt="SpaceButton"
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
              </div>
              
              <h2 className="mb-1 text-xl text-white">Ready to Publish</h2>
              <p className="mb-6 text-gray-400">
                This listing will be visible on the home page with a verified badge as an official SpaceButton listing.
              </p>

              <div className="flex w-full gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-700 bg-transparent text-white hover:bg-gray-800"
                  onClick={() => setShowReviewModal(false)}
                >
                  Edit
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-[#703BF7] hover:bg-[#5f32d4]"
                  onClick={handlePublish}
                >
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
