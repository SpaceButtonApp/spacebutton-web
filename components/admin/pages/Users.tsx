'use client'
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Users as UsersIcon, UserCheck, Briefcase, Ban, Eye, MessageCircle, Mail, UserX, Trash2, RefreshCw, AlertCircle, MailCheck, MailX } from "lucide-react";

import { adminApi } from "@/lib/api/admin";
import type { AdminUser } from "@/lib/api/admin";
import { StatCard } from "@/components/admin/shared/StatCard";
import { SearchInput, ExportButton, ActionMenu, FilterPill, Avatar, EmptyState } from "@/components/admin/shared/Atoms";
import { StatusBadge } from "@/components/admin/shared/Badge";
import { ConfirmModal } from "@/components/admin/shared/Modal";
import { formatDate, exportToExcel, truncateId } from "@/lib/utils/admin-format";
import type { AppUser } from "@/lib/types/admin";

type UserFilter = "all" | "individual" | "agent";

interface UsersPageProps {
  onMessageUser?: (user: AppUser) => void;
  onMailUser?: (user: AppUser) => void;
  onViewUser?: (userId: string) => void;
}

const AVATAR_COLORS = ["#7c3aed","#a855f7","#8b5cf6","#6366f1","#c026d3","#9333ea"];
function avatarColorForId(id: string) {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function mapApiUser(u: AdminUser): AppUser {
  return {
    id: u.id,
    userId: u.id.slice(-8).toUpperCase(),
    name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email,
    email: u.email,
    phone: u.phone_number ?? "",
    role: u.role === "agent" ? "agent" : "individual",
    status: (u.status ?? "active").toLowerCase() === "suspended" ? "suspended" : "active",
    joinDate: u.created_at,
    avatarColor: avatarColorForId(u.id),
    referralCode: "",
    referralsMade: u.referrals_made ?? 0,
    connects: 0,
  };
}

export function UsersPage({ onMessageUser, onMailUser, onViewUser }: UsersPageProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [emailVerifiedMap, setEmailVerifiedMap] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<UserFilter>("all");
  const [search, setSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ type: "suspend" | "delete" | "reinstate"; user: AppUser } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let all: AdminUser[] = [];
      let page = 1;
      const pageSize = 100;
      while (true) {
        const res = await adminApi.getUsers(page, pageSize);
        const batch = res.users ?? [];
        all = [...all, ...batch];
        if (all.length >= (res.total ?? 0) || batch.length < pageSize) break;
        page++;
      }
      setUsers(all.map(mapApiUser));
      setEmailVerifiedMap(new Map(all.map((u) => [u.id, u.is_email_verified])));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

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
          u.userId.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  }, [users, filter, search]);

  function handleExport() {
    exportToExcel(
      "users",
      filtered.map((u) => ({
        UserID: u.userId, Name: u.name, Email: u.email, Phone: u.phone, Role: u.role,
        Status: u.status, Joined: formatDate(u.joinDate),
      })),
    );
  }

  async function handleConfirm() {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.type === "suspend") {
        await adminApi.suspendUser(confirmAction.user.id);
        setUsers((prev) => prev.map((u) => u.id === confirmAction.user.id ? { ...u, status: "suspended" } : u));
      }
      if (confirmAction.type === "reinstate") {
        await adminApi.activateUser(confirmAction.user.id);
        setUsers((prev) => prev.map((u) => u.id === confirmAction.user.id ? { ...u, status: "active" } : u));
      }
      if (confirmAction.type === "delete") {
        await adminApi.deleteUser(confirmAction.user.id);
        setUsers((prev) => prev.filter((u) => u.id !== confirmAction.user.id));
      }
    } catch {
      // action failed — do nothing, keep current state
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-sm text-[var(--text-secondary)]">Loading users…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[300px] gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-[var(--text-secondary)] text-center max-w-xs">{error}</p>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
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
        <button onClick={loadUsers} className="p-2.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
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
                <th className="px-6 py-4 font-medium">Referrals</th>
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
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--text-secondary)]">{u.email}</span>
                      {emailVerifiedMap.get(u.id)
                        ? <MailCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-label="Email verified" />
                        : <MailX className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-label="Email not verified" />
                      }
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-[var(--text-secondary)]">{u.phone || "—"}</td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs font-medium capitalize px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5"><StatusBadge status={u.status} /></td>
                  <td className="px-6 py-3.5">
                    <span className={`text-sm font-semibold ${u.referralsMade > 0 ? "text-violet-400" : "text-[var(--text-muted)]"}`}>
                      {u.referralsMade}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-[var(--text-secondary)]">{formatDate(u.joinDate)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <ActionMenu
                      items={[
                        { label: "View profile", icon: <Eye className="w-4 h-4" />, onClick: () => onViewUser?.(u.id) },
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

