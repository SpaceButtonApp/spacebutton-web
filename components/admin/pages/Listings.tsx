'use client'
import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Building2, CheckCircle2, Clock, XCircle, List, LayoutGrid, Eye, Trash2,
  MessageCircle, Mail, MapPin, Bed, Bath, CheckCheck, X, RefreshCw, AlertCircle,
  Video, ExternalLink, ChevronLeft, ChevronRight, Sofa, Tag, Users, Home, Calendar,
} from "lucide-react";
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

const CONDITION_LABELS: Record<string, string> = {
  for_rent: "Rent", need_roommate: "Roommate", flatmate: "Flatmate", subletting: "Vacating",
};
const PROP_TYPE_LABELS: Record<string, string> = {
  apartment: "Flat", house: "House", self_contain: "Self Con",
  room_and_parlour: "Room & Parlour", duplex: "Duplex", storey: "Storey", penthouse: "Penthouse",
};
const LANDLORD_LABELS: Record<string, string> = {
  stays: "Landlord stays in compound",
  "not-stays": "Does not live in compound",
};

interface ListingRow {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  rentPeriod: string;
  propertyType: string;
  categoryDisplay: string;
  condition: string;
  status: ListingStatus;
  approval: ApprovalStatus;
  bedrooms?: number;
  bathrooms?: number;
  sittingRooms?: number;
  balconies?: number;
  rentDueDate?: string | null;
  landlordPresence?: string;
  facilities: string[];
  ownerType: string;
  connectRole?: string;
  totalPackage?: number;
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

  let facilities: string[] = [];
  try { if (l.facilities) facilities = JSON.parse(l.facilities) as string[]; } catch { /* ignore */ }

