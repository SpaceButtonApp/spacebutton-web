'use client'
import React from "react";
import { Users, Building2, ShieldCheck, Ban, Mail } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { StatCard } from "@/components/admin/shared/StatCard";
import { ExportButton } from "@/components/admin/shared/Atoms";
import { formatDate, exportToCsv } from "@/lib/utils/admin-format";
import type { AdminRoute } from "@/components/admin/shared/Sidebar";

export function Dashboard({ onNavigate }: { onNavigate: (r: AdminRoute) => void }) {
  const users = useAdminStore((s) => s.users);
  const listings = useAdminStore((s) => s.listings);
  const verifications = useAdminStore((s) => s.verifications);
  const waitlist = useAdminStore((s) => s.waitlist);
  const adminProfile = useAdminStore((s) => s.adminProfile);

  const totalUsers = users.length;
  const agentCount = users.filter((u) => u.role === "agent").length;
  const activeListings = listings.filter((l) => l.status === "active").length;
  const pendingListings = listings.filter((l) => l.approval === "pending").length;
  const pendingVerifications = verifications.filter((v) => v.status === "pending").length;
  const suspendedUsers = users.filter((u) => u.status === "suspended").length;

  const quickActions = [
    {
      icon: Users, label: "Manage Users", desc: "View users and agents, suspend accounts",
      color: "text-violet-400", bg: "bg-violet-500/15", route: "users" as AdminRoute,
    },
    {
      icon: Building2, label: "Manage Listings", desc: "Review and approve listings",
      color: "text-blue-400", bg: "bg-blue-500/15", route: "listings" as AdminRoute,
    },
    {
      icon: ShieldCheck, label: "Verifications", desc: "Review ID & selfie submissions",
      color: "text-emerald-400", bg: "bg-emerald-500/15", route: "verifications" as AdminRoute,
    },
    {
      icon: Ban, label: "Transactions", desc: "Track connects purchases and usage",
      color: "text-orange-400", bg: "bg-orange-500/15", route: "transactions" as AdminRoute,
    },
  ];

  return (
    <div className="p-8">
      <div className="rounded-2xl bg-gradient-to-r from-violet-900/40 to-indigo-900/20 border border-[var(--border-color)] px-8 py-7 mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
          Welcome back, {adminProfile.fullName.split(" ")[0]}!
        </h2>
        <p className="text-[var(--text-secondary)] text-sm">Here's what's happening with SpaceButton today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users" value={totalUsers} sublabel={`${agentCount} agents`}
          icon={Users} iconBg="bg-violet-500/15" iconColor="text-violet-400"
        />
        <StatCard
          label="Active Listings" value={activeListings}
          sublabel={`${pendingListings} pending · ${listings.length} total`}
          icon={Building2} iconBg="bg-blue-500/15" iconColor="text-blue-400"
        />
        <StatCard
          label="Pending Verifications" value={pendingVerifications} sublabel="awaiting admin review"
          icon={ShieldCheck} iconBg="bg-emerald-500/15" iconColor="text-emerald-400"
        />
        <StatCard
          label="Suspended Users" value={suspendedUsers} sublabel="blocked from platform"
          icon={Ban} iconBg="bg-red-500/15" iconColor="text-red-400" valueColor="text-red-400"
        />
      </div>

      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => onNavigate(a.route)}
            className="text-left bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-violet-500/30 transition-colors"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${a.bg}`}>
              <a.icon className={`w-5 h-5 ${a.color}`} />
            </div>
            <div className="font-semibold text-[var(--text-primary)] mb-1">{a.label}</div>
            <div className="text-sm text-[var(--text-secondary)]">{a.desc}</div>
          </button>
        ))}
      </div>

      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Mail className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="font-semibold text-[var(--text-primary)]">Waitlist</div>
              <div className="text-sm text-[var(--text-secondary)]">{waitlist.length} sign-ups</div>
            </div>
          </div>
          <ExportButton
            onClick={() =>
              exportToCsv(
                "waitlist.csv",
                waitlist.map((w) => ({
                  Name: w.name, Email: w.email, Phone: w.phone, Date: formatDate(w.date),
                }))
              )
            }
          />
        </div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--bg-raised)]">
              <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {waitlist.map((w) => (
                <tr key={w.id} className="border-t border-[var(--border-color)] hover:bg-[var(--bg-hover)]">
                  <td className="px-6 py-3.5 text-[var(--text-primary)] font-medium">{w.name}</td>
                  <td className="px-6 py-3.5 text-[var(--text-secondary)]">{w.email}</td>
                  <td className="px-6 py-3.5 text-[var(--text-secondary)]">{w.phone}</td>
                  <td className="px-6 py-3.5 text-[var(--text-secondary)]">{formatDate(w.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
