'use client'
import React, { useEffect, useRef, useState } from "react";
import { Search, MessageCircle, Bell, Sun, Moon, Building2, Star, Flag, CreditCard, UserPlus, ShieldCheck } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { Avatar } from "@/components/admin/shared/Atoms";
import { formatRelativeTime } from "@/lib/utils/admin-format";
import type { AdminRoute } from "@/components/admin/shared/Sidebar";
import type { NotificationType } from "@/lib/types/admin";

const TYPE_META: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  new_listing: { icon: Building2, color: "text-blue-400", bg: "bg-blue-500/15" },
  new_review: { icon: Star, color: "text-amber-400", bg: "bg-amber-500/15" },
  user_report: { icon: Flag, color: "text-red-400", bg: "bg-red-500/15" },
  transaction: { icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  new_user: { icon: UserPlus, color: "text-violet-400", bg: "bg-violet-500/15" },
  verification: { icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/15" },
};

interface AdminHeaderProps {
  title: string;
  onSearch?: (v: string) => void;
  onNavigate?: (route: AdminRoute) => void;
}

/**
 * AdminHeader — shown at the top of every admin page.
 * Displays the page title, global search, messages shortcut, notification
 * bell (with a live dropdown preview), theme toggle, and the signed-in admin's identity.
 */
export function AdminHeader({ title, onSearch, onNavigate }: AdminHeaderProps) {
  const notifications = useAdminStore((s) => s.notifications);
  const adminProfile = useAdminStore((s) => s.adminProfile);
  const theme = useAdminStore((s) => s.theme);
  const toggleTheme = useAdminStore((s) => s.toggleTheme);
  const markNotificationRead = useAdminStore((s) => s.markNotificationRead);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <header className="flex items-center justify-between gap-4 px-8 py-5 border-b border-[var(--border-color)]">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] shrink-0">{title}</h1>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <div className="relative w-full max-w-xs hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={() => onNavigate?.("messages")}
          className="p-2.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Messages"
        >
          <MessageCircle className="w-5 h-5" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="relative p-2.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-600 text-white text-[11px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-modal)] border border-[var(--border-strong)] rounded-2xl shadow-2xl overflow-hidden z-30">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
                <span className="font-semibold text-[var(--text-primary)] text-sm">Notifications</span>
                {unreadCount > 0 && <span className="text-xs text-violet-400 font-medium">{unreadCount} unread</span>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {recentNotifications.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">No notifications yet.</div>
                )}
                {recentNotifications.map((n) => {
                  const meta = TYPE_META[n.type];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        setDropdownOpen(false);
                        onNavigate?.("notifications");
                      }}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--bg-hover)] transition-colors ${
                        !n.read ? "bg-violet-500/[0.04]" : ""
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate">{n.title}</div>
                        <div className="text-xs text-[var(--text-muted)] truncate">{n.message}</div>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] shrink-0">{formatRelativeTime(n.date)}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => { setDropdownOpen(false); onNavigate?.("notifications"); }}
                className="w-full text-center py-2.5 text-sm font-medium text-violet-400 hover:text-violet-300 border-t border-[var(--border-color)] transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 pl-1">
          <Avatar name={adminProfile.fullName} color={adminProfile.avatarColor} imageUrl={adminProfile.avatarUrl} size={38} />
          <div className="hidden md:block">
            <div className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
              {adminProfile.fullName.split(" ")[0]}
            </div>
            <div className="text-xs text-[var(--text-muted)] leading-tight">{adminProfile.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
