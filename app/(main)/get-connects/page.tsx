'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Zap, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'
import { useAppStore } from '@/lib/store'

interface ConnectPackage {
  id: string
  connects: number
  price: number
  description: string
  popular?: boolean
}

const packages: ConnectPackage[] = [
  {
    id: '1',
    connects: 1,
    price: 2000,
    description: 'Reach out to a single property owner or agent'
  },
  {
    id: '5',
    connects: 5,
    price: 5000,
    description: 'Explore multiple listings and connect with ease',
    popular: true
  },
  {
    id: '10',
    connects: 10,
    price: 10000,
    description: 'Great for an active property search'
  },
  {
    id: '50',
    connects: 50,
    price: 40000,
    description: 'Best value — for serious house hunters'
  }
]

export default function GetConnectsPage() {
  const router = useRouter()
  const { user, addConnects } = useAppStore()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async (pkg: ConnectPackage) => {
    if (isProcessing) return
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      addConnects(pkg.connects)
      setIsProcessing(false)
      alert(`Successfully purchased ${pkg.connects} connects!`)
      router.push('/wallet')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">SpaceButton Connects</h1>
        </div>
      </div>

      <div className="px-4 pt-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
              <Zap className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">SpaceButton Connects</h2>
          <p className="text-muted-foreground">
            Each Connect unlocks a direct conversation with a property owner or agent.
          </p>
        </div>

        {/* Packages */}
        <div className="space-y-3 mb-8">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`w-full p-4 rounded-2xl border-2 transition-all ${
                pkg.popular
                  ? selectedPackage === pkg.id
                    ? 'border-primary bg-primary/5'
                    : 'border-primary bg-primary/5'
                  : selectedPackage === pkg.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{pkg.connects} Connect{pkg.connects > 1 ? 's' : ''}</h3>
                    {pkg.popular && (
                      <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">₦{pkg.price.toLocaleString()}</p>
                  {pkg.popular && selectedPackage === pkg.id && (
                    <Check className="w-6 h-6 text-primary mt-2 ml-auto" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Purchase Button */}
        <Button
          onClick={() => {
            const pkg = packages.find(p => p.id === selectedPackage)
            if (pkg) {
              handlePurchase(pkg)
            }
          }}
          disabled={!selectedPackage || isProcessing}
          className="w-full h-14 rounded-2xl text-base font-semibold mb-4"
        >
          <Zap className="w-5 h-5 mr-2" />
          Get Connects
        </Button>

        {/* Info Text */}
        <p className="text-center text-xs text-muted-foreground">
          Payment will be charged to your Apple ID. Connects are added immediately after purchase.
        </p>
      </div>

      <BottomNav />
    </div>
  )
}
