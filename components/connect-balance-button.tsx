'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function ConnectBalanceButton() {
  const router = useRouter()
  const { user, purchasePremium } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const connectBalance = user?.connectsRemaining || 0
  const hasNoConnects = connectBalance === 0
  const displayBalance = connectBalance === 999 ? 'Unlimited' : connectBalance

  const handlePurchase = (type: 'basic-single' | 'basic-5' | 'premium-monthly' | 'premium-yearly', amount: number) => {
    purchasePremium(type, amount)
    setShowModal(false)
  }

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - modalPos.x,
      y: e.clientY - modalPos.y,
    })
  }

  const handleDragMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setModalPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
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
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div 
            className="w-full max-w-md rounded-t-3xl bg-background p-6 pb-8 relative"
            style={{
              transform: `translate(${modalPos.x}px, ${modalPos.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Drag Handle */}
            <div
              onMouseDown={handleDragStart}
              className="mx-auto mb-3 h-1 w-12 rounded-full bg-muted cursor-grab active:cursor-grabbing"
            />

            <h2 className="mb-1 text-lg font-bold">Get Connects</h2>
            <p className="mb-4 text-sm text-muted-foreground">
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
          </div>
        </div>
      )}
    </>
  )
}
