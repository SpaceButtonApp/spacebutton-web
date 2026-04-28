'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Phone, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PhoneVerificationPage() {
  const router = useRouter()
  const [codes, setCodes] = useState<string[]>(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  const [phoneNumber, setPhoneNumber] = useState('')
  
  useEffect(() => {
    const signupData = localStorage.getItem('signupData')
    if (signupData) {
      const data = JSON.parse(signupData)
      setPhoneNumber(data.phoneNumber || data.phone || '')
    }
    inputRefs.current[0]?.focus()
  }, [])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newCodes = [...codes]
    newCodes[index] = value
    setCodes(newCodes)

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
    setTimeout(() => {
      router.push('/welcome')
    }, 1000)
  }

  const handleResendOTP = () => {
    setIsResending(true)
    setCodes(['', '', '', '', '', ''])
    
    // Simulate resend
    setTimeout(() => {
      setIsResending(false)
      setResendTimer(30) // 30 second cooldown
      inputRefs.current[0]?.focus()
    }, 1500)
  }

  const maskedPhone = phoneNumber
    ? phoneNumber.slice(0, 4) + '*'.repeat(Math.max(0, phoneNumber.length - 6)) + phoneNumber.slice(-2)
    : 'your phone number'

  const isCodeComplete = codes.every(c => c !== '')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4 flex flex-col items-center">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-lg shadow-success/30">
            <Phone className="w-12 h-12 text-success-foreground" />
          </div>
        </div>

        {/* Header Text */}
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
          <h1 className="text-3xl font-bold text-foreground mb-3">Verify your phone</h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            We have sent a 6-digit verification code to{' '}
            <span className="text-success font-medium">{maskedPhone}</span>
          </p>
        </div>

        {/* Code Input Boxes */}
        <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
          {codes.map((code, index) => (
            <div key={index} className="relative">
              <input
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={code}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`
                  w-14 h-16 text-center text-2xl font-bold rounded-2xl
                  bg-card border-2 text-foreground
                  focus:outline-none transition-all duration-200
                  ${code ? 'border-success shadow-lg shadow-success/20' : 'border-border focus:border-success'}
                `}
              />
              {code && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-success-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleContinue}
          disabled={isLoading || !isCodeComplete}
          className={`
            w-full max-w-sm h-14 rounded-2xl font-semibold text-base
            transition-all duration-300 transform
            ${isCodeComplete 
              ? 'bg-success hover:bg-success/90 text-success-foreground shadow-lg shadow-success/30 hover:scale-[1.02]' 
              : 'bg-secondary text-muted-foreground cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            'Verify Phone Number'
          )}
        </Button>

        {/* Resend Section */}
        <div className="text-center mt-8">
          {resendTimer > 0 ? (
            <p className="text-muted-foreground text-sm">
              Resend code in <span className="text-success font-medium">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={isResending}
              className="text-sm text-muted-foreground hover:text-success transition-colors flex items-center gap-2 mx-auto"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend verification code</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-auto pt-8 text-center">
          <p className="text-muted-foreground text-xs">
            Didn&apos;t receive the SMS? Check your phone signal
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            For demo: Enter any 6-digit code (e.g., 123456)
          </p>
        </div>
      </div>
    </div>
  )
}
