'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Bookmark, Clock, Sparkles } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { PropertyCard } from '@/components/property-card'
import { ConnectBalanceButton } from '@/components/connect-balance-button'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const tabs = ['Connect', 'Agent', 'Shortlet', 'Properties'] as const
type Tab = typeof tabs[number]

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { user, activeTab, setActiveTab, properties, closedProperties } = useAppStore()
  const [currentTab, setCurrentTab] = useState<Tab>('Connect')

  useEffect(() => {
    setMounted(true)
  }, [])

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab)
    if (tab === 'Connect' || tab === 'Agent') {
      setActiveTab(tab.toLowerCase() as 'connect' | 'agent')
    }
  }

  const filteredProperties = properties.filter((property) => {
    if (closedProperties.includes(property.id)) return false
    
    const type = property.listingType || property.type
    if (currentTab === 'Connect') return type === 'connect'
    if (currentTab === 'Agent') return type === 'agent'
    if (currentTab === 'Properties') return type === 'properties'
    return false
  })

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-40 -right-40 w-80 h-80 bg-[#703BF7]/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="bg-card/80 backdrop-blur-xl px-4 py-4 sticky top-0 z-40 border-b border-border">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.push('/profile')}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 flex-shrink-0 hover:border-primary transition-colors"
          >
            <Image
              src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
              alt="Profile"
              width={48}
              height={48}
              className="object-cover"
            />
          </button>
          
          {/* Centered Logo */}
          <div className="flex-1 flex items-center justify-center gap-2">
            <Image
              src={logoUrl}
              alt="Spacebutton"
              width={36}
              height={36}
              className="h-9 w-9"
            />
            <span className="text-lg font-bold text-foreground">SpaceButton</span>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ConnectBalanceButton />
            <button 
              onClick={() => router.push('/saved')}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <Bookmark className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex bg-secondary rounded-full p-1 border border-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  currentTab === tab
                    ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 relative">
        {currentTab === 'Shortlet' ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
              <Clock className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Coming Soon</h2>
            <p className="text-muted-foreground text-center max-w-xs">
              We&apos;re working on bringing you amazing {currentTab.toLowerCase()} options.
            </p>
            <div className="flex items-center gap-2 mt-4 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Stay tuned for updates</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
                  <Bookmark className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">No Listings Yet</h2>
                <p className="text-muted-foreground text-center max-w-xs">
                  Be the first to post a listing in this category.
                </p>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
