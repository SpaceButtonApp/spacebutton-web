'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { authApi, getAuthErrorMessage } from '@/lib/api/auth'

function VerificationCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [codes, setCodes] = useState<string[]>(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newCodes = [...codes]
    newCodes[index] = value

    setCodes(newCodes)

    // Auto focus to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement
      prevInput?.focus()
    }
  }

  const handleContinue = async () => {
    const verificationCode = codes.join('')
    if (verificationCode.length !== 6) return

    setIsLoading(true)
    setError('')
    try {
      await authApi.verifyEmail(email, verificationCode)
      // Trigger phone OTP after email is verified
      await authApi.sendPhoneOtpSignup(email)
      router.push(`/signup/phone-verification?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (isResending || resendTimer > 0) return
    setIsResending(true)
    setResendSuccess(false)
    try {
      await authApi.resendOtp(email)
      setResendSuccess(true)
      setResendTimer(30)
      setCodes(['', '', '', '', '', ''])
    } catch {
      // silently fail
    } finally {
      setIsResending(false)
    }
  }

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const maskedEmail = email
    ? email.substring(0, 3) + '*'.repeat(email.length - 6) + email.substring(email.length - 3)
    : 'your email'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header illustration */}
      <div className="relative h-32 bg-gradient-to-b from-secondary to-background overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice">
          <rect x="20" y="80" width="30" height="70" className="fill-muted" />
          <rect x="60" y="60" width="25" height="90" className="fill-muted-foreground/20" />
          <rect x="95" y="70" width="35" height="80" className="fill-muted" />
          <rect x="140" y="50" width="40" height="100" className="fill-muted-foreground/20" />
          <rect x="190" y="65" width="30" height="85" className="fill-muted" />
          <rect x="230" y="75" width="35" height="75" className="fill-muted-foreground/20" />
          <rect x="275" y="55" width="40" height="95" className="fill-muted" />
          <rect x="325" y="70" width="30" height="80" className="fill-muted-foreground/20" />
          <rect x="365" y="85" width="25" height="65" className="fill-muted" />
          <circle cx="50" cy="130" r="8" className="fill-primary/30" />
          <rect x="46" y="138" width="8" height="12" className="fill-primary/30" />
          <circle cx="150" cy="125" r="8" className="fill-success/40" />
          <rect x="146" y="133" width="8" height="17" className="fill-success/40" />
        </svg>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
            <Image
              src="/icon.png"
              alt="SpaceButton"
              width={40}
              height={40}
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-foreground">we have sent a code to</h1>
          <p className="text-foreground font-medium">{maskedEmail}</p>
          <p className="text-sm text-muted-foreground mt-1">Enter it below.</p>
        </div>

        {/* Code Input Boxes */}
        <div className="flex justify-center gap-3 mb-8">
          {codes.map((code, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-14 h-14 text-center text-xl font-bold rounded-lg border-2 transition-colors text-foreground ${
                code
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <Button
          onClick={handleContinue}
          disabled={isLoading || codes.some(c => c === '')}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base mb-4"
        >
          {isLoading ? 'Verifying...' : 'Continue'}
        </Button>

        <div className="text-center mt-4">
          {resendSuccess && (
            <p className="text-sm text-green-500 mb-2">Code resent! Check your inbox.</p>
          )}
          {resendTimer > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend code in <span className="text-primary font-semibold">{resendTimer}s</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the OTP?{' '}
              <button
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-primary font-semibold hover:underline disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerificationCodePageWrapper() {
  return <Suspense><VerificationCodePage /></Suspense>
}
