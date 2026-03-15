'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

interface ConnectCostModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  propertyTitle: string
}

export function ConnectCostModal({ isOpen, onClose, onConfirm, propertyTitle }: ConnectCostModalProps) {
  const router = useRouter()
  const connectsRemaining = useAppStore((state) => state.connectsRemaining)

  if (!isOpen) return null

  const hasEnoughConnects = connectsRemaining > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-background p-6 shadow-lg">
        <h2 className="mb-2 text-2xl font-bold text-center">Connect to Property</h2>
        
        <div className="mb-6 rounded-lg bg-muted p-4 text-center">
          <p className="text-foreground mb-2">
            This will cost you <span className="font-bold">1 connect</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to continue?
          </p>
        </div>

        {!hasEnoughConnects && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive font-medium">
              You don't have enough connects. Please purchase more connects to continue.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (hasEnoughConnects) {
                onConfirm()
              } else {
                router.push('/premium')
              }
            }}
            className="flex-1 rounded-xl"
            disabled={!hasEnoughConnects}
          >
            {hasEnoughConnects ? 'Connect' : 'Buy Connects'}
          </Button>
        </div>
      </div>
    </div>
  )
}
