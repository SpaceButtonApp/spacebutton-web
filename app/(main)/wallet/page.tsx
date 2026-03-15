"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, ArrowDownLeft, ArrowUpRight, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"

const transactions = [
  {
    id: 1,
    type: "credit",
    title: "Wallet Top Up",
    amount: 5000,
    date: "Mar 15, 2023",
  },
  {
    id: 2,
    type: "debit",
    title: "Premium Subscription",
    amount: 2000,
    date: "Mar 14, 2023",
  },
  {
    id: 3,
    type: "credit",
    title: "Referral Bonus",
    amount: 500,
    date: "Mar 12, 2023",
  },
  {
    id: 4,
    type: "debit",
    title: "Connect Purchase",
    amount: 2000,
    date: "Mar 10, 2023",
  },
]

export default function WalletPage() {
  const router = useRouter()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const balance = 1500

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">My Wallet</h1>
        <button className="w-10 h-10 flex items-center justify-center">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4">
        <div className="bg-primary rounded-3xl p-6 text-primary-foreground mb-8">
          <p className="text-sm opacity-80 mb-1">Available Balance</p>
          <h2 className="text-4xl font-bold mb-6">NGN {balance.toLocaleString()}.00</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => router.push('/wallet/fund')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Fund Wallet
            </Button>
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => setShowWithdrawModal(true)}
            >
              Withdraw
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <button className="text-sm text-primary font-medium">See All</button>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-4 p-4 bg-secondary/50 rounded-2xl"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  tx.type === "credit" ? "bg-success/10" : "bg-destructive/10"
                }`}
              >
                {tx.type === "credit" ? (
                  <ArrowDownLeft
                    className={`w-5 h-5 ${
                      tx.type === "credit" ? "text-success" : "text-destructive"
                    }`}
                  />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{tx.title}</p>
                <p className="text-sm text-muted-foreground">{tx.date}</p>
              </div>
              <p
                className={`font-semibold ${
                  tx.type === "credit" ? "text-success" : "text-destructive"
                }`}
              >
                {tx.type === "credit" ? "+" : "-"}NGN {tx.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="w-full max-w-md rounded-t-3xl bg-background p-6 pb-8">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
            <div className="flex flex-col items-center text-center">
              <p className="text-lg font-semibold mb-4">You can't withdraw at this moment</p>
              <Button
                className="w-full rounded-xl"
                onClick={() => setShowWithdrawModal(false)}
              >
                Okay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
