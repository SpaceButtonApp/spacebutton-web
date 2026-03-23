'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Camera, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const [admin, setAdmin] = useState({
    name: 'Dame Dame',
    displayedName: 'Dame',
    position: 'Admin',
    email: 'dame@example.com',
    phone: '+234 123 456 7890',
    username: 'dame@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth) {
      const parsed = JSON.parse(adminAuth)
      setAdmin(prev => ({
        ...prev,
        name: parsed.name || prev.name,
        email: parsed.email || prev.email,
        avatar: parsed.avatar || prev.avatar,
      }))
    }
  }, [])

  const handleSave = () => {
    setIsEditing(false)
    localStorage.setItem('adminAuth', JSON.stringify({
      email: admin.email,
      name: admin.name,
      role: admin.position,
      avatar: admin.avatar,
    }))
    alert('Settings saved successfully!')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* General Section */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">General</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <Image
                src={admin.avatar}
                alt={admin.name}
                width={120}
                height={120}
                className="rounded-full"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            {isEditing && (
              <button className="text-primary text-sm font-medium hover:underline">
                Change Photo
              </button>
            )}
          </div>

          {/* Form Fields */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Displayed Name</label>
              <Input
                value={admin.displayedName}
                onChange={(e) => setAdmin({ ...admin, displayedName: e.target.value })}
                disabled={!isEditing}
                className="h-12 rounded-xl bg-secondary/50 border-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={admin.name}
                onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                disabled={!isEditing}
                className="h-12 rounded-xl bg-secondary/50 border-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Input
                value={admin.position}
                onChange={(e) => setAdmin({ ...admin, position: e.target.value })}
                disabled={!isEditing}
                className="h-12 rounded-xl bg-secondary/50 border-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={admin.email}
                onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                disabled={!isEditing}
                className="h-12 rounded-xl bg-secondary/50 border-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={admin.phone}
                onChange={(e) => setAdmin({ ...admin, phone: e.target.value })}
                disabled={!isEditing}
                className="h-12 rounded-xl bg-secondary/50 border-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Login Info Section */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-6">Login Info</h2>

        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username/Email</label>
            <Input
              value={admin.username}
              disabled
              className="h-12 rounded-xl bg-secondary/50 border-0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="flex gap-3">
              <Input
                type="password"
                value="••••••••"
                disabled
                className="h-12 rounded-xl bg-secondary/50 border-0"
              />
              <Button
                variant="outline"
                className="h-12 px-6"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">Change Password</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  className="h-12 rounded-xl bg-secondary/50 border-0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  className="h-12 rounded-xl bg-secondary/50 border-0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  className="h-12 rounded-xl bg-secondary/50 border-0"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => {
                  setShowPasswordModal(false)
                  alert('Password changed successfully!')
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
