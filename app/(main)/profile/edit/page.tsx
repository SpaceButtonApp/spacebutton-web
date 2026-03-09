'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export default function EditProfilePage() {
  const router = useRouter()
  const { user, updateUser } = useAppStore()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    email: user?.email || '',
  })

  const handleSave = () => {
    updateUser(formData)
    router.back()
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
        {/* Referral Section */}
        <div className="p-4 rounded-xl bg-secondary space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Referral Code</label>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-12 px-4 rounded-xl bg-background border border-border flex items-center">
                <span className="font-mono font-semibold">{user?.referralCode || 'N/A'}</span>
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

        {/* Editable Fields */}
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
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-14 rounded-xl border-border bg-background px-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="h-14 rounded-xl border-border bg-background px-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-14 rounded-xl border-border bg-background px-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="h-14 rounded-xl border-border bg-background px-4"
            />
            <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
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
