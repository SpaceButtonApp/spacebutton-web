'use client'
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Building2, CheckCircle2, Clock, XCircle, List, LayoutGrid, Eye, Trash2, MessageCircle, Mail, MapPin, Bed, Bath, CheckCheck, X, RefreshCw, AlertCircle, Video, ExternalLink } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { AdminListing, AdminAgent } from "@/lib/api/admin";
import { StatCard } from "@/components/admin/shared/StatCard";
import { SearchInput, ExportButton, ActionMenu, FilterPill, Avatar, EmptyState } from "@/components/admin/shared/Atoms";
import { StatusBadge } from "@/components/admin/shared/Badge";
import { Modal, ConfirmModal, ReasonModal } from "@/components/admin/shared/Modal";
import { formatDate, exportToExcel, formatNaira, truncateId } from "@/lib/utils/admin-format";
import type { AppUser, ApprovalStatus, ListingStatus, UserRole } from "@/lib/types/admin";

type ApprovalFilter = "all" | "pending" | "approved" | "rejected";
type ViewMode = "table" | "grid";

interface ListingRow {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  rentPeriod: string;
  propertyType: string;
  status: ListingStatus;
  approval: ApprovalStatus;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  videoUrl?: string;
  agentId: string;
  agentName: string;
  agentEmail: string;
  agentAvatarColor: string;
  createdDate: string;
}

function hashColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#6D28D9","#7C3AED","#8B5CF6","#2563EB","#0EA5E9","#10B981","#F59E0B","#EF4444","#EC4899","#14B8A6"];
  return colors[Math.abs(hash) % colors.length];
}

function mapListing(l: AdminListing, agentMap: Map<string, AdminAgent>): ListingRow {
  const agent = agentMap.get(l.agent_id);
  const agentName = agent
    ? [agent.first_name, agent.last_name].filter(Boolean).join(" ") || agent.agency_name || "Agent"
    : "Agent";
  const price = parseFloat(l.price ?? "0") || 0;
  const statusRaw = (l.status ?? "").toLowerCase();
  let approval: ApprovalStatus;
  let status: ListingStatus;
  if (statusRaw === "pending") {
    approval = "pending"; status = "closed";
  } else if (statusRaw === "rejected") {
    approval = "rejected"; status = "closed";
  } else if (statusRaw === "active") {
    approval = "approved"; status = "active";
  } else if (statusRaw === "closed") {
    approval = "approved"; status = "closed";
  } else {
    approval = "pending"; status = "closed";
  }
  const location = [l.address, l.city, l.state].filter(Boolean).join(", ") || "—";
  return {
    id: l.id,
    title: l.title,
    description: l.description ?? "",
    location,
    price,
    rentPeriod: l.rent_period ?? "",
    propertyType: l.property_type ?? "",
    status,
    approval,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    images: (l.images ?? []).map((img) => img.url),
    videoUrl: l.video_tour_url,
    agentId: l.agent_id,
    agentName,
    agentEmail: agent?.email ?? "",
    agentAvatarColor: hashColor(l.agent_id),
    createdDate: l.created_at,
  };
}

function toAppUser(row: ListingRow): AppUser {
  return {
    id: row.agentId,
    userId: row.agentId,
    name: row.agentName,
    email: row.agentEmail,
    phone: "",
    role: "agent" as UserRole,
    status: "active",
    joinDate: "",
    avatarColor: row.agentAvatarColor,
    referralCode: "",
    connects: 0,
  };
}

interface ListingsPageProps {
  onMessageUser?: (user: AppUser) => void;
  onMailUser?: (user: AppUser) => void;
  focusListingId?: string | null;
  onFocusConsumed?: () => void;
}

