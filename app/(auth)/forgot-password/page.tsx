'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailOrPhone) {
      setError('Please enter your email or phone number')
      return
    }
    
    // Store for next step
    localStorage.setItem('resetEmail', emailOrPhone)
    console.log('[v0] Reset code sent to:', emailOrPhone)
    router.push('/forgot-password/reset')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4">
        <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
        <p className="text-muted-foreground mb-8">
          Enter your email or phone number to receive a verification code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email or Phone Number</label>
            <Input
              type="text"
              placeholder="Enter email or phone number"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="h-14 rounded-xl border-border bg-background px-4"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
          >
            Send Verification Code
          </Button>
        </form>
      </div>
    </div>
  )
}
