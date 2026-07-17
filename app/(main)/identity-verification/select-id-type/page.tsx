'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'

const idTypes = [
  { id: 'nin', label: 'National Identification Number (NIN)' },
  { id: 'passport', label: 'International Passport' },
  { id: 'drivers-license', label: 'Driver\'s License' },
  { id: 'voters-card', label: 'Voter\'s Card' }
]

export default function SelectIDTypePage() {
  const router = useRouter()
  const [selectedID, setSelectedID] = useState<string | null>(null)

  const handleContinue = () => {
    if (selectedID) {
      sessionStorage.setItem('selectedIDType', selectedID)
      router.push('/identity-verification/upload-id')
    }
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
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <div className="w-3 h-3 rounded-full bg-muted" />
          <div className="w-3 h-3 rounded-full bg-muted" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 flex-1">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select ID Type</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Choose the government-issued ID you&apos;ll be uploading.
        </p>

        {/* ID Type Options */}
        <div className="space-y-3">
          {idTypes.map((idType) => (
            <button
              key={idType.id}
              onClick={() => setSelectedID(idType.id)}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                selectedID === idType.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{idType.label}</span>
                {selectedID === idType.id && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <div className="px-4 pb-8">
        <Button
          onClick={handleContinue}
          disabled={!selectedID}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Continue
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}
