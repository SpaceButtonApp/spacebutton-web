'use client'
import React, { useMemo, useState } from "react";
import { Users as UsersIcon, UserCheck, Briefcase, Ban, Eye, MessageCircle, Mail, UserX, Trash2, Star, Flag, Building2, Gift } from "lucide-react";
import { useAdminStore, getReferralCount } from "@/lib/admin-store";
import { StatCard } from "@/components/admin/shared/StatCard";
import { SearchInput, ExportButton, ActionMenu, FilterPill, Avatar, EmptyState } from "@/components/admin/shared/Atoms";
import { StatusBadge } from "@/components/admin/shared/Badge";
import { Modal, ConfirmModal } from "@/components/admin/shared/Modal";
import { formatDate, exportToCsv, truncateId } from "@/lib/utils/admin-format";
import type { AppUser } from "@/lib/types/admin";

type UserFilter = "all" | "individual" | "agent";

interface UsersPageProps {
  onMessageUser?: (user: AppUser) => void;
  onMailUser?: (user: AppUser) => void;
}

export function UsersPage({ onMessageUser, onMailUser }: UsersPageProps) {
  const users = useAdminStore((s) => s.users);
  const suspendUser = useAdminStore((s) => s.suspendUser);
  const reinstateUser = useAdminStore((s) => s.reinstateUser);
  const deleteUser = useAdminStore((s) => s.deleteUser);

  const [filter, setFilter] = useState<UserFilter>("all");
  const [search, setSearch] = useState("");
  const [profileUser, setProfileUser] = useState<AppUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "suspend" | "delete" | "reinstate"; user: AppUser } | null>(null);

  const individualCount = users.filter((u) => u.role === "individual").length;
  const agentCount = users.filter((u) => u.role === "agent").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;

  const filtered = useMemo(() => {
    let list = users;
    if (filter === "individual") list = list.filter((u) => u.role === "individual");
    if (filter === "agent") list = list.filter((u) => u.role === "agent");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.userId.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  }, [users, filter, search]);

  function handleExport() {
    exportToCsv(
      "users.csv",
      filtered.map((u) => ({
        UserID: u.userId, Name: u.name, Email: u.email, Phone: u.phone, Role: u.role,
        Status: u.status, Joined: formatDate(u.joinDate),
      }))
    );
  }

  function handleConfirm() {
    if (!confirmAction) return;
    if (confirmAction.type === "suspend") suspendUser(confirmAction.user.id);
    if (confirmAction.type === "reinstate") reinstateUser(confirmAction.user.id);
    if (confirmAction.type === "delete") deleteUser(confirmAction.user.id);
    setConfirmAction(null);
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={users.length} icon={UsersIcon} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
        <StatCard label="Individuals" value={individualCount} icon={UserCheck} iconBg="bg-blue-500/15" iconColor="text-blue-400" />
        <StatCard label="Agents" value={agentCount} icon={Briefcase} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
        <StatCard label="Suspended Users" value={suspendedCount} icon={Ban} iconBg="bg-red-500/15" iconColor="text-red-400" valueColor="text-red-400" />
      </div>

      <div className="flex gap-2 mb-4">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>Users</FilterPill>
        <FilterPill active={filter === "individual"} onClick={() => setFilter("individual")}>Individual</FilterPill>
        <FilterPill active={filter === "agent"} onClick={() => setFilter("agent")}>Agent</FilterPill>
      </div>

      <div className="flex gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, or ID..." />
        <ExportButton onClick={handleExport} />
      </div>

      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)]">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} color={u.avatarColor} size={36} />
                      <div>
                        <div className="text-[var(--text-primary)] font-medium">{u.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{truncateId(u.userId, 10)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-[var(--text-secondary)]">{u.email}</td>
                  <td className="px-6 py-3.5 text-[var(--text-secondary)]">{u.phone}</td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs font-medium capitalize px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5"><StatusBadge status={u.status} /></td>
                  <td className="px-6 py-3.5 text-[var(--text-secondary)]">{formatDate(u.joinDate)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <ActionMenu
                      items={[
                        { label: "View profile", icon: <Eye className="w-4 h-4" />, onClick: () => setProfileUser(u) },
                        { label: "Message", icon: <MessageCircle className="w-4 h-4" />, onClick: () => onMessageUser?.(u) },
                        { label: "Send mail", icon: <Mail className="w-4 h-4" />, onClick: () => onMailUser?.(u) },
                        u.status === "suspended"
                          ? { label: "Reinstate", icon: <UserCheck className="w-4 h-4" />, onClick: () => setConfirmAction({ type: "reinstate", user: u }) }
                          : { label: "Suspend", icon: <UserX className="w-4 h-4" />, onClick: () => setConfirmAction({ type: "suspend", user: u }), danger: true },
                        { label: "Delete", icon: <Trash2 className="w-4 h-4" />, onClick: () => setConfirmAction({ type: "delete", user: u }), danger: true },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState label="No users match your search." />}
        </div>
      </div>

      {/* User profile modal */}
      <Modal open={!!profileUser} onClose={() => setProfileUser(null)} title="User Profile" maxWidth="max-w-xl">
        {profileUser && (
          <UserProfileContent
            user={profileUser}
            onMessage={() => { onMessageUser?.(profileUser); setProfileUser(null); }}
            onMail={() => { onMailUser?.(profileUser); setProfileUser(null); }}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!confirmAction}
        title={
          confirmAction?.type === "delete" ? "Delete user?" :
          confirmAction?.type === "reinstate" ? "Reinstate user?" : "Suspend user?"
        }
        description={
          confirmAction?.type === "delete"
            ? `This will permanently remove ${confirmAction.user.name} from the platform.`
            : confirmAction?.type === "reinstate"
            ? `${confirmAction.user.name} will regain full access to the platform.`
            : `${confirmAction?.user.name} will lose access to the platform until reinstated.`
        }
        confirmLabel={confirmAction?.type === "delete" ? "Delete" : confirmAction?.type === "reinstate" ? "Reinstate" : "Suspend"}
        danger={confirmAction?.type !== "reinstate"}
        icon={<UserX className="w-6 h-6 text-red-400" />}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

function UserProfileContent({ user, onMessage, onMail }: { user: AppUser; onMessage: () => void; onMail: () => void }) {
  const users = useAdminStore((s) => s.users);
  const listings = useAdminStore((s) => s.listings);
  const reports = useAdminStore((s) => s.reports);
  const reviews = useAdminStore((s) => s.reviews);

  const userListings = listings.filter((l) => l.ownerId === user.id);
  const closedListings = userListings.filter((l) => l.status === "closed");
  const userReports = reports.filter((r) => r.reportedUserId === user.id);
  const userReviews = reviews.filter((r) => r.revieweeId === user.id);
  const referralCount = getReferralCount(users, user.referralCode);
  const avgRating = userReviews.length
    ? (userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length).toFixed(1)
    : "—";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={user.name} color={user.avatarColor} size={64} />
        <div className="flex-1">
          <div className="text-xl font-bold text-[var(--text-primary)]">{user.name}</div>
          <div className="text-sm text-[var(--text-secondary)]">{user.email}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <StatusBadge status={user.status} />
            <span className="text-xs font-medium capitalize px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
              {user.role}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onMessage} className="p-2.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Message">
            <MessageCircle className="w-4 h-4" />
          </button>
          <button onClick={onMail} className="p-2.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Send mail">
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <MiniStat icon={Flag} label="Reports" value={userReports.length} />
        <MiniStat icon={Star} label="Reviews" value={`${userReviews.length} (${avgRating}★)`} />
        <MiniStat icon={Building2} label="Listings" value={userListings.length} />
        <MiniStat icon={Ban} label="Closed Listings" value={closedListings.length} />
        <MiniStat icon={Gift} label="Referrals" value={referralCount} />
        <MiniStat icon={UserCheck} label="Connects" value={user.connects} />
      </div>

      <div className="space-y-2 text-sm">
        <Row label="Phone" value={user.phone} />
        <Row label="Joined" value={formatDate(user.joinDate)} />
        <Row label="User ID" value={user.userId} />
        <Row label="Referral Code" value={user.referralCode} />
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, small }: { icon: React.ElementType; label: string; value: string | number; small?: boolean }) {
  return (
    <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-3.5">
      <Icon className="w-4 h-4 text-violet-400 mb-2" />
      <div className={`font-bold text-[var(--text-primary)] ${small ? "text-sm" : "text-lg"} truncate`}>{value}</div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-[var(--border-color)] last:border-0">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-[var(--text-primary)] font-medium">{value}</span>
    </div>
  );
}
