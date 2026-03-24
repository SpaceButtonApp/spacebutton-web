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
            : 'bg-primary text-primary-foreground hover:bg-primary/90',
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

      {/* Purchase Modal - Centered */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#12121a] border border-gray-800/50 p-6 relative shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="mb-2 text-xl font-bold text-white">Get Connects</h2>
            <p className="mb-6 text-sm text-gray-400">
              Purchase connects to reach out to property owners and agents
            </p>

            <div className="space-y-3">
              {/* Single Connect */}
              <button
                onClick={() => handlePurchase('basic-single', 2000, 1)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-left transition-all hover:border-purple-500 hover:bg-purple-500/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">1 Connect</p>
                    <p className="text-sm text-gray-400">Single reach out</p>
                  </div>
                  <p className="font-bold text-purple-400">N2,000</p>
                </div>
              </button>

              {/* 5 Connects */}
              <button
                onClick={() => handlePurchase('basic-5', 5000, 5)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-left transition-all hover:border-purple-500 hover:bg-purple-500/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">5 Connects</p>
                    <p className="text-sm text-gray-400">Multiple reach outs</p>
                  </div>
                  <p className="font-bold text-purple-400">N5,000</p>
                </div>
              </button>

              {/* Monthly Premium */}
              <button
                onClick={() => handlePurchase('premium-monthly', 50000, 999)}
                className="w-full rounded-xl border border-purple-500/50 bg-purple-500/10 p-4 text-left transition-all hover:border-purple-400 hover:bg-purple-500/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Unlimited (Monthly)</p>
                    <p className="text-sm text-gray-400">Premium access</p>
                  </div>
                  <p className="font-bold text-purple-400">N50,000</p>
                </div>
              </button>

              {/* Yearly Premium */}
              <button
                onClick={() => handlePurchase('premium-yearly', 480000, 999)}
                className="w-full rounded-xl border border-purple-500/50 bg-purple-500/10 p-4 text-left transition-all hover:border-purple-400 hover:bg-purple-500/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Unlimited (Yearly)</p>
                    <p className="text-sm text-gray-400">Best value - Save 20%</p>
                  </div>
                  <p className="font-bold text-purple-400">N480,000</p>
                </div>
              </button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="mt-6 w-full h-12 rounded-xl border-gray-700 bg-gray-800/50 text-white hover:bg-gray-700"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
