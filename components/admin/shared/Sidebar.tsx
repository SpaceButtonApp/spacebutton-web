'use client'
import React, { useState } from "react";
import {
  LayoutGrid, Users, ShieldCheck, Building2, MessageSquare, CreditCard,
  Star, Bell, Flag, Settings, LogOut, ChevronLeft,
} from "lucide-react";

export type AdminRoute =
  | "dashboard" | "users" | "verifications" | "listings" | "messages"
  | "transactions" | "reviews" | "notifications" | "reports" | "settings";

const NAV_ITEMS: { key: AdminRoute; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "users", label: "Users", icon: Users },
  { key: "verifications", label: "Verifications", icon: ShieldCheck },
  { key: "listings", label: "Listings", icon: Building2 },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "transactions", label: "Transactions", icon: CreditCard },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "reports", label: "Reports", icon: Flag },
  { key: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  active: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  onLogoutClick: () => void;
  /** Pending-item counts per section — renders a numeric badge when > 0. */
  badgeCounts?: Partial<Record<AdminRoute, number>>;
}

export function Sidebar({ active, onNavigate, onLogoutClick, badgeCounts = {} }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative h-full shrink-0 bg-[var(--bg-sunken)] border-r border-[var(--border-color)] flex flex-col transition-all duration-200 ${
        collapsed ? "w-[84px]" : "w-[280px]"
      }`}
    >
      <div className="flex items-center gap-3 px-6 py-6 shrink-0">
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm">
          <img src="/admin-logo.png" alt="SpaceButton" className="w-full h-full object-cover" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-[var(--text-primary)] font-bold leading-tight">SpaceButton</div>
            <div className="text-xs text-[var(--text-muted)] leading-tight">Admin Panel</div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          const count = badgeCounts[key] ?? 0;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors relative ${
                isActive
                  ? "bg-violet-600/15 text-violet-400"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">{label}</span>}
              {count > 0 && (
                collapsed ? (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                ) : (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {count > 99 ? "99+" : count}
                  </span>
                )
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-6 shrink-0">
        <button
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[var(--bg-hover-strong)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
      </button>
    </aside>
  );
}
