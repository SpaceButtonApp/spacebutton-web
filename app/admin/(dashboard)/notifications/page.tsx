'use client'

import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'
import { Bell, CheckCircle, Check, Trash2, XCircle, Handshake } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

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

  // Combine app notifications with admin-specific ones
  const adminNotifications: AdminNotification[] = [
    { id: 'admin-1', type: 'user', title: 'New user registered', message: 'John Doe just created an account', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 'admin-2', type: 'listing', title: 'New listing submitted', message: 'A new property listing needs review', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    { id: 'admin-3', type: 'transaction', title: 'Transaction completed', message: 'Payment of N5,000 received from Jane Smith', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 'admin-4', type: 'review', title: 'New review posted', message: 'A user left a 5-star review', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    // Map store notifications
    ...notifications.map(n => ({
      id: n.id,
      type: n.type || 'general',
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt || (n.timestamp ? new Date(n.timestamp).toISOString() : new Date().toISOString())
    })),
    ...localNotifications
  ]

  // Sort by date, most recent first
  const sortedNotifications = adminNotifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const unreadCount = sortedNotifications.filter(n => !n.read).length
  const doneDealCount = sortedNotifications.filter(n => n.type === 'done_deal').length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'done_deal':
        return <Handshake className="w-5 h-5 text-green-400" />
      case 'user':
        return <Bell className="w-5 h-5 text-blue-400" />
      case 'listing':
        return <Bell className="w-5 h-5 text-purple-400" />
      case 'transaction':
        return <Bell className="w-5 h-5 text-yellow-400" />
      case 'review':
        return <Bell className="w-5 h-5 text-orange-400" />
      default:
        return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  const markAllAsRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setLocalNotifications([])
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Notifications" />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Total Notifications</p>
            <p className="text-2xl font-bold text-white">{sortedNotifications.length}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Unread</p>
            <p className="text-2xl font-bold text-purple-400">{unreadCount}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Handshake className="w-4 h-4 text-green-400" />
              <p className="text-sm text-gray-400">Done Deals</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{doneDealCount}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">All Notifications</h2>
          <div className="flex gap-2">
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-[#12121a] border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
            <button 
              onClick={clearAll}
              className="px-4 py-2 text-sm text-red-400 hover:text-red-300 bg-[#12121a] border border-gray-800 rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
          {sortedNotifications.length > 0 ? (
            <div className="divide-y divide-gray-800/50">
              {sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-5 hover:bg-gray-800/20 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-purple-500/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      notification.type === 'done_deal' ? 'bg-green-500/20' :
                      notification.type === 'user' ? 'bg-blue-500/20' :
                      notification.type === 'listing' ? 'bg-purple-500/20' :
                      notification.type === 'transaction' ? 'bg-yellow-500/20' :
                      'bg-gray-800'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{notification.title}</p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                        )}
                        {notification.type === 'done_deal' && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">
                            Done Deal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
