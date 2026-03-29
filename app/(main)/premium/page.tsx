"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from '@/components/back-button'

const plans = {
  basic: {
    name: "Basic",
    features: [
      { text: "Basic Premium", included: true },
      { text: "Get the chance to Chat the owner of the space", included: true },
      { text: "Get the chance to Call the owner of the space", included: true },
      { text: "Get the chance to Video Call the owner of the space", included: true },
    ],
    pricing: [
      { connects: 1, price: 2000, label: "1 Connect" },
      { connects: 5, price: 5000, label: "5 Connects" },
    ],
  },
  basicPlus: {
    name: "Basic+",
    features: [
      { text: "Basic Premium", included: true },
      { text: "Get the chance to Chat the owner of the space", included: true },
      { text: "Get the chance to Call the owner of the space", included: true },
      { text: "Get the chance to Video Call the owner of the space", included: true },
    ],
    pricing: [
      { connects: 10, price: 10000, label: "10 Connects" },
      { connects: 50, price: 40000, label: "50 Connects" },
    ],
  },
}

export default function PremiumPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "basicPlus">("basic")
  const [selectedPricing, setSelectedPricing] = useState(0)

  const currentPlan = plans[selectedPlan]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 flex items-center gap-4">
        <BackButton fallbackUrl="/settings" />
      </header>

      <div className="px-4 pb-8">
        <h1 className="text-2xl font-bold text-center mb-6">SpaceButton Premium</h1>

        <div className="bg-secondary rounded-full p-1 flex mb-6">
          <button
            onClick={() => {
              setSelectedPlan("basic")
              setSelectedPricing(0)
            }}
            className={`flex-1 py-3 rounded-full text-sm font-medium transition-colors ${selectedPlan === "basic" ? "bg-background shadow-sm" : ""
              }`}
          >
            Basic
          </button>
          <button
            onClick={() => {
              setSelectedPlan("basicPlus")
              setSelectedPricing(0)
            }}
            className={`flex-1 py-3 rounded-full text-sm font-medium transition-colors ${selectedPlan === "basicPlus" ? "bg-background shadow-sm" : ""
              }`}
          >
            Basic+
          </button>
        </div>

        <div className="border border-border rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing options side by side */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {currentPlan.pricing.map((pricing, index) => (
            <button
              key={index}
              onClick={() => setSelectedPricing(index)}
              className={`p-4 rounded-xl border-2 transition-colors text-center ${selectedPricing === index
                ? "border-primary bg-primary/5"
                : "border-border"
                }`}
            >
              <p className="text-sm font-medium mb-1">{pricing.label}</p>
              <p className="text-xl font-bold">
                N{pricing.price.toLocaleString()}
              </p>
              <span className="text-xs text-muted-foreground">/otp</span>
            </button>
          ))}
        </div>

        <Button
          onClick={() => {
            const selectedOption = currentPlan.pricing[selectedPricing]
            router.push(`/payment?amount=${selectedOption.price}&plan=${currentPlan.name.toLowerCase()}&connects=${selectedOption.connects}`)
          }}
          className="w-full h-14 text-base font-semibold"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
