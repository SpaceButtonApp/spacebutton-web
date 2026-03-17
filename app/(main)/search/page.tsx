'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bookmark, Search, MapPin, Building2, Banknote, ChevronDown, Grid } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'
import { PropertyCard } from '@/components/property-card'
import { useAppStore } from '@/lib/store'
import { mockProperties, locations, apartmentTypes, priceRanges } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

// Complete Nigerian states with their LGAs - matching the location-input component
const stateWithLGAs: Record<string, string[]> = {
  'Lagos State': ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo Odofin', 'Apapa', 'Badagry', 'Bariga', 'Epe', 'Eti-Osa', 'Ifako-Ijaye', 'Ikoyi', 'Ikorodu', 'Isolo', 'Lagos Island', 'Lagos Mainland', 'Lekki', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere', 'Ajah', 'Ibeju-Lekki'],
  'Ogun State': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo Ota', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko-Afijo', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Sagamu', 'Yewa North', 'Yewa South'],
  'Rivers State': ['Abua Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ibama', 'Ikwerre', 'Isiokpo', 'Khana', 'Obio Akpor', 'Ogoni', 'Opobo Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
  'Federal Capital Territory': ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'],
  'Abia State': ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'],
  'Adamawa State': ['Demsa', 'Fufore', 'Ganye', 'Girei', 'Gombi', 'Guyuk', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo-Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
  'Akwa Ibom State': ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo', 'Ibiono Ibom', 'Iko', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Nsit Atai', 'Nsit Ibom', 'Nsit Ubium', 'Obot Akara', 'Oron', 'Uyo'],
  'Anambra State': ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'],
  'Bauchi State': ['Alkaleri', 'Bauchi', 'Baure', 'Bogoro', 'Dambam', 'Darazo', 'Dass', 'Gamawa', 'Giade', 'Itas Gadau', 'Jemaa', 'Katagum', 'Kirfi', 'Lere', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Yakuba', 'Yelwa', 'Zaki'],
  'Bayelsa State': ['Brass', 'Ekeremor', 'Kolokuma-Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'],
  'Benue State': ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Katsina Ala', 'Konshisha', 'Makurdi', 'Obi', 'Ogbadibo', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
  'Borno State': ['Abadam', 'Askira Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Dusnma', 'Gamboru', 'Guzamala', 'Gwoza', 'Jere', 'Kaga', 'Kala Balge', 'Kanem', 'Kangarum', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Maiduguri', 'Magumeri', 'Marte', 'Mobbar', 'Munguno', 'Ngala', 'Nganzai', 'Shani'],
  'Cross River State': ['Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipality', 'Calabar South', 'Etung', 'Ikom', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Okcukwu', 'Yakurr', 'Yala'],
  'Delta State': ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'],
  'Ebonyi State': ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Gabu', 'Ikwo', 'Ishielu', 'Isuikwu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'],
  'Edo State': ['Akoko Edo', 'Auchi', 'Benin City', 'Egor', 'Esan Central', 'Esan North East', 'Esan South East', 'Esan West', 'Igueben', 'Oredo', 'Ovia North East', 'Ovia South West', 'Owan East', 'Owan West', 'Uhunmwonde'],
  'Ekiti State': ['Ado', 'Akure', 'Ekiti East', 'Ekiti South West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido Osi', 'Ijero', 'Irepodun', 'Isin', 'Isuyin', 'Moba', 'Oye'],
  'Enugu State': ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Eze North', 'Igbo Eze South', 'Igbo Etiti', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Uzo Uwani'],
  'Gombe State': ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu Deba'],
  'Imo State': ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ikeduru', 'Isiala Mbano', 'Mbaitoli', 'Ngor Okpala', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Okigwe', 'Onuimo', 'Oru East', 'Oru West', 'Owerri', 'Owerri Municipal', 'Owerri North', 'Owerri West', 'Unuimo'],
  'Jigawa State': ['Auyo', 'Babura', 'Birin Kudu', 'Birnin Kudu', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Hadejia', 'Jahun', 'Kaugama', 'Kiyawa', 'Koni', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'],
  'Kaduna State': ['Birnin Gwari', 'Bombali', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jemaa', 'Kachia', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kudan', 'Kudinchi', 'Lere', 'Makarfi', 'Malumfashi', 'Manchok', 'Maru', 'Misau', 'Nasarawa', 'Rigachikun', 'Saba', 'Sabon Gida', 'Saminaka', 'Sanga', 'Soba', 'Zonkwa', 'Zaria'],
  'Kano State': ['Ajinkyia', 'Albasa', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kachumbari', 'Kaia', 'Kajiji', 'Kaki', 'Kano Municipal', 'Karfi', 'Karaye', 'Kaura Namoda', 'Kaya', 'Kiri', 'Kumbotso', 'Kunchi', 'Kura', 'Kurkur', 'Kuwai', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
  'Katsina State': ['Acida', 'Baure', 'Bataiya', 'Batsari', 'Dandume', 'Danja', 'Daura', 'Faskari', 'Funtua', 'Gandi', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Kargi', 'Katsina', 'Katsina North', 'Katsina South', 'Kurfi', 'Kusada', 'Mai Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safiyanu', 'Sandamu', 'Tarki', 'Tumbau', 'Zango'],
  'Kebbi State': ['Aleiro', 'Argungu', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Buhari', 'Dandi', 'Danko', 'Fakai', 'Gaya', 'Gwandu', 'Jega', 'Kaoje', 'Kari', 'Koko', 'Kulle', 'Maiyama', 'Makera', 'Malando', 'Mezuma', 'Paikoro', 'Sakaba', 'Saminaka', 'Shanga', 'Suru', 'Tanko', 'Wasagu', 'Yauri', 'Zuru'],
  'Kogi State': ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela-Odolu', 'Ijumu', 'Kabba-Bunnu', 'Kogi', 'Lokoja', 'Mopamuro', 'Ofu', 'Ogori-Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'],
  'Kwara State': ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'],
  'Nasarawa State': ['Akwanga', 'Awe', 'Dinder', 'Garaku', 'Gaya', 'Karu', 'Keana', 'Kokona', 'Keffi', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'],
  'Niger State': ['Agaie', 'Agwara', 'Bida', 'Bosso', 'Chachaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Minna', 'Mokwa', 'Muya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'],
  'Ondo State': ['Akoko North East', 'Akoko North West', 'Akoko South West', 'Akoko South East', 'Akure North', 'Akure South', 'Ilaje', 'Ilawole', 'Irele', 'Ondo', 'Ondo East', 'Ondo West', 'Ose', 'Owo', 'Oye'],
  'Osun State': ['Aiyedade', 'Atakunrin', 'Ede', 'Egbedore', 'Ejigbo', 'Giwa', 'Ifelodun', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ila Orangun', 'Ilesa', 'Ilesa East', 'Ilesa West', 'Ijebu Jesa', 'Isokan', 'Isonyin', 'Obokun', 'Olorunda', 'Osogbo', 'Owena', 'Oyere'],
  'Oyo State': ['Afijio', 'Akinyele', 'Akobo', 'Atiba', 'Atisbo', 'Egbeda', 'Ido', 'Irepodun', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Iyaganku', 'Kajola', 'Kanla', 'Lagelu', 'Lanlate', 'Ogbomoso North', 'Ogbomoso South', 'Olorunyomi', 'Oluyole', 'Ona-Ara', 'Orelope', 'Oyo', 'Oyo East', 'Oyo North', 'Saki East', 'Saki West', 'Surulere'],
  'Plateau State': ['Bokkos', 'Bassa', 'Barkin Ladi', 'Gindiri', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kaura', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Riyom', 'Shendam', 'Toro', 'Wase'],
  'Sokoto State': ['Binji', 'Bodinga', 'Dange-Shinari', 'Gada', 'Gawabawa', 'Goronyo', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Yabo', 'Yagba'],
  'Taraba State': ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Ising', 'Jalingo', 'Karim Lamido', 'Kurmi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari'],
  'Yobe State': ['Bade', 'Bursari', 'Damaturu', 'Fune', 'Geidam', 'Gujba', 'Guyuk', 'Jakusko', 'Karasuwa', 'Karewa', 'Kubar', 'Machina', 'Mai Adua', 'Nangere', 'Nguru', 'Potiskum', 'Sahare', 'Sakarai', 'Yunusari', 'Yusufari'],
  'Zamfara State': ['Anka', 'Bakura', 'Birnin Magaji', 'Bukkuyum', 'Bungudu', 'Charanchi', 'Chafe', 'Dandume', 'Dera', 'Dukku', 'Fada', 'Gada', 'Gummi', 'Gusau', 'Jigawa', 'Kaura Namoda', 'Kazaure', 'Kiyawa', 'Kontagora', 'Maradun', 'Maru', 'Shinkafi', 'Silame', 'Talata Mafara', 'Taura', 'Tsafe', 'Zurmi'],
}

export default function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    lga: '',
    apartmentType: '',
    minPrice: '',
    maxPrice: '',
  })
  const [showResults, setShowResults] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Get LGAs for selected state
  const availableLGAs = filters.location ? (stateWithLGAs[filters.location] || []) : []

  const handleSearch = () => {
    setShowResults(true)
  }

  const filteredProperties = useMemo(() => {
    return mockProperties.filter((property) => {
      if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // Filter by state (location)
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase().replace(' state', ''))) {
        return false
      }
      // Filter by LGA - check if property location includes the LGA
      if (filters.lga && !property.location.toLowerCase().includes(filters.lga.toLowerCase())) {
        return false
      }
      if (filters.apartmentType && property.category !== filters.apartmentType.toLowerCase()) {
        return false
      }
      if (filters.minPrice && property.price < parseInt(filters.minPrice)) {
        return false
      }
      if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) {
        return false
      }
      return true
    })
  }, [searchQuery, filters])

  const suggestedProperties = mockProperties.slice(0, 2)

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-background px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => router.push('/saved')}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
          >
            <Bookmark className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search For An Apartment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 rounded-xl border-2 border-foreground bg-background pl-4 pr-14 text-base"
          />
          <Button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-primary p-0"
          >
            <Search className="w-5 h-5 text-primary-foreground" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-4 space-y-3">
        {/* Location */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
            className="w-full h-14 rounded-xl border border-border bg-background px-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <span className={filters.location ? 'text-foreground' : 'text-muted-foreground'}>
                {filters.location || 'Location'}
              </span>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', activeDropdown === 'location' && 'rotate-180')} />
          </button>
          {activeDropdown === 'location' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => { setFilters({ ...filters, location: loc, lga: '' }); setActiveDropdown(null); }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary text-sm"
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LGA - Only show if location is selected */}
        {filters.location && availableLGAs.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'lga' ? null : 'lga')}
              className="w-full h-14 rounded-xl border border-border bg-background px-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span className={filters.lga ? 'text-foreground' : 'text-muted-foreground'}>
                  {filters.lga || 'Local Government Area'}
                </span>
              </div>
              <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', activeDropdown === 'lga' && 'rotate-180')} />
            </button>
            {activeDropdown === 'lga' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
                {availableLGAs.map((lga) => (
                  <button
                    key={lga}
                    onClick={() => { setFilters({ ...filters, lga }); setActiveDropdown(null); }}
                    className="w-full px-4 py-3 text-left hover:bg-secondary text-sm"
                  >
                    {lga}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Apartment Type */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
            className="w-full h-14 rounded-xl border border-border bg-background px-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <span className={filters.apartmentType ? 'text-foreground' : 'text-muted-foreground'}>
                {filters.apartmentType || 'Apartment Type'}
              </span>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', activeDropdown === 'type' && 'rotate-180')} />
          </button>
          {activeDropdown === 'type' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
              {apartmentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => { setFilters({ ...filters, apartmentType: type }); setActiveDropdown(null); }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary text-sm"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Min Price */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'minPrice' ? null : 'minPrice')}
            className="w-full h-14 rounded-xl border border-border bg-background px-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Banknote className="w-5 h-5 text-muted-foreground" />
              <span className={filters.minPrice ? 'text-foreground' : 'text-muted-foreground'}>
                {filters.minPrice ? `₦${parseInt(filters.minPrice).toLocaleString()}` : 'Min. Price'}
              </span>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', activeDropdown === 'minPrice' && 'rotate-180')} />
          </button>
          {activeDropdown === 'minPrice' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
              {priceRanges.min.map((price) => (
                <button
                  key={price}
                  onClick={() => { setFilters({ ...filters, minPrice: price.toString() }); setActiveDropdown(null); }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary text-sm"
                >
                  ₦{price.toLocaleString()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Max Price */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'maxPrice' ? null : 'maxPrice')}
            className="w-full h-14 rounded-xl border border-border bg-background px-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Banknote className="w-5 h-5 text-muted-foreground" />
              <span className={filters.maxPrice ? 'text-foreground' : 'text-muted-foreground'}>
                {filters.maxPrice ? `₦${parseInt(filters.maxPrice).toLocaleString()}` : 'Max. Price'}
              </span>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', activeDropdown === 'maxPrice' && 'rotate-180')} />
          </button>
          {activeDropdown === 'maxPrice' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
              {priceRanges.max.map((price) => (
                <button
                  key={price}
                  onClick={() => { setFilters({ ...filters, maxPrice: price.toString() }); setActiveDropdown(null); }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary text-sm"
                >
                  ₦{price.toLocaleString()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results / Suggestions */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-bold mb-4">
          {showResults ? 'Search Results' : 'Suggested Apartment'}
        </h2>
        <div className="space-y-3">
          {(showResults ? filteredProperties : suggestedProperties).map((property) => (
            <PropertyCard key={property.id} property={property} variant="compact" />
          ))}
        </div>
        
        {showResults && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No properties found matching your criteria.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
