"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, Wallet, CreditCard, Building2, Globe } from "lucide-react"
import { useAppStore } from "@/lib/store"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [showUnavailableModal, setShowUnavailableModal] = useState(false)
  const user = useAppStore((state) => state.user)
  const walletBalance = user?.walletBalance || 0

  const allPaymentMethods = [
    {
      id: "wallet",
      name: "Pay with Wallet",
      subtitle: `NGN ${walletBalance.toLocaleString()}.00`,
      icon: Wallet,
    },
    {
      id: "card",
      name: "Pay with Card",
      icon: CreditCard,
    },
    {
      id: "transfer",
      name: "Pay with Transfer",
      icon: Building2,
    },
    {
      id: "country",
      name: "Charge my Country",
      icon: Globe,
    },
  ]
  
  const amount = parseInt(searchParams.get("amount") || "2000")
  const plan = searchParams.get("plan") || "basic"
  const connects = searchParams.get("connects") || "1"
  const type = searchParams.get("type") || ""

  // Filter out wallet payment method when funding wallet
  const paymentMethods = type === "wallet" 
    ? allPaymentMethods.filter(method => method.id !== "wallet")
    : allPaymentMethods

  const handleMethodClick = (methodId: string) => {
    if (methodId === "country") {
      setShowUnavailableModal(true)
    } else {
      setSelectedMethod(methodId)
    }
  }

  const handleContinue = () => {
    const params = `amount=${amount}&plan=${plan}&connects=${connects}&type=${type}`
    if (selectedMethod === "transfer") {
      router.push(`/payment/transfer?${params}`)
    } else if (selectedMethod === "card") {
      router.push(`/payment/card?${params}`)
    } else {
      router.push(`/payment/success?${params}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 flex items-center justify-between">
        <div className="flex-1" />
        <h1 className="text-lg font-semibold">Select Payment Method</h1>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 pb-8">
        <div className="text-center mb-8">
          <p className="text-muted-foreground mb-2">You pay</p>
          <div className="inline-block bg-success/10 px-6 py-2 rounded-full">
            <span className="text-2xl font-bold text-success">
              #{amount.toLocaleString()}.00
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handleMethodClick(method.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                selectedMethod === method.id
                  ? "border-primary"
                  : "border-border"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <method.icon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{method.name}</p>
                {method.subtitle && (
                  <p className="text-sm text-muted-foreground">{method.subtitle}</p>
                )}
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedMethod === method.id
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}
              />
            </button>
          ))}
        </div>

        {selectedMethod && (
          <button
            onClick={handleContinue}
            className="w-full mt-8 h-14 bg-primary text-primary-foreground rounded-2xl font-semibold"
          >
            Continue
          </button>
        )}
      </div>

      {/* Unavailable Option Modal */}
      {showUnavailableModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2">Option Unavailable</h2>
            <p className="text-muted-foreground mb-6">This option is not available for you at this moment</p>
            <button
              onClick={() => setShowUnavailableModal(false)}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
