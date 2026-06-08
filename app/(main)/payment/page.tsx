'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Zap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { paymentsApi, connectsToPackage } from '@/lib/api/payments'
import { cn } from '@/lib/utils'

const PACKAGES = [
  { connects: 50, price: 40000, label: '50 Connects', badge: 'Best Value' },
  { connects: 10, price: 10000, label: '10 Connects', badge: null },
  { connects: 5,  price: 5000,  label: '5 Connects',  badge: null },
  { connects: 1,  price: 2000,  label: '1 Connect',   badge: null },
]

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAppStore()

  // Pre-select based on `connects` query param (from connect-cost-modal)
  const requestedConnects = parseInt(searchParams.get('connects') || '1')
  const returnUrl = searchParams.get('returnUrl') || '/home'

  const [selected, setSelected] = useState<number>(
    PACKAGES.findIndex((p) => p.connects === requestedConnects) !== -1
      ? PACKAGES.findIndex((p) => p.connects === requestedConnects)
      : 3,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Store returnUrl in sessionStorage so verify page can redirect back
  useEffect(() => {
    sessionStorage.setItem('payment_return_url', returnUrl)
  }, [returnUrl])

  const handlePay = async () => {
    if (!user?.email) return
    const pkg = PACKAGES[selected]
    setLoading(true)
    setError(null)
    try {
      const { authorization_url } = await paymentsApi.initializePayment(
        connectsToPackage(pkg.connects),
        user.email,
      )
      window.location.href = authorization_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initialization failed. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Buy Connects</h1>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* What are connects */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary" />
            <p className="font-semibold text-foreground">What are Connects?</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Connects let you start conversations with property owners and agents.
            Each new chat costs 1 connect.
          </p>
        </div>

        {/* Package selector */}
        <div className="space-y-3">
          <p className="font-semibold text-foreground">Choose a package</p>
          {PACKAGES.map((pkg, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                'w-full rounded-2xl border-2 p-4 text-left flex items-center justify-between transition-all',
                selected === i
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30 bg-card',
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  selected === i ? 'border-primary bg-primary' : 'border-muted-foreground',
                )}>
                  {selected === i && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{pkg.label}</p>
                  {pkg.badge && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {pkg.badge}
                    </span>
                  )}
                </div>
              </div>
              <p className="font-bold text-primary text-lg">₦{pkg.price.toLocaleString()}</p>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-xl">
            {error}
          </p>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-4 py-6 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground text-sm">You&apos;ll pay</p>
          <p className="font-bold text-2xl text-foreground">
            ₦{PACKAGES[selected].price.toLocaleString()}
          </p>
        </div>
        <Button
          onClick={handlePay}
          disabled={loading}
          className="w-full h-14 rounded-xl text-base font-semibold"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Redirecting to Paystack...</>
          ) : (
            `Pay ₦${PACKAGES[selected].price.toLocaleString()} via Paystack`
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Secured by Paystack · SSL encrypted
        </p>
      </div>
    </div>
  )
}
