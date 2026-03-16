"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const amount = parseInt(searchParams.get("amount") || "2000")

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
