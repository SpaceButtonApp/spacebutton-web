"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { useAppStore } from "@/lib/store"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const amount = parseInt(searchParams.get("amount") || "2000")
  const plan = searchParams.get("plan") || "basic"
  const connects = parseInt(searchParams.get("connects") || "1")
  const type = searchParams.get("type") || ""
  
  const { purchasePremium, addToWallet, addTransaction } = useAppStore()
  const hasProcessed = useRef(false)
  
  // Add connects or wallet balance after successful payment
  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true
    
    if (type === "wallet") {
      // Funding wallet
      addToWallet(amount)
    } else {
      // Purchasing connects/premium
      let purchaseType: 'basic-single' | 'basic-5' | 'premium-monthly' | 'premium-yearly' = 'basic-single'
      let transactionTitle = ''
      
      if (plan === "basic" && connects === 1) {
        purchaseType = 'basic-single'
        transactionTitle = 'Connect Purchase (1 Connect)'
      } else if (plan === "basic" && connects === 5) {
        purchaseType = 'basic-5'
        transactionTitle = 'Connect Purchase (5 Connects)'
      } else if (plan === "premium" && amount === 50000) {
        purchaseType = 'premium-monthly'
        transactionTitle = 'Premium Subscription (Monthly)'
      } else if (plan === "premium") {
        purchaseType = 'premium-yearly'
        transactionTitle = 'Premium Subscription (Yearly)'
      }
      
      purchasePremium(purchaseType, 0) // Pass 0 since payment is already made
      
      // Record the connect/premium purchase as a transaction (revenue for the company)
      addTransaction({
        type: 'credit',
        title: transactionTitle,
        amount: amount
      })
    }
  }, [amount, plan, connects, type, purchasePremium, addToWallet, addTransaction])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-success flex items-center justify-center">
            <Check className="w-16 h-16 text-white" strokeWidth={3} />
          </div>
          <div className="absolute inset-0 w-32 h-32 rounded-full bg-success/20 animate-ping" />
        </div>

        <h1 className="text-3xl font-bold mb-2">#{amount.toLocaleString()}.00</h1>
        <p className="text-muted-foreground">Successful Payment Made</p>
      </div>

      <div className="px-4 pb-24">
        <Button
          onClick={() => router.push("/home")}
          className="w-full h-14 text-base font-semibold bg-success hover:bg-success/90"
        >
          Done
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}
