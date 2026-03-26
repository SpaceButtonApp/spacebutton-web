'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Zap, X, ChevronLeft } from 'lucide-react'
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

      {/* Full Page Connect Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-background">
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => setShowModal(false)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold flex-1 text-center pr-10">Get Connects</h1>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center px-6 pt-8 pb-24">
            {/* Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#703BF7]/20 rounded-full blur-xl scale-150" />
              <div className="relative w-24 h-24 rounded-full bg-[#703BF7]/10 border-2 border-[#703BF7]/30 flex items-center justify-center">
                <Zap className="h-12 w-12 text-[#703BF7]" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground mb-2">Purchase Connects</h2>
            <p className="text-muted-foreground text-center mb-8 max-w-sm">
              Connects allow you to reach out to property owners and agents directly
            </p>

            {/* Current Balance */}
            <div className="w-full max-w-md mb-8 p-4 rounded-2xl bg-secondary/50 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Balance</span>
                <span className="text-xl font-bold text-[#703BF7]">{displayBalance} Connects</span>
              </div>
            </div>

            {/* Options */}
            <div className="w-full max-w-md space-y-4">
              {/* Single Connect */}
              <button
                onClick={() => handlePurchase('basic-single', 2000, 1)}
                className="w-full rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-[#703BF7] hover:bg-[#703BF7]/5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-foreground">1 Connect</p>
                    <p className="text-sm text-muted-foreground">Single property reach out</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-[#703BF7]">N2,000</p>
                    <p className="text-xs text-muted-foreground">per connect</p>
                  </div>
                </div>
              </button>

              {/* 5 Connects */}
              <button
                onClick={() => handlePurchase('basic-5', 5000, 5)}
                className="w-full rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-[#703BF7] hover:bg-[#703BF7]/5 hover:shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Save 50%
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-foreground">5 Connects</p>
                    <p className="text-sm text-muted-foreground">Multiple property reach outs</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-[#703BF7]">N5,000</p>
                    <p className="text-xs text-muted-foreground">N1,000 per connect</p>
                  </div>
                </div>
              </button>

              {/* Monthly Premium */}
              <button
                onClick={() => handlePurchase('premium-monthly', 50000, 999)}
                className="w-full rounded-2xl border-2 border-[#703BF7]/50 bg-[#703BF7]/5 p-5 text-left transition-all hover:border-[#703BF7] hover:bg-[#703BF7]/10 hover:shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-[#703BF7] text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Popular
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-foreground">Unlimited (Monthly)</p>
                    <p className="text-sm text-muted-foreground">Premium access - 30 days</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-[#703BF7]">N50,000</p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>
              </button>

              {/* Yearly Premium */}
              <button
                onClick={() => handlePurchase('premium-yearly', 480000, 999)}
                className="w-full rounded-2xl border-2 border-[#703BF7]/50 bg-[#703BF7]/5 p-5 text-left transition-all hover:border-[#703BF7] hover:bg-[#703BF7]/10 hover:shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Best Value
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-foreground">Unlimited (Yearly)</p>
                    <p className="text-sm text-muted-foreground">Premium access - Save 20%</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-[#703BF7]">N480,000</p>
                    <p className="text-xs text-muted-foreground line-through">N600,000</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Info text */}
            <p className="text-xs text-muted-foreground text-center mt-8 max-w-md">
              Connects are used when you want to message a property owner or agent. Premium gives you unlimited connects for the subscription period.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
