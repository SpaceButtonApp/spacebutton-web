'use client'

import { useRouter } from 'next/navigation'
import { Power, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const router = useRouter()
  const { setUser } = useAppStore()

  const handleLogout = () => {
    setUser(null)
    router.push('/login')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-sm rounded-2xl bg-[#12121a] border border-gray-800/50 p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon with glow effect */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/30 border border-red-500/30 flex items-center justify-center">
              <Power className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-white">Log Out</h2>
          <p className="mb-8 text-gray-400">
            You are about to log out from SpaceButton.
            <br />
            Are you sure you want to proceed?
          </p>

          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl border-gray-700 bg-gray-800/50 text-white hover:bg-gray-700 hover:text-white"
              onClick={onClose}
            >
              No
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-red-500 text-white hover:bg-red-600"
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
