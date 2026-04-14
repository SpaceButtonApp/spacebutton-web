'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { SplashScreen } from '@/components/splash-screen'

// Web app shows splash screen first, then redirects to login/home
export default function WebAppEntry() {
  const router = useRouter()
  const user = useAppStore((state) => state.user)
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  useEffect(() => {
    // Only redirect after splash screen completes
    if (!showSplash) {
      if (user?.isLoggedIn) {
        router.replace('/home')
      } else {
        router.replace('/get-started')
      }
    }
  }, [user, router, showSplash])

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
