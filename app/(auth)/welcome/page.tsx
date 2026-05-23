'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { Sparkles, Home, Users, Zap, CheckCircle } from 'lucide-react'

interface SignupData {
  name: string
  gender: string
  profileType: 'individual' | 'agent'
  email: string
  phone: string
  invitationCode?: string
}

// Confetti ribbon component
function Confetti() {
  const [ribbons, setRibbons] = useState<Array<{ id: number; left: number; delay: number; duration: number; color: string }>>([])
  
  useEffect(() => {
    const colors = ['#703BF7', '#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#EC4899']
    const newRibbons = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setRibbons(newRibbons)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {ribbons.map((ribbon) => (
        <div
          key={ribbon.id}
          className="absolute w-2 h-6 animate-fall"
          style={{
            left: `${ribbon.left}%`,
            backgroundColor: ribbon.color,
            animationDelay: `${ribbon.delay}s`,
            animationDuration: `${ribbon.duration}s`,
            borderRadius: '2px',
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  )
}

export default function WelcomePage() {
  const router = useRouter()
  const user = useAppStore((state) => state.user)
  const setUser = useAppStore((state) => state.setUser)
  const addRegisteredUser = useAppStore((state) => state.addRegisteredUser)
  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'
  
  // Create user from signup data on mount
  useEffect(() => {
    const signupDataStr = localStorage.getItem('signupData')
    if (signupDataStr && !user) {
      const signupData: SignupData = JSON.parse(signupDataStr)
      localStorage.removeItem('signupData')
      
      const userId = `user-${Date.now()}`
      
      // Add to registered users for admin tracking
      addRegisteredUser({
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        type: signupData.profileType,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        gender: signupData.gender as 'Male' | 'Female' | 'Other',
      })
      
      setUser({
        id: userId,
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        type: signupData.profileType,
        isLoggedIn: true,
        referralCode: `REF${Date.now().toString(36).toUpperCase()}`,
        referredCount: 0,
        location: 'Nigeria',
        walletBalance: 0,
        isPremium: false,
        connectsRemaining: 3,
        gender: signupData.gender as 'Male' | 'Female' | 'Other',
      })
    }
  }, [user, setUser, addRegisteredUser])

  const features = [
    { icon: Home, label: 'Find your perfect space' },
    { icon: Users, label: 'Verified property listings' },
    { icon: Zap, label: '₦6000 connect included' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Confetti */}
      <Confetti />
      
      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
        {/* Success Icon */}
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-success/20 to-success/30 flex items-center justify-center shadow-2xl shadow-success/20 border border-success/30">
            <CheckCircle className="w-14 h-14 text-success" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <Image
            src={logoUrl}
            alt="SpaceButton"
            width={48}
            height={48}
            className="h-12 w-12"
          />
          <span className="text-2xl font-bold text-foreground">SpaceButton</span>
        </div>

        {/* Welcome Text */}
        <h1 className="text-3xl font-bold text-foreground mb-3 text-center">Welcome aboard!</h1>
        <p className="text-muted-foreground text-center max-w-sm mb-8">
          Your account is ready. Start exploring the best spaces tailored just for you.
        </p>

        {/* Features */}
        <div className="w-full max-w-sm space-y-3 mb-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-card/80 border border-border/50 backdrop-blur-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-foreground font-medium">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => router.push('/home')}
          className="w-full max-w-sm h-14 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25 transition-all"
        >
          Start Exploring
        </Button>
      </div>
    </div>
  )
}
