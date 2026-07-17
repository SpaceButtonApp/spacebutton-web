"use client"

import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"
import { BackButton } from '@/components/back-button'

const connects = [
  { id: 'c1',  label: '1 Connect',   subtitle: 'Single reach out',    price: 2000,  connects: 1  },
  { id: 'c5',  label: '5 Connects',  subtitle: 'Small package',       price: 5000,  connects: 5  },
  { id: 'c10', label: '10 Connects', subtitle: 'Multiple reach outs', price: 10000, connects: 10 },
  { id: 'c50', label: '50 Connects', subtitle: 'Best value package',  price: 40000, connects: 50 },
]

export default function GetConnectsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 flex items-center gap-4 border-b border-border">
        <BackButton fallbackUrl="/settings" />
        <h1 className="text-lg font-bold">Get Connects</h1>
      </header>

      <div className="px-4 py-6 space-y-4">
        <p className="text-sm text-muted-foreground text-center pb-2">
          Connects let you reach out directly to property owners and agents.
        </p>

        {connects.map((plan) => (
          <button
            key={plan.id}
            onClick={() =>
              router.push(`/payment?amount=${plan.price}&plan=basic&connects=${plan.connects}`)
            }
            className="w-full rounded-2xl border border-border bg-secondary hover:border-[#703BF7]/60 hover:bg-[#703BF7]/5 transition-all p-5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#703BF7]/15 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-[#703BF7]" fill="#703BF7" />
              </div>
              <div className="text-left">
                <p className="font-semibold">{plan.label}</p>
                <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
              </div>
            </div>
            <p className="font-bold text-[#703BF7] text-lg whitespace-nowrap">
              ₦{plan.price.toLocaleString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
