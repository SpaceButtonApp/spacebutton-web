'use client'
import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { Sidebar } from "@/components/admin/shared/Sidebar";
import { AdminHeader } from "@/components/admin/shared/AdminHeader";
import { ConfirmModal } from "@/components/admin/shared/Modal";
import { ComposeMailModal } from "@/components/admin/shared/ComposeMailModal";
import { Dashboard } from "@/components/admin/pages/Dashboard";
import { UsersPage } from "@/components/admin/pages/Users";
import { VerificationsPage } from "@/components/admin/pages/Verifications";
import { ListingsPage } from "@/components/admin/pages/Listings";
import { MessagesPage } from "@/components/admin/pages/Messages";
import { TransactionsPage } from "@/components/admin/pages/Transactions";
import { ReviewsPage } from "@/components/admin/pages/Reviews";
import { NotificationsPage } from "@/components/admin/pages/Notifications";
import { ReportsPage } from "@/components/admin/pages/Reports";
import { SettingsPage } from "@/components/admin/pages/Settings";
import { UserDetailPage } from "@/components/admin/pages/UserDetail";
import type { AdminRoute } from "@/components/admin/shared/Sidebar";

const PAGE_TITLES: Record<AdminRoute, string> = {
  dashboard: "Dashboard",
  users: "Users",
  verifications: "Verifications",
  listings: "Listings",
  messages: "Support Messages",
  transactions: "Transactions",
  reviews: "Reviews",
  notifications: "Notifications",
  reports: "Reports",
  settings: "Settings",
};

export function AdminApp() {
  const theme = useAdminStore((s) => s.theme);
  const isLoading = useAdminStore((s) => s.isLoading);
  const initFromApi = useAdminStore((s) => s.initFromApi);
  const verifications = useAdminStore((s) => s.verifications);

  useEffect(() => {
    initFromApi();
  }, [initFromApi]);
  const listings = useAdminStore((s) => s.listings);
  const reports = useAdminStore((s) => s.reports);
  const messages = useAdminStore((s) => s.messages);
  const notifications = useAdminStore((s) => s.notifications);

  const [route, setRoute] = useState<AdminRoute>("dashboard");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [messageTargetUserId, setMessageTargetUserId] = useState<string | null>(null);
  const [viewListingId, setViewListingId] = useState<string | null>(null);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [composeMailTo, setComposeMailTo] = useState<{ name: string; email: string } | null>(null);

  const badgeCounts: Partial<Record<AdminRoute, number>> = {
    verifications: verifications.filter((v) => v.status === "pending").length,
    listings: listings.filter((l) => l.approval === "pending").length,
    reports: reports.filter((r) => r.status === "pending").length,
    messages: messages.reduce((sum, t) => sum + t.unreadCount, 0),
    notifications: notifications.filter((n) => !n.read).length,
  };

  function goToUserThread(userId: string) {
    setMessageTargetUserId(userId);
    setRoute("messages");
  }

  function goToListingDetail(listingId: string) {
    setViewListingId(listingId);
    setRoute("listings");
  }

  function handleNavigate(r: AdminRoute) {
    if (r !== "users") setViewUserId(null);
    setRoute(r);
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin-auth");
      window.location.href = "/admin/login";
    }
  }

  return (
    <div className={`admin-root fixed inset-0 flex overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] font-sans ${theme === "dark" ? "dark" : ""}`}>
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-page)]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-secondary)]">Loading data…</span>
          </div>
        </div>
      )}
      <Sidebar
        active={route}
        onNavigate={handleNavigate}
        onLogoutClick={() => setLogoutOpen(true)}
        badgeCounts={badgeCounts}
      />

      <div className="flex-1 min-w-0 flex flex-col h-full">
        <div className="shrink-0">
          <AdminHeader title={PAGE_TITLES[route]} onNavigate={handleNavigate} />
        </div>

        <div className="flex-1 overflow-y-auto">
          {route === "dashboard" && <Dashboard onNavigate={setRoute} />}
          {route === "users" && !viewUserId && (
            <UsersPage
              onMessageUser={(u) => goToUserThread(u.id)}
              onMailUser={(u) => setComposeMailTo({ name: u.name, email: u.email })}
              onViewUser={(id) => setViewUserId(id)}
            />
          )}
          {route === "users" && viewUserId && (
            <UserDetailPage
              userId={viewUserId}
              onBack={() => setViewUserId(null)}
              onMessageUser={(u) => { setViewUserId(null); goToUserThread(u.id); }}
              onMailUser={(u) => { setViewUserId(null); setComposeMailTo({ name: u.name, email: u.email }); }}
            />
          )}
          {route === "verifications" && (
            <VerificationsPage
              onMessageUser={(u) => goToUserThread(u.id)}
              onMailUser={(u) => setComposeMailTo({ name: u.name, email: u.email })}
            />
          )}
          {route === "listings" && (
            <ListingsPage
              focusListingId={viewListingId}
              onFocusConsumed={() => setViewListingId(null)}
              onMessageUser={(u) => goToUserThread(u.id)}
              onMailUser={(u) => setComposeMailTo({ name: u.name, email: u.email })}
            />
          )}
          {route === "messages" && (
            <MessagesPage openUserId={messageTargetUserId} onOpenUserConsumed={() => setMessageTargetUserId(null)} />
          )}
          {route === "transactions" && <TransactionsPage />}
          {route === "reviews" && <ReviewsPage />}
          {route === "notifications" && <NotificationsPage />}
          {route === "reports" && <ReportsPage onViewListing={goToListingDetail} />}
          {route === "settings" && <SettingsPage onLogoutClick={() => setLogoutOpen(true)} />}
        </div>
      </div>

      <ConfirmModal
        open={logoutOpen}
        title="Log Out?"
        description="Are you sure you want to log out of your admin account?"
        confirmLabel="Yes, Logout"
        cancelLabel="No, Cancel"
        icon={<LogOut className="w-6 h-6 text-red-400" />}
        onConfirm={() => { setLogoutOpen(false); handleLogout(); }}
        onCancel={() => setLogoutOpen(false)}
      />

      <ComposeMailModal open={!!composeMailTo} to={composeMailTo} onClose={() => setComposeMailTo(null)} />
    </div>
  );
}
