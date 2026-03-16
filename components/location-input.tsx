'use client'

import { useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

// Complete Nigerian location data - State → LGA → Communities
const nigerianLocations: Record<string, Record<string, string[]>> = {
  'Abia': {
    'Aba North': ['Ariaria', 'Eziukwu', 'Igbuoma', 'Okpuala', 'Ekezie', 'Ntigha', 'Abayi'],
    'Aba South': ['Muri', 'Ogbor Hill', 'Ulele', 'Arochukwu Road', 'Obingwa', 'Ukazi'],
    'Arochukwu': ['Arochukwu', 'Ohafia', 'Ozu Abam', 'Uturu', 'Achara', 'Imiringi'],
    'Bende': ['Bende', 'Okigwe', 'Ezinna', 'Ameka', 'Ihechiowa', 'Umunze'],
    'Ikwuano': ['Ikwuano', 'Ibeku', 'Okpuala', 'Umuahia South', 'Ihenta', 'Amawu'],
    'Isuikwuato': ['Isuikwuato', 'Umunneochi', 'Abam', 'Asaga', 'Lokpanta', 'Uzuakoli'],
    'Obi Ngwa': ['Obi Ngwa', 'Itumbauzo', 'Obinagu', 'Osisioma', 'Atafom', 'Aba'],
    'Ohafia': ['Ohafia', 'Arochukwu', 'Afo Uno', 'Osuagwu', 'Nkporo', 'Elu'],
    'Osisioma': ['Osisioma', 'Owerrinta', 'Apata', 'Umuahia', 'Abuodu', 'Iheanacho'],
    'Ugwunagbo': ['Ugwunagbo', 'Ezeoke', 'Ibom', 'Umungonwa', 'Umuahia', 'Isiuzo'],
    'Ukwa East': ['Ukwa', 'Igbere', 'Arochukwu', 'Isiala Ngwa', 'Mma', 'Nrigkwo'],
    'Ukwa West': ['Ukwa', 'Mma', 'Igbere', 'Ubom', 'Nkporo', 'Oloko'],
    'Umuahia North': ['Umuahia', 'Ibeku', 'Olokoro', 'Afaraukwu', 'Amawu', 'Ediene'],
    'Umuahia South': ['Ubakala', 'Itumbauzo', 'Ahiaba', 'Amawu', 'Nkalu', 'Izu'],
    'Umu Nneochi': ['Umu Nneochi', 'Isuikwuato', 'Uturu', 'Abiakpo', 'Asaga', 'Lokpanta'],
  },
  'Lagos': {
    'Agege': ['Agege', 'Kara', 'Okota', 'Isolo', 'Shogunle', 'Cement'],
    'Ajeromi-Ifelodun': ['Ajeromi', 'Ifelodun', 'Apapa', 'Ijora', 'Costain'],
    'Alimosho': ['Alimosho', 'Mowe', 'Ifo', 'Jajiji', 'Ilogbo', 'Iju'],
    'Amuwo Odofin': ['Amuwo Odofin', 'Eko Atlantic', 'Alaro', 'Lekki', 'Ikoyi'],
    'Apapa': ['Apapa', 'Ijora', 'Costain', 'Tincan Island', 'Kirikiri'],
    'Badagry': ['Badagry', 'Olorunda', 'Agbara', 'Seme', 'Gberigbe'],
    'Bariga': ['Bariga', 'Shomolu', 'Surulere', 'Itire', 'Ijesha'],
    'Epe': ['Epe', 'Ibeju Lekki', 'Ajah', 'Lekki', 'Ikorodu'],
    'Eti-Osa': ['Eti-Osa', 'Ikoyi', 'Victoria Island', 'Lekki', 'Ibeju Lekki'],
    'Ifako-Ijaye': ['Ifako', 'Ijaye', 'Alagbado', 'Iju', 'Alagbole'],
    'Ikoyi': ['Ikoyi', 'Victoria Island', 'Lekki', 'Ajah', 'Ikoyi East'],
    'Ikorodu': ['Ikorodu', 'Imota', 'Ijede', 'Iwopin', 'Magbon'],
    'Isolo': ['Isolo', 'Oshodi', 'Oke Odo', 'Ilupeju', 'Shogunle'],
    'Lagos Mainland': ['Lagos Island', 'Surulere', 'Ikoyi', 'Victoria Island', 'Lekki'],
    'Lagos Island': ['Lagos Island', 'Ikoyi', 'Victoria Island', 'Ajah', 'Lekki'],
    'Lekki': ['Lekki', 'Ajah', 'Ibeju Lekki', 'Epe', 'Victoria Island'],
    'Mushin': ['Mushin', 'Bariga', 'Surulere', 'Itire', 'Ijesha'],
    'Ojo': ['Ojo', 'Apapa', 'Ajegunna', 'Akinpelu', 'Orile Agege'],
    'Oshodi-Isolo': ['Oshodi', 'Isolo', 'Shogunle', 'Mafoluku', 'Ilupeju'],
    'Shomolu': ['Shomolu', 'Bariga', 'Itire', 'Ijesha', 'Surulere'],
    'Surulere': ['Surulere', 'Ijesha', 'Itire', 'Bariga', 'Ojuelegba'],
    'Ajah': ['Ajah', 'Lekki', 'Epe', 'Ibeju Lekki', 'Eti-Osa'],
    'Ibeju-Lekki': ['Ibeju Lekki', 'Epe', 'Ajah', 'Lekki', 'Ikorodu'],
  },
  'Oyo': {
    'Ibadan North': ['Ibadan', 'Onireke', 'Bodija', 'Jericho', 'GRA Ibadan'],
    'Ibadan North East': ['Ibadan', 'Bashorun', 'Iwo Road', 'Alalubosa', 'Eleyele'],
    'Ibadan North West': ['Ibadan', 'Akala', 'Akinyele', 'Odo Ona', 'Isawo'],
    'Ibadan South': ['Ibadan', 'Dugbe', 'Mokola', 'Iwo Road', 'Adamasingba'],
    'Ibadan South East': ['Ibadan', 'Akobo', 'Ayanwale', 'Olomi', 'Soka'],
    'Ibadan South West': ['Ibadan', 'Oke Do', 'Oke Pelu', 'Aremo', 'Yemoja'],
    'Ido': ['Ido', 'Ibadan', 'Tapa', 'Onipe', 'Agbore'],
    'Iseyin': ['Iseyin', 'Ibadan', 'Kisi', 'Eruwa', 'Kanla'],
    'Atiba': ['Atiba', 'Oyo Town', 'Ijaye', 'Ago', 'Ogunjimi'],
    'Egbedore': ['Egbedore', 'Ibadan', 'Sepeteri', 'Akinogun', 'Alao'],
    'Ogbomoso North': ['Ogbomoso', 'Ibadan', 'Lanlate', 'Iwopin', 'Ajaawa'],
    'Ogbomoso South': ['Ogbomoso', 'Ibadan', 'Saki', 'Iseyin', 'Iwo'],
    'Oyo East': ['Oyo', 'Atiba', 'Kisi', 'Ago', 'Ayete'],
    'Oyo North': ['Oyo', 'Kisi', 'Ago Owu', 'Ayete', 'Atiba'],
    'Akinyele': ['Akinyele', 'Moniya', 'Sanyo', 'Ilora', 'Apete'],
    'Lagelu': ['Lagelu', 'Ibadan', 'Eleyele', 'Jericho', 'Bashorun'],
    'Ona Ara': ['Ona Ara', 'Ibadan', 'Ojoo', 'Moniya', 'Sanda'],
    'Oluyole': ['Oluyole', 'Ibadan', 'Ijebu Jesa', 'Abeokuta', 'Eruwa'],
    'Surulere': ['Surulere', 'Ibadan', 'Ijebu Jesa', 'Eruwa', 'Iseyin'],
  },
  'Federal Capital Territory': {
    'Abuja Municipal': ['Garki', 'Wuse', 'Asokoro', 'Maitama', 'Central Business District'],
    'Bwari': ['Bwari', 'Abaji', 'Kubwa', 'Gwagwa', 'Dure'],
    'Gwagwalada': ['Gwagwalada', 'Kuje', 'Abaji', 'Kubwa', 'Suleja'],
    'Kuje': ['Kuje', 'Abaji', 'Gwagwalada', 'Jikwoyi', 'Lugbe'],
    'Kwali': ['Kwali', 'Kuje', 'Abaji', 'Gwagwalada', 'Rubochi'],
  },
}

interface LocationInputProps {
  value: {
    community: string
    lga: string
    state: string
    country: string
  }
  onChange: (location: {
    community: string
    lga: string
    state: string
    country: string
  }) => void
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  const [openDropdown, setOpenDropdown] = useState<'state' | 'lga' | 'community' | null>(null)

  const states = Object.keys(nigerianLocations).sort()
  const lgas = value.state ? Object.keys(nigerianLocations[value.state] || {}).sort() : []
  const communities = value.state && value.lga 
    ? (nigerianLocations[value.state]?.[value.lga] || []).sort()
    : []

  const locationText = [value.community, value.lga, value.state, 'Nigeria'].filter(Boolean).join(', ')

  const handleStateSelect = (state: string) => {
    onChange({
      country: 'Nigeria',
      state,
      lga: '',
      community: '',
    })
    setOpenDropdown('lga')
  }

  const handleLgaSelect = (lga: string) => {
    onChange({
      ...value,
      lga,
      community: '',
    })
    setOpenDropdown('community')
  }

  const handleCommunitySelect = (community: string) => {
    onChange({
      ...value,
      community,
    })
    setOpenDropdown(null)
  }

  return (
    <div>
      <h3 className="font-medium mb-3">Location</h3>
      <div className="space-y-3">
        {/* Display Button */}
        <button
          onClick={() => setOpenDropdown(openDropdown ? null : 'state')}
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

        {/* State Dropdown */}
        {openDropdown === 'state' && (
          <div className="border border-border rounded-2xl p-3 space-y-2 bg-secondary/30 max-h-64 overflow-y-auto">
            <label className="text-xs font-semibold text-muted-foreground px-1 sticky top-0">SELECT STATE</label>
            <div className="space-y-1">
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
        {openDropdown === 'lga' && value.state && (
          <div className="border border-border rounded-2xl p-3 space-y-2 bg-secondary/30 max-h-64 overflow-y-auto">
            <label className="text-xs font-semibold text-muted-foreground px-1 sticky top-0">SELECT LGA</label>
            <div className="space-y-1">
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

        {/* Community Dropdown */}
        {openDropdown === 'community' && value.state && value.lga && (
          <div className="border border-border rounded-2xl p-3 space-y-2 bg-secondary/30 max-h-64 overflow-y-auto">
            <label className="text-xs font-semibold text-muted-foreground px-1 sticky top-0">SELECT COMMUNITY</label>
            <div className="space-y-1">
              {communities.map((community) => (
                <button
                  key={community}
                  onClick={() => handleCommunitySelect(community)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    value.community === community
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  )}
                >
                  {community}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
