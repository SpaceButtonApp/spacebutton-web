'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, MessageCircle, Settings, Plus } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useHydrated } from '@/lib/hooks/use-hydrated'

const navItems = [
  { icon: Home, href: '/home', label: 'Home' },
  { icon: Search, href: '/search', label: 'Search' },
  { icon: MessageCircle, href: '/messages', label: 'Messages' },
  { icon: Settings, href: '/settings', label: 'Settings' },
]

export function DesktopSidebar() {
  const pathname = usePathname()
  const { unreadChatsCount } = useAppStore()
  const hydrated = useHydrated()
  const unreadMessages = hydrated ? unreadChatsCount : 0

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[40vw] bg-card border-r border-border z-50 items-center justify-center">
      {/* Inner column — fixed width so nav items don't stretch across 40vw */}
      <div className="flex flex-col h-full w-64 py-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <Image src="/logo.png" alt="SpaceButton" width={40} height={69} className="h-8 w-auto" style={{ width: 'auto' }} />
          <span className="text-lg font-bold text-foreground">SpaceButton</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const hasUnread = item.label === 'Messages' && unreadMessages > 0

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (isActive && item.href === '/home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 w-full',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <div className="relative flex-shrink-0">
                  <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} strokeWidth={isActive ? 2.5 : 2} />
                  {hasUnread && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
                  )}
                </div>
                <span className={cn('font-medium text-base', isActive && 'text-primary')}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Post button */}
        <Link
          href="/add-post"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Post</span>
        </Link>
      </div>
    </aside>
  )
}
