'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Search, Bell, Sun, Moon } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface AdminUser {
  email: string
  name: string
  role: string
  avatar: string
}

export function AdminHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [admin, setAdmin] = useState<AdminUser | null>(null)

  useEffect(() => {
    setMounted(true)
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth) {
      setAdmin(JSON.parse(adminAuth))
    }
  }, [])

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search"
          className="h-10 pl-10 rounded-full bg-secondary border-0"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full bg-secondary transition-colors"
        >
          {mounted && theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <Image
            src={admin?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
            alt={admin?.name || 'Admin'}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="text-right">
            <p className="text-sm font-medium">{admin?.name || 'Dame Dame'}</p>
            <p className="text-xs text-muted-foreground">{admin?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
