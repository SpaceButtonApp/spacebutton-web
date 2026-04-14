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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <BackButton fallbackUrl="/login" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <KeyRound className="w-10 h-10 text-primary" />
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
            <span className="text-lg font-bold text-foreground">SpaceButton</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Forgot Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email or phone number to receive a verification code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Email or Phone Number</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter email or phone number"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/20"
          >
            Send Verification Code
          </Button>
        </form>
      </div>
    </div>
  )
}
