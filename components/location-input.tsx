'use client'

import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface LocationValue {
  country: string
  state: string
  lga: string
  nearestBusStop: string
}

interface LocationInputProps {
  value: {
    community?: string
    lga?: string
    state?: string
    country?: string
    city?: string
    nearestBusStop?: string
  }
  onChange: (value: LocationValue) => void
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  // Only allow text characters (letters and spaces)
  const handleTextOnly = (input: string) => {
    return input.replace(/[^a-zA-Z\s]/g, '')
  }

  const handleChange = (field: keyof LocationValue, inputValue: string) => {
    const cleanValue = handleTextOnly(inputValue)
    onChange({
      country: 'Nigeria',
      state: value.state || value.city || '',
      lga: value.lga || '',
      nearestBusStop: value.nearestBusStop || '',
      [field]: field === 'country' ? 'Nigeria' : cleanValue
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-[#703BF7]" />
        <h3 className="font-medium text-white">Location</h3>
      </div>

      {/* Country - Fixed Nigeria */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Country</label>
        <Input
          value="Nigeria"
          disabled
          className="h-12 bg-[#1a1a24] border-gray-800 text-white rounded-xl placeholder:text-gray-500 cursor-not-allowed opacity-70"
        />
      </div>

      {/* State */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">State</label>
        <Input
          value={value.state || value.city || ''}
          onChange={(e) => handleChange('state', e.target.value)}
          placeholder="Enter state"
          className="h-12 bg-[#1a1a24] border-gray-800 text-white rounded-xl placeholder:text-gray-500"
        />
      </div>

      {/* Local Government Area */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Local Government Area (LGA)</label>
        <Input
          value={value.lga || ''}
          onChange={(e) => handleChange('lga', e.target.value)}
          placeholder="Enter LGA"
          className="h-12 bg-[#1a1a24] border-gray-800 text-white rounded-xl placeholder:text-gray-500"
        />
      </div>

      {/* Nearest Bus Stop */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Nearest Bus Stop</label>
        <Input
          value={value.nearestBusStop || ''}
          onChange={(e) => handleChange('nearestBusStop', e.target.value)}
          placeholder="Enter nearest bus stop"
          className="h-12 bg-[#1a1a24] border-gray-800 text-white rounded-xl placeholder:text-gray-500"
        />
      </div>
    </div>
  )
}
