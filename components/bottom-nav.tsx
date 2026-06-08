'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, MessageCircle, Settings, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useHydrated } from '@/lib/hooks/use-hydrated'


const navItems = [
  { icon: Home, href: '/home', label: 'Home' },
  { icon: Search, href: '/search', label: 'Search' },
  { icon: MessageCircle, href: '/messages', label: 'Messages' },
  { icon: Settings, href: '/settings', label: 'Settings' },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { unreadChatsCount } = useAppStore()
  const hydrated = useHydrated()

  const unreadMessages = hydrated ? unreadChatsCount : 0

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-between px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const hasUnread = item.label === 'Messages' && unreadMessages > 0
          
          return (
            <button
              key={item.href}
              onClick={() => {
                if (isActive && item.href === '/home') {
                  // If already on home page, reload and scroll to top
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  router.refresh()
                } else {
                  router.push(item.href)
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px] relative',
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <item.icon className={cn('w-6 h-6', isActive && 'text-primary')} strokeWidth={isActive ? 2.5 : 2} />
                {hasUnread && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
                )}
              </div>
              <span className={cn('text-xs mt-1 font-medium', isActive && 'text-primary')}>{item.label}</span>
            </button>
          )
        })}
        <button
          onClick={() => router.push('/add-post')}
          className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px] text-muted-foreground hover:text-foreground"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xs mt-1 font-medium">Post</span>
        </button>
      </div>
    </nav>
  )
}
