"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronDown, X, Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LocationInput } from "@/components/location-input"
import Image from "next/image"
import { useAppStore } from "@/lib/store"
import { listingsApi } from "@/lib/api/listings"
import type { ListingCategory, PropertyType } from "@/lib/types/listing"

const listingConditionsLandlord = ["Rent", "Roommate", "Flatmate"]
const listingConditionsTenant = ["Vacating", "Roommate", "Flatmate"]
const listingConditionsAgent = ["Vacating", "Rent", "Roommate", "Flatmate"]
const genderOptions = ["Male", "Female", "Both"]
const propertyCategories = ["Flat", "Self Con", "Duplex", "Storey", "Penthouse"]
const facilities = ["Parking Lot", "Pet Allowed", "Park", "Garden", "Estate", "Kid's Friendly", "Home theatre", "Other"]

export default function AddPostPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const isAgent = user?.type === 'agent'
  const [listingType, setListingType] = useState<"Connect" | "Agent">(isAgent ? "Agent" : "Connect")
  const [connectRole, setConnectRole] = useState<"Tenant" | "Landlord">("Tenant")
  const [listingTitle, setListingTitle] = useState("")
  
  // Auto-select first condition based on type
  const getDefaultCondition = () => {
    if (isAgent) return listingConditionsAgent[0]
    return connectRole === "Tenant" ? listingConditionsTenant[0] : listingConditionsLandlord[0]
  }
  
  const [selectedCondition, setSelectedCondition] = useState(getDefaultCondition())
  const [selectedGender, setSelectedGender] = useState<"Male" | "Female" | "Both">("Both")
  const [selectedCategory, setSelectedCategory] = useState("Flat")
  const [descriptions, setDescriptions] = useState("")
  const [location, setLocation] = useState({
    country: "Nigeria",
    state: "",
    lga: "",
    nearestBusStop: "",
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [rentPrice, setRentPrice] = useState("")
  const [rentPeriod, setRentPeriod] = useState<'monthly' | 'yearly'>('yearly')
  const [showRentPeriodDropdown, setShowRentPeriodDropdown] = useState(false)
  const [bedrooms, setBedrooms] = useState(3)
  const [bathrooms, setBathrooms] = useState(2)
  const [sittingRooms, setSittingRooms] = useState(2)
  const [balconies, setBalconies] = useState(2)
  const [landlordPresence, setLandlordPresence] = useState<"stays" | "not-stays">("stays")
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")
  const [totalPackage, setTotalPackage] = useState("")

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    )
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setMediaFiles((prev) => [...prev, ...files])
    setPhotos((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }

  const today = new Date()
  const minSelectableDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth()))

  const calculatedReward = Math.round(parseInt(rentPrice.replace(/,/g, '') || '0') * 0.05)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const validateForm = () => {
    if (!listingTitle.trim()) {
      setValidationMessage("Please enter a listing title")
      setShowValidationModal(true)
      return false
    }
    
    if (!selectedCondition) {
      setValidationMessage("Please select a listing condition")
      setShowValidationModal(true)
      return false
    }
    
    if (!location.state.trim()) {
      setValidationMessage("Please enter the state")
      setShowValidationModal(true)
      return false
    }
    if (!location.lga.trim()) {
      setValidationMessage("Please enter the Local Government Area (LGA)")
      setShowValidationModal(true)
      return false
    }
    if (!location.nearestBusStop.trim()) {
      setValidationMessage("Please enter the nearest bus stop")
      setShowValidationModal(true)
      return false
    }
    
    if (photos.length < 3) {
      setValidationMessage("Please add at least 3 photos/videos of the property")
      setShowValidationModal(true)
      return false
    }
    
    if (photos.length > 5) {
      setValidationMessage("Maximum 5 photos/videos allowed")
      setShowValidationModal(true)
      return false
    }
    
    const hasVideo = mediaFiles.some(f => f.type.startsWith('video/'))
    if (!hasVideo) {
      setValidationMessage("Please upload at least one video of the property")
      setShowValidationModal(true)
      return false
    }
    
    if (!rentPrice || parseInt(rentPrice.replace(/,/g, '')) <= 0) {
      setValidationMessage("Please enter a valid rent price")
      setShowValidationModal(true)
      return false
    }
    
    if (bedrooms <= 0) {
      setValidationMessage("Please specify at least one bedroom")
      setShowValidationModal(true)
      return false
    }
    
    if (bathrooms <= 0) {
      setValidationMessage("Please specify at least one bathroom")
      setShowValidationModal(true)
      return false
    }
    
    if (selectedFacilities.length === 0) {
      setValidationMessage("Please select at least one facility/environment feature")
      setShowValidationModal(true)
      return false
    }
    
    if ((listingType === "Connect" && connectRole === "Tenant") || (listingType === "Agent" && selectedCondition === "Vacating")) {
      if (!selectedDate) {
        setValidationMessage("Please select the current rent due date")
        setShowValidationModal(true)
        return false
      }
    }
    
    if ((listingType === "Agent" || (listingType === "Connect" && connectRole === "Landlord")) && 
        (!totalPackage || parseInt(totalPackage.replace(/,/g, '')) <= 0)) {
      setValidationMessage("Please enter the total package amount")
      setShowValidationModal(true)
      return false
    }
    
    if ((listingType === "Agent" || (listingType === "Connect" && connectRole === "Landlord"))) {
      const rentAmount = parseInt(rentPrice.replace(/,/g, '') || '0')
      const packageAmount = parseInt(totalPackage.replace(/,/g, '') || '0')
      if (packageAmount < rentAmount) {
        setValidationMessage("Total package must be equal to or greater than the rent price")
        setShowValidationModal(true)
        return false
      }
    }
    
    return true
  }

  const handleFinishClick = () => {
    if (validateForm()) {
      setShowReviewModal(true)
    }
  }

  const logoUrl = '/icon.png'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 justify-center pr-8">
            <Image src={logoUrl} alt="SpaceButton" width={28} height={28} className="h-7 w-7" />
            <h1 className="text-lg font-semibold text-foreground">Add Apartment Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Listing Type - Only shown for agents */}
        {isAgent && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-medium text-foreground mb-3">Listing Type</h3>
            <div className="flex gap-3">
              <button
                className="px-6 py-2.5 rounded-full text-sm font-medium bg-primary text-primary-foreground"
              >
                Agent
              </button>
            </div>
          </div>
        )}

        {/* I am section - Only visible for individuals (Connect listing type) */}
        {!isAgent && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-medium text-foreground mb-3">I am</h3>
            <div className="flex gap-3">
              {["Tenant", "Landlord"].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setConnectRole(role as "Tenant" | "Landlord")
                    // Auto-select first condition for new role
                    const newCondition = role === "Tenant" ? listingConditionsTenant[0] : listingConditionsLandlord[0]
                    setSelectedCondition(newCondition)
                  }}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    connectRole === role
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <div>
            <h3 className="font-medium text-foreground mb-3">Listing Title</h3>
            <Input
              value={listingTitle}
              onChange={(e) => setListingTitle(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
              placeholder="Two Bedroom Flat"
              className="h-12 bg-secondary border-border text-foreground rounded-xl placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-3">Listing Condition</h3>
            <div className="flex flex-wrap gap-3">
              {(isAgent 
                ? listingConditionsAgent 
                : (listingType === "Connect" && connectRole === "Tenant" 
                  ? listingConditionsTenant 
                  : listingConditionsLandlord)
              ).map((condition) => (
                <button
                  key={condition}
                  onClick={() => setSelectedCondition(condition)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCondition === condition
                      ? "bg-primary text-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-3">Property Category</h3>
            <div className="flex flex-wrap gap-3">
              {propertyCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-card border border-border rounded-xl p-5">
          <LocationInput value={location} onChange={setLocation} />
        </div>

        {/* Photos & Videos */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-destructive font-medium">
              !! Don&apos;t upload content with watermarks (from any app) or added Text. Only raw content is accepted.
            </p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Listing Photos & Videos</h3>
            <span className="text-xs text-muted-foreground">{photos.length}/5 (min 3, at least 1 video)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                {mediaFiles[index]?.type.startsWith('video/') ? (
                  <video src={photo} className="w-full h-full object-cover" muted />
                ) : (
                  <Image src={photo} alt="" fill className="object-cover" unoptimized />
                )}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
                {mediaFiles[index]?.type.startsWith('video/') && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-foreground">
                    Video
                  </div>
                )}
              </div>
            ))}
            {photos.length < 5 && (
              <button 
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*,video/*'
                  input.multiple = true
                  input.onchange = (e) => handlePhotoUpload(e as any)
                  input.click()
                }}
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center hover:bg-gray-800/50 transition-colors"
              >
                <Plus className="w-8 h-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Photos/Videos</span>
              </button>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <div>
            <h3 className="font-medium text-foreground mb-3">Rent Price</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={rentPrice}
                  onChange={(e) => setRentPrice(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="1500000"
                  className="h-12 bg-secondary border-border text-foreground rounded-xl pr-12 placeholder:text-muted-foreground"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">NGN</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowRentPeriodDropdown(!showRentPeriodDropdown)}
                  className="h-12 px-4 rounded-xl bg-secondary border border-border flex items-center gap-2 min-w-[120px] justify-between text-foreground"
                >
                  <span className="text-sm capitalize">{rentPeriod}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showRentPeriodDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showRentPeriodDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-border rounded-xl overflow-hidden z-10 shadow-lg">
                    {(['monthly', 'yearly'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => {
                          setRentPeriod(period)
                          setShowRentPeriodDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left text-sm capitalize hover:bg-muted transition-colors ${
                          rentPeriod === period ? 'bg-primary/20 text-primary' : 'text-foreground'
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

          {/* Reward - Visible for Connect Tenant with Rent/Vacating OR Agent with Vacating */}
          {((listingType === "Connect" && connectRole === "Tenant" && (selectedCondition === "Rent" || selectedCondition === "Vacating")) || 
            (isAgent && selectedCondition === "Vacating")) && (
            <div>
              <h3 className="font-medium text-foreground mb-3">Reward (5% of Rent)</h3>
              <div className="relative">
                <Input
                  value={calculatedReward.toLocaleString()}
                  disabled
                  placeholder="0"
                  className="h-12 bg-primary/10 border-primary/30 text-primary rounded-xl pr-12 font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">NGN</span>
              </div>
            </div>
          )}

          {/* Total Package - Visible for Agent (except Vacating) OR Connect with Landlord role OR Connect with Tenant and Roommate/Flatmate */}
          {((listingType === "Agent" && selectedCondition !== "Vacating") || (listingType === "Connect" && connectRole === "Landlord") || (listingType === "Connect" && connectRole === "Tenant" && (selectedCondition === "Roommate" || selectedCondition === "Flatmate"))) && (
            <div>
              <h3 className="font-medium text-foreground mb-3">Total Package</h3>
              <div className="relative">
                <Input
                  value={totalPackage}
                  onChange={(e) => setTotalPackage(e.target.value.replace(/[^0-9,]/g, ''))}
                  placeholder="Enter total package amount"
                  className="h-12 bg-secondary border-border text-foreground rounded-xl pr-12 placeholder:text-muted-foreground"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">NGN</span>
              </div>
            </div>
          )}
        </div>

        {/* Property Features */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-medium text-foreground mb-4">Property Features</h3>
          <div className="space-y-3">
            {[
              { label: "Bedroom", value: bedrooms, setValue: setBedrooms },
              { label: "Bathroom", value: bathrooms, setValue: setBathrooms },
              { label: "Sitting Room", value: sittingRooms, setValue: setSittingRooms },
              { label: "Balcony", value: balconies, setValue: setBalconies },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center justify-between p-4 bg-secondary rounded-xl"
              >
                <span className="text-muted-foreground">{feature.label}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => feature.setValue(Math.max(0, feature.value - 1))}
                    className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-foreground font-medium">{feature.value}</span>
                  <button
                    onClick={() => feature.setValue(feature.value + 1)}
                    className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Select Rent Due Date - Visible for Connect Tenant OR Agent with Vacating */}
        {((listingType === "Connect" && connectRole === "Tenant") || (isAgent && selectedCondition === "Vacating")) && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-medium text-foreground mb-3">Select Current Rent Due Date</h3>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full flex items-center justify-between p-4 bg-secondary border border-border rounded-xl text-foreground"
            >
              <span className={selectedDate ? "text-foreground" : "text-muted-foreground"}>
                {selectedDate ? selectedDate.toLocaleDateString() : "Select Date"}
              </span>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showCalendar ? "rotate-180" : ""}`} />
            </button>
            {showCalendar && (
              <div className="mt-3 p-4 bg-secondary border border-border rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-medium text-foreground">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-2 text-primary text-xs font-medium">{day}</div>
                  ))}
                  {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                    const day = i + 1
                    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                    const isDisabled = dateToCheck < minSelectableDate
                    const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth() && selectedDate?.getFullYear() === currentMonth.getFullYear()
                    return (
                      <button
                        key={day}
                        disabled={isDisabled}
                        onClick={() => !isDisabled && setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                        className={`py-2 rounded-lg text-sm ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : isDisabled
                            ? "text-muted-foreground/50 cursor-not-allowed"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gender Needed */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-medium text-foreground mb-3">Gender Needed</h3>
          <div className="flex flex-wrap gap-3">
            {genderOptions.map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender as "Male" | "Female" | "Both")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  selectedGender === gender
                    ? "bg-primary text-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Landlord Presence */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-medium text-foreground mb-3">Landlord Presence</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-secondary rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={landlordPresence === "stays"}
                onChange={() => setLandlordPresence("stays")}
                className="w-5 h-5 rounded border-border bg-transparent accent-primary"
              />
              <span className="text-sm text-muted-foreground">Landlord Stays in the Compound</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-secondary rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={landlordPresence === "not-stays"}
                onChange={() => setLandlordPresence("not-stays")}
                className="w-5 h-5 rounded border-border bg-transparent accent-primary"
              />
              <span className="text-sm text-muted-foreground">Landlord Does not stay in the Compound</span>
            </label>
          </div>
        </div>

        {/* Environment / Facilities */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-medium text-foreground mb-3">Environment / Facilities</h3>
          <div className="flex flex-wrap gap-2">
            {facilities.map((facility) => (
              <button
                key={facility}
                onClick={() => toggleFacility(facility)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFacilities.includes(facility)
                    ? "bg-primary text-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {facility}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-medium text-foreground mb-3">Additional Description</h3>
          <textarea
            value={descriptions}
            onChange={(e) => setDescriptions(e.target.value)}
            placeholder="Write other descriptions if available"
            className="w-full px-4 py-3 bg-secondary border border-border text-foreground rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            rows={4}
          />
          {/* Disclaimer based on listing type */}
          {listingType === "Agent" && (
            <p className="mt-3 text-sm text-amber-500 bg-amber-500/10 p-3 rounded-lg">
              Agent must not collect inspection fee.
            </p>
          )}
          {listingType === "Connect" && connectRole === "Tenant" && selectedCondition === "Rent" && (
            <p className="mt-3 text-sm text-amber-500 bg-amber-500/10 p-3 rounded-lg">
              Individual must not request for more than 5% of the annual rent.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleFinishClick}
          className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-foreground rounded-xl"
        >
          Finish
        </Button>
      </div>

      {/* Validation Error Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6">
            <h2 className="text-lg font-semibold mb-2 text-red-400">Incomplete Details</h2>
            <p className="text-muted-foreground mb-6">{validationMessage}</p>
            <Button
              onClick={() => setShowValidationModal(false)}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-foreground"
            >
              Okay
            </Button>
          </div>
        </div>
      )}

      {/* Under Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70">
          <div className="w-full max-w-md rounded-t-3xl bg-card border-t border-border p-6 pb-8">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-700" />
            
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-[#703BF7]/30 to-[#703BF7]/60">
                <div className="h-16 w-16 rounded-full bg-primary" />
              </div>
              
              <h2 className="mb-1 text-2xl text-foreground">Your listing is now</h2>
              <h3 className="mb-4 text-2xl font-bold text-foreground">Under Review</h3>
              <p className="mb-6 text-muted-foreground">
                Your property will be visible on the home page shortly.
              </p>

              {submitError && (
                <p className="text-sm text-destructive text-center mb-2">{submitError}</p>
              )}

              <div className="flex w-full gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl bg-secondary border-border text-foreground hover:bg-secondary/80"
                  disabled={isSubmitting}
                  onClick={() => setShowReviewModal(false)}
                >
                  Edit Post
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-foreground disabled:opacity-60"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true)
                    setSubmitError('')
                    try {
                      const category: ListingCategory =
                        selectedCondition === 'Vacating' ? 'subletting' :
                        (selectedCondition === 'Roommate' || selectedCondition === 'Flatmate') ? 'need_roommate' :
                        'for_rent'

                      const property_type: PropertyType =
                        selectedCategory === 'Self Con' ? 'self_contain' :
                        (selectedCategory === 'Duplex' || selectedCategory === 'Storey') ? 'house' :
                        'apartment'

                      const listing = await listingsApi.createListing({
                        title: listingTitle,
                        description: descriptions || `Beautiful ${bedrooms} bedroom ${selectedCategory.toLowerCase()} available for ${selectedCondition.toLowerCase()}.`,
                        property_type,
                        category,
                        price: parseInt(rentPrice.replace(/,/g, '') || '0'),
                        state: location.state,
                        city: location.lga,
                        address: location.nearestBusStop,
                        bedrooms,
                        bathrooms,
                        rent_period: rentPeriod,
                        total_package: (listingType === 'Agent' || (listingType === 'Connect' && connectRole === 'Landlord'))
                          ? parseInt(totalPackage.replace(/,/g, '') || '0') : undefined,
                        rent_due_date: ((listingType === 'Connect' && connectRole === 'Tenant') || (isAgent && selectedCondition === 'Vacating')) && selectedDate
                          ? selectedDate.toISOString() : undefined,
                        gender_needed: selectedGender.toLowerCase(),
                        landlord_presence: landlordPresence,
                        balconies,
                        sitting_rooms: sittingRooms,
                        facilities: selectedFacilities.join(','),
                        connect_role: listingType === 'Connect' ? connectRole : undefined,
                      })

                      const imageFiles = mediaFiles.filter(f => !f.type.startsWith('video/'))
                      const videoFile = mediaFiles.find(f => f.type.startsWith('video/'))
                      if (imageFiles.length > 0) {
                        await listingsApi.uploadImages(listing.id, imageFiles)
                      }
                      if (videoFile) {
                        await listingsApi.uploadVideo(listing.id, videoFile)
                      }

                      router.push('/home')
                    } catch {
                      setSubmitError('Failed to submit. Please try again.')
                      setIsSubmitting(false)
                    }
                  }}
                >
                  {isSubmitting ? 'Submitting…' : 'Finish'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
