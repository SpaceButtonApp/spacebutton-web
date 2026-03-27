'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Zap, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function ConnectBalanceButton() {
  const router = useRouter()
  const { user } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>('premium-monthly')

  const connectBalance = user?.connectsRemaining || 0
  const hasNoConnects = connectBalance === 0
  const displayBalance = connectBalance === 999 ? 'Unlimited' : connectBalance

  const handlePurchase = (type: 'basic-single' | 'basic-5' | 'premium-monthly' | 'premium-yearly', amount: number, connects: number) => {
    setShowModal(false)
    router.push(`/payment?amount=${amount}&plan=${type.includes('premium') ? 'premium' : 'basic'}&connects=${connects}`)
  }

  const plans = [
    { id: 'basic-single', title: '1 Connect', subtitle: 'Single reach out', price: 'N2,000', amount: 2000, connects: 1 },
    { id: 'basic-5', title: '5 Connects', subtitle: 'Multiple reach outs', price: 'N5,000', amount: 5000, connects: 5 },
    { id: 'premium-monthly', title: 'Unlimited (Monthly)', subtitle: 'Premium access', price: 'N50,000', amount: 50000, connects: 999 },
    { id: 'premium-yearly', title: 'Unlimited (Yearly)', subtitle: 'Best value - Save 20%', price: 'N480,000', amount: 480000, connects: 999 },
  ]

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

      {/* Modal Overlay */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          {/* Modal Content - Light mode card matching reference */}
          <div 
            className="bg-white dark:bg-[#1a1a24] rounded-2xl w-full max-w-md shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="pt-6 pb-4 px-6 text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Purchase Connects</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Connects allows you to reach out to property owners and agents directly
              </p>
            </div>

            {/* Plans */}
            <div className="px-4 pb-6 space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan.id)
                    handlePurchase(plan.id as any, plan.amount, plan.connects)
                  }}
                  className={cn(
                    'w-full rounded-xl border-2 p-4 text-left transition-all flex items-center justify-between',
                    selectedPlan === plan.id
                      ? 'border-[#703BF7] bg-[#703BF7]/5 dark:bg-[#703BF7]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#703BF7]/50 bg-white dark:bg-[#12121a]'
                  )}
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{plan.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.subtitle}</p>
                  </div>
                  <p className="font-bold text-[#703BF7] text-lg">{plan.price}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
