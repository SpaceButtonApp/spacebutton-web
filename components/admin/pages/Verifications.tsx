'use client'
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileCheck2, ShieldCheck, ShieldX, Clock, Eye, MessageCircle, Mail, RefreshCw, AlertCircle } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { AdminUser, PendingVerification, VerifiedUser } from "@/lib/api/admin";
import { StatCard } from "@/components/admin/shared/StatCard";
import { SearchInput, ExportButton, FilterPill, Avatar, ActionMenu, EmptyState } from "@/components/admin/shared/Atoms";
import { formatDate, exportToExcel, truncateId } from "@/lib/utils/admin-format";
import type { AppUser, UserRole } from "@/lib/types/admin";

type VerFilter = "pending" | "verified";

interface VerRow {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  idType?: string;
  idNumber?: string;
  idImageUrl?: string;
  selfieImageUrl?: string;
  status: "pending" | "verified";
  idVerificationStatus: string;
  liveVerificationStatus: string;
  role?: string;
  submittedDate: string;
  avatarColor: string;
}

function hashColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#6D28D9","#7C3AED","#8B5CF6","#2563EB","#0EA5E9","#10B981","#F59E0B","#EF4444","#EC4899","#14B8A6"];
  return colors[Math.abs(hash) % colors.length];
}

function toAppUser(r: VerRow): AppUser {
  return {
    id: r.userId,
    userId: r.userId,
    name: r.name,
    email: r.email,
    phone: r.phone ?? "",
    role: (r.role as UserRole) ?? "individual",
    status: "active",
    joinDate: r.submittedDate,
    avatarColor: r.avatarColor,
    referralCode: "",
    connects: 0,
  };
}

interface VerificationsPageProps {
  onMessageUser?: (user: AppUser) => void;
  onMailUser?: (user: AppUser) => void;
}

