'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, MessageCircle } from 'lucide-react'
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
  const { notifications, markNotificationRead, supportChats } = useAppStore()

  useEffect(() => {
    const auth = localStorage.getItem('admin-auth')
    if (auth) {
      setAdmin(JSON.parse(auth))
    }
  }, [])

  // Use store notifications
  const unreadCount = notifications.filter(n => !n.read).length
  const unreadMessages = supportChats.filter(c => c.unread > 0).length

  const handleNotificationClick = (id: string) => {
    markNotificationRead(id)
  }

  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png'

  return (
    <header className="h-16 bg-card backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Image src={logoUrl} alt="SpaceButton" width={28} height={28} className="h-7 w-7" />
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

        {/* Messages */}
        <Link href="/admin/messages" className="relative">
          <button className="relative p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <MessageCircle className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full" />
            )}
          </button>
        </Link>

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
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id)}
                      className={`p-4 border-b border-border hover:bg-accent/50 cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-2 rounded-full ${!notif.read ? 'bg-primary' : 'bg-muted-foreground'}`} />
                        <div>
                          <p className="text-sm text-foreground">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-semibold text-sm">
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
