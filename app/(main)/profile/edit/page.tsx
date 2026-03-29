'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Users, Camera } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export default function EditProfilePage() {
  const router = useRouter()
  const { user, updateUser } = useAppStore()
  const [profileImage, setProfileImage] = useState(user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face')
  const [showImageOptions, setShowImageOptions] = useState(false)
  const fileInputRef = useState<HTMLInputElement>(null)[1]
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    email: user?.email || '',
  })

  const handleSave = () => {
    updateUser({ ...formData, avatar: profileImage })
    router.back()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
        setShowImageOptions(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    alert('Camera feature requires mobile device with camera access')
    setShowImageOptions(false)
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user?.referralCode || '')
    alert('Referral code copied!')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background px-4 py-4 sticky top-0 z-40 border-b border-border">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-lg font-bold">Edit Profile</h1>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6 space-y-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary">
              <Image
                src={profileImage}
                alt="Profile"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => setShowImageOptions(!showImageOptions)}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          {showImageOptions && (
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => handleImageUpload(e as any)
                  input.click()
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Choose from Phone
              </button>
              <button
                onClick={handleCameraCapture}
                className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Take Photo
              </button>
            </div>
          )}
        </div>

        {/* Referral Section */}
        <div className="p-4 rounded-xl bg-secondary space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Referral Code</label>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-12 px-4 rounded-xl bg-background border border-border flex items-center">
                <span className="font-mono font-semibold">{user?.name?.split(' ')[0] || user?.referralCode || 'N/A'}</span>
              </div>
              <button
                onClick={copyReferralCode}
                className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center"
              >
                <Copy className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Number of Referred People</label>
            <div className="flex items-center gap-3 mt-1 h-12 px-4 rounded-xl bg-background border border-border">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">{user?.referredCount || 0} people</span>
            </div>
          </div>
        </div>

        {/* Editable Fields - Only Name is editable */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-14 rounded-xl border-border bg-background px-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
            <Input
              type="tel"
              value={formData.phone}
              disabled
              className="h-14 rounded-xl border-border bg-muted px-4 cursor-not-allowed opacity-60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Location</label>
            <Input
              type="text"
              value={formData.location}
              disabled
              className="h-14 rounded-xl border-border bg-muted px-4 cursor-not-allowed opacity-60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <Input
              type="email"
              value={formData.email}
              disabled
              className="h-14 rounded-xl border-border bg-muted px-4 cursor-not-allowed opacity-60"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}
