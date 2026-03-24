'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/back-button'

export default function VerificationPage() {
  const router = useRouter()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isVerified, setIsVerified] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-kJSONfc9hORfv0xhwC97LF0eSOCvJL.png'

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pasteData)) return

    const newCode = [...code]
    pasteData.split('').forEach((char, i) => {
      if (i < 6) newCode[i] = char
    })
    setCode(newCode)
    inputRefs.current[Math.min(pasteData.length, 5)]?.focus()
  }

  const handleVerify = () => {
    // For demo purposes, accept any 6-digit code
    if (code.every(digit => digit !== '')) {
      setIsVerified(true)
      setTimeout(() => {
        router.push('/welcome')
      }, 1500)
    }
  }

  const handleResend = () => {
    setCode(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-[#703BF7]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-[#703BF7]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#703BF7]/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative px-4 pt-6 pb-4">
        <BackButton fallbackUrl="/signup/password" variant="light" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col px-6 py-8">
        {isVerified ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/30">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verified!</h1>
            <p className="text-gray-400">Redirecting you to your account...</p>
          </div>
        ) : (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-[#703BF7]/20 flex items-center justify-center border border-[#703BF7]/30">
                <Mail className="w-10 h-10 text-[#703BF7]" />
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
                <span className="text-lg font-bold text-white">SpaceButton</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Enter verification code</h1>
              <p className="text-gray-400 text-sm">
                We sent a 6-digit code to your email address. Enter the code below to verify your account.
              </p>
            </div>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold bg-[#12121a] border-2 border-gray-800 rounded-xl text-white focus:border-[#703BF7] focus:outline-none focus:ring-2 focus:ring-[#703BF7]/20 transition-all"
                />
              ))}
            </div>

            {/* Resend */}
            <div className="text-center mb-8">
              <p className="text-gray-400 text-sm">
                Didn&apos;t receive a code?{' '}
                <button
                  onClick={handleResend}
                  className="text-[#703BF7] font-medium hover:text-[#8b5cf6] transition-colors"
                >
                  Resend
                </button>
              </p>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={code.some(digit => digit === '')}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-[#703BF7] to-[#5f32d4] hover:from-[#8b5cf6] hover:to-[#703BF7] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#703BF7]/20"
            >
              Verify
            </Button>

            {/* Demo Note */}
            <p className="text-center text-gray-500 text-xs mt-6">
              For demo: Enter any 6-digit code (e.g., 123456)
            </p>
          </>
        )}
      </div>
    </div>
  )
}
