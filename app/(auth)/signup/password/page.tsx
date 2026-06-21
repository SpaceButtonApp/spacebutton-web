'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Check, X, Lock } from 'lucide-react'
import { BackButton } from '@/components/back-button'
import { authApi, getAuthErrorMessage } from '@/lib/api/auth'

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
  const [loading, setLoading] = useState(false)

  const logoUrl = '/icon.png'

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

  const handleSubmit = async (e: React.FormEvent) => {
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

    const raw = localStorage.getItem('signupData')
    if (!raw) { router.push('/signup'); return }
    const data = JSON.parse(raw)

    // Split full name → first / last
    const nameParts = (data.name as string).trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || '.'

    setLoading(true)
    try {
      await authApi.signup({
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        phone_number: data.phone,
        password: formData.password,
        role: data.profileType === 'agent' ? 'agent' : 'user',
        referral_code: data.invitationCode || undefined,
      })
      // Save password for auto-login after phone verification
      localStorage.setItem('signupData', JSON.stringify({ ...data, password: formData.password }))
      router.push(`/verify?email=${encodeURIComponent(data.email)}`)
    } catch (err) {
      setErrors({ general: getAuthErrorMessage(err) })
    } finally {
      setLoading(false)
    }
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
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-xl font-bold text-foreground">SpaceButton</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-4 mb-2">Create your password</h1>
            <p className="text-muted-foreground text-sm">Secure your account with a strong password</p>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.general && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                  {errors.general}
                </div>
              )}
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
                disabled={!allRequirementsMet || !passwordsMatch || loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Creating account...</>
                ) : 'Continue'}
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
