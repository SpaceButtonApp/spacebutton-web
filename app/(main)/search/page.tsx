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

// Nigerian states with their LGAs
const stateWithLGAs: Record<string, string[]> = {
  'Lagos State': ['Lagos Island', 'Lagos Mainland', 'Alimosho', 'Amuwo Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lekki', 'Mushin', 'Oshodi-Isolo', 'Shomolu', 'Surulere', 'Victoria Island', 'Yaba'],
  'Ogun State': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Ewekoro', 'Imeko-Afon', 'Ijebu East', 'Ijebu North', 'Ijebu North-East', 'Ijebu Ode', 'Ikenne', 'Ilupeju', 'Ipokia', 'Obafemi-Owode', 'Odeda', 'Odogbolu', 'Oghara', 'Ohimini', 'Okitipupa', 'Oluyole', 'Ondo East', 'Ondo West', 'Ose', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Oyigbo'],
  'Abia State': ['Abia North', 'Abia South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala-Ngwa North', 'Isiala-Ngwa South', 'Isuikwuato', 'Nkuku', 'Obingwa', 'Ohafia', 'Osisioma Ngwa', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umunneochi'],
  'Adamawa State': ['Bakare', 'Demsa', 'Fufure', 'Ganaye', 'Gayuk', 'Girei', 'Gombi', 'Grie', 'Hong', 'Jada', 'Jimeta', 'Lamurde', 'Madagali', 'Maiha', 'Mayo-Belwa', 'Michika', 'Mubarak', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
  'Akwa Ibom State': ['Abak', 'Afia-Nsit', 'Akanawon', 'Akpabuyo', 'Atakumpanam', 'Bakassi', 'Biase', 'Eket', 'Esit-Eket', 'Essien Udim', 'Etim Ekpo', 'Etinam', 'Ewa', 'Ibeno', 'Idem-Ikot', 'Idian-Ikot', 'Ikono', 'Ikoneto', 'Ikot Abasi', 'Ikot Offiong', 'Itu', 'Oron', 'Udung-Uko', 'Ukanafun', 'Uruan', 'Urue-Offong-Oruko', 'Uyo'],
  'Anambra State': ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi', 'Ozo-Uno'],
  'Bauchi State': ['Alkaleri', 'Bauchi', 'Bogoro', 'Damboa', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas-Gadau', 'Jama\'are', 'Jammal', 'Katagum', 'Kirfi', 'Lere', 'Misau', 'Ningi', 'Shira', 'Tafawa-Balewa', 'Toro', 'Warji', 'Yankari'],
  'Bayelsa State': ['Brass', 'Ekowe', 'Ekeremor', 'Kolokuma-Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Soku', 'Southern-Ijaw', 'Twon-Brass', 'Yenagoa'],
  'Benue State': ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer-East', 'Gwer-West', 'Katsina-Ala', 'Konshisha', 'Korkuagha', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Ojo', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
  'Borno State': ['Abadam', 'Askira-Uba', 'Bama', 'Bayo', 'Benisheik', 'Biu', 'Bullumkutu', 'Bursari', 'Damaturu', 'Damboa', 'Daura', 'Dikwa', 'Doula', 'Dusnma', 'Gamboru-Ngala', 'Geidam', 'Gujba', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Jigawa', 'Jilli', 'Kabasuwan', 'Kaga', 'Kahu', 'Kalgo', 'Kangarim', 'Kanumbu'],
  'Cross River State': ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Cameroon', 'Demsa', 'Etung', 'Garoua-Boulay', 'Ikom', 'Obanliku', 'Oban', 'Odukpani', 'Ogoja', 'Okoye'],
  'Delta State': ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North-East', 'Ika South', 'Isoko North', 'Isoko South', 'Ivie', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Warri North', 'Warri South', 'Warri South-West'],
  'Ebonyi State': ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi East', 'Ebonyi North', 'Ebonyi West', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Nsukka', 'Onicha'],
  'Edo State': ['Akoko-Edo', 'Akpakpava', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba-Okha', 'Oredo', 'Orhionmwon', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde'],
  'Ekiti State': ['Ado-Ekiti', 'Aiyekire', 'Aiyegunle', 'Aiyetire', 'Akira', 'Akobo', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Erinjiyan', 'Erinmope', 'Erinosa', 'Esa-Oke', 'Esure', 'Gbonyin', 'Geri-Alaro', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun', 'Irepodun-Ifelodun', 'Ise-Orun', 'Isoko', 'Itaji-Ekiti', 'Itage', 'Itaogbolu', 'Itapaji', 'Itapetim'],
  'Enugu State': ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi-Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Uzo-Uwani'],
  'Gombe State': ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu-Deba'],
  'Imo State': ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ekedema', 'Ekweredolum', 'Emekuku', 'Eze-Nlitte', 'Ideato North', 'Ideato South', 'Idemili North', 'Idemili South', 'Ihiala', 'Ihezonwu', 'Ihitte-Uboma', 'Ikwerre', 'Isiala-Mbano', 'Isiano', 'Isiebu-Odo', 'Isim', 'Isinweke', 'Isu', 'Izzi', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Oji-River', 'Okha', 'Okonkwo', 'Okpala', 'Okposi', 'Okunato'],
  'Jigawa State': ['Auyo', 'Babbar', 'Bauchi', 'Baure', 'Bebeji', 'Birnin Kudu', 'Birnin Magaji', 'Buji', 'Bungudu', 'Dutse', 'Gagarawa', 'Gamawa', 'Garki', 'Garun Mallam', 'Gaya', 'Gazawa', 'Gwiwa', 'Hadejia', 'Jahun', 'Jaje', 'Jangebe', 'Jigawa', 'Jobawa', 'Jule', 'Kahuwa', 'Kaje', 'Kalto', 'Kano', 'Kanyam'],
  'Kaduna State': ['Birnin Gwari', 'Bombali', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kudan', 'Kudinchi', 'Lere', 'Makarfi', 'Malumfashi', 'Manchok', 'Maru', 'Misau', 'Nasarawa', 'Rigachikun', 'Saba', 'Sabon Gida', 'Saminaka', 'Sanga', 'Soba', 'Zonkwa', 'Zaria'],
  'Kano State': ['Ajinkyia', 'Albasa', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kachumbari', 'Kaia', 'Kajiji', 'Kaki', 'Kano Municipal', 'Karfi', 'Karaye', 'Kaura Namoda', 'Kaya', 'Kiri', 'Kumbotso', 'Kunchi', 'Kura', 'Kurkur', 'Kuwai', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
  'Katsina State': ['Achalonu', 'Achiakwo', 'Afinifere', 'Agile', 'Akosombo', 'Akpabuyo', 'Akpakpava', 'Aktolu', 'Akwanga', 'Alagbon', 'Alanamu', 'Alanso', 'Alanun', 'Alanza'],
  'Kebbi State': ['Aleiro', 'Arewa Dandi', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Danko/Wasagu', 'Farinon', 'Gwandu', 'Jega', 'Kalgo', 'Karoy', 'Kasuwan Magani', 'Kazaure', 'Keri', 'Kerinawa'],
  'Kogi State': ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela-Odolu', 'Ijumu', 'Kabba-Bunnu', 'Kogi', 'Lokoja', 'Mopamuro', 'Ofu', 'Ogaminana', 'Okehi', 'Okene'],
  'Kwara State': ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Kaur', 'Kole', 'Kwara South', 'Moro', 'Offa', 'Oke-Ero', 'Oyun', 'Pategi'],
  'Nasarawa State': ['Akwanga', 'Awe', 'Doma', 'Guma', 'Karu', 'Keffi', 'Kokona', 'Lafia', 'Nassarawa', 'Nasarawa-Keffi', 'Nasarawa-Lafia', 'Obi', 'Toto', 'Wamba'],
  'Niger State': ['Agaie', 'Agamagu', 'Agwara', 'Bida', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Konkwesso', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Tahoua', 'Wushishi'],
  'Ondo State': ['Akoko North-East', 'Akoko North-West', 'Akoko South-East', 'Akoko South-West', 'Akure North', 'Akure South', 'Alepe', 'Alisa', 'Alusekere', 'Amakete', 'Amakoro', 'Amange', 'Amatege', 'Amawu', 'Amaza'],
  'Osun State': ['Adefope', 'Adefone', 'Adekunle', 'Adefone-Fadile', 'Adefope-Fadile', 'Afijio', 'Afijio-East', 'Afijio-South', 'Afijio-West', 'Agerinyo', 'Ajia', 'Ajian', 'Ajigbo', 'Ajikale', 'Ajikale-East', 'Ajikale-South', 'Ajikale-West', 'Ajilan', 'Ajilano', 'Ajilenu'],
  'Oyo State': ['Afijio', 'Akinyele', 'Atisbo', 'Atogo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Ifedayo', 'Ifeloju', 'Ilesha East', 'Ilesha West', 'Irepodun', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Iye', 'Lajowa', 'Lagelu', 'Laguna', 'Oba', 'Oyo East', 'Oyo West', 'Saki East', 'Saki West', 'Surulere'],
  'Plateau State': ['Barkin Ladi', 'Bassa', 'Bokkos', 'Foo', 'Gindiri', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Quaan Pan', 'Riyom', 'Shendam', 'Wase'],
  'Rivers State': ['Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emuoha', 'Etche', 'Gokana', 'Gokere', 'Gobo', 'Ikwerre', 'Isiala-Mbano', 'Isuikwuato', 'Khana', 'Obia', 'Ogba-Egbema-Ndoni', 'Ogu-Bolo', 'Okrika', 'Omuma', 'Opobo-Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
  'Sokoto State': ['Binji', 'Bodinga', 'Dange-Shinko', 'Goronyo', 'Gudu', 'Gwadabawa', 'Gware', 'Illela', 'Isa', 'Kaura-Namoda', 'Kware', 'Rabah', 'Sabon Birni', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamakko', 'Wurno', 'Yabo'],
  'Taraba State': ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim-Lamido', 'Katsina-Ala', 'Kurmi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'],
  'Yobe State': ['Bade', 'Borsari', 'Bursari', 'Damaturu', 'Daura', 'Gaidam', 'Geidam', 'Gujba', 'Guzamala', 'Jakusko', 'Kakasuwa', 'Karawa', 'Kasuwa-Magani', 'Kazaure', 'Kaziamaki', 'Keffi', 'Kiyandama', 'Kobi', 'Kumagunna', 'Kumato', 'Kumya'],
  'Zamfara State': ['Anka', 'Bakura', 'Birnin Magaji', 'Bungudu', 'Buugudu', 'Dzukuma', 'Gummi', 'Kaila', 'Kasuwa', 'Kasuwa-Kudu', 'Kasuwa-Toro', 'Kasuwa-Zaria', 'Kasuwari', 'Kasuwari-Kudu', 'Kasuwari-Toro', 'Kasuwari-Zaria'],
  'Federal Capital Territory': ['Abuja Municipal Area Council', 'Bwari Area Council', 'Gwagwalada Area Council', 'Kuje Area Council', 'Kwali Area Council', 'Municipal Area Council'],
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
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
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
