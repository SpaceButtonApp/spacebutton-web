'use client'
import React, { useCallback, useEffect, useState } from "react";
import { Flag, AlertCircle, Building2, FileText, XCircle, CheckCircle2, ExternalLink, MapPin } from "lucide-react";
import { supportApi, type AdminUser } from "@/lib/api/support";
import type { AdminUserReport, AdminListingReport, AdminListing } from "@/lib/api/admin";
import { StatCard } from "@/components/admin/shared/StatCard";
import { FilterPill, EmptyState, ActionMenu, Avatar } from "@/components/admin/shared/Atoms";
import { StatusBadge } from "@/components/admin/shared/Badge";
import { Modal, ConfirmModal } from "@/components/admin/shared/Modal";
import { formatDate, truncateId, formatNaira } from "@/lib/utils/admin-format";

type Tab = "user" | "listing";

const AVATAR_COLORS = ["#7c3aed", "#a855f7", "#8b5cf6", "#6366f1", "#c026d3", "#9333ea"];
function avatarColor(id: string) {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function UserCell({ userId, user }: { userId: string; user?: AdminUser }) {
  const name = user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email : null;
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={name ?? userId} color={avatarColor(userId)} size={30} />
      <div>
        <div className="font-medium text-[var(--text-primary)] text-sm">{name ?? "Unknown user"}</div>
        <div className="text-xs text-[var(--text-muted)] font-mono">{userId.slice(-8).toUpperCase()}</div>
      </div>
    </div>
  );
}

function ReasonBadge({ reason }: { reason: string }) {
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-500/15 text-[var(--text-tertiary)] border border-slate-500/20">
      {reason}
    </span>
  );
}

interface ReportsViewProps {
  onViewListing?: (listingId: string) => void;
}

