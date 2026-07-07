'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Upload, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BottomNav } from '@/components/bottom-nav'

export default function UploadIDPage() {
  const router = useRouter()
  const [ninNumber, setNinNumber] = useState('')
  const [idImage, setIdImage] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setIdImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (ninNumber && idImage) {
      sessionStorage.setItem('ninNumber', ninNumber)
      sessionStorage.setItem('idImage', idImage)
      router.push('/identity-verification/take-selfie')
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
          <div className="w-3 h-3 rounded-full bg-muted" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 flex-1">
        <h2 className="text-2xl font-bold text-foreground mb-2">Upload Your ID</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Take a clear photo of your {sessionStorage.getItem('selectedIDType') === 'nin' ? 'National Identification Number (NIN)' : 'government-issued ID'}. Make sure all details are readable.
        </p>

        {/* NIN Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">NIN Number</label>
          <Input
            type="text"
            placeholder="Enter your 11-digit NIN"
            value={ninNumber}
            onChange={(e) => setNinNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
            className="h-12 rounded-xl"
            maxLength={11}
          />
          <p className="text-xs text-muted-foreground mt-1">Found on your National ID card or NIMC slip</p>
        </div>

        {/* ID Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">ID Document</label>
          <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center bg-secondary/30 mb-3">
            {idImage ? (
              <div>
                <img src={idImage} alt="ID" className="w-full h-48 object-cover rounded-lg mb-3" />
                <p className="text-xs text-muted-foreground">Image uploaded successfully</p>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">Tap to upload ID</p>
                <p className="text-xs text-muted-foreground">Front of document, JPEG or PNG</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="file"
              id="gallery-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label htmlFor="gallery-upload" className="flex-1">
              <Button
                asChild
                variant="outline"
                className="w-full h-12 rounded-xl cursor-pointer"
              >
                <span><Upload className="w-4 h-4 mr-2" />Gallery</span>
              </Button>
            </label>

            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </Button>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="px-4 pb-8">
        <Button
          onClick={handleSubmit}
          disabled={!ninNumber || !idImage}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Submit ID Document
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}
