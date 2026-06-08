'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { paymentsApi, syncConnectsBalance } from '@/lib/api/payments'

type State = 'verifying' | 'success' | 'failed'

export default function PaymentVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference') || searchParams.get('trxref') || ''

  const [state, setState] = useState<State>('verifying')
  const [connectsAdded, setConnectsAdded] = useState(0)
  const [error, setError] = useState('')

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
        setState('success')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Payment verification failed.')
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
            <h1 className="text-2xl font-bold mb-2">Verifying payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-2">
              {connectsAdded} connect{connectsAdded !== 1 ? 's' : ''} have been added to your account.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-8">
              <p className="text-3xl font-bold text-primary">+{connectsAdded}</p>
              <p className="text-sm text-muted-foreground">Connects added</p>
            </div>
            <Button
              onClick={() => router.push(returnUrl)}
              className="w-full h-12 rounded-xl font-semibold"
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
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-muted-foreground mb-8">{error || 'Something went wrong. Please try again.'}</p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/payment')}
                className="w-full h-12 rounded-xl font-semibold"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(returnUrl)}
                className="w-full h-12 rounded-xl"
              >
                Go Back
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
