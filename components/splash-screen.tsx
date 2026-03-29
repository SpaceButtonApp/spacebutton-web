'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'draw' | 'connect' | 'reveal' | 'hold'>('draw')
  
  const logoIcon = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  useEffect(() => {
    // Phase 1: Draw lines (0-600ms)
    const drawTimer = setTimeout(() => setPhase('connect'), 600)
    
    // Phase 2: Lines connect and logo appears (600-1000ms)
    const connectTimer = setTimeout(() => setPhase('reveal'), 1000)
    
    // Phase 3: Reveal full logo with text (1000-1500ms)
    const revealTimer = setTimeout(() => setPhase('hold'), 1500)
    
    // Phase 4: Hold and complete (2500ms total - enough time to read)
    const completeTimer = setTimeout(() => onComplete(), 2500)

    return () => {
      clearTimeout(drawTimer)
      clearTimeout(connectTimer)
      clearTimeout(revealTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f] overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#703BF7]/10 rounded-full blur-[100px]" />
      </div>

      {/* Main animation container */}
      <div className="relative flex items-center justify-center">
        {/* SVG Line Drawing Animation */}
        {(phase === 'draw' || phase === 'connect') && (
          <svg 
            viewBox="0 0 80 80" 
            className="w-16 h-16 absolute"
            style={{ overflow: 'visible' }}
          >
            {/* Top curve of S (drawing from top-right) */}
            <path
              d="M50,15 C50,15 65,20 65,35 C65,50 40,50 40,50"
              fill="none"
              stroke="#703BF7"
              strokeWidth="8"
              strokeLinecap="round"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: phase === 'draw' ? 100 : 0,
                animation: phase === 'draw' ? 'drawTop 0.6s ease-out forwards' : 'none'
              }}
            />
            
            {/* Bottom curve of B (drawing from bottom-left) */}
            <path
              d="M30,65 C30,65 15,60 15,45 C15,30 40,30 40,30"
              fill="none"
              stroke="#703BF7"
              strokeWidth="8"
              strokeLinecap="round"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: phase === 'draw' ? 100 : 0,
                animation: phase === 'draw' ? 'drawBottom 0.6s ease-out forwards' : 'none'
              }}
            />
          </svg>
        )}

        {/* Logo Icon - fades in after lines connect */}
        <div 
          className={`transition-all duration-300 ease-out ${
            phase === 'connect' || phase === 'reveal' || phase === 'hold'
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
        >
          <Image
            src={logoIcon}
            alt="SpaceButton"
            width={64}
            height={64}
            className="w-16 h-16"
            priority
          />
        </div>

        {/* SpaceButton text - slides in from right */}
        <div 
          className={`overflow-hidden transition-all duration-400 ease-out ${
            phase === 'reveal' || phase === 'hold' 
              ? 'max-w-[200px] opacity-100 ml-3' 
              : 'max-w-0 opacity-0 ml-0'
          }`}
        >
          <span className="text-2xl font-bold text-white whitespace-nowrap">
            SpaceButton
          </span>
        </div>
      </div>

      {/* Tagline - appears during hold phase */}
      <div 
        className={`absolute bottom-32 text-center transition-all duration-300 ease-out ${
          phase === 'hold' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <p className="text-gray-400 text-sm">Find Your Perfect Space</p>
      </div>

      <style jsx>{`
        @keyframes drawTop {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawBottom {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
