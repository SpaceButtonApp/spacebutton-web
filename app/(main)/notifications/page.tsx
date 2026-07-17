'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Check, Trash2 } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { notificationsApi } from '@/lib/api/notifications'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { NotificationResponse } from '@/lib/types/notification'

const NOTIFICATION_ICONS: Record<string, string> = {
  new_message: '💬',
  new_listing: '🏠',
  low_connects: '⚡',
  new_call: '📞',
  kyc_update: '🪪',
  verification_id_approved: '✅',
  verification_id_rejected: '❌',
  verification_live_approved: '✅',
  verification_live_rejected: '❌',
  done_deal: '🤝',
  general: '🔔',
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const load = useCallback(async () => {
    try {
      const { notifications: list } = await notificationsApi.getNotifications(1, 50)
      setNotifications(list)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id).catch(() => {})
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  const handleDelete = async (id: string) => {
    await notificationsApi.deleteNotification(id).catch(() => {})
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => {})
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const filtered = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background px-4 py-4 sticky top-0 z-40 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-bold">Notifications</h1>

          {unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary font-medium"
            >
              Mark all read
            </button>
          ) : (
            <div className="w-20" />
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all capitalize',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground',
              )}
            >
              {f === 'unread' && unreadCount > 0 ? `Unread (${unreadCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl bg-secondary animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4">
              <Bell className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {filter === 'unread' ? 'All caught up!' : 'No Notifications'}
            </h2>
            <p className="text-muted-foreground text-center text-sm">
              {filter === 'unread' ? 'You have no unread notifications.' : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'flex gap-3 p-4 rounded-xl border transition-all',
                  n.is_read
                    ? 'bg-secondary border-border'
                    : 'bg-primary/5 border-primary/20',
                )}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center flex-shrink-0 text-lg">
                  {NOTIFICATION_ICONS[n.notification_type] ?? '🔔'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      'text-sm font-semibold line-clamp-1',
                      !n.is_read && 'text-foreground',
                    )}>
                      {n.title}
                    </p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-2">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="flex items-center gap-1 text-xs text-primary font-medium"
                      >
                        <Check className="w-3 h-3" />
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
