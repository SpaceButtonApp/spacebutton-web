'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'

export default function TakeSelfiePage() {
  const router = useRouter()
  const [selfieImage, setSelfieImage] = useState<string | null>(null)

  const handleCameraUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelfieImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (selfieImage) {
      sessionStorage.setItem('selfieImage', selfieImage)
      router.push('/identity-verification/submitted')
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
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <div className="w-3 h-3 rounded-full bg-teal-500" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-foreground mb-2">Take a Selfie</h2>
        <p className="text-muted-foreground text-sm mb-8">
          We need a clear selfie to confirm you match the ID document. Ensure good lighting and face the camera directly.
        </p>

        {/* Selfie Preview Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-xs mb-6">
            {selfieImage ? (
              <div className="rounded-2xl overflow-hidden">
                <img src={selfieImage} alt="Selfie" className="w-full h-auto" />
              </div>
            ) : (
              <div className="border-4 border-dashed border-muted rounded-2xl aspect-square flex flex-col items-center justify-center bg-secondary/30">
                <Camera className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground text-center">Tap to take selfie</p>
                <p className="text-xs text-muted-foreground text-center mt-2">Front camera, clear face</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Buttons */}
        <div className="space-y-3 mb-6">
          <input
            type="file"
            id="camera-input"
            accept="image/*"
            capture="environment"
            onChange={handleCameraUpload}
            className="hidden"
          />
          
          <label htmlFor="camera-input">
            <Button
              asChild
              className="w-full h-12 rounded-xl cursor-pointer"
            >
              <span><Camera className="w-4 h-4 mr-2" />Take Selfie</span>
            </Button>
          </label>

          {selfieImage && (
            <Button
              onClick={() => setSelfieImage(null)}
              variant="outline"
              className="w-full h-12 rounded-xl"
            >
              Retake Selfie
            </Button>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="px-4 pb-8">
        <Button
          onClick={handleSubmit}
          disabled={!selfieImage}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Submit Selfie
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}
