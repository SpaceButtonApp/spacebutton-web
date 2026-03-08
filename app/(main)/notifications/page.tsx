'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const tabs = ['Recent', 'Old', 'Marked'] as const
type Tab = typeof tabs[number]

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, markNotificationRead } = useAppStore()
  const [activeTab, setActiveTab] = useState<Tab>('Recent')

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'Recent') return n.type === 'recent'
    if (activeTab === 'Old') return n.type === 'old'
    return n.type === 'marked'
  })

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background px-4 py-4 sticky top-0 z-40 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-lg font-bold">Notifications</h1>
          
          <div className="w-10" />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex bg-secondary rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  activeTab === tab
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 py-4">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Notifications</h2>
            <p className="text-muted-foreground text-center">
              You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => markNotificationRead(notification.id)}
                className={cn(
                  'w-full p-4 rounded-xl text-left transition-colors',
                  notification.read ? 'bg-secondary' : 'bg-primary/5 border border-primary/20'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    notification.read ? 'bg-muted' : 'bg-primary/10'
                  )}>
                    <Bell className={cn(
                      'w-5 h-5',
                      notification.read ? 'text-muted-foreground' : 'text-primary'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold truncate">{notification.title}</h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
