'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { Check } from 'lucide-react'

interface ConnectCostModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  propertyTitle: string
  agentId?: string
  propertyId?: string
}

const connectOptions = [
  { connects: 50, price: 40000, label: "50 Connects" },
  { connects: 10, price: 10000, label: "10 Connects" },
  { connects: 5, price: 5000, label: "5 Connects" },
  { connects: 1, price: 2000, label: "1 Connect" },
]

export function ConnectCostModal({ isOpen, onClose, onConfirm, propertyTitle, agentId, propertyId }: ConnectCostModalProps) {
  const router = useRouter()
  const user = useAppStore((state) => state.user)
  const deductConnect = useAppStore((state) => state.deductConnect)
  const connectsRemaining = user?.connectsRemaining || 0
  const [selectedOption, setSelectedOption] = useState(3) // Default to lowest (1 Connect)

  if (!isOpen) return null

  const hasEnoughConnects = connectsRemaining > 0

  const handlePrimaryAction = () => {
    if (hasEnoughConnects) {
      // Deduct 1 connect when user clicks Chat
      deductConnect()
      onConfirm()
      if (agentId) {
        router.push(`/chat/${agentId}${propertyId ? `?propertyId=${propertyId}` : ''}`)
      }
    } else {
      // Go to payment with selected option
      const option = connectOptions[selectedOption]
      router.push(`/payment?amount=${option.price}&plan=basic&connects=${option.connects}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="mx-4 w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-background p-6 shadow-lg">
        <h2 className="mb-2 text-2xl font-bold text-center">Connect with Owner</h2>
        
        {hasEnoughConnects ? (
          <>
            <div className="mb-6 rounded-lg bg-muted p-4 text-center">
              <p className="text-foreground mb-2">
                This will cost you <span className="font-bold">1 connect</span>
              </p>
              <p className="text-sm text-muted-foreground">
                You have {connectsRemaining} connect{connectsRemaining !== 1 ? 's' : ''} remaining.
              </p>
            </div>

            <div className="mb-4 rounded-lg bg-success/10 border border-success/20 p-3">
              <p className="text-sm text-success font-medium">
                Click on the chat button to start chat with the owner.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive font-medium">
                You don&apos;t have enough connects. Please purchase more connects to continue.
              </p>
            </div>

            <div className="space-y-2 mb-4">
              {connectOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={`w-full p-3 rounded-xl border-2 transition-colors flex items-center justify-between ${
                    selectedOption === index
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === index ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {selectedOption === index && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <span className="font-bold">N{option.price.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={handlePrimaryAction}
            className="w-full rounded-xl h-12"
          >
            {hasEnoughConnects ? 'Chat' : 'Buy Connects'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-xl h-12"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
