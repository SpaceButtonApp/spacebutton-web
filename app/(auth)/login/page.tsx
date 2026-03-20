'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const setUser = useAppStore((state) => state.setUser)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-Z3o2DS9CjpuvL55ZsNkmvtolSu2dZz.png'

  const handleSubmit = (e: React.FormEvent) => {
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header illustration */}
      <div className="relative h-32 bg-gradient-to-b from-secondary to-background overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice">
          {/* City skyline */}
          <rect x="20" y="80" width="30" height="70" fill="#e5e5e5" />
          <rect x="60" y="60" width="25" height="90" fill="#d4d4d4" />
          <rect x="95" y="70" width="35" height="80" fill="#e5e5e5" />
          <rect x="140" y="50" width="40" height="100" fill="#d4d4d4" />
          <rect x="190" y="65" width="30" height="85" fill="#e5e5e5" />
          <rect x="230" y="75" width="35" height="75" fill="#d4d4d4" />
          <rect x="275" y="55" width="40" height="95" fill="#e5e5e5" />
          <rect x="325" y="70" width="30" height="80" fill="#d4d4d4" />
          <rect x="365" y="85" width="25" height="65" fill="#e5e5e5" />
          {/* People silhouettes */}
          <circle cx="50" cy="130" r="8" fill="#703BF7" opacity="0.3" />
          <rect x="46" y="138" width="8" height="12" fill="#703BF7" opacity="0.3" />
          <circle cx="150" cy="125" r="8" fill="#10B981" opacity="0.4" />
          <rect x="146" y="133" width="8" height="17" fill="#10B981" opacity="0.4" />
          <circle cx="300" cy="128" r="8" fill="#703BF7" opacity="0.3" />
          <rect x="296" y="136" width="8" height="14" fill="#703BF7" opacity="0.3" />
        </svg>
      </div>

      {/* Logo & Title Section */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        <button
          onClick={() => router.push('/')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-block mb-6">
            <Image
              src={logoUrl}
              alt="Spacebutton"
              width={50}
              height={15}
              className="h-auto w-auto"
              loading="eager"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Please enter your login details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address or Phone Number</label>
            <Input
              type="text"
              placeholder="Enter email or phone number"
              value={formData.emailOrPhone}
              onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
              className="h-14 rounded-xl border-border bg-background px-4"
            />
            {errors.emailOrPhone && (
              <p className="text-sm text-destructive">{errors.emailOrPhone}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-14 rounded-xl border-border bg-background px-4 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-primary font-medium">
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center mt-8 text-muted-foreground">
          Don&apos;t Have An Account?{' '}
          <Link href="/signup" className="text-foreground font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
