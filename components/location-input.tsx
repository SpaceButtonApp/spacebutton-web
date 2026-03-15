'use client'

import { useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface LocationInputProps {
  value: {
    city: string
    lga: string
    state: string
    country: string
  }
  onChange: (location: {
    city: string
    lga: string
    state: string
    country: string
  }) => void
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleChange = (field: keyof typeof value, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    })
  }

  const locationText = `${value.city}, ${value.lga}, ${value.state}, ${value.country}`.replace(/^, |, $|, , /g, ', ').replace(/^, |, $/g, '')

  return (
    <div>
      <h3 className="font-medium mb-3">Location</h3>
      <div className="space-y-3">
        {/* Display */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between h-14 rounded-2xl border border-border px-4 bg-background hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1 text-left">
            <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className={cn('text-sm', locationText ? 'text-foreground' : 'text-muted-foreground')}>
              {locationText || 'Select location details'}
            </span>
          </div>
          <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', showDropdown && 'rotate-180')} />
        </button>

        {/* Dropdown Fields */}
        {showDropdown && (
          <div className="border border-border rounded-2xl p-4 space-y-3 bg-secondary/30">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">CITY / TOWN</label>
              <Input
                value={value.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g. Lagos"
                className="h-12 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">LGA</label>
              <Input
                value={value.lga}
                onChange={(e) => handleChange('lga', e.target.value)}
                placeholder="e.g. Ikoyi"
                className="h-12 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">STATE</label>
              <Input
                value={value.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="e.g. Lagos State"
                className="h-12 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">COUNTRY</label>
              <Input
                value={value.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="e.g. Nigeria"
                className="h-12 rounded-lg text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
