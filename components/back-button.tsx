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

  return (
    <button
      onClick={() => router.push(fallbackUrl)}
      className={cn(
        'w-10 h-10 flex items-center justify-center rounded-full transition-colors',
        variant === 'default' && 'bg-secondary border border-border hover:bg-secondary/80 text-foreground',
        variant === 'light' && 'bg-secondary/50 hover:bg-secondary text-foreground',
        variant === 'dark' && 'bg-secondary hover:bg-secondary/80 text-foreground',
        className
      )}
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  )
}
