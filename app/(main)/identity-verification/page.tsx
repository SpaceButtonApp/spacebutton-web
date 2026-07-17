'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'
import { useAppStore } from '@/lib/store'

export default function IdentityVerificationPage() {
  const router = useRouter()
  const { user, updateIdentityVerification } = useAppStore()
  const [currentStep, setCurrentStep] = useState(1)

  // Check if already verified or in progress
  const verificationStatus = user?.verificationStatus || 'not-started'

  const handleStartVerification = () => {
    router.push('/identity-verification/select-id-type')
  }

  if (verificationStatus === 'in-progress') {
    return (
      <div className="min-h-screen bg-background pb-24 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Identity Verification</h1>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 pt-6">
          <div className="flex gap-2 justify-center mb-8">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            <div className="w-3 h-3 rounded-full bg-muted" />
            <div className="w-3 h-3 rounded-full bg-muted" />
            <div className="w-3 h-3 rounded-full bg-muted" />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-semibold text-yellow-600">!</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Verification In Progress</h2>
          <p className="text-muted-foreground text-sm">
            Your documents are being reviewed. This usually takes up to 24 hours. You&apos;ll receive a notification once it&apos;s done.
          </p>
        </div>

        {/* Button */}
        <div className="px-4 pb-8">
          <Button
            onClick={() => router.back()}
            className="w-full h-12 rounded-xl"
            variant="outline"
          >
            Go Back
          </Button>
        </div>

        <BottomNav />
      </div>
    )
  }

  if (verificationStatus === 'approved') {
    return (
      <div className="min-h-screen bg-background pb-24 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Identity Verification</h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-teal-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Verified!</h2>
          <p className="text-muted-foreground text-sm">
            Your identity has been verified. You can now post listings and build trust in the community.
          </p>
        </div>

        {/* Button */}
        <div className="px-4 pb-8">
          <Button
            onClick={() => router.push('/profile')}
            className="w-full h-12 rounded-xl"
          >
            Back to Profile
          </Button>
        </div>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Identity Verification</h1>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="px-4 pt-6">
        <div className="flex gap-2 justify-center mb-8">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <div className="w-3 h-3 rounded-full bg-muted" />
          <div className="w-3 h-3 rounded-full bg-muted" />
          <div className="w-3 h-3 rounded-full bg-muted" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 flex-1">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground text-center mb-2">Get Verified</h2>
        <p className="text-muted-foreground text-center mb-8">
          Verified users can post listings and are trusted by others on the platform. Complete both steps to unlock posting.
        </p>

        {/* Steps */}
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Step 1 — Identity Document</h3>
                <p className="text-xs text-muted-foreground mt-1">Not submitted</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Step 2 — Live Selfie</h3>
                <p className="text-xs text-muted-foreground mt-1">Not submitted</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="px-4 pb-8">
        <Button
          onClick={handleStartVerification}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Start Verification
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}
