'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Bookmark, Clock } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { PropertyCard } from '@/components/property-card'
import { ConnectBalanceButton } from '@/components/connect-balance-button'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const tabs = ['Connect', 'Agent', 'Shortlet', 'Properties'] as const
type Tab = typeof tabs[number]

export default function HomePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, activeTab, setActiveTab, properties } = useAppStore()
  const [currentTab, setCurrentTab] = useState<Tab>('Connect')

  useEffect(() => {
    setMounted(true)
  }, [])

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-kJSONfc9hORfv0xhwC97LF0eSOCvJL.png'

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab)
    if (tab === 'Connect' || tab === 'Agent') {
      setActiveTab(tab.toLowerCase() as 'connect' | 'agent')
    }
  }

  const filteredProperties = properties.filter((property) => {
    const type = property.listingType || property.type
    if (currentTab === 'Connect') return type === 'connect'
    if (currentTab === 'Agent') return type === 'agent'
    return false
  })

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-background px-4 py-4 sticky top-0 z-40">
        {/* Top Row - Logo and User Actions */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.push('/profile')}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-border flex-shrink-0"
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
          <div className="flex-1 flex items-center justify-center">
            <Image
              src={logoUrl}
              alt="Spacebutton"
              width={48}
              height={48}
              className="h-12 w-12"
            />
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ConnectBalanceButton />
            <button 
              onClick={() => router.push('/saved')}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"
            >
              <Bookmark className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex bg-secondary rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  currentTab === tab
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {currentTab === 'Shortlet' || currentTab === 'Properties' ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">AVAILABLE SOON</h2>
            <p className="text-muted-foreground text-center">
              We&apos;re working on bringing you amazing {currentTab.toLowerCase()} options.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
