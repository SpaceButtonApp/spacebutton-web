'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, MessageCircle, Settings, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: Home, href: '/home', label: 'Home' },
  { icon: Search, href: '/search', label: 'Search' },
  { icon: MessageCircle, href: '/messages', label: 'Messages' },
  { icon: Settings, href: '/settings', label: 'Settings' },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-between px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px]',
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-6 h-6', isActive && 'text-primary')} strokeWidth={isActive ? 2.5 : 2} />
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
