"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = {
  basic: {
    name: "Basic",
    features: [
      { text: "Basic premium", included: true },
      { text: "Get the chance to Chat the owner of the space", included: true },
      { text: "Get the chance to Call the owner of the space", included: true },
      { text: "Get the chance to Video Call the owner of the space", included: true },
      { text: "Premium advantage", included: false },
      { text: "First to review post", included: false },
    ],
    pricing: [
      { connects: 1, price: 2000, label: "1 Connect" },
      { connects: 5, price: 5000, label: "5 Connect" },
    ],
  },
  premium: {
    name: "Premium",
    features: [
      { text: "All Basic features", included: true },
      { text: "Get the chance to Chat the owner of the space", included: true },
      { text: "Get the chance to Call the owner of the space", included: true },
      { text: "Get the chance to Video Call the owner of the space", included: true },
      { text: "Premium advantage", included: true },
      { text: "First to review post", included: true },
    ],
    pricing: [
      { connects: 1, price: 5000, label: "Single Connect" },
      { connects: 5, price: 20000, label: "5 Connect" },
    ],
  },
}

export default function PremiumPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium">("basic")
  const [selectedPricing, setSelectedPricing] = useState(0)

  const currentPlan = plans[selectedPlan]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 pb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-foreground">
            <path d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-lg font-semibold">SPACEBUTTON</span>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">SpaceButton Premium</h1>

        <div className="bg-secondary rounded-full p-1 flex mb-6">
          <button
            onClick={() => setSelectedPlan("basic")}
            className={`flex-1 py-3 rounded-full text-sm font-medium transition-colors ${selectedPlan === "basic" ? "bg-background shadow-sm" : ""
              }`}
          >
            Basic
          </button>
          <button
            onClick={() => setSelectedPlan("premium")}
            className={`flex-1 py-3 rounded-full text-sm font-medium transition-colors ${selectedPlan === "premium" ? "bg-background shadow-sm" : ""
              }`}
          >
            Premium
          </button>
        </div>

        <div className="border border-border rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                {feature.included ? (
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          {currentPlan.pricing.map((pricing, index) => (
            <button
              key={index}
              onClick={() => setSelectedPricing(index)}
              className={`flex-1 p-4 rounded-xl border-2 transition-colors ${selectedPricing === index
                  ? "border-foreground"
                  : "border-border"
                }`}
            >
              <p className="text-sm text-muted-foreground">{pricing.label}</p>
              <p className="text-2xl font-bold">
                #{pricing.price.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground">/ otp</span>
              </p>
            </button>
          ))}
        </div>

        <Button
          onClick={() => router.push("/payment")}
          className="w-full h-14 text-base font-semibold"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
