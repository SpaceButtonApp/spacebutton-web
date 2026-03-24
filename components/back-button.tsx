'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  fallbackUrl?: string
  className?: string
  variant?: 'default' | 'light' | 'dark'
}

export function BackButton({ fallbackUrl = '/home', className, variant = 'default' }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Check if we have history to go back to
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      // Fallback to the specified URL
      router.push(fallbackUrl)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={cn(
        'w-10 h-10 flex items-center justify-center rounded-full transition-colors',
        variant === 'default' && 'bg-secondary hover:bg-secondary/80',
        variant === 'light' && 'bg-white/10 hover:bg-white/20 text-white',
        variant === 'dark' && 'bg-black/10 hover:bg-black/20',
        className
      )}
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  )
}
