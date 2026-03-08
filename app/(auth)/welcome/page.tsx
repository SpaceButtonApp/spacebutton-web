'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { Home, CheckCircle2 } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()
  const user = useAppStore((state) => state.user)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Success Icon */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-success/10 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle2 className="w-16 h-16 text-success" />
          </div>
        </div>
        {/* Animated particles */}
        <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-primary/30 animate-ping" />
        <div className="absolute -bottom-1 -right-3 w-3 h-3 rounded-full bg-success/40 animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-primary/50 animate-ping" style={{ animationDelay: '0.3s' }} />
      </div>

      {/* Welcome Text */}
      <h1 className="text-3xl font-bold mb-2 text-center">Welcome on Board!</h1>
      <p className="text-muted-foreground text-center mb-2">
        Hi {user?.name || 'there'},
      </p>
      <p className="text-muted-foreground text-center max-w-sm mb-12">
        Your account has been successfully created. Start exploring apartments now!
      </p>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
          <span className="text-background font-bold text-lg">S</span>
        </div>
        <span className="font-bold text-xl tracking-tight">SPACEBUTTON</span>
      </div>

      {/* CTA Button */}
      <Button
        onClick={() => router.push('/home')}
        className="w-full max-w-sm h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2"
      >
        <Home className="w-5 h-5" />
        Explore Apartments
      </Button>
    </div>
  )
}
