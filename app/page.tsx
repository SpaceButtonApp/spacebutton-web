'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

// Web app entry point - redirects to get-started or home
export default function WebAppEntry() {
  const router = useRouter()
  const user = useAppStore((state) => state.user)

  useEffect(() => {
    // Redirect to appropriate page based on login status
    if (user?.isLoggedIn) {
      router.replace('/home')
    } else {
      router.replace('/get-started')
    }
  }, [user, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
