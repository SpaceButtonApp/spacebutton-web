'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { User, Mail, Phone, Ticket, Check } from 'lucide-react'
import { BackButton } from '@/components/back-button'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    profileType: 'individual' as 'individual' | 'agent',
    email: '',
    phone: '',
    invitationCode: '',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-kJSONfc9hORfv0xhwC97LF0eSOCvJL.png'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!formData.agreeToTerms) newErrors.terms = 'You must agree to the terms'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Store form data and navigate to password page
    localStorage.setItem('signupData', JSON.stringify(formData))
    router.push('/signup/password')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-[#703BF7]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-[#703BF7]/10 rounded-full blur-[120px]" />
      </div>

      {/* Progress bar */}
      <div className="relative px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <BackButton fallbackUrl="/" variant="light" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded-full bg-[#703BF7]" />
            <div className="w-8 h-1 rounded-full bg-gray-700" />
          </div>
          <span className="text-sm text-gray-400">1 of 2</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-auto relative">
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
              <span className="text-xl font-bold text-white">SpaceButton</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-4 mb-2">Create an account</h1>
            <p className="text-gray-400 text-sm">Join thousands finding their perfect space</p>
          </div>

          {/* Form Card */}
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50 focus:border-[#703BF7] transition-all"
                  />
                </div>
                {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profileType: 'individual' })}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      formData.profileType === 'individual'
                        ? 'bg-gradient-to-r from-[#703BF7] to-[#5f32d4] text-white'
                        : 'bg-[#1a1a24] border border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profileType: 'agent' })}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      formData.profileType === 'agent'
                        ? 'bg-gradient-to-r from-[#703BF7] to-[#5f32d4] text-white'
                        : 'bg-[#1a1a24] border border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    Agent
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full pl-11 pr-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50 focus:border-[#703BF7] transition-all"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full pl-11 pr-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50 focus:border-[#703BF7] transition-all"
                  />
                </div>
                {errors.phone && <p className="mt-2 text-sm text-red-400">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Invitation Code (Optional)
                </label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.invitationCode}
                    onChange={(e) => setFormData({ ...formData, invitationCode: e.target.value })}
                    placeholder="Enter invite code"
                    className="w-full pl-11 pr-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50 focus:border-[#703BF7] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, agreeToTerms: !formData.agreeToTerms })}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    formData.agreeToTerms 
                      ? 'bg-[#703BF7] border-[#703BF7]' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {formData.agreeToTerms && <Check className="w-3 h-3 text-white" />}
                </button>
                <label className="text-sm text-gray-400">
                  I agree to SpaceButton{' '}
                  <Link href="/terms" className="text-[#703BF7] hover:text-[#8b5cf6]">
                    Terms & Conditions
                  </Link>
                </label>
              </div>
              {errors.terms && <p className="text-sm text-red-400">{errors.terms}</p>}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#703BF7] to-[#5f32d4] hover:from-[#8b5cf6] hover:to-[#703BF7] text-white font-semibold rounded-xl transition-all duration-200"
              >
                Continue
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-center text-gray-400 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-white font-semibold hover:text-[#703BF7] transition-colors">
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
