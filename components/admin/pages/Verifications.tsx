'use client'
import React, { useMemo, useState } from "react";
import { FileCheck2, ShieldCheck, ShieldX, Clock, Check, X, Eye, MessageCircle, Mail, Maximize2 } from "lucide-react";
import { useAdminStore, getUserById } from "@/lib/admin-store";
import { StatCard } from "@/components/admin/shared/StatCard";
import { SearchInput, ExportButton, FilterPill, Avatar, ActionMenu, EmptyState } from "@/components/admin/shared/Atoms";
import { StatusBadge } from "@/components/admin/shared/Badge";
import { Modal, ReasonModal, ImageLightbox } from "@/components/admin/shared/Modal";
import { formatDate, exportToExcel, truncateId } from "@/lib/utils/admin-format";
import type { Verification, AppUser } from "@/lib/types/admin";

type VerFilter = "pending" | "verified";

interface VerificationsPageProps {
  onMessageUser?: (user: AppUser) => void;
  onMailUser?: (user: AppUser) => void;
}

export function VerificationsPage({ onMessageUser, onMailUser }: VerificationsPageProps) {
  const users = useAdminStore((s) => s.users);
  const verifications = useAdminStore((s) => s.verifications);
  const approveVerification = useAdminStore((s) => s.approveVerification);
  const rejectVerification = useAdminStore((s) => s.rejectVerification);

  const [filter, setFilter] = useState<VerFilter>("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Verification | null>(null);
  const [rejecting, setRejecting] = useState<Verification | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const total = verifications.length;
  const fullyVerified = verifications.filter((v) => v.status === "verified").length;
  const notVerified = verifications.filter((v) => v.status === "not_verified").length;
  const pendingReview = verifications.filter((v) => v.status === "pending").length;

  const filtered = useMemo(() => {
    let list = verifications.filter((v) => (filter === "pending" ? v.status === "pending" : v.status === "verified"));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((v) => {
        const u = getUserById(users, v.userId);
        return (
          u?.name.toLowerCase().includes(q) ||
          u?.email.toLowerCase().includes(q) ||
          u?.userId.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [verifications, filter, search, users]);

  function handleExport() {
    exportToExcel(
      "verifications",
      filtered.map((v) => {
        const u = getUserById(users, v.userId);
        return {
          User: u?.name ?? "—", Email: u?.email ?? "—", UserID: u?.userId ?? "—",
          IDType: v.idType, Role: u?.role ?? "—", Status: v.status, Submitted: formatDate(v.submittedDate),
        };
      })
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Submissions" value={total} icon={FileCheck2} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
        <StatCard label="Fully Verified" value={fullyVerified} icon={ShieldCheck} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" valueColor="text-emerald-400" />
        <StatCard label="Not Verified" value={notVerified} icon={ShieldX} iconBg="bg-red-500/15" iconColor="text-red-400" valueColor="text-red-400" />
        <StatCard label="Pending Review" value={pendingReview} icon={Clock} iconBg="bg-amber-500/15" iconColor="text-amber-400" valueColor="text-amber-400" />
      </div>

      <div className="flex gap-2 mb-4">
        <FilterPill active={filter === "pending"} onClick={() => setFilter("pending")}>Pending Review</FilterPill>
        <FilterPill active={filter === "verified"} onClick={() => setFilter("verified")}>Verified Users</FilterPill>
      </div>

      <div className="flex gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, or user ID..." />
        <ExportButton onClick={handleExport} />
      </div>

      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Number</th>
                <th className="px-6 py-4 font-medium">User ID</th>
                <th className="px-6 py-4 font-medium">ID Type</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const u = getUserById(users, v.userId);
                if (!u) return null;
                return (
                  <tr key={v.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)]">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} color={u.avatarColor} size={36} />
                        <div>
                          <div className="text-[var(--text-primary)] font-medium">{u.name}</div>
                          {v.status === "verified" && (
                            <div className="text-xs text-emerald-400 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Fully Verified
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)]">{u.email}</td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)]">{u.phone}</td>
                    <td className="px-6 py-3.5 text-[var(--text-muted)] font-mono text-xs">{truncateId(u.userId, 12)}</td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                        {v.idType}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[var(--text-tertiary)] capitalize">{u.role}</td>
                    <td className="px-6 py-3.5 text-right">
                      <ActionMenu
                        items={[
                          { label: "View", icon: <Eye className="w-4 h-4" />, onClick: () => setSelected(v) },
                          { label: "Message", icon: <MessageCircle className="w-4 h-4" />, onClick: () => onMessageUser?.(u) },
                          { label: "Email", icon: <Mail className="w-4 h-4" />, onClick: () => onMailUser?.(u) },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState label="No submissions found." />}
        </div>
      </div>

      {/* Submission detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Verification Submission" maxWidth="max-w-2xl">
        {selected && (() => {
          const u = getUserById(users, selected.userId);
          if (!u) return null;
          return (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Avatar name={u.name} color={u.avatarColor} size={56} />
                <div>
                  <div className="text-lg font-bold text-[var(--text-primary)]">{u.name}</div>
                  <div className="text-sm text-[var(--text-secondary)] capitalize">{u.role} · {truncateId(u.userId, 14)}</div>
                </div>
                <div className="ml-auto"><StatusBadge status={selected.status} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-3.5">
                  <div className="text-xs text-[var(--text-muted)] mb-1">ID Type</div>
                  <div className="text-[var(--text-primary)] font-medium">{selected.idType}</div>
                </div>
                <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-3.5">
                  <div className="text-xs text-[var(--text-muted)] mb-1">Document No.</div>
                  <div className="text-[var(--text-primary)] font-medium font-mono">{selected.idNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <ZoomableImage label="ID Document" src={selected.idImageUrl} onExpand={() => setLightboxSrc(selected.idImageUrl)} />
                <ZoomableImage label="Selfie" src={selected.selfieImageUrl} onExpand={() => setLightboxSrc(selected.selfieImageUrl)} />
              </div>

              {selected.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setRejecting(selected); setSelected(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/15 text-red-400 font-medium hover:bg-red-500/25 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => { approveVerification(selected.id); setSelected(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} alt="Fullscreen document" open={!!lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      <ReasonModal
        open={!!rejecting}
        title="Reason for rejection"
        onSubmit={(reason) => {
          if (rejecting) rejectVerification(rejecting.id, reason);
          setRejecting(null);
        }}
        onCancel={() => setRejecting(null)}
      />
    </div>
  );
}

function ZoomableImage({ label, src, onExpand }: { label: string; src: string; onExpand: () => void }) {
  return (
    <div>
      <div className="text-xs text-[var(--text-muted)] mb-2">{label}</div>
      <div className="relative group">
        <img src={src} alt={label} className="w-full h-40 object-cover rounded-xl border border-[var(--border-color)]" />
        <button
          onClick={onExpand}
          className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
          aria-label={`View ${label} fullscreen`}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