  const location = [l.address, l.city, l.state].filter(Boolean).join(", ") || "—";
  return {
    id: l.id,
    title: l.title,
    description: l.description ?? "",
    location,
    price,
    rentPeriod: l.rent_period ?? "",
    propertyType: l.property_type ?? "",
    categoryDisplay: PROP_TYPE_LABELS[l.property_type ?? ""] ?? l.property_type ?? "—",
    condition: CONDITION_LABELS[l.category ?? ""] ?? "",
    status,
    approval,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    sittingRooms: l.sitting_rooms,
    balconies: l.balconies,
    rentDueDate: l.rent_due_date,
    landlordPresence: LANDLORD_LABELS[l.landlord_presence ?? ""] ?? l.landlord_presence ?? "",
    facilities,
    ownerType: l.owner_type ?? "user",
    connectRole: l.connect_role ?? undefined,
    totalPackage: l.total_package ? parseFloat(l.total_package) : undefined,
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
                    <td className="px-6 py-3.5 text-[var(--text-secondary)]">{l.categoryDisplay || "—"}</td>
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

      <Modal open={!!detailListing} onClose={() => setDetailListing(null)} maxWidth="max-w-5xl">
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
  const ownerLabel = listing.ownerType === "agent" ? "Agent" : (listing.connectRole ?? "User");

  return (
    <div className="flex gap-5">
      {/* ── LEFT: image carousel ──────────────────────────────────── */}
      <div className="w-[42%] shrink-0 flex flex-col gap-2.5">
        {listing.images.length > 0 ? (
          <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
            <img
              src={listing.images[imgIdx]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {/* Status badge */}
            <div className="absolute top-3 left-3">
              <StatusBadge status={listing.approval === "approved" ? listing.status : listing.approval} />
            </div>
            {/* Counter */}
            {listing.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/50 text-white/90 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {imgIdx + 1} / {listing.images.length}
              </div>
            )}
            {/* Prev / Next */}
            {listing.images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + listing.images.length) % listing.images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % listing.images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            className="rounded-xl bg-[var(--bg-sunken)] border border-[var(--border-color)] flex items-center justify-center"
            style={{ aspectRatio: "4/3" }}
          >
            <Building2 className="w-12 h-12 text-[var(--text-muted)]" />
          </div>
        )}

        {/* Thumbnails */}
        {listing.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {listing.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === imgIdx ? "border-violet-500" : "border-[var(--border-color)]"
                }`}
              >
                <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: details ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Owner chip */}
        <span className="inline-block px-3 py-1 rounded-full bg-[var(--bg-sunken)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] font-medium">
          {ownerLabel}
        </span>

        {/* Title + location */}
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight">{listing.title}</h3>
          <div className="flex items-start gap-1.5 mt-1.5 text-sm text-[var(--text-muted)]">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{listing.location}</span>
          </div>
        </div>

        {/* Price + Total Package */}
        <div className="flex items-end gap-8">
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold mb-0.5">Rent</p>
            <p className="text-2xl font-bold text-violet-400 leading-none">
              {listing.price ? formatNaira(listing.price) : "—"}
              {listing.rentPeriod && (
                <span className="text-sm font-normal text-[var(--text-muted)]">/{listing.rentPeriod}</span>
              )}
            </p>
          </div>
          {listing.totalPackage ? (
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold mb-0.5">Total Package</p>
              <p className="text-xl font-bold text-[var(--text-primary)] leading-none">{formatNaira(listing.totalPackage)}</p>
            </div>
          ) : null}
        </div>

        {/* Property Features */}
        {(listing.bedrooms !== undefined || listing.bathrooms !== undefined ||
          listing.sittingRooms !== undefined || listing.balconies !== undefined) && (
          <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-4">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Property Features</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {listing.bedrooms !== undefined && (
                <FeatureBox icon={Bed} label="Bedrooms" value={listing.bedrooms} />
              )}
              {listing.bathrooms !== undefined && (
                <FeatureBox icon={Bath} label="Bathrooms" value={listing.bathrooms} />
              )}
              {listing.sittingRooms !== undefined && (
                <FeatureBox icon={Sofa} label="Sitting Rooms" value={listing.sittingRooms} />
              )}
              {listing.balconies !== undefined && (
                <FeatureBox icon={Building2} label="Balconies" value={listing.balconies} />
              )}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-4">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Additional Information</h4>
          <div className="divide-y divide-[var(--border-color)]">
            <InfoRow icon={Tag} label="Category" value={listing.categoryDisplay} />
            {listing.condition && <InfoRow icon={Users} label="Condition" value={listing.condition} />}
            {listing.landlordPresence && <InfoRow icon={Home} label="Landlord Presence" value={listing.landlordPresence} />}
            <InfoRow icon={Calendar} label="Rent Due Date" value={listing.rentDueDate ? formatDate(listing.rentDueDate) : "—"} />
          </div>
        </div>

        {/* Video Tour */}
        {listing.videoUrl && (
          <VideoEmbed url={listing.videoUrl} />
        )}

        {/* Facilities & Environment */}
        {listing.facilities.length > 0 && (
          <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-4">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Facilities & Environment</h4>
            <div className="flex flex-wrap gap-2">
              {listing.facilities.map((f, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {listing.description && (
          <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-4">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Description</h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* Posted By */}
        <div className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-4">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Posted By</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={listing.agentName} color={listing.agentAvatarColor} size={40} />
              <div>
                <div className="font-semibold text-[var(--text-primary)]">{listing.agentName}</div>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[var(--bg-raised)] border border-[var(--border-color)] text-[10px] text-[var(--text-muted)] capitalize">
                  {ownerLabel}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onMessage}
                className="p-2 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Message"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={onMail}
                className="p-2 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Approve / Reject */}
        {listing.approval === "pending" && (
          <div className="flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 py-3.5 rounded-xl bg-red-950/60 border border-red-900/40 text-red-400 font-semibold flex items-center justify-center gap-2 hover:bg-red-900/40 transition-colors"
            >
              <X className="w-4 h-4" /> Reject
            </button>
            <button
              onClick={onApprove}
              className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
            >
              <CheckCheck className="w-4 h-4" /> Approve
            </button>
          </div>
        )}

        {/* Message Owner */}
        <button
          onClick={onMessage}
          className="w-full py-3 rounded-xl bg-violet-600/10 border border-violet-600/20 text-violet-400 font-medium flex items-center justify-center gap-2 hover:bg-violet-600/20 transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> Message Owner
        </button>

        <button
          onClick={onDelete}
          className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400/80 text-sm font-medium hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Delete Listing
        </button>
      </div>
    </div>
  );
}

function FeatureBox({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)]">
      <Icon className="w-5 h-5 text-[var(--text-muted)]" />
      <span className="text-base font-bold text-[var(--text-primary)]">{value}</span>
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-1 last:pb-0">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <span className="text-sm text-[var(--text-primary)] font-medium text-right max-w-[55%]">{value}</span>
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
