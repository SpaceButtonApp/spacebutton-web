'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function FundWalletPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')

  const handleContinue = () => {
    if (amount) {
      router.push(`/payment?amount=${amount}&type=wallet`)
    }
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
        <h1 className="flex-1 text-center text-xl font-semibold">Fund Wallet</h1>
        <div className="w-12" />
      </header>

      <div className="p-4">
        <div className="mb-6">
          <label className="mb-2 block font-medium">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">NGN</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="rounded-xl pl-14 text-lg"
            />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3">
          {[1000, 2000, 5000, 10000, 20000, 50000].map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset.toString())}
              className={`rounded-xl border p-3 text-sm font-medium ${
                amount === preset.toString()
                  ? 'border-primary bg-primary/5 text-primary'
                  : ''
              }`}
            >
              NGN {preset.toLocaleString()}
            </button>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!amount}
          className="w-full rounded-xl py-6 text-lg"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
