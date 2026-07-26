'use client'
import React from "react";
import { Bell } from "lucide-react";

export function NotificationsPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 rounded-2xl bg-violet-500/15 flex items-center justify-center mb-5">
        <Bell className="w-8 h-8 text-violet-400" />
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Notifications</h2>
      <p className="text-[var(--text-secondary)] text-sm text-center max-w-sm">
        Real-time admin notifications will appear here once the notification system is wired up.
      </p>
      <span className="mt-4 text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
        Coming Soon
      </span>
    </div>
  );
}
