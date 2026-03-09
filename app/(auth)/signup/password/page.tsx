'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'

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
  const setUser = useAppStore((state) => state.setUser)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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

    // Get signup data from localStorage
    const signupData = localStorage.getItem('signupData')
    if (signupData) {
      const data = JSON.parse(signupData)
      
      // Create user
      setUser({
        id: 'user-' + Date.now(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        type: data.profileType,
        isLoggedIn: true,
        referralCode: 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        referredCount: 0,
        walletBalance: 0,
        isPremium: false,
        connectsRemaining: 0,
      })
      
      localStorage.removeItem('signupData')
    }
    
    router.push('/welcome')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header illustration */}
      <div className="relative h-28 bg-gradient-to-b from-secondary to-background overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice">
          {/* City skyline */}
          <rect x="20" y="60" width="30" height="60" fill="#e5e5e5" />
          <rect x="60" y="40" width="25" height="80" fill="#d4d4d4" />
          <rect x="95" y="50" width="35" height="70" fill="#e5e5e5" />
          <rect x="140" y="30" width="40" height="90" fill="#d4d4d4" />
          <rect x="190" y="45" width="30" height="75" fill="#e5e5e5" />
          <rect x="230" y="55" width="35" height="65" fill="#d4d4d4" />
          <rect x="275" y="35" width="40" height="85" fill="#e5e5e5" />
          <rect x="325" y="50" width="30" height="70" fill="#d4d4d4" />
          <rect x="365" y="65" width="25" height="55" fill="#e5e5e5" />
          {/* People */}
          <circle cx="80" cy="105" r="6" fill="#703BF7" opacity="0.4" />
          <rect x="77" y="111" width="6" height="9" fill="#703BF7" opacity="0.4" />
          <circle cx="200" cy="100" r="6" fill="#10B981" opacity="0.5" />
          <rect x="197" y="106" width="6" height="14" fill="#10B981" opacity="0.5" />
        </svg>
        
        {/* Progress indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-8 h-1 rounded-full bg-primary" />
          <div className="w-8 h-1 rounded-full bg-primary" />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Create your password</h1>
          <span className="text-sm text-muted-foreground">2 of 2</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Create Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="**********"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-14 rounded-xl border-border bg-background px-4 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="**********"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="h-14 rounded-xl border-border bg-background px-4 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Both password must match</p>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Password requirements */}
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium">Your password must include:</p>
            {requirements.map((req, index) => {
              const isMet = req.test(formData.password)
              return (
                <div key={index} className="flex items-center gap-3">
                  {isMet ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <X className="w-4 h-4 text-destructive" />
                  )}
                  <span className={`text-sm ${isMet ? 'text-success' : 'text-foreground'}`}>
                    {req.label}
                  </span>
                </div>
              )
            })}
          </div>

          <Button
            type="submit"
            disabled={!allRequirementsMet || !passwordsMatch}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base disabled:opacity-50"
          >
            Continue
          </Button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          Do You Have An Account?{' '}
          <Link href="/login" className="text-foreground font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
