"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Copy, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TransferPage() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(43 * 60)
  const [copied, setCopied] = useState<string | null>(null)

  const bankDetails = {
    bankName: "Sterling Bank",
    accountName: "CORALPAY-NextGen PG",
    accountNumber: "5274332865",
    amount: "NGN 2000",
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return `${mins} Mins`
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center pr-10">Pay with Bank Transfer</h1>
      </header>

      <div className="px-4 pb-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-2">Tranfer NGN 2000</h2>
          <p className="text-muted-foreground">
            Account number expires in{" "}
            <span className="text-primary font-medium">{formatTime(timeLeft)}</span>
          </p>
        </div>

        <div className="border border-border rounded-2xl overflow-hidden mb-6">
          <div className="p-6 space-y-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">BANK NAME</p>
              <p className="font-medium">{bankDetails.bankName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">BANK NAME</p>
              <p className="font-medium">{bankDetails.accountName}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">BANK NAME</p>
                <p className="font-medium">{bankDetails.accountNumber}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.accountNumber, "account")}
                className="text-primary"
              >
                {copied === "account" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">BANK NAME</p>
                <p className="font-medium">{bankDetails.amount}</p>
              </div>
              <button
                onClick={() => copyToClipboard("2000", "amount")}
                className="text-primary"
              >
                {copied === "amount" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div className="bg-secondary px-6 py-4 flex items-center justify-center gap-2">
            <span className="text-primary font-medium">Help</span>
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mb-6">
          Note: Kindly transfer exact amount to account details above
        </p>

        <Button
          onClick={() => router.push("/payment/success")}
          className="w-full h-14 text-base font-semibold mb-4"
        >
          I've sent the Money
        </Button>

        <button
          onClick={() => router.back()}
          className="w-full text-center font-medium"
        >
          Change Payment Method
        </button>
      </div>
    </div>
  )
}
