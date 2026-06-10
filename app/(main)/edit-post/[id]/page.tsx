'use client'

import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, MapPin, Camera, Plus, Minus, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppStore } from '@/lib/store'
import { listingsApi } from '@/lib/api/listings'
import type { ListingResponse, PropertyType, ListingCategory } from '@/lib/types/listing'

const categoryOptions = ['Flat', 'Self Con', 'Duplex', 'Storey', 'Penthouse']
const facilityOptions = ['Parking Lot', 'Pet Allowed', 'Park', 'Garden', 'Estate', "Kid's Friendly", 'Home theatre', 'Other']

function toPropertyType(cat: string): PropertyType {
  switch (cat.toLowerCase().replace(' ', '_')) {
    case 'self_con': return 'self_contain'
    case 'duplex': case 'storey': case 'penthouse': return 'house'
    default: return 'apartment'
  }
}

function fromPropertyType(t: PropertyType): string {
  switch (t) {
    case 'self_contain': return 'Self Con'
    case 'house': return 'Duplex'
    default: return 'Flat'
  }
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const isAgent = user?.type === 'agent'

  const [listing, setListing] = useState<ListingResponse | null>(null)
  const [loadingListing, setLoadingListing] = useState(true)
  const [saving, setSaving] = useState(false)
  const [closing, setClosing] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [address, setAddress] = useState('')
  const [price, setPrice] = useState('')
  const [bedrooms, setBedrooms] = useState(1)
  const [bathrooms, setBathrooms] = useState(1)
  const [sittingRoom, setSittingRoom] = useState(1)
  const [balcony, setBalcony] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('Flat')
  const [landlordPresence, setLandlordPresence] = useState<'stays' | 'not-stays'>('stays')
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])

  useEffect(() => {
    listingsApi.getListing(id)
      .then((l) => {
        setListing(l)
        setTitle(l.title)
        setDescription(l.description ?? '')
        setCity(l.city ?? '')
        setState(l.state ?? '')
        setAddress(l.address ?? '')
        setPrice(l.price ?? '')
        setBedrooms(l.bedrooms ?? 1)
        setBathrooms(l.bathrooms ?? 1)
        setSittingRoom(l.sitting_rooms ?? 1)
        setBalcony(l.balconies ?? 0)
        setSelectedCategory(fromPropertyType(l.property_type))
        setLandlordPresence(l.landlord_presence === 'stays' ? 'stays' : 'not-stays')
        try {
          if (l.facilities) setSelectedFacilities(JSON.parse(l.facilities))
        } catch { /* ignore */ }
      })
      .catch(() => setListing(null))
      .finally(() => setLoadingListing(false))
  }, [id])

  const toggleFacility = (f: string) =>
    setSelectedFacilities(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])

  const handleSave = async () => {
    setSaving(true)
    try {
      await listingsApi.updateListing(id, {
        title,
        description,
        city,
        state,
        address,
        price: Number(price.replace(/,/g, '') || '0'),
        bedrooms,
        bathrooms,
        sitting_rooms: sittingRoom,
        balconies: balcony,
        property_type: toPropertyType(selectedCategory),
        landlord_presence: landlordPresence,
        facilities: JSON.stringify(selectedFacilities),
      })
      setShowReviewModal(true)
    } catch { /* show toast in future */ }
    finally { setSaving(false) }
  }

  const handleCloseDeal = async () => {
    setClosing(true)
    try {
      await listingsApi.closeDeal(id)
      router.push('/profile')
    } catch { /* ignore */ }
    finally { setClosing(false) }
  }

  if (loadingListing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
        <p className="text-muted-foreground">Listing not found or you don't have access to edit it.</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const coverImage = listing.images.find(i => i.is_cover)?.image_url ?? listing.images[0]?.image_url

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-4">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">Edit Listing</h1>
        <div className="w-10" />
      </header>

      {/* Preview Card */}
      <div className="mx-4 mt-4 rounded-2xl border bg-card p-3">
        <div className="flex gap-3">
          <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted shrink-0">
            {coverImage && <Image src={coverImage} alt={listing.title} fill className="object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{title || listing.title}</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {[city, state].filter(Boolean).join(', ') || listing.city}
            </p>
            <p className="mt-1 text-lg font-bold text-primary">
              ₦{parseInt(price.replace(/,/g, '') || '0').toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
            <Camera className="h-4 w-4" />
            <span>{listing.images.length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Title */}
        <div>
          <Label className="mb-2 block font-semibold">Listing Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Two Bedroom Flat" className="rounded-xl" />
        </div>

        {/* Description */}
        <div>
          <Label className="mb-2 block font-semibold">Description</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the property..."
            rows={3}
            className="w-full px-3 py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Property Category */}
        <div>
          <Label className="mb-2 block font-semibold">Property Category</Label>
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between p-3 border rounded-xl bg-background hover:bg-muted transition-colors"
            >
              <span>{selectedCategory}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl overflow-hidden z-10 shadow-lg">
                {categoryOptions.map((cat) => (
                  <button key={cat} onClick={() => { setSelectedCategory(cat); setShowCategoryDropdown(false) }}
                    className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : ''}`}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="block font-semibold">Location</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="rounded-xl" />
          <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="rounded-xl" />
          <div className="flex items-center gap-2 rounded-xl border p-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" className="flex-1 bg-transparent outline-none text-sm" />
          </div>
        </div>

        {/* Price */}
        <div>
          <Label className="mb-2 block font-semibold">Price (₦)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
            <Input type="text" value={parseInt(price.replace(/,/g, '') || '0').toLocaleString()} onChange={(e) => setPrice(e.target.value.replace(/,/g, ''))} className="rounded-xl pl-8" />
          </div>
        </div>

        {/* Features */}
        <div>
          <Label className="mb-3 block font-semibold">Property Features</Label>
          <div className="space-y-3">
            {[
              { label: 'Bedroom', value: bedrooms, set: setBedrooms },
              { label: 'Bathroom', value: bathrooms, set: setBathrooms },
              { label: 'Sitting Room', value: sittingRoom, set: setSittingRoom },
              { label: 'Balcony', value: balcony, set: setBalcony },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between rounded-xl border p-3">
                <span>{f.label}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => f.set(Math.max(0, f.value - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border"><Minus className="h-4 w-4" /></button>
                  <span className="w-6 text-center">{f.value}</span>
                  <button onClick={() => f.set(f.value + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Landlord Presence */}
        {!isAgent && (
          <div>
            <Label className="mb-2 block font-semibold">Landlord Presence</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={landlordPresence === 'stays'} onCheckedChange={() => setLandlordPresence('stays')} />
                <span>Landlord stays in the compound</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={landlordPresence === 'not-stays'} onCheckedChange={() => setLandlordPresence('not-stays')} />
                <span>Landlord does not stay in the compound</span>
              </label>
            </div>
          </div>
        )}

        {/* Facilities */}
        <div>
          <Label className="mb-2 block font-semibold">Facilities</Label>
          <div className="flex flex-wrap gap-2">
            {facilityOptions.map((f) => (
              <button key={f} onClick={() => toggleFacility(f)}
                className={`rounded-full px-4 py-2 text-sm ${selectedFacilities.includes(f) ? 'bg-primary text-primary-foreground' : 'border bg-background'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl py-6 text-lg">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
        </Button>

        {/* Close Deal */}
        {listing.status === 'active' && (
          <Button onClick={handleCloseDeal} disabled={closing} variant="outline" className="w-full rounded-xl py-6 text-lg border-orange-500/50 text-orange-500 hover:bg-orange-500/10">
            {closing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Mark as Closed / Sold'}
          </Button>
        )}
      </div>

      {/* Success Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md rounded-t-3xl bg-background p-6 pb-8">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-primary/30 to-primary/60">
                <div className="h-16 w-16 rounded-full bg-primary" />
              </div>
              <h2 className="mb-1 text-2xl">Changes saved!</h2>
              <p className="mb-6 text-muted-foreground">Your listing has been updated and may go back under review.</p>
              <div className="flex w-full gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowReviewModal(false)}>Keep Editing</Button>
                <Button className="flex-1 rounded-xl" onClick={() => router.push('/profile')}>Done</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
