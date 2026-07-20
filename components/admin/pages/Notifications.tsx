'use client'
import React, { useMemo, useState } from "react";
import { Building2, Star, Flag, CreditCard, UserPlus, ShieldCheck, CheckCheck } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { FilterPill, EmptyState } from "@/components/admin/shared/Atoms";
import { formatRelativeTime } from "@/lib/utils/admin-format";
import type { AppNotification, NotificationType } from "@/lib/types/admin";

const TYPE_META: Record<NotificationType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  new_listing: { icon: Building2, color: "text-blue-400", bg: "bg-blue-500/15", label: "New Listing" },
  new_review: { icon: Star, color: "text-amber-400", bg: "bg-amber-500/15", label: "New Review" },
  user_report: { icon: Flag, color: "text-red-400", bg: "bg-red-500/15", label: "User Report" },
  transaction: { icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/15", label: "Transaction" },
  new_user: { icon: UserPlus, color: "text-violet-400", bg: "bg-violet-500/15", label: "New User" },
  verification: { icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/15", label: "Verification" },
};

type Filter = "all" | "unread" | NotificationType;

export function NotificationsPage() {
  const notifications = useAdminStore((s) => s.notifications);
  const markNotificationRead = useAdminStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAdminStore((s) => s.markAllNotificationsRead);

  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let list = [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filter === "unread") list = list.filter((n) => !n.read);
    else if (filter !== "all") list = list.filter((n) => n.type === filter);
    return list;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-wrap gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>All</FilterPill>
          <FilterPill active={filter === "unread"} onClick={() => setFilter("unread")}>Unread ({unreadCount})</FilterPill>
          {(Object.keys(TYPE_META) as NotificationType[]).map((t) => (
            <FilterPill key={t} active={filter === t} onClick={() => setFilter(t)}>{TYPE_META[t].label}</FilterPill>
          ))}
        </div>
        <button
          onClick={markAllNotificationsRead}
          className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 font-medium shrink-0"
        >
          <CheckCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>

      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl divide-y divide-white/5 overflow-hidden">
        {filtered.map((n) => (
          <NotificationRow key={n.id} n={n} onRead={() => markNotificationRead(n.id)} />
        ))}
        {filtered.length === 0 && <EmptyState label="No notifications here." />}
      </div>
    </div>
  );
}

function NotificationRow({ n, onRead }: { n: AppNotification; onRead: () => void }) {
  const meta = TYPE_META[n.type];
  const Icon = meta.icon;
  return (
    <button
      onClick={onRead}
      className={`w-full flex items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-[var(--bg-hover)] ${!n.read ? "bg-violet-500/[0.03]" : ""}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
        <Icon className={`w-5 h-5 ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-primary)] font-medium text-sm">{n.title}</span>
          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{n.message}</p>
      </div>
      <span className="text-xs text-[var(--text-muted)] shrink-0">{formatRelativeTime(n.date)}</span>
    </button>
  );
}
