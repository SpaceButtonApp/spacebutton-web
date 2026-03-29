'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Mail, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/back-button'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [error, setError] = useState('')

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailOrPhone) {
      setError('Please enter your email or phone number')
      return
    }
    
    // Store for next step
    localStorage.setItem('resetEmail', emailOrPhone)
    router.push(`/forgot-password/verify?email=${encodeURIComponent(emailOrPhone)}`)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-[#703BF7]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-[#703BF7]/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative px-4 pt-6 pb-4">
        <BackButton fallbackUrl="/login" variant="light" />
      </div>

      {/* Content */}
      <div className="relative flex-1 px-6 py-4">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#703BF7]/20 flex items-center justify-center border border-[#703BF7]/30">
            <KeyRound className="w-10 h-10 text-[#703BF7]" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Image
              src={logoUrl}
              alt="SpaceButton"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-lg font-bold text-white">SpaceButton</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Forgot Password</h1>
          <p className="text-gray-400 text-sm">
            Enter your email or phone number to receive a verification code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email or Phone Number</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Enter email or phone number"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-[#12121a] border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50 focus:border-[#703BF7] transition-all"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#703BF7] to-[#5f32d4] hover:from-[#8b5cf6] hover:to-[#703BF7] text-white font-semibold text-base shadow-lg shadow-[#703BF7]/20"
          >
            Send Verification Code
          </Button>
        </form>
      </div>
    </div>
  )
}
