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

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

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

    // Get signup data and create user directly
    const signupData = localStorage.getItem('signupData')
    if (signupData) {
      const data = JSON.parse(signupData)
      // Store complete signup data for final user creation
      localStorage.setItem('signupData', JSON.stringify({ ...data, password: formData.password }))
    }
    
    // Skip phone verification - go to email verification which then goes to welcome
    router.push('/verify')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <BackButton fallbackUrl="/signup" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded-full bg-primary" />
            <div className="w-8 h-1 rounded-full bg-primary" />
          </div>
          <span className="text-sm text-muted-foreground">2 of 2</span>
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
            <h1 className="text-2xl font-bold text-foreground mt-4 mb-2">Create your password</h1>
            <p className="text-muted-foreground text-sm">Secure your account with a strong password</p>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Must be at least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="w-full pl-11 pr-12 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Both passwords must match</p>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Password requirements */}
              <div className="p-4 bg-secondary rounded-xl border border-border">
                <p className="text-sm font-medium text-muted-foreground mb-3">Password requirements:</p>
                <div className="space-y-2">
                  {requirements.map((req, index) => {
                    const isMet = req.test(formData.password)
                    return (
                      <div key={index} className="flex items-center gap-3">
                        {isMet ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <X className="w-4 h-4 text-destructive" />
                        )}
                        <span className={`text-sm ${isMet ? 'text-success' : 'text-muted-foreground'}`}>
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
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
