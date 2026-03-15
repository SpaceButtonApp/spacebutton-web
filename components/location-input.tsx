'use client'

import { useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data for cascading dropdowns
const locationData = {
  Nigeria: {
    'Lagos State': {
      'Lagos Island': ['Lagos', 'Ikoyi', 'Victoria Island'],
      'Lekki': ['Lekki', 'Ajah', 'Ibeju-Lekki'],
      'Ikeja': ['Ikeja', 'Egbe', 'Alimosho'],
    },
    'Oyo State': {
      'Ibadan': ['Ibadan', 'Oyo', 'Iseyin'],
      'Ogbomosho': ['Ogbomosho', 'Ilorin'],
    },
    'Abuja': {
      'FCT': ['Abuja', 'Garki', 'Wuse'],
    },
  },
  'United Kingdom': {
    'England': {
      'London': ['London', 'Westminster', 'Kensington'],
      'Manchester': ['Manchester', 'Stockport'],
    },
  },
  'United States': {
    'New York': {
      'New York County': ['New York', 'Manhattan'],
    },
    'California': {
      'Los Angeles County': ['Los Angeles', 'Beverly Hills'],
    },
  },
}

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
  const [openDropdown, setOpenDropdown] = useState<'country' | 'state' | 'lga' | 'city' | null>(null)

  const countries = Object.keys(locationData)
  const states = value.country ? Object.keys(locationData[value.country as keyof typeof locationData] || {}) : []
  const lgas = value.country && value.state 
    ? Object.keys((locationData[value.country as keyof typeof locationData]?.[value.state as keyof typeof locationData[keyof typeof locationData]] || {}) as Record<string, string[]>)
    : []
  const cities = value.country && value.state && value.lga
    ? ((locationData[value.country as keyof typeof locationData]?.[value.state as keyof typeof locationData[keyof typeof locationData]] || {})[value.lga as keyof typeof locationData[keyof typeof locationData][keyof typeof locationData[keyof typeof locationData]]] || []) as string[]
    : []

  const locationText = `${value.city}${value.city && value.lga ? ', ' : ''}${value.lga}${(value.city || value.lga) && value.state ? ', ' : ''}${value.state}${(value.city || value.lga || value.state) && value.country ? ', ' : ''}${value.country}`
    .replace(/^, |, $|, , /g, ', ')
    .replace(/^, |, $/g, '')

  const handleCountrySelect = (country: string) => {
    onChange({
      country,
      state: '',
      lga: '',
      city: '',
    })
    setOpenDropdown('state')
  }

  const handleStateSelect = (state: string) => {
    onChange({
      ...value,
      state,
      lga: '',
      city: '',
    })
    setOpenDropdown('lga')
  }

  const handleLgaSelect = (lga: string) => {
    onChange({
      ...value,
      lga,
      city: '',
    })
    setOpenDropdown('city')
  }

  const handleCitySelect = (city: string) => {
    onChange({
      ...value,
      city,
    })
    setOpenDropdown(null)
  }

  return (
    <div>
      <h3 className="font-medium mb-3">Location</h3>
      <div className="space-y-3">
        {/* Display Button */}
        <button
          onClick={() => setOpenDropdown(openDropdown ? null : 'country')}
          className="w-full flex items-center justify-between h-14 rounded-2xl border border-border px-4 bg-background hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1 text-left">
            <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className={cn('text-sm', locationText ? 'text-foreground' : 'text-muted-foreground')}>
              {locationText || 'Select location'}
            </span>
          </div>
          <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', openDropdown && 'rotate-180')} />
        </button>

        {/* Cascading Dropdowns */}
        {openDropdown && (
          <div className="border border-border rounded-2xl p-4 space-y-3 bg-secondary/30">
            {/* Country Dropdown */}
            {openDropdown === 'country' && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">SELECT COUNTRY</label>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {countries.map((country) => (
                    <button
                      key={country}
                      onClick={() => handleCountrySelect(country)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        value.country === country
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      )}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* State Dropdown */}
            {openDropdown === 'state' && value.country && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  SELECT STATE
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {states.map((state) => (
                    <button
                      key={state}
                      onClick={() => handleStateSelect(state)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        value.state === state
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      )}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LGA Dropdown */}
            {openDropdown === 'lga' && value.country && value.state && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  SELECT LGA
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {lgas.map((lga) => (
                    <button
                      key={lga}
                      onClick={() => handleLgaSelect(lga)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        value.lga === lga
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      )}
                    >
                      {lga}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* City Dropdown */}
            {openDropdown === 'city' && value.country && value.state && value.lga && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  SELECT CITY / TOWN
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        value.city === city
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      )}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Info */}
            {openDropdown && (
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                {openDropdown === 'country' && 'Select a country to continue'}
                {openDropdown === 'state' && value.country && `Select a state in ${value.country}`}
                {openDropdown === 'lga' && value.state && `Select an LGA in ${value.state}`}
                {openDropdown === 'city' && value.lga && `Select a city in ${value.lga}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
