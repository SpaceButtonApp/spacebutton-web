'use client'

import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'
import { Bell, Check, Trash2, X, Handshake, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useState, useEffect } from 'react'

interface AdminNotification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { notifications } = useAppStore()
  const [localNotifications, setLocalNotifications] = useState<AdminNotification[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Initialize with default admin notifications
  useEffect(() => {
    const defaultNotifications: AdminNotification[] = [
      { id: 'admin-1', type: 'user', title: 'New user registered', message: 'John Doe just created an account', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: 'admin-2', type: 'listing', title: 'New listing submitted', message: 'A new property listing needs review', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: 'admin-3', type: 'transaction', title: 'Transaction completed', message: 'Payment of N5,000 received from Jane Smith', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
      { id: 'admin-4', type: 'review', title: 'New review posted', message: 'A user left a 5-star review', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    ]
    
    // Map store notifications
    const storeNotifs = notifications.map(n => ({
      id: n.id,
      type: n.type || 'general',
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt || (n.timestamp ? new Date(n.timestamp).toISOString() : new Date().toISOString())
    }))
    
    setLocalNotifications([...defaultNotifications, ...storeNotifs])
  }, [notifications])

  // Sort by date, most recent first
  const sortedNotifications = [...localNotifications].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const unreadCount = sortedNotifications.filter(n => !n.read).length
  const doneDealCount = sortedNotifications.filter(n => n.type === 'done_deal').length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'done_deal':
        return <Handshake className="w-5 h-5 text-success" />
      case 'user':
        return <Bell className="w-5 h-5 text-blue-400" />
      case 'listing':
        return <Bell className="w-5 h-5 text-primary" />
      case 'transaction':
        return <Bell className="w-5 h-5 text-yellow-400" />
      case 'review':
        return <Bell className="w-5 h-5 text-orange-400" />
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />
    }
  }

  const markAllAsRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setLocalNotifications([])
    setShowClearConfirm(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Notifications" />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground mb-1">Total Notifications</p>
            <p className="text-2xl font-bold text-foreground">{sortedNotifications.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground mb-1">Unread</p>
            <p className="text-2xl font-bold text-primary">{unreadCount}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Handshake className="w-4 h-4 text-success" />
              <p className="text-sm text-muted-foreground">Done Deals</p>
            </div>
            <p className="text-2xl font-bold text-success">{doneDealCount}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">All Notifications</h2>
          <div className="flex gap-2">
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground bg-card border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 text-sm text-destructive hover:text-destructive bg-card border border-border rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {sortedNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-5 hover:bg-accent/20 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      notification.type === 'done_deal' ? 'bg-success/20' :
                      notification.type === 'user' ? 'bg-blue-500/20' :
                      notification.type === 'listing' ? 'bg-primary/20' :
                      notification.type === 'transaction' ? 'bg-yellow-500/20' :
                      'bg-secondary'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{notification.title}</p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                        {notification.type === 'done_deal' && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success">
                            Done Deal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Clear All Notifications?</h2>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. All notifications will be permanently deleted.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 h-11 rounded-xl border border-border bg-secondary text-foreground hover:bg-accent transition-colors font-medium"
                >
                  No
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-medium"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
