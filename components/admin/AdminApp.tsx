'use client'
import React, { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { AdminSidebar } from "@/components/admin/shared/Sidebar";
import { AdminHeader } from "@/components/admin/shared/AdminHeader";
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
import type { AdminRoute } from "@/components/admin/shared/Sidebar";
import type { AppUser } from "@/lib/types/admin";

export function AdminApp() {
  const notifications = useAdminStore((s) => s.notifications);
  const theme = useAdminStore((s) => s.theme);
  const [route, setRoute] = useState<AdminRoute>("dashboard");

  // Cross-page message thread opener (Users → Messages)
  const [messageTargetUserId, setMessageTargetUserId] = useState<string | null>(null);
  // Cross-page mail composer
  const [mailTarget, setMailTarget] = useState<AppUser | null>(null);
  // Cross-page listing focus (Reports → Listings)
  const [focusListingId, setFocusListingId] = useState<string | null>(null);

  const badgeCounts: Partial<Record<AdminRoute, number>> = {
    notifications: notifications.filter((n) => !n.read).length,
  };

  function handleMessageUser(user: AppUser) {
    setMessageTargetUserId(user.id);
    setRoute("messages");
  }

  function handleMailUser(user: AppUser) {
    setMailTarget(user);
  }

  function handleViewListing(listingId: string) {
    setFocusListingId(listingId);
    setRoute("listings");
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin-auth");
      window.location.href = "/admin/login";
    }
  }

  return (
    <div className={`admin-root flex h-screen overflow-hidden ${theme === "dark" ? "dark" : ""}`}>
      <AdminSidebar
        current={route}
        onNavigate={setRoute}
        badgeCounts={badgeCounts}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader current={route} onNavigate={setRoute} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto bg-[var(--bg-base)]">
          {route === "dashboard" && <Dashboard onNavigate={setRoute} />}
          {route === "users" && (
            <UsersPage onMessageUser={handleMessageUser} onMailUser={handleMailUser} />
          )}
          {route === "verifications" && (
            <VerificationsPage onMessageUser={handleMessageUser} onMailUser={handleMailUser} />
          )}
          {route === "listings" && (
            <ListingsPage
              onMessageUser={handleMessageUser}
              onMailUser={handleMailUser}
              focusListingId={focusListingId}
              onFocusConsumed={() => setFocusListingId(null)}
            />
          )}
          {route === "messages" && (
            <MessagesPage
              openUserId={messageTargetUserId}
              onOpenUserConsumed={() => setMessageTargetUserId(null)}
            />
          )}
          {route === "transactions" && <TransactionsPage />}
          {route === "reviews" && <ReviewsPage />}
          {route === "notifications" && <NotificationsPage />}
          {route === "reports" && <ReportsPage onViewListing={handleViewListing} />}
          {route === "settings" && <SettingsPage onLogoutClick={handleLogout} />}
        </main>
      </div>

      {mailTarget && (
        <ComposeMailModal
          open
          onClose={() => setMailTarget(null)}
          defaultTo={mailTarget.email}
          defaultToName={mailTarget.name}
        />
      )}
    </div>
  );
}
