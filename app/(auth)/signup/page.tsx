'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { User, Mail, Ticket, Check, ChevronDown } from 'lucide-react'
import { BackButton } from '@/components/back-button'

const countryCodes = [
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
]

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    profileType: 'individual' as 'individual' | 'agent',
    email: '',
    phone: '',
    countryCode: '+234',
    invitationCode: '',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showCountryPicker, setShowCountryPicker] = useState(false)

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  const selectedCountry = countryCodes.find(c => c.code === formData.countryCode) || countryCodes[0]

  const handlePhoneChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '')
    setFormData({ ...formData, phone: numericValue })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (formData.phone.length < 10) newErrors.phone = 'Please enter a valid phone number'
    if (!formData.agreeToTerms) newErrors.terms = 'You must agree to the terms'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Store form data with full phone number and navigate to password page
    localStorage.setItem('signupData', JSON.stringify({
      ...formData,
      phone: `${formData.countryCode}${formData.phone}`
    }))
    router.push('/signup/password')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <BackButton fallbackUrl="/" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded-full bg-primary" />
            <div className="w-8 h-1 rounded-full bg-muted" />
          </div>
          <span className="text-sm text-muted-foreground">1 of 2</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-auto">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-2">
              <Image
                src={logoUrl}
                alt="SpaceButton"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-xl font-bold text-foreground">SpaceButton</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-4 mb-2">Create an account</h1>
            <p className="text-muted-foreground text-sm">Join thousands finding their perfect space</p>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                {errors.name && <p className="mt-2 text-sm text-destructive">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Profile Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profileType: 'individual' })}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      formData.profileType === 'individual'
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
                        : 'bg-secondary border border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profileType: 'agent' })}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      formData.profileType === 'agent'
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
                        : 'bg-secondary border border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    Agent
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-destructive">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  {/* Country Code Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryPicker(!showCountryPicker)}
                      className="flex items-center gap-2 px-3 py-3 bg-secondary border border-border rounded-xl text-foreground hover:border-primary/50 transition-all min-w-[100px]"
                    >
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span className="text-sm">{selectedCountry.code}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                    
                    {showCountryPicker && (
                      <div className="absolute z-50 top-full left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {countryCodes.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, countryCode: country.code })
                              setShowCountryPicker(false)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors ${
                              formData.countryCode === country.code ? 'bg-primary/20' : ''
                            }`}
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-foreground text-sm flex-1 text-left">{country.country}</span>
                            <span className="text-muted-foreground text-sm">{country.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Phone Number Input */}
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1 px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                {errors.phone && <p className="mt-2 text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Invitation Code (Optional)
                </label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.invitationCode}
                    onChange={(e) => setFormData({ ...formData, invitationCode: e.target.value })}
                    placeholder="Enter invite code"
                    className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, agreeToTerms: !formData.agreeToTerms })}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    formData.agreeToTerms 
                      ? 'bg-primary border-primary' 
                      : 'border-muted-foreground hover:border-primary'
                  }`}
                >
                  {formData.agreeToTerms && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>
                <label className="text-sm text-muted-foreground">
                  I agree to SpaceButton{' '}
                  <Link href="/terms" className="text-primary hover:text-primary/80">
                    Terms & Conditions
                  </Link>
                </label>
              </div>
              {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl transition-all duration-200"
              >
                Continue
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-muted-foreground text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-foreground font-semibold hover:text-primary transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
