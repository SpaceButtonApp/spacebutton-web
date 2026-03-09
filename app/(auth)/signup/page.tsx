'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    profileType: 'individual' as 'individual' | 'agent',
    email: '',
    phone: '',
    invitationCode: '',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!formData.agreeToTerms) newErrors.terms = 'You must agree to the terms'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Store form data and navigate to password page
    localStorage.setItem('signupData', JSON.stringify(formData))
    router.push('/signup/password')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header illustration */}
      <div className="relative h-28 bg-gradient-to-b from-secondary to-background overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice">
          {/* City skyline */}
          <rect x="20" y="60" width="30" height="60" fill="#e5e5e5" />
          <rect x="60" y="40" width="25" height="80" fill="#d4d4d4" />
          <rect x="95" y="50" width="35" height="70" fill="#e5e5e5" />
          <rect x="140" y="30" width="40" height="90" fill="#d4d4d4" />
          <rect x="190" y="45" width="30" height="75" fill="#e5e5e5" />
          <rect x="230" y="55" width="35" height="65" fill="#d4d4d4" />
          <rect x="275" y="35" width="40" height="85" fill="#e5e5e5" />
          <rect x="325" y="50" width="30" height="70" fill="#d4d4d4" />
          <rect x="365" y="65" width="25" height="55" fill="#e5e5e5" />
          {/* People */}
          <circle cx="80" cy="105" r="6" fill="#703BF7" opacity="0.4" />
          <rect x="77" y="111" width="6" height="9" fill="#703BF7" opacity="0.4" />
          <circle cx="200" cy="100" r="6" fill="#10B981" opacity="0.5" />
          <rect x="197" y="106" width="6" height="14" fill="#10B981" opacity="0.5" />
          <circle cx="350" cy="103" r="6" fill="#703BF7" opacity="0.4" />
          <rect x="347" y="109" width="6" height="11" fill="#703BF7" opacity="0.4" />
        </svg>
        
        {/* Progress indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-8 h-1 rounded-full bg-primary" />
          <div className="w-8 h-1 rounded-full bg-border" />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-4 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Create an account</h1>
          <span className="text-sm text-muted-foreground">1 of 2</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              type="text"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-14 rounded-xl border-border bg-background px-4"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, profileType: 'individual' })}
                className={`flex-1 h-14 rounded-xl font-medium transition-all ${
                  formData.profileType === 'individual'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-border text-foreground'
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, profileType: 'agent' })}
                className={`flex-1 h-14 rounded-xl font-medium transition-all ${
                  formData.profileType === 'agent'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-border text-foreground'
                }`}
              >
                Agent
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-14 rounded-xl border-border bg-background px-4"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              placeholder="Enter Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-14 rounded-xl border-border bg-background px-4"
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Invitation Code</label>
            <Input
              type="text"
              placeholder="Enter Invite Code"
              value={formData.invitationCode}
              onChange={(e) => setFormData({ ...formData, invitationCode: e.target.value })}
              className="h-14 rounded-xl border-border bg-background px-4"
            />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, agreeToTerms: checked as boolean })
              }
              className="w-5 h-5 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label htmlFor="terms" className="text-sm">
              I agree to SpaceButton{' '}
              <Link href="/terms" className="text-primary font-medium">
                Terms & Condition
              </Link>
            </label>
          </div>
          {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}

          <Button
            type="submit"
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
          >
            Sign Up
          </Button>
        </form>

        <p className="text-center mt-6 text-muted-foreground pb-4">
          Do You Have An Account?{' '}
          <Link href="/login" className="text-foreground font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
