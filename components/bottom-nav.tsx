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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#12121a]/90 backdrop-blur-xl border-t border-gray-800/50">
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
                  ? 'bg-gradient-to-br from-purple-600/20 to-purple-800/20 text-purple-400' 
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <item.icon className={cn('w-6 h-6', isActive && 'text-purple-400')} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn('text-xs mt-1 font-medium', isActive && 'text-purple-400')}>{item.label}</span>
            </button>
          )
        })}
        <button
          onClick={() => router.push('/add-post')}
          className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px] text-gray-500 hover:text-gray-300"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs mt-1 font-medium">Post</span>
        </button>
      </div>
    </nav>
  )
}
