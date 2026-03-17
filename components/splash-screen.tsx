'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showFullLogo, setShowFullLogo] = useState(false)

  useEffect(() => {
    // Show icon for 1 second, then animate to full logo
    const iconTimer = setTimeout(() => {
      setShowFullLogo(true)
    }, 1000)

    // Complete splash after 3 seconds total
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 3000)

    return () => {
      clearTimeout(iconTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Hexagonal network background */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-bottom bg-contain opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='600' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='hexagons' width='50' height='43.3' patternUnits='userSpaceOnUse' patternTransform='scale(2)'%3E%3Cpolygon points='25,0 50,14.43 50,43.3 25,57.74 0,43.3 0,14.43' fill='none' stroke='%23999' stroke-width='0.5'/%3E%3Ccircle cx='25' cy='0' r='2' fill='%23999'/%3E%3Ccircle cx='50' cy='14.43' r='2' fill='%23999'/%3E%3Ccircle cx='50' cy='43.3' r='2' fill='%23999'/%3E%3Ccircle cx='25' cy='57.74' r='2' fill='%23999'/%3E%3Ccircle cx='0' cy='43.3' r='2' fill='%23999'/%3E%3Ccircle cx='0' cy='14.43' r='2' fill='%23999'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23hexagons)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Logo container */}
      <div className="relative flex items-center justify-center">
        {/* Icon - always visible, moves left when full logo shows */}
        <div 
          className={`transition-all duration-700 ease-out ${
            showFullLogo ? 'transform -translate-x-1' : ''
          }`}
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-kJSONfc9hORfv0xhwC97LF0eSOCvJL.png"
            alt="SpaceButton Icon"
            width={56}
            height={56}
            className="h-14 w-14"
            priority
          />
        </div>

        {/* Text - slides in from right */}
        <div 
          className={`overflow-hidden transition-all duration-700 ease-out ${
            showFullLogo ? 'max-w-[200px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'
          }`}
        >
          <span 
            className="text-2xl font-bold whitespace-nowrap"
            style={{ color: '#6C3AE1' }}
          >
            SpaceButton
          </span>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-[3000ms] ease-linear"
            style={{ 
              backgroundColor: '#6B3CE9',
              width: '100%',
              animation: 'loadingBar 3s linear forwards'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
