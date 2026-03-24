'use client'

import { useState, useEffect } from 'react'
import { Bell, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAppStore } from '@/lib/store'

interface AdminUser {
  name: string
  email: string
  role: string
  avatar?: string
}

export function AdminHeader({ title }: { title: string }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const { notifications } = useAppStore()

  useEffect(() => {
    const auth = localStorage.getItem('admin-auth')
    if (auth) {
      setAdmin(JSON.parse(auth))
    }
  }, [])

  // Combine admin notifications with app notifications
  const allNotifications = [
    { id: 'admin-1', title: 'New user registered', time: '5 min ago', read: false },
    { id: 'admin-2', title: 'New listing submitted', time: '15 min ago', read: false },
    { id: 'admin-3', title: 'Transaction completed', time: '1 hour ago', read: true },
    ...notifications.slice(0, 3).map(n => ({
      id: n.id,
      title: n.title,
      time: 'Recently',
      read: n.read
    }))
  ]

  const unreadCount = allNotifications.filter(n => !n.read).length

  return (
    <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs text-primary-foreground flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {allNotifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-border/50 hover:bg-accent/30 cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 mt-2 rounded-full ${!notif.read ? 'bg-primary' : 'bg-muted-foreground'}`} />
                      <div>
                        <p className="text-sm text-foreground">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <Link 
                  href="/admin/notifications" 
                  onClick={() => setShowNotifications(false)}
                  className="w-full block text-center text-sm text-primary hover:text-primary/80"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          {admin?.avatar ? (
            <Image 
              src={admin.avatar} 
              alt={admin.name} 
              width={36} 
              height={36} 
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {admin?.name?.charAt(0) || 'A'}
            </div>
          )}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">{admin?.name || 'Admin'}</p>
            <p className="text-xs text-muted-foreground">{admin?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