export default function ReportsView({ onViewListing }: ReportsViewProps) {
  const [userReports, setUserReports] = useState<AdminUserReport[]>([]);
  const [listingReports, setListingReports] = useState<AdminListingReport[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, AdminUser>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("user");
  const [selectedUser, setSelectedUser] = useState<AdminUserReport | null>(null);
  const [selectedListing, setSelectedListing] = useState<AdminListingReport | null>(null);
  const [listingDetail, setListingDetail] = useState<AdminListing | null>(null);
  const [listingDetailLoading, setListingDetailLoading] = useState(false);
  const [confirmCloseListing, setConfirmCloseListing] = useState<AdminListingReport | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ur, lr] = await Promise.allSettled([
        supportApi.getUserReports(1, 100),
        supportApi.getListingReports(1, 100),
      ]);
      if (ur.status === 'fulfilled') setUserReports(ur.value.reports ?? []);
      if (lr.status === 'fulfilled') setListingReports(lr.value.reports ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }

    try {
      let all: AdminUser[] = [];
      let page = 1;
      while (true) {
        const res = await supportApi.getUsers({ page, page_size: 100 });
        const batch = res.users ?? [];
        all = [...all, ...batch];
        if (all.length >= (res.total ?? 0) || batch.length < 100) break;
        page++;
      }
      setUsersMap(new Map(all.map((u) => [u.id, u])));
    } catch {
      // names just won't resolve — falls back to raw IDs
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Fetch full listing details (price, location, poster) when the report modal opens
  useEffect(() => {
    if (!selectedListing) { setListingDetail(null); return; }
    let cancelled = false;
    setListingDetailLoading(true);
    supportApi.getListing(selectedListing.listing_id)
      .then((l) => { if (!cancelled) setListingDetail(l); })
      .catch(() => { if (!cancelled) setListingDetail(null); })
      .finally(() => { if (!cancelled) setListingDetailLoading(false); });
    return () => { cancelled = true; };
  }, [selectedListing]);

  async function handleUserAction(reportId: string, status: 'actioned' | 'dismissed') {
    setActionLoading(reportId);
    try {
      await supportApi.updateUserReport(reportId, status);
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
      await supportApi.updateListingReport(reportId, status);
      setListingReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      if (selectedListing?.id === reportId) setSelectedListing(prev => prev ? { ...prev, status } : prev);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCloseListing(r: AdminListingReport) {
    setActionLoading(r.id);
    try {
      await supportApi.closeListing(r.listing_id);
      setConfirmCloseListing(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to close listing');
    } finally {
      setActionLoading(null);
    }
  }

  function goToListing(listingId: string) {
    setSelectedListing(null);
    onViewListing?.(listingId);
  }

  const pendingUsers = userReports.filter((r) => r.status === "pending").length;
  const pendingListings = listingReports.filter((r) => r.status === "pending").length;

  return (
    <div className="admin-root dark" style={{ height: 'auto', overflow: 'visible' }}>
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
                        <UserCell userId={r.reported_user_id} user={usersMap.get(r.reported_user_id)} />
                      </td>
                      <td className="px-6 py-3.5">
                        <UserCell userId={r.reporter_id} user={usersMap.get(r.reporter_id)} />
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
                            <FileText className="w-3.5 h-3.5" /> View
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
                        <UserCell userId={r.reporter_id} user={usersMap.get(r.reporter_id)} />
                      </td>
                      <td className="px-6 py-3.5"><ReasonBadge reason={r.reason} /></td>
                      <td className="px-6 py-3.5 text-[var(--text-secondary)] text-xs">{formatDate(r.created_at)}</td>
                      <td className="px-6 py-3.5"><StatusBadge status={r.status} /></td>
                      <td className="px-6 py-3.5 text-right">
                        <ActionMenu items={[
                          { label: "Report Details", icon: <FileText className="w-4 h-4" />, onClick: () => setSelectedListing(r) },
                          { label: "Close Listing", icon: <XCircle className="w-4 h-4" />, onClick: () => setConfirmCloseListing(r), danger: true },
                          r.status === "pending" ? { label: "Mark Actioned", icon: <CheckCircle2 className="w-4 h-4" />, onClick: () => handleListingAction(r.id, "actioned") } : null,
                          r.status === "pending" ? { label: "Dismiss", icon: <XCircle className="w-4 h-4" />, onClick: () => handleListingAction(r.id, "dismissed") } : null,
                        ].filter(Boolean) as Parameters<typeof ActionMenu>[0]["items"]} />
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
              <div>
                <div className="text-xs text-[var(--text-muted)] mb-1.5">Reporter</div>
                <UserCell userId={selectedListing.reporter_id} user={usersMap.get(selectedListing.reporter_id)} />
              </div>

              <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-3.5 space-y-2.5">
                <div>
                  <div className="text-xs text-[var(--text-muted)] mb-1">Listing Name</div>
                  <div className="text-[var(--text-primary)] font-medium text-sm">{selectedListing.listing_title ?? listingDetail?.title ?? '—'}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Price</div>
                    <div className="text-[var(--text-primary)] text-sm">
                      {listingDetailLoading ? '…' : listingDetail?.price ? formatNaira(parseFloat(listingDetail.price)) : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Location</div>
                    <div className="text-[var(--text-primary)] text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                      {listingDetailLoading ? '…' : [listingDetail?.city, listingDetail?.state].filter(Boolean).join(', ') || '—'}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)] mb-1">Posted By</div>
                  {listingDetailLoading ? (
                    <div className="text-[var(--text-primary)] text-sm">…</div>
                  ) : listingDetail ? (
                    <UserCell userId={listingDetail.agent_id} user={usersMap.get(listingDetail.agent_id)} />
                  ) : (
                    <div className="text-[var(--text-primary)] text-sm">—</div>
                  )}
                </div>
                <button
                  onClick={() => goToListing(selectedListing.listing_id)}
                  className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm font-medium pt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Listing Details
                </button>
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
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  disabled={actionLoading === selectedListing.id}
                  onClick={() => setConfirmCloseListing(selectedListing)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/15 text-red-400 text-sm font-medium hover:bg-red-500/25"
                >
                  <XCircle className="w-4 h-4" /> Close Listing
                </button>
                {selectedListing.status === 'pending' && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>

        <ConfirmModal
          open={!!confirmCloseListing}
          title="Close listing?"
          description={`"${confirmCloseListing?.listing_title ?? 'This listing'}" will be marked closed and hidden from search.`}
          confirmLabel="Close listing"
          icon={<XCircle className="w-6 h-6 text-red-400" />}
          onConfirm={() => { if (confirmCloseListing) handleCloseListing(confirmCloseListing); }}
          onCancel={() => setConfirmCloseListing(null)}
        />
      </div>
    </div>
  );
}
