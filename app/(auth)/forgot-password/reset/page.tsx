'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Check, X, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/back-button'

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export default function ResetPasswordPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  const allRequirementsMet = requirements.every((req) => req.test(formData.password))
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!allRequirementsMet || !passwordsMatch) {
      return
    }
    
    localStorage.removeItem('resetEmail')
    router.push('/login')
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
        <BackButton fallbackUrl="/forgot-password/verify" variant="light" />
      </div>

      {/* Content */}
      <div className="relative flex-1 px-6 py-4">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#703BF7]/20 flex items-center justify-center border border-[#703BF7]/30">
            <Lock className="w-10 h-10 text-[#703BF7]" />
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
          <h1 className="text-2xl font-bold text-white mb-3">Reset Password</h1>
          <p className="text-gray-400 text-sm">
            Create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="**********"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-14 px-4 pr-12 bg-[#12121a] border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50 focus:border-[#703BF7] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="**********"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full h-14 px-4 pr-12 bg-[#12121a] border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50 focus:border-[#703BF7] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password requirements */}
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-gray-300">Your password must include:</p>
            {requirements.map((req, index) => {
              const isMet = req.test(formData.password)
              return (
                <div key={index} className="flex items-center gap-3">
                  {isMet ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm ${isMet ? 'text-green-500' : 'text-gray-400'}`}>
                    {req.label}
                  </span>
                </div>
              )
            })}
          </div>

          <Button
            type="submit"
            disabled={!allRequirementsMet || !passwordsMatch}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#703BF7] to-[#5f32d4] hover:from-[#8b5cf6] hover:to-[#703BF7] text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#703BF7]/20"
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  )
}
