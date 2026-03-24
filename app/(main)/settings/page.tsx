'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  User, Wallet, Crown, Bell, 
  HelpCircle, LogOut, ChevronRight 
} from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { LogoutModal } from '@/components/logout-modal'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: User, label: 'Profile', href: '/profile', color: 'text-white', bg: 'bg-purple-500/20' },
  { icon: Wallet, label: 'My Wallet', href: '/wallet', color: 'text-white', bg: 'bg-blue-500/20' },
  { icon: Crown, label: 'Premium', href: '/premium', color: 'text-white', bg: 'bg-yellow-500/20' },
  { icon: Bell, label: 'Notifications', href: '/notifications', badge: 5, color: 'text-white', bg: 'bg-green-500/20' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help', color: 'text-white', bg: 'bg-cyan-500/20' },
  { icon: LogOut, label: 'Log Out', href: '/logout', color: 'text-red-400', bg: 'bg-red-500/20' },
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
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header with Theme Toggle */}
      <div className="relative flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-white">Settings</h1>
        <ThemeToggle />
      </div>

      {/* Profile Header */}
      <div className="relative px-6 pt-4 pb-6 flex flex-col items-center">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-purple-500/30 mb-4 shadow-lg shadow-purple-500/20">
          <Image
            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
            alt={user?.name || 'User'}
            width={112}
            height={112}
            className="object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold text-white">{user?.name || 'Guest'}</h1>
        <p className="text-gray-400 capitalize">{user?.type || 'Individual'}</p>
      </div>

      {/* Menu Items */}
      <div className="relative px-4 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleItemClick(item)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-[#12121a] border border-gray-800/50 hover:border-purple-500/30 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', item.bg)}>
                <item.icon className={cn('w-5 h-5', item.color)} />
              </div>
              <span className={cn('font-medium', item.color)}>{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{item.badge}</span>
                </div>
              )}
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
          </button>
        ))}
      </div>

      <BottomNav />
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </div>
  )
}
