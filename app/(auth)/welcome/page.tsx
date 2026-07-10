'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sparkles, ShieldCheck, Zap } from 'lucide-react'

function Confetti() {
  const [ribbons, setRibbons] = useState<Array<{ id: number; left: number; delay: number; duration: number; color: string }>>([])

  useEffect(() => {
    const colors = ['#703BF7', '#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#EC4899']
    setRibbons(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
    )
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {ribbons.map((ribbon) => (
        <div
          key={ribbon.id}
          className="absolute w-2 h-6"
          style={{
            left: `${ribbon.left}%`,
            backgroundColor: ribbon.color,
            borderRadius: '2px',
            animation: `fall ${ribbon.duration}s ${ribbon.delay}s linear forwards`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function WelcomePage() {
  const router = useRouter()

  // Clean up signup temp data now that onboarding is complete
  useEffect(() => {
    localStorage.removeItem('signupData')
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Confetti />

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shadow-2xl shadow-primary/20 border border-primary/30">
            <Zap className="w-14 h-14 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/logo.png"
            alt="SpaceButton"
            width={40}
            height={69}
            className="h-7 w-auto"
            style={{ width: 'auto' }}
          />
          <span className="text-xl font-bold text-foreground">SpaceButton</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold text-foreground mb-2 text-center">Welcome aboard!</h1>
        <p className="text-muted-foreground text-center max-w-xs mb-8">
          Your account is ready. We've added a gift to get you started.
        </p>

        {/* Connects card */}
        <div className="w-full max-w-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-6 mb-8 text-center">
          <p className="text-muted-foreground text-sm mb-1">Your free gift</p>
          <p className="text-5xl font-extrabold text-primary mb-1">3</p>
          <p className="text-foreground font-semibold text-lg">Free Connects</p>
          <p className="text-muted-foreground text-xs mt-2">
            Use connects to reach out to property owners and agents
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <Button
            onClick={() => router.replace('/verification')}
            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            Verify your ID
          </Button>

          <Button
            variant="outline"
            onClick={() => router.replace('/home')}
            className="w-full h-14 rounded-xl border-border text-foreground font-semibold text-base hover:bg-secondary"
          >
            Continue to dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
