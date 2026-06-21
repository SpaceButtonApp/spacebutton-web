'use client'

import { AlertCircle, Zap } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useHydrated } from '@/lib/hooks/use-hydrated'
import { cn } from '@/lib/utils'

export function ConnectBalanceButton() {
  const { user } = useAppStore()
  const hydrated = useHydrated()

  const connectBalance = hydrated ? (user?.connectsRemaining || 0) : 0
  const hasNoConnects = connectBalance === 0
  const displayBalance = connectBalance === 999 ? 'Unlimited' : connectBalance

  return (
    <div
      className={cn(
        'rounded-full font-medium text-sm flex items-center gap-2 px-3 py-2',
        hasNoConnects
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-[#703BF7] text-white'
      )}
    >
      {hasNoConnects ? (
        <>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>0 Connects</span>
        </>
      ) : (
        <>
          <Zap className="w-4 h-4 flex-shrink-0" />
          <span>{displayBalance} Connects</span>
        </>
      )}
    </div>
  )
}
