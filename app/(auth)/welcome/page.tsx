'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

// Confetti ribbon component
function Confetti() {
  const [ribbons, setRibbons] = useState<Array<{ id: number; left: number; delay: number; duration: number; color: string }>>([])
  
  useEffect(() => {
    const colors = ['#703BF7', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899']
    const newRibbons = Array.from({ length: 50 }, (_, i) => ({
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Confetti */}
      <Confetti />
      
      {/* City skyline background */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-muted/30 flex items-end justify-center">
        <div className="flex items-end gap-2 opacity-30">
          <div className="w-8 h-20 bg-muted-foreground/20 rounded-t" />
          <div className="w-12 h-32 bg-muted-foreground/20 rounded-t" />
          <div className="w-6 h-16 bg-muted-foreground/20 rounded-t" />
          <div className="w-10 h-24 bg-muted-foreground/20 rounded-t" />
          <div className="w-8 h-28 bg-muted-foreground/20 rounded-t" />
          <div className="w-14 h-20 bg-muted-foreground/20 rounded-t" />
          <div className="w-6 h-12 bg-muted-foreground/20 rounded-t" />
        </div>
      </div>
      
      {/* 3D Illustration placeholder */}
      <div className="relative mb-8 z-10">
        <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/60 flex items-center justify-center shadow-lg">
            <div className="w-20 h-16 rounded-lg bg-primary/80 flex items-center justify-center">
              <div className="w-8 h-8 rounded bg-primary-foreground/30" />
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -left-4 bottom-4 w-12 h-12 rounded-lg bg-primary/30 flex flex-col gap-1 p-2">
          <div className="h-1 w-full bg-primary/50 rounded" />
          <div className="h-1 w-full bg-primary/50 rounded" />
          <div className="h-1 w-full bg-primary/50 rounded" />
          <div className="h-1 w-full bg-primary/50 rounded" />
        </div>
      </div>

      {/* Welcome Text */}
      <h1 className="text-3xl font-bold mb-2 text-center z-10">Welcome SpaceButton</h1>
      <p className="text-muted-foreground text-center max-w-sm mb-12 z-10">
        Your account is ready to use. you will be redirected to the home page. Welcome on board
      </p>

      {/* CTA Button */}
      <Button
        onClick={() => router.push('/home')}
        className="w-full max-w-sm h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base z-10"
      >
        Explore
      </Button>
    </div>
  )
}
