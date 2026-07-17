'use client'

<<<<<<< HEAD
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Zap, ArrowDownLeft, ArrowUpRight, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { useAppStore } from "@/lib/store"

export default function WalletPage() {
  const router = useRouter()
  const user = useAppStore((state) => state.user)
  const transactions = useAppStore((state) => state.transactions)
=======
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Zap, ArrowDownLeft, ArrowUpRight, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'
import { useAppStore } from '@/lib/store'
import { paymentsApi } from '@/lib/api/payments'
import type { TransactionResponse } from '@/lib/types/payment'
import { formatDistanceToNow } from 'date-fns'

function txIcon(type: TransactionResponse['transaction_type']) {
  if (type === 'purchase') return <ArrowDownLeft className="w-5 h-5 text-green-500" />
  if (type === 'bonus') return <Gift className="w-5 h-5 text-blue-500" />
  return <ArrowUpRight className="w-5 h-5 text-destructive" />
}

function txColor(type: TransactionResponse['transaction_type']) {
  if (type === 'purchase' || type === 'bonus') return 'text-green-500'
  return 'text-destructive'
}

export default function WalletPage() {
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const updateUser = useAppStore((s) => s.updateUser)

  const [balance, setBalance] = useState(user?.connectsRemaining ?? 0)
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [balRes, txRes] = await Promise.allSettled([
        paymentsApi.getBalance(),
        paymentsApi.getTransactions(),
      ])
      if (balRes.status === 'fulfilled') {
        setBalance(balRes.value.balance)
        updateUser({ connectsRemaining: balRes.value.balance })
      }
      if (txRes.status === 'fulfilled') {
        setTransactions(txRes.value.transactions)
      }
    } finally {
      setLoading(false)
    }
  }, [updateUser])

  useEffect(() => { load() }, [load])
>>>>>>> main

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 flex items-center justify-between border-b border-border">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">My Connects</h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pt-4">
        {/* Balance card */}
        <div className="bg-primary rounded-3xl p-6 text-primary-foreground mb-8">
<<<<<<< HEAD
          <p className="text-sm opacity-80 mb-1">Connects Balance</p>
          <h2 className="text-4xl font-bold mb-6">{user?.connectsRemaining || 0}</h2>
          <p className="text-xs opacity-75 mb-4">Each connect unlocks a new chat</p>
          <Button
            className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => router.push('/get-connects')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Get Connects
=======
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 opacity-80" />
            <p className="text-sm opacity-80">Connects Balance</p>
          </div>
          <h2 className="text-5xl font-bold mb-6">{balance}</h2>
          <Button
            variant="secondary"
            className="w-full bg-white/20 hover:bg-white/30 text-white border-0 h-11 rounded-xl font-semibold"
            onClick={() => router.push('/payment')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Buy More Connects
>>>>>>> main
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transaction History</h3>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-2xl animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
                <div className="h-5 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">No transactions yet</p>
            <p className="text-sm text-muted-foreground">Your connects purchases will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-2xl">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  tx.transaction_type === 'deduction' ? 'bg-destructive/10' : 'bg-green-500/10'
                }`}>
                  {txIcon(tx.transaction_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${txColor(tx.transaction_type)}`}>
                    {tx.transaction_type === 'deduction' ? '-' : '+'}{tx.connects_qty}
                  </p>
                  <p className="text-xs text-muted-foreground">connects</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
