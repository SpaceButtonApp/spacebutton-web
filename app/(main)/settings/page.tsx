'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  User, Wallet, Zap, Shield, Bell, 
  HelpCircle, LogOut, ChevronRight 
} from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { LogoutModal } from '@/components/logout-modal'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: User, label: 'Profile', href: '/profile', color: 'text-foreground', bg: 'bg-primary/20' },
  { icon: Wallet, label: 'My Wallet', href: '/wallet', color: 'text-foreground', bg: 'bg-blue-500/20' },
  { icon: Zap, label: 'Get Connects', href: '/get-connects', color: 'text-foreground', bg: 'bg-yellow-500/20' },
  { icon: Shield, label: 'Identity Verification', href: '/identity-verification', color: 'text-foreground', bg: 'bg-purple-500/20' },
  { icon: Bell, label: 'Notifications', href: '/notifications', badge: 1, color: 'text-foreground', bg: 'bg-green-500/20' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help', color: 'text-foreground', bg: 'bg-cyan-500/20' },
  { icon: LogOut, label: 'Log Out', href: '/logout', color: 'text-destructive', bg: 'bg-destructive/20' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (item.label === 'Log Out') {
      setShowLogoutModal(true)
    } else {
      router.push(item.href)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Theme Toggle */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
        <ThemeToggle />
      </div>

      {/* Profile Header */}
      <div className="px-6 pt-4 pb-6 flex flex-col items-center">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/30 mb-4 shadow-lg shadow-primary/20">
          <Image
            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
            alt={user?.name || 'User'}
            width={112}
            height={112}
            className="object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{user?.name || 'Guest'}</h1>
        <p className="text-muted-foreground capitalize">{user?.type || 'Individual'}</p>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleItemClick(item)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', item.bg)}>
                <item.icon className={cn('w-5 h-5', item.color)} />
              </div>
              <span className={cn('font-medium', item.color)}>{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                  <span className="text-xs text-success-foreground font-medium">{item.badge}</span>
                </div>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>

      <BottomNav />
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </div>
  )
}
