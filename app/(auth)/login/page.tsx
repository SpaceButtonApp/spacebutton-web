'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAppStore((state) => state.setUser)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.emailOrPhone) {
      newErrors.emailOrPhone = 'Email or phone number is required'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    // Mock login - derive name from email
    const emailName = formData.emailOrPhone.includes('@') 
      ? formData.emailOrPhone.split('@')[0].replace(/[._]/g, ' ')
      : 'User'
    const capitalizedName = emailName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    
    setUser({
      id: `user-${Date.now()}`,
      name: capitalizedName,
      email: formData.emailOrPhone.includes('@') ? formData.emailOrPhone : '',
      phone: formData.emailOrPhone.includes('@') ? '' : formData.emailOrPhone,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      type: 'individual',
      isLoggedIn: true,
      referralCode: `REF${Date.now().toString(36).toUpperCase()}`,
      referredCount: 0,
      location: 'Nigeria',
      walletBalance: 0,
      isPremium: false,
      connectsRemaining: 0,
    })

    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <Image
              src={logoUrl}
              alt="SpaceButton"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <span className="text-2xl font-bold text-foreground">SpaceButton</span>
          </div>
          <p className="text-muted-foreground text-sm">Find your perfect space</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {errors.general}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.emailOrPhone}
                  onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                  placeholder="Enter email or phone number"
                  className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              {errors.emailOrPhone && (
                <p className="mt-2 text-sm text-destructive">{errors.emailOrPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Password
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
              {errors.password && (
                <p className="mt-2 text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-foreground font-semibold hover:text-primary transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  )
}
