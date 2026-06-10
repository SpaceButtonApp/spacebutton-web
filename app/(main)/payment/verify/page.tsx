'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { paymentsApi, syncConnectsBalance } from '@/lib/api/payments'
import { useAppStore } from '@/lib/store'

type State = 'verifying' | 'success' | 'failed'

function PaymentVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference') || searchParams.get('trxref') || ''

  const [state, setState] = useState<State>('verifying')
  const [connectsAdded, setConnectsAdded] = useState(0)
  const [newBalance, setNewBalance] = useState<number | null>(null)
  const [error, setError] = useState('')

  const { user } = useAppStore()

  useEffect(() => {
    if (!reference) {
      setState('failed')
      setError('No payment reference found.')
      return
    }

    paymentsApi.verifyPayment(reference)
      .then(async ({ connects_added }) => {
        setConnectsAdded(connects_added)
        await syncConnectsBalance()
        const balance = useAppStore.getState().user?.connectsRemaining ?? null
        setNewBalance(balance)
        setState('success')
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : ''
        // Webhook already credited the connects — still a success for the user
        if (msg.toLowerCase().includes('already verified') || msg.toLowerCase().includes('already_verified')) {
          syncConnectsBalance().then(() => {
            const balance = useAppStore.getState().user?.connectsRemaining ?? null
            setNewBalance(balance)
            setState('success')
          })
          return
        }
        setError(msg || 'Payment verification failed. Please contact support.')
        setState('failed')
      })
  }, [reference]) // eslint-disable-line react-hooks/exhaustive-deps

  const returnUrl = typeof window !== 'undefined'
    ? sessionStorage.getItem('payment_return_url') || '/home'
    : '/home'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">

        {state === 'verifying' && (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verifying payment…</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="relative mb-6 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-green-500/10 animate-ping mx-auto" />
            </div>

            <h1 className="text-2xl font-bold mb-2 text-foreground">Purchase Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Your connects have been added to your account.
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8 space-y-3">
              {connectsAdded > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Connects purchased</span>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary text-lg">+{connectsAdded}</span>
                  </div>
                </div>
              )}
              {newBalance !== null && (
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm text-muted-foreground">New balance</span>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-bold text-foreground text-lg">{newBalance} connects</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => router.push(returnUrl)}
              className="w-full h-12 rounded-xl font-semibold bg-green-500 hover:bg-green-600 text-white"
            >
              Continue
            </Button>
          </>
        )}

        {state === 'failed' && (
          <>
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-muted-foreground mb-8">{error || 'Something went wrong. Please contact support if your money was deducted.'}</p>
            <div className="space-y-3">
              <Button onClick={() => router.push('/payment')} className="w-full h-12 rounded-xl font-semibold">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push(returnUrl)} className="w-full h-12 rounded-xl">
                Go Back
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentVerifyPageWrapper() {
  return <Suspense><PaymentVerifyPage /></Suspense>
}
