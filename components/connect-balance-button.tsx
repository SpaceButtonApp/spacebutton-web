'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Zap } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useHydrated } from '@/lib/hooks/use-hydrated'
import { cn } from '@/lib/utils'

export function ConnectBalanceButton() {
  const router = useRouter()
  const { user } = useAppStore()
  const hydrated = useHydrated()
  const [showModal, setShowModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>('basic-50')

  const connectBalance = hydrated ? (user?.connectsRemaining || 0) : 0
  const hasNoConnects = connectBalance === 0
  const displayBalance = connectBalance === 999 ? 'Unlimited' : connectBalance

  const handlePurchase = (type: string, amount: number, connects: number) => {
    setShowModal(false)
    router.push(`/payment?amount=${amount}&plan=basic&connects=${connects}`)
  }

  const plans = [
    { id: 'basic-single', title: '1 Connect', subtitle: 'Single reach out', price: 'N2,000', amount: 2000, connects: 1 },
    { id: 'basic-5', title: '5 Connects', subtitle: 'Small package', price: 'N5,000', amount: 5000, connects: 5 },
    { id: 'basic-10', title: '10 Connects', subtitle: 'Multiple reach outs', price: 'N10,000', amount: 10000, connects: 10 },
    { id: 'basic-50', title: '50 Connects', subtitle: 'Best value package', price: 'N40,000', amount: 40000, connects: 50 },
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
          {/* Modal Content */}
          <div
            className="bg-white dark:bg-[#1a1a24] rounded-2xl w-full max-w-md shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="pt-5 pb-3 px-6 text-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Purchase Connects</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Connects allow you to reach out to property owners and agents directly
              </p>
            </div>

            {/* Plans */}
            <div className="px-4 space-y-2">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan.id)
                    handlePurchase(plan.id, plan.amount, plan.connects)
                  }}
                  className={cn(
                    'w-full rounded-xl border-2 px-4 py-3 text-left transition-all flex items-center justify-between',
                    selectedPlan === plan.id
                      ? 'border-[#703BF7] bg-[#703BF7]/5 dark:bg-[#703BF7]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#703BF7]/50 bg-white dark:bg-[#12121a]'
                  )}
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{plan.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{plan.subtitle}</p>
                  </div>
                  <p className="font-bold text-[#703BF7]">{plan.price}</p>
                </button>
              ))}
            </div>

            {/* Cancel Button */}
            <div className="px-4 pt-3 pb-5">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
