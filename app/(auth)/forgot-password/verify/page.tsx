'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(180)
  const email = searchParams.get('email') || 'user@example.com'

  // Timer for OTP expiration
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1)
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    // Store verification email and proceed to reset password
    localStorage.setItem('verifiedResetEmail', email)
    router.push('/forgot-password/reset')
  }

  const handleResend = () => {
    setTimeLeft(180)
    setOtp(['', '', '', '', '', ''])
    setError('')
    alert('Verification code sent to ' + email)
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
      <div className="flex-1 px-6 py-4 flex flex-col">
        <div>
          <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground mb-2">
            we have sent a code to
          </p>
          <p className="font-semibold mb-8">{email}</p>
          <p className="text-muted-foreground mb-8">Enter it below.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          {/* OTP Input */}
          <div className="flex gap-3 justify-center mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                className={`w-12 h-14 rounded-lg border-2 text-center text-lg font-semibold ${
                  digit
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-secondary'
                } focus:outline-none focus:border-primary transition-colors`}
              />
            ))}
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          {/* Timer */}
          <div className="text-center text-sm text-muted-foreground">
            {timeLeft > 0 ? (
              <p>
                Resend code in{' '}
                <span className="font-semibold text-primary">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-primary font-medium hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          <div className="flex-1" />

          <Button
            type="submit"
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
          >
            Continue
          </Button>
        </form>
      </div>
    </div>
  )
}
