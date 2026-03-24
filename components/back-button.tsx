'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface BackButtonProps {
  fallbackUrl?: string
  className?: string
  variant?: 'default' | 'light' | 'dark'
}

export function BackButton({ fallbackUrl = '/home', className, variant = 'default' }: BackButtonProps) {
  const router = useRouter()
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    // Check if there's actual history to go back to
    // We need at least 2 entries (current page + previous page)
    if (typeof window !== 'undefined') {
      // Use a small delay to ensure the page has fully loaded
      const checkHistory = () => {
        const hasHistory = window.history.length > 2
        setCanGoBack(hasHistory)
      }
      checkHistory()
    }
  }, [])

  const handleBack = () => {
    if (canGoBack) {
      router.back()
    } else {
      router.push(fallbackUrl)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={cn(
        'w-10 h-10 flex items-center justify-center rounded-full transition-colors',
        variant === 'default' && 'bg-[#1a1a24] border border-gray-800 hover:bg-gray-800 text-white',
        variant === 'light' && 'bg-white/10 hover:bg-white/20 text-white',
        variant === 'dark' && 'bg-black/10 hover:bg-black/20',
        className
      )}
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  )
}
