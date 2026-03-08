'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  User, Wallet, Crown, Bell, Settings as SettingsIcon, 
  HelpCircle, LogOut, ChevronRight 
} from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: User, label: 'Profile', href: '/profile', color: 'text-foreground' },
  { icon: Wallet, label: 'My Wallet', href: '/wallet', color: 'text-foreground' },
  { icon: Crown, label: 'Premium', href: '/premium', color: 'text-foreground' },
  { icon: Bell, label: 'Notifications', href: '/notifications', badge: 5, color: 'text-foreground' },
  { icon: SettingsIcon, label: 'Personal Data', href: '/settings/personal', color: 'text-foreground' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help', color: 'text-foreground' },
  { icon: LogOut, label: 'Log Out', href: '/logout', color: 'text-destructive' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, setUser } = useAppStore()

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (item.label === 'Log Out') {
      setUser(null)
      router.push('/')
      console.log('[v0] User logged out')
    } else {
      router.push(item.href)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Profile Header */}
      <div className="px-6 pt-8 pb-6 flex flex-col items-center">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-secondary mb-4">
          <Image
            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
            alt={user?.name || 'User'}
            width={112}
            height={112}
            className="object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold">{user?.name || 'Guest'}</h1>
        <p className="text-muted-foreground capitalize">{user?.type || 'Individual'}</p>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleItemClick(item)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                <item.icon className={cn('w-5 h-5', item.color)} />
              </div>
              <span className={cn('font-medium', item.color)}>{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{item.badge}</span>
                </div>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
