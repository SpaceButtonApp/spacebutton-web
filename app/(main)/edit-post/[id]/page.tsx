'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, MapPin, Camera, X, Plus, Minus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppStore } from '@/lib/store'

const conditions = ['Rent', 'Roommate', 'Flatmate']
const categories = ['Flat', 'Self Con', 'Duplex', 'Storey', 'Penthouse']
const facilities = ['Parking Lot', 'Pet Allowed', 'Park', 'Garden', 'Estate', "Kid's Friendly", 'Home theatre', 'Other']

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { properties, updateProperty } = useAppStore()
  const property = properties.find((p) => p.id === id)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const [title, setTitle] = useState(property?.title || '')
  const [selectedCondition, setSelectedCondition] = useState(property?.condition || 'rent')
  const [selectedCategory, setSelectedCategory] = useState(property?.category || 'flat')
  const [descriptions, setDescriptions] = useState('')
  const [location, setLocation] = useState(property?.location || '')
  const [price, setPrice] = useState(property?.price.toString() || '')
  const [bedrooms, setBedrooms] = useState(property?.beds || 3)
  const [bathrooms, setBathrooms] = useState(property?.baths || 2)
  const [sittingRoom, setSittingRoom] = useState(property?.reception || 2)
  const [balcony, setBalcony] = useState(2)
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(['Parking Lot', 'Pet Allowed', 'Garden', 'Estate', "Kid's Friendly", 'Home theatre'])
  const [landlordPresence, setLandlordPresence] = useState<'stays' | 'not-stays'>('stays')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2023, 3, 15))
  const [images, setImages] = useState<string[]>(property?.images.slice(0, 3) || [])
  const [showReviewModal, setShowReviewModal] = useState(false)

  const reward = selectedCondition === 'rent' ? Math.round(parseInt(price || '0') * 0.05) : 0

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    )
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFinish = () => {
    // Update the property in the store
    updateProperty(id, {
      title,
      location,
      price: parseInt(price.replace(/,/g, '') || '0'),
      condition: selectedCondition as 'rent' | 'roommate' | 'flatmate',
      category: selectedCategory as 'flat' | 'self-con' | 'duplex' | 'storey' | 'penthouse',
      beds: bedrooms,
      baths: bathrooms,
      reception: sittingRoom,
      balconies: balcony,
      features: selectedFacilities,
      landlordPresence: landlordPresence,
      description: descriptions,
      images: images,
    })
    setShowReviewModal(true)
  }

  if (!property) {
    return <div>Property not found</div>
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">Edit Home details</h1>
        <div className="w-10" />
      </header>

      {/* Property Preview Card */}
      <div className="mx-4 mt-4 rounded-2xl border bg-card p-3">
        <div className="flex gap-3">
          <div className="relative h-20 w-20 overflow-hidden rounded-xl">
            <Image src={property.images[0]} alt={property.title} fill className="object-cover" />
            <div className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
              <span className="text-[10px] text-primary-foreground">✓</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{title || property.title}</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {location || property.location}
            </p>
            <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">Connect</span>
              <span className="flex items-center gap-1">Roommate</span>
              <span className="flex items-center gap-1">Duplex</span>
            </div>
            <p className="mt-1 text-lg font-bold text-primary">
              ${parseInt(price || '0').toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
            <Camera className="h-4 w-4" />
            <span>{images.length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Listing Title */}
        <div>
          <Label className="mb-2 block font-semibold">Listing Title</Label>
          <div className="relative">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Two Bedroom Flat"
              className="rounded-xl pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">⌂</span>
          </div>
        </div>

        {/* Listing Condition */}
        <div>
          <Label className="mb-2 block font-semibold">Listing Condition</Label>
          <div className="flex flex-wrap gap-2">
            {conditions.map((condition) => (
              <button
                key={condition}
                onClick={() => setSelectedCondition(condition.toLowerCase() as 'rent' | 'roommate' | 'flatmate')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCondition === condition.toLowerCase()
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary'
                }`}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>

        {/* Property Category */}
        <div>
          <Label className="mb-2 block font-semibold">Property category</Label>
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between p-3 border rounded-xl bg-background hover:bg-muted transition-colors"
            >
              <span>{selectedCategory}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`} />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl overflow-hidden z-10 shadow-lg">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category.toLowerCase().replace(' ', '-') as typeof selectedCategory)
                      setShowCategoryDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${
                      selectedCategory === category.toLowerCase().replace(' ', '-') ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <Label className="mb-2 block font-semibold">Location</Label>
          <div className="flex items-center gap-2 rounded-xl border p-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="First gate, Ojo, Lagos State, Nigeria."
              className="flex-1 bg-transparent outline-none"
            />
          </div>
          <div className="mt-3 overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop"
              alt="Map"
              width={400}
              height={150}
              className="w-full object-cover"
            />
            <p className="bg-muted p-2 text-center text-sm text-muted-foreground">
              Select on the map
            </p>
          </div>
        </div>

        {/* Listing Photos */}
        <div>
          <Label className="mb-2 block font-semibold">Listing Photos</Label>
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-video overflow-hidden rounded-xl">
                <Image src={image} alt={`Photo ${index + 1}`} fill className="object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Rent Price */}
        <div>
          <Label className="mb-2 block font-semibold">Rent Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="text"
              value={parseInt(price || '0').toLocaleString()}
              onChange={(e) => setPrice(e.target.value.replace(/,/g, ''))}
              className="rounded-xl pl-8 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          </div>
        </div>

        {/* Reward - Only visible for Connect */}
        {selectedCondition === 'rent' && (
          <div>
            <Label className="mb-2 block font-semibold">Reward</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="text"
                value={reward.toLocaleString()}
                disabled
                className="rounded-xl bg-muted pl-8 pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            </div>
          </div>
        )}

        {/* Property Features */}
        <div>
          <Label className="mb-3 block font-semibold">Property Features</Label>
          <div className="space-y-3">
            {[
              { label: 'Bedroom', value: bedrooms, setValue: setBedrooms },
              { label: 'Bathroom', value: bathrooms, setValue: setBathrooms },
              { label: 'Sitting Room', value: sittingRoom, setValue: setSittingRoom },
              { label: 'Balcony', value: balcony, setValue: setBalcony },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center justify-between rounded-xl border p-3">
                <span>{feature.label}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => feature.setValue(Math.max(0, feature.value - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center">{feature.value}</span>
                  <button
                    onClick={() => feature.setValue(feature.value + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Select Current Rent Due Date - Only visible for Connect */}
        {selectedCondition === 'rent' && (
          <div>
            <Label className="mb-2 block font-semibold">Select Current Rent Due Date</Label>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex w-full items-center justify-between rounded-xl border p-3"
            >
              <span>{selectedDate ? selectedDate.toLocaleDateString() : 'Select Date'}</span>
              <ChevronDown className="h-5 w-5" />
            </button>

            {showDatePicker && (
              <div className="mt-2 rounded-xl border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <button className="text-muted-foreground">{'<'}</button>
                  <span className="font-semibold">April 2023</span>
                  <button className="text-muted-foreground">{'>'}</button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-muted-foreground">{day}</div>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedDate(new Date(2023, 3, day))
                        setShowDatePicker(false)
                      }}
                      className={`rounded-full p-2 ${
                        selectedDate?.getDate() === day
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Landlord Presence */}
        <div>
          <Label className="mb-2 block font-semibold">Landlord Presence</Label>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <Checkbox
                checked={landlordPresence === 'stays'}
                onCheckedChange={() => setLandlordPresence('stays')}
              />
              <span>Landlord Stays in the Compound</span>
            </label>
            <label className="flex items-center gap-3">
              <Checkbox
                checked={landlordPresence === 'not-stays'}
                onCheckedChange={() => setLandlordPresence('not-stays')}
              />
              <span>Landlord Does not stay in the Compound</span>
            </label>
          </div>
        </div>

        {/* Environment / Facilities */}
        <div>
          <Label className="mb-2 block font-semibold">Environment / Facilities</Label>
          <div className="flex flex-wrap gap-2">
            {facilities.map((facility) => (
              <button
                key={facility}
                onClick={() => toggleFacility(facility)}
                className={`rounded-full px-4 py-2 text-sm ${
                  selectedFacilities.includes(facility)
                    ? 'bg-primary text-primary-foreground'
                    : 'border bg-background'
                }`}
              >
                {facility}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
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
            className="rounded-xl"
          />
        </div>

        {/* Finish Button */}
        <Button
          onClick={handleFinish}
          className="w-full rounded-xl py-6 text-lg"
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
                Your changes have been saved and are being reviewed.
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
