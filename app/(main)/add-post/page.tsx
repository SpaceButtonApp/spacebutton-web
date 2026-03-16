"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronDown, MapPin, X, Plus, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LocationInput } from "@/components/location-input"
import Image from "next/image"

const listingConditions = ["Rent", "Roommate", "Flatmate"]
const propertyCategories = ["Flat", "Self Con", "Duplex", "Storey", "Penthouse"]
const facilities = ["Parking Lot", "Pet Allowed", "Park", "Garden", "Estate", "Kid's Friendly", "Home theatre", "Other"]

export default function AddPostPage() {
  const router = useRouter()
  const [listingType, setListingType] = useState<"Connect" | "Agent">("Connect")
  const [listingTitle, setListingTitle] = useState("")
  const [selectedCondition, setSelectedCondition] = useState("Rent")
  const [selectedCategory, setSelectedCategory] = useState("Flat")
  const [descriptions, setDescriptions] = useState("")
  const [location, setLocation] = useState({
    community: "",
    lga: "",
    state: "",
    country: "",
  })
  const [photos, setPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=200&fit=crop",
  ])
  const [rentPrice, setRentPrice] = useState("1500000")
  const [bedrooms, setBedrooms] = useState(3)
  const [bathrooms, setBathrooms] = useState(2)
  const [sittingRooms, setSittingRooms] = useState(2)
  const [balconies, setBalconies] = useState(2)
  const [landlordPresence, setLandlordPresence] = useState<"stays" | "not-stays">("stays")
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(["Parking Lot", "Pet Allowed", "Garden", "Estate", "Other"])
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const toggleCondition = (condition: string) => {
    setSelectedCondition(condition)
  }

  const toggleCategory = (category: string) => {
    setSelectedCategory(category)
  }

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
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotos((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    }
  }

  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 3))

  // Reward is 5% of rent price, auto-calculated
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

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center pr-10">Add Apartment Details</h1>
      </header>

      <div className="px-4 space-y-6">
        <div>
          <h3 className="font-medium mb-3">Listing type</h3>
          <div className="flex gap-3">
            {["Connect", "Agent"].map((type) => (
              <button
                key={type}
                onClick={() => setListingType(type as "Connect" | "Agent")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  listingType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Listing Title</h3>
          <div className="relative">
            <Input
              value={listingTitle}
              onChange={(e) => setListingTitle(e.target.value)}
              placeholder="Two Bedroom Flat"
              className="h-14 rounded-2xl pr-12"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Listing Condition</h3>
          <div className="flex flex-wrap gap-3">
            {listingConditions.map((condition) => (
              <button
                key={condition}
                onClick={() => setSelectedCondition(condition)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCondition === condition
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Property category</h3>
          <div className="flex flex-wrap gap-3">
            {propertyCategories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <LocationInput value={location} onChange={setLocation} />
        </div>

        <div className="h-40 rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-secondary flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Select on the map</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Listing Photos</h3>
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image src={photo} alt="" fill className="object-cover" />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            <button 
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = (e) => handlePhotoUpload(e as any)
                input.click()
              }}
              className="aspect-[4/3] rounded-2xl border-2 border-dashed border-border flex items-center justify-center hover:bg-secondary/50 transition-colors"
            >
              <Plus className="w-8 h-8 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Rent Price</h3>
          <div className="relative">
            <Input
              value={rentPrice}
              onChange={(e) => setRentPrice(e.target.value)}
              placeholder="0"
              className="h-14 rounded-2xl pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          </div>
        </div>

        {/* Reward - Only visible for Connect listing type */}
        {listingType === "Connect" && (
          <div>
            <h3 className="font-medium mb-3">Reward (5% of Rent)</h3>
            <div className="relative">
              <Input
                value={calculatedReward.toLocaleString()}
                disabled
                placeholder="0"
                className="h-14 rounded-2xl pr-12 bg-primary/10 border-primary/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-medium mb-3">Property Features</h3>
          <div className="space-y-3">
            {[
              { label: "Bedroom", value: bedrooms, setValue: setBedrooms },
              { label: "Bathroom", value: bathrooms, setValue: setBathrooms },
              { label: "Sitting Room", value: sittingRooms, setValue: setSittingRooms },
              { label: "Balcony", value: balconies, setValue: setBalconies },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl"
              >
                <span>{feature.label}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => feature.setValue(Math.max(0, feature.value - 1))}
                    className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{feature.value}</span>
                  <button
                    onClick={() => feature.setValue(feature.value + 1)}
                    className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Select Rent Due Date - Only visible for Connect */}
        {listingType === "Connect" && (
          <div>
          <h3 className="font-medium mb-3">Select Current Rent Due Date</h3>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full flex items-center justify-between p-4 border border-border rounded-2xl"
          >
            <span className="text-muted-foreground">
              {selectedDate ? selectedDate.toLocaleDateString() : "Select Date"}
            </span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showCalendar ? "rotate-180" : ""}`} />
          </button>
          {showCalendar && (
            <div className="mt-3 p-4 border border-border rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handleNextMonth} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2 text-primary text-xs">{day}</div>
                ))}
                {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                  const day = i + 1
                  const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth()
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                      className={`py-2 rounded-lg text-sm ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
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

        <div>
          <h3 className="font-medium mb-3">Landlord Presence</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={landlordPresence === "stays"}
                onChange={() => setLandlordPresence("stays")}
                className="w-5 h-5 rounded border-border accent-primary"
              />
              <span className="text-sm">Landlord Stays in the Compound</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={landlordPresence === "not-stays"}
                onChange={() => setLandlordPresence("not-stays")}
                className="w-5 h-5 rounded border-border accent-primary"
              />
              <span className="text-sm">Landlord Does not stay in the Compound</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Environment / Facilities</h3>
          <div className="flex flex-wrap gap-2">
            {facilities.map((facility) => (
              <button
                key={facility}
                onClick={() => toggleFacility(facility)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFacilities.includes(facility)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                {facility}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Input
            value={descriptions}
            onChange={(e) => {
              const value = e.target.value
              // Allow only alphabetic characters and spaces
              const alphabeticOnly = value.replace(/[^a-zA-Z\s]/g, '')
              setDescriptions(alphabeticOnly)
            }}
            placeholder="Write other descriptions if available"
            className="h-14 rounded-2xl"
          />
        </div>

        <Button
          onClick={() => setShowReviewModal(true)}
          className="w-full h-14 text-base font-semibold"
        >
          Finish
        </Button>
      </div>

      {/* Under Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md rounded-t-3xl bg-background p-6 pb-8">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
            
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-primary/30 to-primary/60">
                <div className="h-16 w-16 rounded-full bg-primary" />
              </div>
              
              <h2 className="mb-1 text-2xl">Your listing is now</h2>
              <h3 className="mb-4 text-2xl font-bold">Under Review</h3>
              <p className="mb-6 text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur.
              </p>

              <div className="flex w-full gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowReviewModal(false)}
                >
                  Edit Post
                </Button>
                <Button
                  className="flex-1 rounded-xl"
                  onClick={() => router.push('/home')}
                >
                  Finish
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
