'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'
import { useAppStore } from '@/lib/store'

export default function SubmittedPage() {
  const router = useRouter()
  const { updateIdentityVerification } = useAppStore()

  useEffect(() => {
    // Mark verification as submitted and in progress
    updateIdentityVerification('in-progress')
    
    // Clean up session storage
    sessionStorage.removeItem('selectedIDType')
    sessionStorage.removeItem('ninNumber')
    sessionStorage.removeItem('idImage')
    sessionStorage.removeItem('selfieImage')
  }, [updateIdentityVerification])

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      {/* Progress Indicator */}
      <div className="px-4 pt-6">
        <div className="flex gap-2 justify-center mb-8">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <div className="w-3 h-3 rounded-full bg-teal-500" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-teal-600" />
        </div>

        <h2 className="text-3xl font-bold text-foreground mb-3">Submitted!</h2>
        
        <p className="text-muted-foreground mb-8 max-w-sm">
          Your documents are under review. We typically verify within 24 hours. You&apos;ll be notified once approved.
        </p>
      </div>

      {/* Button */}
      <div className="px-4 pb-8">
        <Button
          onClick={() => {
            sessionStorage.clear()
            router.push('/profile')
          }}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Back to Profile
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}
