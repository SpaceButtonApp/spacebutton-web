'use client'

import { useRouter } from 'next/navigation'
import { Power, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/login')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-50/95">
      <div className="relative mx-4 w-full max-w-sm rounded-3xl bg-red-50 p-8 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Power className="h-8 w-8 text-red-500" />
          </div>

          <h2 className="mb-2 text-2xl font-bold text-foreground">LOG OUT</h2>
          <p className="mb-6 text-muted-foreground">
            You are about to log out from SpaceButton.
            <br />
            Are you sure you want to proceed?
          </p>

          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-muted bg-muted/50"
              onClick={onClose}
            >
              No
            </Button>
            <Button
              className="flex-1 rounded-xl bg-red-500 text-white hover:bg-red-600"
              onClick={handleLogout}
            >
              Yes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