export function VerificationsPage({ onMessageUser, onMailUser }: VerificationsPageProps) {
  const router = useRouter();
  const [rows, setRows] = useState<VerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<VerFilter>("pending");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pendingResult = await adminApi.getPendingVerifications().catch(() => [] as PendingVerification[]);
      const pending = pendingResult as PendingVerification[];

      // Fetch each pending user individually — avoids page_size limits
      const userResults = await Promise.allSettled(
        pending.map((p) => adminApi.getUser(p.user_id))
      );
      const userMap = new Map<string, AdminUser>();
      pending.forEach((p, i) => {
        const r = userResults[i];
        if (r.status === "fulfilled") userMap.set(p.user_id, r.value);
      });

      let allVerified: VerifiedUser[] = [];
      try {
        let vPage = 1;
        while (true) {
          const vRes = await adminApi.getVerifiedUsers(vPage, 100);
          const batch = vRes.users ?? [];
          allVerified = [...allVerified, ...batch];
          if (allVerified.length >= (vRes.total ?? 0) || batch.length < 100) break;
          vPage++;
        }
      } catch {
        // verified users endpoint unavailable — show pending only
      }

      const pendingRows: VerRow[] = pending.map((p) => {
        const u = userMap.get(p.user_id);
        const name = u
          ? [u.first_name, u.last_name].filter(Boolean).join(" ") || p.user_id
          : p.user_id;
        return {
          userId: p.user_id,
          name,
          email: u?.email ?? "—",
          phone: u?.phone_number,
          idType: p.id_type,
          idNumber: p.id_document_number,
          idImageUrl: p.id_document_url,
          selfieImageUrl: p.selfie_url,
          status: "pending" as const,
          idVerificationStatus: p.id_verification_status,
          liveVerificationStatus: p.live_verification_status,
          role: u?.role,
          submittedDate: p.created_at ?? "",
          avatarColor: hashColor(p.user_id),
        };
      });

      const verifiedRows: VerRow[] = allVerified.map((v) => ({
        userId: v.user_id,
        name: [v.first_name, v.last_name].filter(Boolean).join(" ") || v.user_id,
        email: v.email,
        phone: v.phone_number,
        role: v.role,
        idType: v.id_type,
        status: "verified" as const,
        idVerificationStatus: "approved",
        liveVerificationStatus: "approved",
        submittedDate: "",
        avatarColor: hashColor(v.user_id),
      }));

      setRows([...pendingRows, ...verifiedRows]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to load verifications";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const verifiedCount = rows.filter((r) => r.status === "verified").length;

  const filtered = useMemo(() => {
    let list = rows.filter((r) => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.userId.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, filter, search]);

  function handleExport() {
    exportToExcel(
      "verifications",
      filtered.map((r) => ({
        User: r.name,
        Email: r.email,
        UserID: r.userId,
        IDType: r.idType ?? "—",
        Role: r.role ?? "—",
        Status: r.status,
        Submitted: r.submittedDate ? formatDate(r.submittedDate) : "—",
      }))
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-sm text-[var(--text-secondary)]">Loading verifications…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-[var(--text-secondary)] text-sm">{error}</p>
        <button
          onClick={load}
          className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Submissions" value={rows.length} icon={FileCheck2} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
        <StatCard label="Fully Verified" value={verifiedCount} icon={ShieldCheck} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" valueColor="text-emerald-400" />
        <StatCard label="Not Verified" value={0} icon={ShieldX} iconBg="bg-red-500/15" iconColor="text-red-400" valueColor="text-red-400" />
        <StatCard label="Pending Review" value={pendingCount} icon={Clock} iconBg="bg-amber-500/15" iconColor="text-amber-400" valueColor="text-amber-400" />
      </div>

      <div className="flex gap-2 mb-4">
        <FilterPill active={filter === "pending"} onClick={() => setFilter("pending")}>
          Pending Review
          {pendingCount > 0 && (
            <span className="ml-1.5 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </FilterPill>
        <FilterPill active={filter === "verified"} onClick={() => setFilter("verified")}>
          Verified Users
          {verifiedCount > 0 && (
            <span className="ml-1.5 text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">{verifiedCount}</span>
          )}
        </FilterPill>
      </div>

      <div className="flex gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, or user ID..." />
        <button
          onClick={load}
          className="p-3 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <ExportButton onClick={handleExport} />
      </div>

      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">ID Doc</th>
                <th className="px-6 py-4 font-medium">Selfie</th>
                <th className="px-6 py-4 font-medium">ID Type</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.userId} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)]">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} color={r.avatarColor} size={36} />
                      <div>
                        <div className="text-[var(--text-primary)] font-medium">{r.name}</div>
                        {r.status === "verified" && (
                          <div className="text-xs text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Fully Verified
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-[var(--text-secondary)]">{r.email}</td>
                  <td className="px-6 py-3.5"><DocStatusChip status={r.idVerificationStatus} /></td>
                  <td className="px-6 py-3.5"><DocStatusChip status={r.liveVerificationStatus} /></td>
                  <td className="px-6 py-3.5">
                    {r.idType ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                        {r.idType}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-[var(--text-tertiary)] capitalize">{r.role ?? "—"}</td>
                  <td className="px-6 py-3.5 text-right">
                    <ActionMenu
                      items={[
                        { label: r.status === "pending" ? "Review" : "View", icon: <Eye className="w-4 h-4" />, onClick: () => router.push(`/admin/verifications/${r.userId}`) },
                        { label: "Message", icon: <MessageCircle className="w-4 h-4" />, onClick: () => onMessageUser?.(toAppUser(r)) },
                        { label: "Email", icon: <Mail className="w-4 h-4" />, onClick: () => onMailUser?.(toAppUser(r)) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState label="No submissions found." />}
        </div>
      </div>

    </div>
  );
}

function DocStatusChip({ status }: { status: string }) {
  if (status === "approved") return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400"><ShieldCheck className="w-3 h-3" />Approved</span>
  if (status === "rejected") return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400"><ShieldX className="w-3 h-3" />Rejected</span>
  if (status === "pending") return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400"><Clock className="w-3 h-3" />Pending</span>
  return <span className="text-xs text-[var(--text-muted)]">—</span>
}

