'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Check, X, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  const allRequirementsMet = requirements.every((req) => req.test(formData.password))
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allRequirementsMet || !passwordsMatch) return

    const email = searchParams.get('email') || ''
    const otp = searchParams.get('otp') || ''

    setLoading(true)
    setError('')
    try {
      await authApi.resetPassword({
        email,
        otp_code: otp,
        new_password: formData.password,
        confirm_password: formData.confirmPassword,
      })
      router.push('/login')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <BackButton fallbackUrl="/forgot-password/verify" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Lock className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Image
              src={logoUrl}
              alt="SpaceButton"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="text-lg font-bold text-foreground">SpaceButton</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Reset Password</h1>
          <p className="text-muted-foreground text-sm">
            Create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="**********"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-14 px-4 pr-12 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="**********"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full h-14 px-4 pr-12 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password requirements */}
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-muted-foreground">Your password must include:</p>
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

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={!allRequirementsMet || !passwordsMatch || loading}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPageWrapper() {
  return <Suspense><ResetPasswordPage /></Suspense>
}