export function ListingsPage({ onMessageUser, onMailUser, focusListingId, onFocusConsumed }: ListingsPageProps) {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApprovalFilter>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [detailListing, setDetailListing] = useState<ListingRow | null>(null);
  const [confirmDel, setConfirmDel] = useState<ListingRow | null>(null);
  const [rejectingListing, setRejectingListing] = useState<ListingRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [firstPage, agentsResult] = await Promise.allSettled([
        adminApi.getListings(1, 100),
        adminApi.getAgents(1, 200),
      ]);

      if (firstPage.status === "rejected") throw firstPage.reason;

      let all: AdminListing[] = firstPage.value.listings ?? [];
      let page = 2;
      while (all.length < (firstPage.value.total ?? 0) && (firstPage.value.listings?.length ?? 0) >= 100) {
        const next = await adminApi.getListings(page, 100);
        const batch = next.listings ?? [];
        all = [...all, ...batch];
        if (batch.length < 100) break;
        page++;
      }

      const agentMap = new Map<string, AdminAgent>();
      if (agentsResult.status === "fulfilled") {
        for (const a of (agentsResult.value.agents ?? [])) {
          agentMap.set(a.id, a);
          agentMap.set(a.user_id, a);
        }
      }

      setListings(all.map((l) => mapListing(l, agentMap)));
    } catch (e) {
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to load listings";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (focusListingId && listings.length > 0) {
      const l = listings.find((li) => li.id === focusListingId);
      if (l) setDetailListing(l);
      onFocusConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusListingId, listings]);

  const totalActive = listings.filter((l) => l.status === "active").length;
  const pendingCount = listings.filter((l) => l.approval === "pending").length;
  const approvedCount = listings.filter((l) => l.approval === "approved").length;
  const rejectedCount = listings.filter((l) => l.approval === "rejected").length;

  const filtered = useMemo(() => {
    let list = listings;
    if (filter === "pending") list = list.filter((l) => l.approval === "pending");
    else if (filter === "approved") list = list.filter((l) => l.approval === "approved");
    else if (filter === "rejected") list = list.filter((l) => l.approval === "rejected");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.agentName.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }, [listings, filter, search]);

  async function handleApprove(id: string) {
    try {
      await adminApi.approveListing(id);
      const update = (l: ListingRow) => l.id === id ? { ...l, approval: "approved" as const, status: "active" as const } : l;
      setListings((prev) => prev.map(update));
      setDetailListing((prev) => prev ? update(prev) : prev);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to approve listing");
    }
  }

  async function handleReject(id: string, reason: string) {
    try {
      await adminApi.rejectListing(id, reason);
      const update = (l: ListingRow) => l.id === id ? { ...l, approval: "rejected" as const, status: "closed" as const } : l;
      setListings((prev) => prev.map(update));
      setDetailListing((prev) => prev ? update(prev) : prev);
      setRejectingListing(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to reject listing");
    }
  }

  async function handleDelete(id: string) {
    try {
      await adminApi.deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      setDetailListing((prev) => (prev?.id === id ? null : prev));
      setConfirmDel(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete listing");
    }
  }

  function handleExport() {
    exportToExcel(
      "listings",
      filtered.map((l) => ({
        Title: l.title,
        Location: l.location,
        Price: l.price,
        PropertyType: l.propertyType,
        Status: l.status,
        Approval: l.approval,
        Agent: l.agentName,
        Listed: formatDate(l.createdDate),
      }))
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-sm text-[var(--text-secondary)]">Loading listings…</span>
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
        <StatCard label="Active Listings" value={totalActive} icon={Building2} iconBg="bg-blue-500/15" iconColor="text-blue-400" />
        <StatCard label="Pending Approval" value={pendingCount} icon={Clock} iconBg="bg-amber-500/15" iconColor="text-amber-400" valueColor="text-amber-400" />
        <StatCard label="Approved" value={approvedCount} icon={CheckCircle2} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" valueColor="text-emerald-400" />
        <StatCard label="Rejected" value={rejectedCount} icon={XCircle} iconBg="bg-red-500/15" iconColor="text-red-400" valueColor="text-red-400" />
      </div>

      <div className="flex gap-2 mb-4">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>All</FilterPill>
        <FilterPill active={filter === "pending"} onClick={() => setFilter("pending")}>Pending</FilterPill>
        <FilterPill active={filter === "approved"} onClick={() => setFilter("approved")}>Approved</FilterPill>
        <FilterPill active={filter === "rejected"} onClick={() => setFilter("rejected")}>Rejected</FilterPill>
      </div>

      <div className="flex gap-3 mb-5 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title, location or agent..." />
        <div className="flex gap-1 bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-xl p-1 shrink-0">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "table" ? "bg-violet-600 text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            aria-label="Table view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-violet-600 text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={load}
          className="p-3 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <ExportButton onClick={handleExport} />
      </div>

      {viewMode === "table" ? (
        <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                  <th className="px-6 py-4 font-medium">Listing</th>
                  <th className="px-6 py-4 font-medium">Agent</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Approval</th>
                  <th className="px-6 py-4 font-medium">Listed</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)]">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {l.images[0] ? (
                          <img src={l.images[0]} alt={l.title} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[var(--border-color)]" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
                          </div>
                        )}
                        <div>
                          <div className="text-[var(--text-primary)] font-medium">{l.title}</div>
                          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{l.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={l.agentName} color={l.agentAvatarColor} size={28} />
                        <span className="text-[var(--text-secondary)]">{l.agentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)] capitalize">{l.propertyType || "—"}</td>
                    <td className="px-6 py-3.5 text-[var(--text-primary)]">{l.price ? formatNaira(l.price) : "—"}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={l.status} /></td>
                    <td className="px-6 py-3.5"><StatusBadge status={l.approval} /></td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)]">{formatDate(l.createdDate)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <ActionMenu
                        items={[
                          { label: "View details", icon: <Eye className="w-4 h-4" />, onClick: () => setDetailListing(l) },
                          { label: "Message agent", icon: <MessageCircle className="w-4 h-4" />, onClick: () => onMessageUser?.(toAppUser(l)) },
                          { label: "Email agent", icon: <Mail className="w-4 h-4" />, onClick: () => onMailUser?.(toAppUser(l)) },
                          l.approval === "pending" ? { label: "Approve", icon: <CheckCheck className="w-4 h-4" />, onClick: () => handleApprove(l.id) } : null,
                          l.approval === "pending" ? { label: "Reject", icon: <X className="w-4 h-4" />, onClick: () => setRejectingListing(l), danger: true } : null,
                          { label: "Delete", icon: <Trash2 className="w-4 h-4" />, onClick: () => setConfirmDel(l), danger: true },
                        ].filter(Boolean) as Parameters<typeof ActionMenu>[0]["items"]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <EmptyState label="No listings found." />}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} onView={() => setDetailListing(l)} />
          ))}
          {filtered.length === 0 && <div className="col-span-3"><EmptyState label="No listings found." /></div>}
        </div>
      )}

      <Modal open={!!detailListing} onClose={() => setDetailListing(null)} title="Listing Details" maxWidth="max-w-2xl">
        {detailListing && (
          <ListingDetail
            listing={detailListing}
            onApprove={() => handleApprove(detailListing.id)}
            onReject={() => setRejectingListing(detailListing)}
            onDelete={() => { setDetailListing(null); setConfirmDel(detailListing); }}
            onMessage={() => onMessageUser?.(toAppUser(detailListing))}
            onMail={() => onMailUser?.(toAppUser(detailListing))}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!confirmDel}
        title="Delete listing?"
        description={`"${confirmDel?.title}" will be permanently removed from the platform.`}
        confirmLabel="Delete"
        icon={<Trash2 className="w-6 h-6 text-red-400" />}
        onConfirm={() => { if (confirmDel) handleDelete(confirmDel.id); }}
        onCancel={() => setConfirmDel(null)}
      />

      <ReasonModal
        open={!!rejectingListing}
        title="Reason for rejection"
        onSubmit={(reason) => { if (rejectingListing) handleReject(rejectingListing.id, reason); }}
        onCancel={() => setRejectingListing(null)}
      />
    </div>
  );
}

