'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

// Web app directly redirects to login/home - no landing page
// Landing page is only for mobile app (React Native)
export default function WebAppEntry() {
  const router = useRouter()
  const user = useAppStore((state) => state.user)

  useEffect(() => {
    // If user is logged in, go to home. Otherwise, go to get-started page.
    if (user?.isLoggedIn) {
      router.replace('/home')
    } else {
      router.replace('/get-started')
    }
  }, [user, router])

  // Show a brief loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
