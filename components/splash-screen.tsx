'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'initial' | 'pulse' | 'expand' | 'reveal' | 'hold' | 'fadeOut'>('initial')
  
  const logoIcon = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  useEffect(() => {
    // Phase 0: Initial - logo starts small (0-100ms)
    const initialTimer = setTimeout(() => setPhase('pulse'), 100)
    
    // Phase 1: Pulse animation (100-700ms)
    const pulseTimer = setTimeout(() => setPhase('expand'), 700)
    
    // Phase 2: Expand with ring effect (700-1200ms)
    const expandTimer = setTimeout(() => setPhase('reveal'), 1200)
    
    // Phase 3: Reveal text (1200-1800ms)
    const revealTimer = setTimeout(() => setPhase('hold'), 1800)
    
    // Phase 4: Hold (1800-2800ms)
    const holdTimer = setTimeout(() => setPhase('fadeOut'), 2800)
    
    // Phase 5: Fade out and complete (3200ms total)
    const completeTimer = setTimeout(() => onComplete(), 3200)

    return () => {
      clearTimeout(initialTimer)
      clearTimeout(pulseTimer)
      clearTimeout(expandTimer)
      clearTimeout(revealTimer)
      clearTimeout(holdTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden transition-opacity duration-400 ${
        phase === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Central glow */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px] transition-all duration-700 ease-out ${
            phase === 'initial' ? 'w-0 h-0 opacity-0' :
            phase === 'pulse' ? 'w-[200px] h-[200px] opacity-100' :
            phase === 'expand' ? 'w-[400px] h-[400px] opacity-80' :
            'w-[600px] h-[600px] opacity-60'
          }`}
        />
        
        {/* Expanding ring effect */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/30 transition-all ease-out ${
            phase === 'expand' || phase === 'reveal' || phase === 'hold' || phase === 'fadeOut'
              ? 'w-[300px] h-[300px] opacity-0 duration-1000' 
              : 'w-16 h-16 opacity-0 duration-0'
          }`}
        />
        
        {/* Secondary expanding ring */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 transition-all ease-out ${
            phase === 'expand' || phase === 'reveal' || phase === 'hold' || phase === 'fadeOut'
              ? 'w-[400px] h-[400px] opacity-0 duration-1200' 
              : 'w-16 h-16 opacity-0 duration-0'
          }`}
          style={{ transitionDelay: '100ms' }}
        />
        
        {/* Floating particles */}
        {(phase === 'reveal' || phase === 'hold') && (
          <>
            <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-primary/40 animate-float-1" />
            <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-primary/30 animate-float-2" />
            <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-primary/50 animate-float-3" />
            <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-primary/20 animate-float-4" />
          </>
        )}
      </div>

      {/* Main animation container */}
      <div className="relative flex items-center justify-center">
        {/* Rotating ring behind logo */}
        <div 
          className={`absolute transition-all duration-500 ease-out ${
            phase === 'initial' ? 'scale-0 opacity-0' :
            phase === 'pulse' ? 'scale-100 opacity-100' :
            'scale-110 opacity-0'
          }`}
        >
          <div className="w-24 h-24 rounded-full border-2 border-primary/40 border-t-primary animate-spin-slow" />
        </div>

        {/* Pulsing glow behind logo */}
        <div 
          className={`absolute w-20 h-20 rounded-2xl bg-primary/30 blur-xl transition-all duration-300 ${
            phase === 'pulse' ? 'animate-pulse-glow opacity-100' : 
            phase === 'expand' || phase === 'reveal' || phase === 'hold' ? 'opacity-60 scale-125' :
            'opacity-0 scale-75'
          }`}
        />

        {/* Logo Icon */}
        <div 
          className={`relative transition-all ease-out ${
            phase === 'initial' ? 'scale-0 opacity-0 duration-0' :
            phase === 'pulse' ? 'scale-100 opacity-100 duration-300 animate-bounce-subtle' :
            phase === 'expand' ? 'scale-110 opacity-100 duration-300' :
            'scale-100 opacity-100 duration-300'
          }`}
        >
          <Image
            src={logoIcon}
            alt="SpaceButton"
            width={72}
            height={72}
            className="w-18 h-18"
            priority
          />
        </div>

        {/* SpaceButton text - slides in from right with stagger */}
        <div 
          className={`overflow-hidden transition-all ease-out ${
            phase === 'reveal' || phase === 'hold' || phase === 'fadeOut'
              ? 'max-w-[200px] opacity-100 ml-3 duration-500' 
              : 'max-w-0 opacity-0 ml-0 duration-300'
          }`}
        >
          <span className="text-2xl font-bold text-foreground whitespace-nowrap">
            SpaceButton
          </span>
        </div>
      </div>

      {/* Tagline - appears during hold phase with typing effect */}
      <div 
        className={`absolute bottom-32 text-center transition-all duration-500 ease-out ${
          phase === 'hold' || phase === 'fadeOut' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <p className="text-muted-foreground text-sm font-medium tracking-wide">
          Find Your Perfect Space
        </p>
      </div>

      {/* Loading dots */}
      <div 
        className={`absolute bottom-20 flex items-center gap-1.5 transition-all duration-300 ${
          phase === 'hold' || phase === 'fadeOut' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce-dot" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce-dot" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce-dot" style={{ animationDelay: '300ms' }} />
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 1s ease-in-out infinite;
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 0.6s ease-in-out infinite;
        }
        
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-dot {
          animation: bounce-dot 1.4s ease-in-out infinite;
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -15px); }
        }
        .animate-float-1 {
          animation: float-1 3s ease-in-out infinite;
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, 10px); }
        }
        .animate-float-2 {
          animation: float-2 4s ease-in-out infinite;
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(8px, 12px); }
        }
        .animate-float-3 {
          animation: float-3 3.5s ease-in-out infinite;
        }
        
        @keyframes float-4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-12px, -8px); }
        }
        .animate-float-4 {
          animation: float-4 4.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
