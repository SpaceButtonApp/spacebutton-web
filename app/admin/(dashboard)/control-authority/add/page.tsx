'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AddAdminPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }
    setShowSuccess(true)
  }

  if (showSuccess) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="bg-card rounded-2xl border border-border p-12 max-w-md text-center">
          {/* Confetti-like decoration */}
          <div className="relative mb-8">
            <div className="absolute -top-4 -left-4 w-3 h-3 bg-green-500 rounded-full" />
            <div className="absolute -top-2 left-8 w-2 h-2 bg-primary rounded-full" />
            <div className="absolute top-0 right-4 w-3 h-3 bg-amber-500 rounded-full" />
            <div className="absolute -top-6 right-12 w-2 h-2 bg-blue-500 rounded-full" />
            
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-5xl">👍</span>
            </div>
            
            <div className="absolute bottom-0 -left-2 w-2 h-2 bg-pink-500 rounded-full" />
            <div className="absolute bottom-4 right-0 w-3 h-3 bg-green-400 rounded-full" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Your account successfully created</h2>
          <p className="text-muted-foreground mb-8">
            The new admin account has been created and they can now access the dashboard.
          </p>

          <Button
            onClick={() => router.push('/admin/control-authority')}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90"
          >
            Go to home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-secondary rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Add New Admin</h1>
      </div>

      {/* Form */}
      <div className="bg-card rounded-2xl border border-border p-8 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Create Admin Account</h2>
          <p className="text-muted-foreground">
            Enter the details for the new admin account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
              className="h-12 rounded-xl bg-secondary/50 border-0"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">User Name</label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter username"
              className="h-12 rounded-xl bg-secondary/50 border-0"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Create Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create password"
                className="h-12 rounded-xl bg-secondary/50 border-0 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                className="h-12 rounded-xl bg-secondary/50 border-0 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="terms" className="text-sm">
              I agree to the <span className="text-primary">terms and conditions</span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-lg font-medium"
          >
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  )
}
