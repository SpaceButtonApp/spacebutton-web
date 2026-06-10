'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, CreditCard, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

export default function PayWithCardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const amount = searchParams.get('amount') || '2000'
  const plan = searchParams.get('plan') || 'basic'
  const connects = searchParams.get('connects') || '1'
  const type = searchParams.get('type') || ''
  const returnUrl = searchParams.get('returnUrl') || '/home'
  
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [saveCard, setSaveCard] = useState(true)

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(' ').slice(0, 19)
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + ' / ' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handlePayNow = () => {
    router.push(`/payment/success?amount=${amount}&plan=${plan}&connects=${connects}&type=${type}&returnUrl=${encodeURIComponent(returnUrl)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 p-4">
        <button
          onClick={() => router.back()}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-xl font-semibold">Pay with Card</h1>
        <div className="w-12" />
      </header>

      <div className="p-4">
        {/* Card Scanner Area */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-primary/80 to-primary p-8">
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/50 py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/50">
              <ScanLine className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg font-medium text-white">Scan your card</p>
          </div>
        </div>

        {/* Card Number */}
        <div className="mb-4">
          <label className="mb-2 block font-medium">Card number</label>
          <div className="relative">
            <Input
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 1234 1234 1234"
              className="rounded-xl pr-32"
            />
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 gap-1">
              <div className="h-6 w-9 rounded bg-[#1434CB] text-center text-[8px] font-bold leading-6 text-white">
                VISA
              </div>
              <div className="flex h-6 w-9 items-center justify-center rounded bg-white">
                <div className="flex">
                  <div className="h-3 w-3 rounded-full bg-red-500 opacity-80" />
                  <div className="-ml-1 h-3 w-3 rounded-full bg-yellow-500 opacity-80" />
                </div>
              </div>
              <div className="h-6 w-9 rounded bg-white text-center text-[6px] font-bold leading-6 text-black">
                AMEX
              </div>
              <div className="h-6 w-9 rounded bg-orange-500 text-center text-[6px] font-bold leading-6 text-white">
                DISC
              </div>
            </div>
          </div>
        </div>

        {/* Expiry and CVC */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block font-medium">Expiry</label>
            <Input
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM / YY"
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium">CVC</label>
            <Input
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="CVC"
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Save Card */}
        <label className="mb-6 flex items-center gap-3">
          <Checkbox
            checked={saveCard}
            onCheckedChange={(checked) => setSaveCard(checked as boolean)}
          />
          <span>Save New Card</span>
        </label>

        {/* Safe Payment Notice */}
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Safe & Secure Payment
        </p>

        {/* Pay Now Button */}
        <Button onClick={handlePayNow} className="w-full rounded-xl py-6 text-lg">
          Pay Now
        </Button>

        {/* Change Payment Method */}
        <button
          onClick={() => router.push('/payment')}
          className="mt-4 w-full text-center text-muted-foreground"
        >
          Change Payment Method
        </button>
      </div>
    </div>
  )
}
