'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/back-button'

export default function ForgotPasswordVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [codes, setCodes] = useState<string[]>(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newCodes = [...codes]
    newCodes[index] = value
    setCodes(newCodes)

    // Auto focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pasteData)) return

    const newCodes = [...codes]
    pasteData.split('').forEach((char, i) => {
      if (i < 6) newCodes[i] = char
    })
    setCodes(newCodes)
    inputRefs.current[Math.min(pasteData.length, 5)]?.focus()
  }

  const handleContinue = async () => {
    const verificationCode = codes.join('')
    if (verificationCode.length !== 6) {
      return
    }

    setIsLoading(true)
    // Mock verification
    setTimeout(() => {
      localStorage.setItem('resetEmail', email)
      router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}`)
    }, 1000)
  }

  const handleResendOTP = () => {
    setCodes(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
  }

  const maskedEmail = email
    ? email.substring(0, 3) + '*'.repeat(Math.max(0, email.length - 6)) + email.substring(email.length - 3)
    : 'your email'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative px-4 pt-6 pb-4">
        <BackButton fallbackUrl="/forgot-password" />
      </div>

      {/* Content */}
      <div className="relative flex-1 px-6 py-4">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Mail className="w-10 h-10 text-primary" />
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
          <h1 className="text-2xl font-bold text-foreground mb-3">Enter Verification Code</h1>
          <p className="text-muted-foreground text-sm">
            We sent a 6-digit code to{' '}
            <span className="text-foreground font-medium">{maskedEmail}</span>
          </p>
        </div>

        {/* Code Input Boxes */}
        <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
          {codes.map((code, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-card border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={isLoading || codes.some(c => c === '')}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {isLoading ? 'Verifying...' : 'Continue'}
        </Button>

        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            Didn&apos;t receive the code?{' '}
            <button
              onClick={handleResendOTP}
              className="text-primary font-medium hover:text-primary/80 transition-colors"
            >
              Resend
            </button>
          </p>
        </div>

        {/* Demo Note */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          For demo: Enter any 6-digit code (e.g., 123456)
        </p>
      </div>
    </div>
  )
}
