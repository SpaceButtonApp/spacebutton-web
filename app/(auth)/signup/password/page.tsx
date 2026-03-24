'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Check, X, Lock } from 'lucide-react'
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

export default function CreatePasswordPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    email: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-kJSONfc9hORfv0xhwC97LF0eSOCvJL.png'

  // Get email from signup data on mount
  useEffect(() => {
    const signupData = localStorage.getItem('signupData')
    if (signupData) {
      const data = JSON.parse(signupData)
      setFormData((prev) => ({ ...prev, email: data.email }))
    }
  }, [])

  const allRequirementsMet = requirements.every((req) => req.test(formData.password))
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    
    if (!allRequirementsMet) {
      newErrors.password = 'Password does not meet requirements'
    }
    if (!passwordsMatch) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Get signup data from localStorage and keep it for verification
    const signupData = localStorage.getItem('signupData')
    if (signupData) {
      const data = JSON.parse(signupData)
      // Store password in signup data for final user creation after verification
      localStorage.setItem('signupData', JSON.stringify({ ...data, password: formData.password }))
    }
    
    router.push(`/verify?email=${encodeURIComponent(formData.email)}`)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Progress bar */}
      <div className="relative px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <BackButton fallbackUrl="/signup" variant="light" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded-full bg-purple-500" />
            <div className="w-8 h-1 rounded-full bg-purple-500" />
          </div>
          <span className="text-sm text-gray-400">2 of 2</span>
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
            <h1 className="text-2xl font-bold text-white mt-4 mb-2">Create your password</h1>
            <p className="text-gray-400 text-sm">Secure your account with a strong password</p>
          </div>

          {/* Form Card */}
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">Must be at least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="w-full pl-11 pr-12 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">Both passwords must match</p>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Password requirements */}
              <div className="p-4 bg-[#1a1a24] rounded-xl border border-gray-800">
                <p className="text-sm font-medium text-gray-300 mb-3">Password requirements:</p>
                <div className="space-y-2">
                  {requirements.map((req, index) => {
                    const isMet = req.test(formData.password)
                    return (
                      <div key={index} className="flex items-center gap-3">
                        {isMet ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm ${isMet ? 'text-green-400' : 'text-gray-400'}`}>
                          {req.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={!allRequirementsMet || !passwordsMatch}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-center text-gray-400 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-white font-semibold hover:text-purple-400 transition-colors">
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
