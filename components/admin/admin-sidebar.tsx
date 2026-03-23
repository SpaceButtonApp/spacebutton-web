'use client'

import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  ListChecks,
  MessageSquare,
  CreditCard,
  Crown,
  Home,
  Building2,
  UsersRound,
  Shield,
  Settings,
  LogOut,
} from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Users', icon: Users, href: '/admin/users' },
  { name: 'Listings', icon: ListChecks, href: '/admin/listings' },
  { name: 'Inbox', icon: MessageSquare, href: '/admin/inbox', badge: 3 },
  { name: 'Transaction', icon: CreditCard, href: '/admin/transactions' },
  { name: 'Subscription', icon: Crown, href: '/admin/subscription' },
]

const categoryItems = [
  { name: 'Shortlet', icon: Home, href: '/admin/shortlet' },
  { name: 'Property', icon: Building2, href: '/admin/property' },
]

const adminItems = [
  { name: 'Team', icon: UsersRound, href: '/admin/team' },
  { name: 'Control Authority', icon: Shield, href: '/admin/control-authority' },
]

const bottomItems = [
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
  { name: 'Log Out', icon: LogOut, href: '/admin/logout', danger: true },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const renderMenuItem = (item: typeof menuItems[0] & { badge?: number; danger?: boolean }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    return (
      <button
        key={item.name}
        onClick={() => router.push(item.href)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
          isActive
            ? 'bg-primary/10 text-primary border-l-4 border-primary'
            : item.danger
            ? 'text-destructive hover:bg-destructive/10'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
      >
        <Icon className="w-5 h-5" />
        <span>{item.name}</span>
        {item.badge && (
          <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-kJSONfc9hORfv0xhwC97LF0eSOCvJL.png"
            alt="SpaceButton"
            width={32}
            height={32}
          />
          <span className="text-lg font-bold text-primary">SPACEBUTTON</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map(renderMenuItem)}

        {/* Category Section */}
        <div className="pt-4">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Category
          </p>
          {categoryItems.map(renderMenuItem)}
        </div>

        {/* Admin Section */}
        <div className="pt-4">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Admin
          </p>
          {adminItems.map(renderMenuItem)}
        </div>
      </nav>

      {/* Bottom Items */}
      <div className="p-4 border-t border-border space-y-1">
        {bottomItems.map(renderMenuItem)}
      </div>
    </aside>
  )
}