function ListingCard({ listing, onView }: { listing: ListingRow; onView: () => void }) {
  return (
    <div
      onClick={onView}
      className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden cursor-pointer hover:border-violet-500/30 transition-colors"
    >
      {listing.images[0] ? (
        <img src={listing.images[0]} alt={listing.title} className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-[var(--bg-sunken)] flex items-center justify-center">
          <Building2 className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="font-semibold text-[var(--text-primary)] text-sm leading-tight">{listing.title}</div>
          <StatusBadge status={listing.approval} />
        </div>
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mb-3">
          <MapPin className="w-3 h-3" />{listing.location}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-violet-400 font-bold text-sm">
            {listing.price ? formatNaira(listing.price) : "—"}
            {listing.rentPeriod && <span className="text-xs text-[var(--text-muted)] font-normal">/{listing.rentPeriod}</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            {listing.bedrooms !== undefined && <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" />{listing.bedrooms}</span>}
            {listing.bathrooms !== undefined && <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" />{listing.bathrooms}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingDetail({
  listing, onApprove, onReject, onDelete, onMessage, onMail,
}: {
  listing: ListingRow;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onMessage: () => void;
  onMail: () => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <div>
      {/* Image gallery */}
      {listing.images.length > 0 && (
        <div className="relative mb-4">
          <img
            src={listing.images[imgIdx]}
            alt={listing.title}
            className="w-full h-56 object-cover rounded-xl border border-[var(--border-color)]"
          />
          {listing.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {listing.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/40"}`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
          {listing.images.length > 1 && (
            <div className="absolute bottom-3 right-3 text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full">
              {imgIdx + 1} / {listing.images.length}
            </div>
          )}
        </div>
      )}

      {/* Video tour */}
      {listing.videoUrl && (
        <div className="mb-4">
          <VideoEmbed url={listing.videoUrl} />
        </div>
      )}

      {/* Title + status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{listing.title}</h3>
          <div className="text-sm text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />{listing.location}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <StatusBadge status={listing.status} />
          <StatusBadge status={listing.approval} />
        </div>
      </div>

      {/* Price */}
      <div className="text-2xl font-bold text-violet-400 mb-1">
        {listing.price ? formatNaira(listing.price) : "—"}
        {listing.rentPeriod && (
          <span className="text-sm text-[var(--text-muted)] font-normal">/{listing.rentPeriod}</span>
        )}
      </div>

      {/* Property type */}
      {listing.propertyType && (
        <div className="text-xs text-[var(--text-muted)] mb-4 capitalize">{listing.propertyType}</div>
      )}

      {/* Description */}
      {listing.description && (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{listing.description}</p>
      )}

      {/* Feature boxes */}
      <div className="flex flex-wrap gap-2 mb-5">
        {listing.bedrooms !== undefined && (
          <FeatureBox icon={Bed} label={`${listing.bedrooms} Bed${listing.bedrooms !== 1 ? "s" : ""}`} />
        )}
        {listing.bathrooms !== undefined && (
          <FeatureBox icon={Bath} label={`${listing.bathrooms} Bath${listing.bathrooms !== 1 ? "s" : ""}`} />
        )}
        {listing.videoUrl && (
          <FeatureBox icon={Video} label="Video Tour" />
        )}
      </div>

      {/* Thumbnail strip for multiple images */}
      {listing.images.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {listing.images.map((src, i) => (
            <button
              key={i}
              onClick={() => setImgIdx(i)}
              className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-violet-500" : "border-[var(--border-color)]"}`}
            >
              <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Agent info */}
      <div className="flex items-center justify-between bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-3.5 mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={listing.agentName} color={listing.agentAvatarColor} size={36} />
          <div>
            <div className="text-[var(--text-primary)] font-medium text-sm">{listing.agentName}</div>
            <div className="text-xs text-[var(--text-muted)]">Agent · {truncateId(listing.agentId, 10)}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onMessage}
            className="p-2 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Message agent"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onMail}
            className="p-2 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Email agent"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Approve / Reject */}
      {listing.approval === "pending" && (
        <div className="flex gap-3 mb-3">
          <button
            onClick={onReject}
            className="flex-1 py-2.5 rounded-xl bg-red-500/15 text-red-400 font-medium hover:bg-red-500/25 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Reject
          </button>
          <button
            onClick={onApprove}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCheck className="w-4 h-4" /> Approve
          </button>
        </div>
      )}

      <button
        onClick={onDelete}
        className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400/80 text-sm font-medium hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" /> Delete Listing
      </button>
    </div>
  );
}

function VideoEmbed({ url }: { url: string }) {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
  if (ytMatch) {
    return (
      <div className="rounded-xl overflow-hidden border border-[var(--border-color)]">
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          className="w-full h-48"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video tour"
        />
      </div>
    );
  }
  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
  if (isDirectVideo) {
    return (
      <video
        src={url}
        controls
        className="w-full h-48 rounded-xl border border-[var(--border-color)] bg-black"
      />
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-sunken)] border border-[var(--border-color)] text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
    >
      <Video className="w-4 h-4" />
      View Video Tour
      <ExternalLink className="w-3.5 h-3.5 ml-auto" />
    </a>
  );
}

function FeatureBox({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
      <Icon className="w-3.5 h-3.5 text-violet-400" />{label}
    </div>
  );
}
