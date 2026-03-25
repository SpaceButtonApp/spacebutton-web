'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function ConnectBalanceButton() {
  const router = useRouter()
  const { user } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const connectBalance = user?.connectsRemaining || 0
  const hasNoConnects = connectBalance === 0
  const displayBalance = connectBalance === 999 ? 'Unlimited' : connectBalance

  const handlePurchase = (type: 'basic-single' | 'basic-5' | 'premium-monthly' | 'premium-yearly', amount: number, connects: number) => {
    setShowModal(false)
    router.push(`/payment?amount=${amount}&plan=${type.includes('premium') ? 'premium' : 'basic'}&connects=${connects}`)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'rounded-full font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap overflow-hidden',
          hasNoConnects
            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            : 'bg-[#703BF7] text-white hover:bg-[#5f32d4]',
          isHovered ? 'px-3 py-2 w-auto' : 'px-2 py-2 w-auto'
        )}
      >
        {hasNoConnects ? (
          <>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>0</span>
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 flex-shrink-0" />
            <span>{displayBalance}</span>
          </>
        )}
      </button>

      {/* Full Page Modal - Similar to Logout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-secondary hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Icon */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#703BF7]/20 rounded-full blur-xl" />
                <div className="relative w-16 h-16 rounded-full bg-[#703BF7]/10 border border-[#703BF7]/30 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-[#703BF7]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Get Connects</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Purchase connects to reach property owners
              </p>
            </div>

            {/* Options Grid */}
            <div className="space-y-3">
              {/* Single Connect */}
              <button
                onClick={() => handlePurchase('basic-single', 2000, 1)}
                className="w-full rounded-xl border border-border bg-secondary/50 p-4 text-left transition-all hover:border-[#703BF7] hover:bg-[#703BF7]/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">1 Connect</p>
                    <p className="text-sm text-muted-foreground">Single reach out</p>
                  </div>
                  <p className="font-bold text-lg text-[#703BF7]">N2,000</p>
                </div>
              </button>

              {/* 5 Connects */}
              <button
                onClick={() => handlePurchase('basic-5', 5000, 5)}
                className="w-full rounded-xl border border-border bg-secondary/50 p-4 text-left transition-all hover:border-[#703BF7] hover:bg-[#703BF7]/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">5 Connects</p>
                    <p className="text-sm text-muted-foreground">Multiple reach outs</p>
                  </div>
                  <p className="font-bold text-lg text-[#703BF7]">N5,000</p>
                </div>
              </button>

              {/* Monthly Premium */}
              <button
                onClick={() => handlePurchase('premium-monthly', 50000, 999)}
                className="w-full rounded-xl border border-[#703BF7]/50 bg-[#703BF7]/10 p-4 text-left transition-all hover:border-[#703BF7] hover:bg-[#703BF7]/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Unlimited (Monthly)</p>
                    <p className="text-sm text-muted-foreground">Premium access</p>
                  </div>
                  <p className="font-bold text-lg text-[#703BF7]">N50,000</p>
                </div>
              </button>

              {/* Yearly Premium */}
              <button
                onClick={() => handlePurchase('premium-yearly', 480000, 999)}
                className="w-full rounded-xl border border-[#703BF7]/50 bg-[#703BF7]/10 p-4 text-left transition-all hover:border-[#703BF7] hover:bg-[#703BF7]/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Unlimited (Yearly)</p>
                    <p className="text-sm text-muted-foreground">Best value - Save 20%</p>
                  </div>
                  <p className="font-bold text-lg text-[#703BF7]">N480,000</p>
                </div>
              </button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="mt-6 w-full h-12 rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
