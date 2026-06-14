'use client'

import { AdminHeader } from '@/components/admin/header'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Notifications" />

      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-5">
          <Bell className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Admin Notifications Coming Soon</h2>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          Real-time admin notifications will be available here. Check back soon.
        </p>
      </div>
    </div>
  )
}
