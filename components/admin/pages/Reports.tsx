'use client'
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Flag, AlertCircle, Building2, Eye, CheckCircle2 } from "lucide-react";
import { adminApi, type AdminUserReport, type AdminListingReport } from "@/lib/api/admin";
import { StatCard } from "@/components/admin/shared/StatCard";
import { FilterPill, EmptyState } from "@/components/admin/shared/Atoms";
import { StatusBadge } from "@/components/admin/shared/Badge";
import { Modal } from "@/components/admin/shared/Modal";
import { formatDate, truncateId } from "@/lib/utils/admin-format";

type Tab = "user" | "listing";

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "bg-amber-500/15 text-amber-400",   text: "pending" },
  actioned:  { bg: "bg-emerald-500/15 text-emerald-400", text: "actioned" },
  dismissed: { bg: "bg-slate-500/15 text-slate-400",   text: "dismissed" },
};

function ReasonBadge({ reason }: { reason: string }) {
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-500/15 text-[var(--text-tertiary)] border border-slate-500/20">
      {reason}
    </span>
  );
}

export function ReportsPage() {
  const [userReports, setUserReports] = useState<AdminUserReport[]>([]);
  const [listingReports, setListingReports] = useState<AdminListingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("user");
  const [selectedUser, setSelectedUser] = useState<AdminUserReport | null>(null);
  const [selectedListing, setSelectedListing] = useState<AdminListingReport | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ur, lr] = await Promise.allSettled([
        adminApi.getUserReports(1, 100),
        adminApi.getListingReports(1, 100),
      ]);
      if (ur.status === 'fulfilled') setUserReports(ur.value.reports ?? []);
      if (lr.status === 'fulfilled') setListingReports(lr.value.reports ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleUserAction(reportId: string, status: 'actioned' | 'dismissed') {
    setActionLoading(reportId);
    try {
      await adminApi.updateUserReport(reportId, status);
      setUserReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      if (selectedUser?.id === reportId) setSelectedUser(prev => prev ? { ...prev, status } : prev);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleListingAction(reportId: string, status: 'actioned' | 'dismissed') {
    setActionLoading(reportId);
    try {
      await adminApi.updateListingReport(reportId, status);
      setListingReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      if (selectedListing?.id === reportId) setSelectedListing(prev => prev ? { ...prev, status } : prev);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  const pendingUsers = userReports.filter((r) => r.status === "pending").length;
  const pendingListings = listingReports.filter((r) => r.status === "pending").length;

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="User Reports" value={loading ? "—" : userReports.length} icon={Flag} iconBg="bg-red-500/15" iconColor="text-red-400" valueColor="text-red-400" />
        <StatCard label="Pending (Users)" value={loading ? "—" : pendingUsers} icon={AlertCircle} iconBg="bg-amber-500/15" iconColor="text-amber-400" valueColor="text-amber-400" />
        <StatCard label="Listing Reports" value={loading ? "—" : listingReports.length} icon={Building2} iconBg="bg-orange-500/15" iconColor="text-orange-400" valueColor="text-orange-400" />
        <StatCard label="Pending (Listings)" value={loading ? "—" : pendingListings} icon={AlertCircle} iconBg="bg-amber-500/15" iconColor="text-amber-400" valueColor="text-amber-400" />
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="flex gap-2 mb-5">
        <FilterPill active={tab === "user"} onClick={() => setTab("user")}>User Reports</FilterPill>
        <FilterPill active={tab === "listing"} onClick={() => setTab("listing")}>Listing Reports</FilterPill>
      </div>

      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          {tab === "user" ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                  <th className="px-6 py-4 font-medium">Reported User</th>
                  <th className="px-6 py-4 font-medium">Reporter</th>
                  <th className="px-6 py-4 font-medium">Reason</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">Loading reports…</td></tr>
                ) : userReports.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState label="No user reports." /></td></tr>
                ) : userReports.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)]">
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-[var(--text-primary)] font-mono text-xs">{truncateId(r.reported_user_id, 12)}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-violet-400 font-mono text-xs">{truncateId(r.reporter_id, 12)}</span>
                    </td>
                    <td className="px-6 py-3.5"><ReasonBadge reason={r.reason} /></td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)] text-xs">{formatDate(r.created_at)}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={r.status} /></td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(r)}
                          className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                  <th className="px-6 py-4 font-medium">Listing</th>
                  <th className="px-6 py-4 font-medium">Reporter</th>
                  <th className="px-6 py-4 font-medium">Reason</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">Loading reports…</td></tr>
                ) : listingReports.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState label="No listing reports." /></td></tr>
                ) : listingReports.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)]">
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-[var(--text-primary)]">{r.listing_title ?? truncateId(r.listing_id, 12)}</div>
                      <div className="text-xs text-[var(--text-muted)] font-mono">{truncateId(r.listing_id, 12)}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-violet-400 font-mono text-xs">{truncateId(r.reporter_id, 12)}</span>
                    </td>
                    <td className="px-6 py-3.5"><ReasonBadge reason={r.reason} /></td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)] text-xs">{formatDate(r.created_at)}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={r.status} /></td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedListing(r)}
                          className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User report detail modal */}
      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Report Details" maxWidth="max-w-lg">
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-3.5">
                <div className="text-xs text-[var(--text-muted)] mb-1">Reporter ID</div>
                <div className="text-[var(--text-primary)] font-mono text-xs">{selectedUser.reporter_id}</div>
              </div>
              <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-3.5">
                <div className="text-xs text-[var(--text-muted)] mb-1">Reported User ID</div>
                <div className="text-[var(--text-primary)] font-mono text-xs">{selectedUser.reported_user_id}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)] mb-1">Reason</div>
              <div className="text-[var(--text-primary)]">{selectedUser.reason}</div>
            </div>
            {selectedUser.details && (
              <div>
                <div className="text-xs text-[var(--text-muted)] mb-1">Details</div>
                <div className="text-[var(--text-tertiary)] text-sm">{selectedUser.details}</div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <StatusBadge status={selectedUser.status} />
              <span className="text-xs text-[var(--text-muted)]">{formatDate(selectedUser.created_at)}</span>
            </div>
            {selectedUser.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <button
                  disabled={actionLoading === selectedUser.id}
                  onClick={() => handleUserAction(selectedUser.id, 'actioned')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25"
                >
                  <CheckCircle2 className="w-4 h-4" /> {actionLoading === selectedUser.id ? '…' : 'Mark Actioned'}
                </button>
                <button
                  disabled={actionLoading === selectedUser.id}
                  onClick={() => handleUserAction(selectedUser.id, 'dismissed')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-tertiary)] text-sm font-medium hover:bg-[var(--bg-hover-strong)]"
                >
                  {actionLoading === selectedUser.id ? '…' : 'Dismiss'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Listing report detail modal */}
      <Modal open={!!selectedListing} onClose={() => setSelectedListing(null)} title="Listing Report Details" maxWidth="max-w-lg">
        {selectedListing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-3.5">
                <div className="text-xs text-[var(--text-muted)] mb-1">Reporter ID</div>
                <div className="text-[var(--text-primary)] font-mono text-xs">{selectedListing.reporter_id}</div>
              </div>
              <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-3.5">
                <div className="text-xs text-[var(--text-muted)] mb-1">Listing</div>
                <div className="text-[var(--text-primary)] font-medium text-sm">{selectedListing.listing_title ?? '—'}</div>
                <div className="text-[var(--text-muted)] font-mono text-xs mt-0.5">{truncateId(selectedListing.listing_id, 14)}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)] mb-1">Reason</div>
              <div className="text-[var(--text-primary)]">{selectedListing.reason}</div>
            </div>
            {selectedListing.details && (
              <div>
                <div className="text-xs text-[var(--text-muted)] mb-1">Details</div>
                <div className="text-[var(--text-tertiary)] text-sm">{selectedListing.details}</div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <StatusBadge status={selectedListing.status} />
              <span className="text-xs text-[var(--text-muted)]">{formatDate(selectedListing.created_at)}</span>
            </div>
            {selectedListing.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <button
                  disabled={actionLoading === selectedListing.id}
                  onClick={() => handleListingAction(selectedListing.id, 'actioned')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25"
                >
                  <CheckCircle2 className="w-4 h-4" /> {actionLoading === selectedListing.id ? '…' : 'Mark Actioned'}
                </button>
                <button
                  disabled={actionLoading === selectedListing.id}
                  onClick={() => handleListingAction(selectedListing.id, 'dismissed')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-tertiary)] text-sm font-medium hover:bg-[var(--bg-hover-strong)]"
                >
                  {actionLoading === selectedListing.id ? '…' : 'Dismiss'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
