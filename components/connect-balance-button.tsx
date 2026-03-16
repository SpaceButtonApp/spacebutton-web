'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function ConnectBalanceButton() {
  const router = useRouter()
  const { user, purchasePremium } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const connectBalance = user?.connectsRemaining || 0
  const hasNoConnects = connectBalance === 0
  const displayBalance = connectBalance === 999 ? 'Unlimited' : connectBalance

  const handlePurchase = (type: 'basic-single' | 'basic-5' | 'premium-monthly' | 'premium-yearly', amount: number) => {
    purchasePremium(type, amount)
    setShowModal(false)
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
            : 'bg-primary text-primary-foreground hover:bg-primary/90',
          isHovered ? 'px-3 py-2 w-auto' : 'px-2 py-2 w-auto'
        )}
      >
        {hasNoConnects ? (
          <>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {isHovered && <span>0</span>}
            {!isHovered && <span>0</span>}
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 flex-shrink-0" />
            <span>{displayBalance}</span>
          </>
        )}
      </button>

      {/* Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md rounded-t-3xl bg-background p-6 pb-8">
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-muted" />

            <h2 className="mb-2 text-2xl font-bold">Get Connects</h2>
            <p className="mb-6 text-muted-foreground">
              Purchase connects to reach out to property owners and agents
            </p>

            <div className="space-y-3">
              {/* Single Connect */}
              <button
                onClick={() => handlePurchase('basic-single', 2000)}
                className="w-full rounded-xl border-2 border-border p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">1 Connect</p>
                    <p className="text-sm text-muted-foreground">Single reach out</p>
                  </div>
                  <p className="font-bold text-primary">₦2,000</p>
                </div>
              </button>

              {/* 5 Connects */}
              <button
                onClick={() => handlePurchase('basic-5', 5000)}
                className="w-full rounded-xl border-2 border-border p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">5 Connects</p>
                    <p className="text-sm text-muted-foreground">Multiple reach outs</p>
                  </div>
                  <p className="font-bold text-primary">₦5,000</p>
                </div>
              </button>

              {/* Monthly Premium */}
              <button
                onClick={() => handlePurchase('premium-monthly', 50000)}
                className="w-full rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-left transition-all hover:border-primary hover:bg-primary/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Unlimited Connects (Monthly)</p>
                    <p className="text-sm text-muted-foreground">Premium access</p>
                  </div>
                  <p className="font-bold text-primary">₦50,000</p>
                </div>
              </button>

              {/* Yearly Premium */}
              <button
                onClick={() => handlePurchase('premium-yearly', 480000)}
                className="w-full rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-left transition-all hover:border-primary hover:bg-primary/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Unlimited Connects (Yearly)</p>
                    <p className="text-sm text-muted-foreground">Best value</p>
                  </div>
                  <p className="font-bold text-primary">₦480,000</p>
                </div>
              </button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="mt-6 w-full rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
