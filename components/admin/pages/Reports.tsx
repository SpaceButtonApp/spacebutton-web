'use client'
import React, { useMemo, useState } from "react";
import { Flag, AlertCircle, Building2, Eye, CheckCircle2 } from "lucide-react";
import { useAdminStore, getUserById, getListingById } from "@/lib/admin-store";
import { StatCard } from "@/components/admin/shared/StatCard";
import { FilterPill, Avatar, EmptyState } from "@/components/admin/shared/Atoms";
import { StatusBadge } from "@/components/admin/shared/Badge";
import { Modal, ConfirmModal } from "@/components/admin/shared/Modal";
import { formatDate, truncateId } from "@/lib/utils/admin-format";
import type { Report } from "@/lib/types/admin";

type Tab = "user" | "listing";

interface ReportsPageProps {
  onViewListing?: (listingId: string) => void;
}

export function ReportsPage({ onViewListing }: ReportsPageProps) {
  const reports = useAdminStore((s) => s.reports);
  const users = useAdminStore((s) => s.users);
  const listings = useAdminStore((s) => s.listings);
  const markReportReviewed = useAdminStore((s) => s.markReportReviewed);
  const markReportResolved = useAdminStore((s) => s.markReportResolved);
  const flagReport = useAdminStore((s) => s.flagReport);

  const [tab, setTab] = useState<Tab>("user");
  const [detail, setDetail] = useState<Report | null>(null);
  const [flagging, setFlagging] = useState<Report | null>(null);

  const userReports = reports.filter((r) => r.targetType === "user");
  const listingReports = reports.filter((r) => r.targetType === "listing");
  const pendingUsers = userReports.filter((r) => r.status === "pending").length;
  const pendingListings = listingReports.filter((r) => r.status === "pending").length;

  const activeList = tab === "user" ? userReports : listingReports;

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="User Reports" value={userReports.length} icon={Flag} iconBg="bg-red-500/15" iconColor="text-red-400" valueColor="text-red-400" />
        <StatCard label="Pending (Users)" value={pendingUsers} icon={AlertCircle} iconBg="bg-amber-500/15" iconColor="text-amber-400" valueColor="text-amber-400" />
        <StatCard label="Listing Reports" value={listingReports.length} icon={Building2} iconBg="bg-orange-500/15" iconColor="text-orange-400" valueColor="text-orange-400" />
        <StatCard label="Pending (Listings)" value={pendingListings} icon={AlertCircle} iconBg="bg-amber-500/15" iconColor="text-amber-400" valueColor="text-amber-400" />
      </div>

      <div className="flex gap-2 mb-5">
        <FilterPill active={tab === "user"} onClick={() => setTab("user")}>User Reports</FilterPill>
        <FilterPill active={tab === "listing"} onClick={() => setTab("listing")}>Listing Reports</FilterPill>
      </div>

      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                <th className="px-6 py-4 font-medium">{tab === "user" ? "Reported User" : "Listing"}</th>
                <th className="px-6 py-4 font-medium">Reporter</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Details</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeList.map((r) => {
                const reporter = getUserById(users, r.reporterId);
                const reportedUser = r.reportedUserId ? getUserById(users, r.reportedUserId) : undefined;
                const reportedListing = r.reportedListingId ? getListingById(listings, r.reportedListingId) : undefined;
                return (
                  <tr key={r.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)]">
                    <td className="px-6 py-3.5">
                      {tab === "user" && reportedUser ? (
                        <div className="flex items-center gap-3">
                          <Avatar name={reportedUser.name} color={reportedUser.avatarColor} size={32} />
                          <div>
                            <div className="text-[var(--text-primary)] font-medium">{reportedUser.name}</div>
                            <div className="text-xs text-[var(--text-muted)]">{truncateId(reportedUser.userId, 10)}</div>
                          </div>
                        </div>
                      ) : reportedListing ? (
                        <div>
                          <div className="text-[var(--text-primary)] font-medium">{reportedListing.title}</div>
                          <div className="text-xs text-[var(--text-muted)]">{truncateId(reportedListing.id, 10)}</div>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">Deleted</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-violet-400 font-medium">{reporter?.name ?? "Unknown"}</span>
                      <div className="text-xs text-[var(--text-muted)]">{reporter ? truncateId(reporter.userId, 10) : "—"}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-500/15 text-[var(--text-tertiary)] border border-slate-500/20">
                        {r.reason}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[var(--text-muted)]">{r.details ?? "—"}</td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)]">{formatDate(r.date)}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={r.status} /></td>
                    <td className="px-6 py-3.5">
                      <button
                        onClick={() => setDetail(r)}
                        className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-medium ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {activeList.length === 0 && <EmptyState label="No reports here." />}
        </div>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Report Details" maxWidth="max-w-lg">
        {detail && (() => {
          const reporter = getUserById(users, detail.reporterId);
          const reportedUser = detail.reportedUserId ? getUserById(users, detail.reportedUserId) : undefined;
          const reportedListing = detail.reportedListingId ? getListingById(listings, detail.reportedListingId) : undefined;
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-3.5">
                  <div className="text-xs text-[var(--text-muted)] mb-1">Reporter</div>
                  <div className="text-[var(--text-primary)] font-medium">{reporter?.name ?? "Unknown"}</div>
                  <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{reporter ? truncateId(reporter.userId, 14) : "—"}</div>
                </div>
                <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-3.5">
                  <div className="text-xs text-[var(--text-muted)] mb-1">{detail.targetType === "user" ? "Reported User" : "Reported Listing"}</div>
                  <div className="text-[var(--text-primary)] font-medium">{reportedUser?.name ?? reportedListing?.title ?? "Deleted"}</div>
                  <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                    {reportedUser ? truncateId(reportedUser.userId, 14) : reportedListing ? truncateId(reportedListing.id, 14) : "—"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-[var(--text-muted)] mb-1">Reason</div>
                <div className="text-[var(--text-primary)]">{detail.reason}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)] mb-1">Details</div>
                <div className="text-[var(--text-tertiary)] text-sm">{detail.details ?? "No additional details provided."}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={detail.status} />
                <span className="text-xs text-[var(--text-muted)]">{detail.flagCount} flag{detail.flagCount === 1 ? "" : "s"} · {formatDate(detail.date)}</span>
              </div>

              {detail.targetType === "listing" && reportedListing && (
                <button
                  onClick={() => { onViewListing?.(reportedListing.id); setDetail(null); }}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-500/15 text-blue-400 text-sm font-medium hover:bg-blue-500/25 transition-colors"
                >
                  <Building2 className="w-4 h-4" /> View Property
                </button>
              )}

              {(detail.messageToReporter || detail.messageToReported) && (
                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                  {detail.messageToReporter && (
                    <div className="text-sm"><span className="text-[var(--text-muted)]">To reporter: </span><span className="text-[var(--text-tertiary)]">{detail.messageToReporter}</span></div>
                  )}
                  {detail.messageToReported && (
                    <div className="text-sm"><span className="text-[var(--text-muted)]">To reported: </span><span className="text-[var(--text-tertiary)]">{detail.messageToReported}</span></div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {detail.status === "pending" && (
                  <button
                    onClick={() => { markReportReviewed(detail.id); setDetail({ ...detail, status: "reviewed" }); }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-tertiary)] text-sm font-medium hover:bg-[var(--bg-hover-strong)]"
                  >
                    Mark Reviewed
                  </button>
                )}
                {detail.status !== "resolved" && (
                  <button
                    onClick={() => { markReportResolved(detail.id); setDetail({ ...detail, status: "resolved" }); }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => setFlagging(detail)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/15 text-red-400 text-sm font-medium hover:bg-red-500/25 ml-auto"
                >
                  <Flag className="w-4 h-4" /> Flag ({detail.flagCount}/3)
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <ConfirmModal
        open={!!flagging}
        title="Flag this content?"
        description={
          flagging && flagging.flagCount + 1 >= 3
            ? `This is the 3rd flag — the ${flagging.targetType === "user" ? "reported user will be suspended" : "listing will be closed"} automatically.`
            : "Adding a flag brings this closer to automatic suspension/closure after 3 flags."
        }
        confirmLabel="Add Flag"
        icon={<Flag className="w-6 h-6 text-red-400" />}
        onConfirm={() => { if (flagging) { flagReport(flagging.id); setDetail(null); } setFlagging(null); }}
        onCancel={() => setFlagging(null)}
      />
    </div>
  );
}
