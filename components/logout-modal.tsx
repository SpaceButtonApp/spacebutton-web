'use client'

import { useState } from 'react'
import { Power, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api/auth'

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await authApi.logout() // clears tokens, cookie, and redirects to /login
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-sm rounded-2xl bg-card border border-border p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-secondary hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon with glow effect */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl" />
            <div className="relative w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center">
              <Power className="h-8 w-8 text-destructive" />
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-foreground">Log Out</h2>
          <p className="mb-8 text-muted-foreground">
            You are about to log out from SpaceButton.
            <br />
            Are you sure you want to proceed?
          </p>

          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={onClose}
            >
              No
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
