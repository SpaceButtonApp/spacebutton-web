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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-secondary/80 backdrop-blur-xl border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200',
                isActive 
                  ? 'bg-foreground text-background shadow-lg' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            </button>
          )
        })}
        <button
          onClick={() => router.push('/add-post')}
          className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-border bg-background text-foreground hover:border-primary hover:text-primary transition-all duration-200"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </nav>
  )
}
