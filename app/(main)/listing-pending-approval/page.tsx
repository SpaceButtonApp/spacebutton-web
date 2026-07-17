'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'

export default function ListingPendingApprovalPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      {/* Content */}
      <div className="px-4 flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-6">
          <div className="text-4xl font-bold text-amber-600">!</div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">Listing Submitted!</h1>
        
        <p className="text-muted-foreground max-w-sm mb-8">
          Your listing has been submitted for admin review. We typically approve within 2-4 hours. You&apos;ll receive a notification once it&apos;s approved and live.
        </p>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 mb-8 w-full max-w-sm">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <span className="font-semibold">Status:</span> Pending Approval
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-4 pb-8 space-y-3">
        <Button
          onClick={() => router.push('/home')}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Back to Home
        </Button>
        <Button
          onClick={() => router.push('/profile')}
          variant="outline"
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          View My Listings
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}
