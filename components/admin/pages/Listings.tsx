'use client'
import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Building2, CheckCircle2, Clock, XCircle, List, LayoutGrid, Eye, Trash2,
  MessageCircle, Mail, MapPin, Bed, Bath, CheckCheck, X, RefreshCw, AlertCircle,
  Video, ExternalLink, ChevronLeft, ChevronRight, Sofa, Tag, Users, Home, Calendar,
  ArrowLeft,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { AdminListing, AdminAgent } from "@/lib/api/admin";
import { StatCard } from "@/components/admin/shared/StatCard";
import { SearchInput, ExportButton, ActionMenu, FilterPill, Avatar, EmptyState } from "@/components/admin/shared/Atoms";
import { StatusBadge } from "@/components/admin/shared/Badge";
import { ConfirmModal, ReasonModal, ImageLightbox } from "@/components/admin/shared/Modal";
import { formatDate, exportToExcel, formatNaira } from "@/lib/utils/admin-format";
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
    ? [agent.first_name, agent.last_name].filter(Boolean).join(" ") || agent.agency_name || "Unknown"
    : "Unknown";
  const price = parseFloat(l.price ?? "0") || 0;
  const statusRaw = (l.status ?? "").toLowerCase();
  let approval: ApprovalStatus;
  let status: ListingStatus;
  if (statusRaw === "pending") { approval = "pending"; status = "closed"; }
  else if (statusRaw === "rejected") { approval = "rejected"; status = "closed"; }
  else if (statusRaw === "active") { approval = "approved"; status = "active"; }
  else if (statusRaw === "closed") { approval = "approved"; status = "closed"; }
  else { approval = "pending"; status = "closed"; }

  let facilities: string[] = [];
  try { if (l.facilities) facilities = JSON.parse(l.facilities) as string[]; } catch { /* ignore */ }

  return {
    id: l.id,
    title: l.title,
    description: l.description ?? "",
    location: [l.address, l.city, l.state].filter(Boolean).join(", ") || "—",
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
    images: (l.images ?? [])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((img) => img.image_url)
      .filter(Boolean),
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
    id: row.agentId, userId: row.agentId, name: row.agentName, email: row.agentEmail,
    phone: "", role: "agent" as UserRole, status: "active", joinDate: "",
    avatarColor: row.agentAvatarColor, referralCode: "", referralsMade: 0, connects: 0,
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
  const [ownerTab, setOwnerTab] = useState<"all" | "agents" | "users">("all");
  const [filter, setFilter] = useState<ApprovalFilter>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [detailListing, setDetailListing] = useState<ListingRow | null>(null);
  const [confirmDel, setConfirmDel] = useState<ListingRow | null>(null);
  const [rejectingListing, setRejectingListing] = useState<ListingRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [firstPage, agentsResult] = await Promise.allSettled([
        adminApi.getListings(1, 100),
        adminApi.getAgents(1, 100),
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
          agentMap.set(a.id, a); agentMap.set(a.user_id, a);
        }
      }
      setListings(all.map((l) => mapListing(l, agentMap)));
    } catch (e) {
      setError(e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to load listings");
    } finally { setLoading(false); }
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

  async function handleApprove(id: string) {
    try {
      await adminApi.approveListing(id);
      const upd = (l: ListingRow) => l.id === id ? { ...l, approval: "approved" as const, status: "active" as const } : l;
      setListings((p) => p.map(upd));
      setDetailListing((p) => p ? upd(p) : p);
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to approve"); }
  }

  async function handleReject(id: string, reason: string) {
    try {
      await adminApi.rejectListing(id, reason);
      const upd = (l: ListingRow) => l.id === id ? { ...l, approval: "rejected" as const, status: "closed" as const } : l;
      setListings((p) => p.map(upd));
      setDetailListing((p) => p ? upd(p) : p);
      setRejectingListing(null);
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to reject"); }
  }

  async function handleDelete(id: string) {
    try {
      await adminApi.deleteListing(id);
      setListings((p) => p.filter((l) => l.id !== id));
      setDetailListing((p) => p?.id === id ? null : p);
      setConfirmDel(null);
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to delete"); }
  }

  // ── filtered list (must be before any early returns — Rules of Hooks) ──────
  const filtered = useMemo(() => {
    let list = listings;
    if (ownerTab === "agents") list = list.filter((l) => l.ownerType === "agent");
    else if (ownerTab === "users") list = list.filter((l) => l.ownerType !== "agent");
    if (filter === "pending") list = list.filter((l) => l.approval === "pending");
    else if (filter === "approved") list = list.filter((l) => l.approval === "approved");
    else if (filter === "rejected") list = list.filter((l) => l.approval === "rejected");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l) =>
        l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.agentName.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }, [listings, ownerTab, filter, search]);

  // ── shared modals (render in both views) ──────────────────────────────────
  const sharedModals = (
    <>
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
    </>
  );

  // ── full-page detail view ────────────────────────────────────────────────
  if (detailListing) {
    return (
      <>
        <ListingDetailPage
          listing={detailListing}
          onBack={() => setDetailListing(null)}
          onApprove={() => handleApprove(detailListing.id)}
          onReject={() => setRejectingListing(detailListing)}
          onDelete={() => setConfirmDel(detailListing)}
          onMessage={() => onMessageUser?.(toAppUser(detailListing))}
          onMail={() => onMailUser?.(toAppUser(detailListing))}
        />
        {sharedModals}
      </>
    );
  }

  // ── loading / error ───────────────────────────────────────────────────────
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
        <button onClick={load} className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors">Retry</button>
      </div>
    );
  }

  // ── listings table / grid ─────────────────────────────────────────────────
  const tabBase = ownerTab === "agents" ? listings.filter((l) => l.ownerType === "agent")
    : ownerTab === "users" ? listings.filter((l) => l.ownerType !== "agent")
    : listings;
  const totalActive = tabBase.filter((l) => l.status === "active").length;
  const pendingCount = tabBase.filter((l) => l.approval === "pending").length;
  const approvedCount = tabBase.filter((l) => l.approval === "approved").length;
  const rejectedCount = tabBase.filter((l) => l.approval === "rejected").length;

  const agentCount = listings.filter((l) => l.ownerType === "agent").length;
  const userCount = listings.filter((l) => l.ownerType !== "agent").length;

  function handleExport() {
    exportToExcel("listings", filtered.map((l) => ({
      Title: l.title, Location: l.location, Price: l.price,
      PropertyType: l.propertyType, Status: l.status, Approval: l.approval,
      PostedBy: l.agentName, Listed: formatDate(l.createdDate),
    })));
  }

  return (
    <>
      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Active Listings" value={totalActive} icon={Building2} iconBg="bg-blue-500/15" iconColor="text-blue-400" />
          <StatCard label="Pending Approval" value={pendingCount} icon={Clock} iconBg="bg-amber-500/15" iconColor="text-amber-400" valueColor="text-amber-400" />
          <StatCard label="Approved" value={approvedCount} icon={CheckCircle2} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" valueColor="text-emerald-400" />
          <StatCard label="Rejected" value={rejectedCount} icon={XCircle} iconBg="bg-red-500/15" iconColor="text-red-400" valueColor="text-red-400" />
        </div>

        <div className="flex gap-1 border-b border-[var(--border-color)] mb-5">
          {(["all", "agents", "users"] as const).map((tab) => {
            const label = tab === "all" ? `All (${listings.length})` : tab === "agents" ? `Agent Listings (${agentCount})` : `User Listings (${userCount})`;
            return (
              <button
                key={tab}
                onClick={() => { setOwnerTab(tab); setFilter("all"); }}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  ownerTab === tab
                    ? "border-violet-500 text-violet-400"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {label}
              </button>
            );
          })}
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
            <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition-colors ${viewMode === "table" ? "bg-violet-600 text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`} aria-label="Table view"><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-violet-600 text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`} aria-label="Grid view"><LayoutGrid className="w-4 h-4" /></button>
          </div>
          <button onClick={load} className="p-3 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
          <ExportButton onClick={handleExport} />
        </div>

        {viewMode === "table" ? (
          <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                    <th className="px-6 py-4 font-medium">Listing</th>
                    <th className="px-6 py-4 font-medium">Posted By</th>
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
                            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1"><MapPin className="w-3 h-3" />{l.location}</div>
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
                        <ActionMenu items={[
                          { label: "View full details", icon: <Eye className="w-4 h-4" />, onClick: () => setDetailListing(l) },
                          { label: "Message poster", icon: <MessageCircle className="w-4 h-4" />, onClick: () => onMessageUser?.(toAppUser(l)) },
                          { label: "Email poster", icon: <Mail className="w-4 h-4" />, onClick: () => onMailUser?.(toAppUser(l)) },
                          l.approval === "pending" ? { label: "Approve", icon: <CheckCheck className="w-4 h-4" />, onClick: () => handleApprove(l.id) } : null,
                          l.approval === "pending" ? { label: "Reject", icon: <X className="w-4 h-4" />, onClick: () => setRejectingListing(l), danger: true } : null,
                          { label: "Delete", icon: <Trash2 className="w-4 h-4" />, onClick: () => setConfirmDel(l), danger: true },
                        ].filter(Boolean) as Parameters<typeof ActionMenu>[0]["items"]} />
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
      </div>
      {sharedModals}
    </>
  );
}

// ─── Grid card ───────────────────────────────────────────────────────────────

function ListingCard({ listing, onView }: { listing: ListingRow; onView: () => void }) {
  return (
    <div onClick={onView} className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden cursor-pointer hover:border-violet-500/30 transition-colors">
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
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mb-3"><MapPin className="w-3 h-3" />{listing.location}</div>
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

// ─── Full-page detail view ───────────────────────────────────────────────────

function ListingDetailPage({
  listing, onBack, onApprove, onReject, onDelete, onMessage, onMail,
}: {
  listing: ListingRow;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onMessage: () => void;
  onMail: () => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  // full data starts from what the list gave us; enriched below
  const [data, setData] = useState<ListingRow>(listing);
  const [fetching, setFetching] = useState(true);

  // keep approval/status in sync when parent updates them (approve/reject)
  useEffect(() => {
    setData((prev) => ({ ...prev, approval: listing.approval, status: listing.status }));
  }, [listing.approval, listing.status]);

  // fetch the full listing + poster details on mount
  useEffect(() => {
    let cancelled = false;
    setFetching(true);

    Promise.allSettled([
      adminApi.getListing(listing.id),
      adminApi.getUser(listing.agentId),
    ]).then(([listingRes, userRes]) => {
      if (cancelled) return;
      setData((prev) => {
        let updated = { ...prev };

        if (listingRes.status === "fulfilled") {
          const l = listingRes.value;
          let facilities: string[] = [];
          try { if (l.facilities) facilities = JSON.parse(l.facilities) as string[]; } catch { /* ignore */ }
          const freshImages = (l.images ?? [])
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((img) => img.image_url)
            .filter(Boolean);
          updated = {
            ...updated,
            images: freshImages.length > 0 ? freshImages : updated.images,
            videoUrl: l.video_tour_url ?? updated.videoUrl,
            bedrooms: l.bedrooms ?? updated.bedrooms,
            bathrooms: l.bathrooms ?? updated.bathrooms,
            sittingRooms: l.sitting_rooms ?? updated.sittingRooms,
            balconies: l.balconies ?? updated.balconies,
            rentDueDate: l.rent_due_date ?? updated.rentDueDate,
            landlordPresence: l.landlord_presence
              ? (LANDLORD_LABELS[l.landlord_presence] ?? l.landlord_presence)
              : updated.landlordPresence,
            facilities: facilities.length > 0 ? facilities : updated.facilities,
            condition: l.category ? (CONDITION_LABELS[l.category] ?? updated.condition) : updated.condition,
            totalPackage: l.total_package ? parseFloat(String(l.total_package)) : updated.totalPackage,
            categoryDisplay: l.property_type
              ? (PROP_TYPE_LABELS[l.property_type] ?? l.property_type)
              : updated.categoryDisplay,
            description: l.description ?? updated.description,
          };
        }

        if (userRes.status === "fulfilled") {
          const u = userRes.value;
          const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
          if (name) updated = { ...updated, agentName: name, agentEmail: u.email ?? updated.agentEmail };
        }

        return updated;
      });
    }).finally(() => { if (!cancelled) setFetching(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.id, listing.agentId]);

  const ownerLabel = data.ownerType === "agent" ? "Agent" : (data.connectRole ?? "User");

  return (
    <div>
      {/* ── Back bar ── */}
      <div className="px-6 py-3.5 border-b border-[var(--border-color)] flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </button>
        {fetching && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <div className="w-3.5 h-3.5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            Loading full details…
          </div>
        )}
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex items-start">

        {/* LEFT: images (sticky) */}
        <div className="sticky top-0 self-start w-[46%] shrink-0 p-6 flex flex-col gap-3">

          {/* Main image */}
          <div
            className="relative rounded-2xl overflow-hidden bg-black cursor-zoom-in group"
            style={{ aspectRatio: "4/3" }}
            onClick={() => data.images[imgIdx] && setLightbox(data.images[imgIdx])}
          >
            {data.images[imgIdx] ? (
              <img
                src={data.images[imgIdx]}
                alt={data.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[var(--bg-sunken)]">
                {fetching ? (
                  <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                ) : (
                  <Building2 className="w-16 h-16 text-[var(--text-muted)]" />
                )}
              </div>
            )}

            {/* Status badge */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              <StatusBadge status={data.approval} />
              {data.approval === "approved" && <StatusBadge status={data.status} />}
            </div>

            {/* Counter */}
            {data.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                {imgIdx + 1} / {data.images.length}
              </div>
            )}

            {/* Zoom hint */}
            {data.images[imgIdx] && (
              <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </div>
            )}

            {/* Prev/Next arrows */}
            {data.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + data.images.length) % data.images.length); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % data.images.length); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {data.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {data.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    i === imgIdx ? "border-violet-500 opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Video */}
          {data.videoUrl && (
            <div className="mt-1">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-2">Video Tour</p>
              <VideoEmbed url={data.videoUrl} />
            </div>
          )}
        </div>

        {/* RIGHT: all details (scrolls with the page) */}
        <div className="flex-1 min-w-0 border-l border-[var(--border-color)] p-6 space-y-5">

          {/* Owner chip */}
          <span className="inline-block px-3 py-1 rounded-full bg-[var(--bg-sunken)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] font-medium">
            {ownerLabel}
          </span>

          {/* Title + location */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] leading-tight">{data.title}</h2>
            <div className="flex items-start gap-1.5 mt-2 text-sm text-[var(--text-muted)]">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{data.location}</span>
            </div>
          </div>

          {/* Rent + Total Package */}
          <div className="flex items-end gap-10 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-1">Rent</p>
              <p className="text-3xl font-bold text-violet-400 leading-none">
                {data.price ? formatNaira(data.price) : "—"}
                {data.rentPeriod && (
                  <span className="text-base font-normal text-[var(--text-muted)] ml-0.5">/{data.rentPeriod}</span>
                )}
              </p>
            </div>
            {data.totalPackage ? (
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-1">Total Package</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] leading-none">{formatNaira(data.totalPackage)}</p>
              </div>
            ) : null}
          </div>

          {/* Property Features */}
          {(data.bedrooms !== undefined || data.bathrooms !== undefined ||
            data.sittingRooms !== undefined || data.balconies !== undefined) && (
            <section className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-2xl p-4">
              <h4 className="font-semibold text-[var(--text-primary)] mb-3">Property Features</h4>
              <div className="grid grid-cols-2 gap-3">
                {data.bedrooms !== undefined && <FeatureBox icon={Bed} label="Bedrooms" value={data.bedrooms} />}
                {data.bathrooms !== undefined && <FeatureBox icon={Bath} label="Bathrooms" value={data.bathrooms} />}
                {data.sittingRooms !== undefined && <FeatureBox icon={Sofa} label="Sitting Rooms" value={data.sittingRooms} />}
                {data.balconies !== undefined && <FeatureBox icon={Building2} label="Balconies" value={data.balconies} />}
              </div>
            </section>
          )}

          {/* Additional Information */}
          <section className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-2xl p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">Additional Information</h4>
            <div className="divide-y divide-[var(--border-color)]">
              <InfoRow icon={Tag} label="Category" value={data.categoryDisplay} />
              {data.condition && <InfoRow icon={Users} label="Condition" value={data.condition} />}
              {data.landlordPresence && <InfoRow icon={Home} label="Landlord Presence" value={data.landlordPresence} />}
              <InfoRow icon={Calendar} label="Rent Due Date" value={data.rentDueDate ? formatDate(data.rentDueDate) : "—"} />
            </div>
          </section>

          {/* Facilities & Environment */}
          {data.facilities.length > 0 && (
            <section className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-2xl p-4">
              <h4 className="font-semibold text-[var(--text-primary)] mb-3">Facilities & Environment</h4>
              <div className="flex flex-wrap gap-2">
                {data.facilities.map((f, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400">{f}</span>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          {data.description && (
            <section className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-2xl p-4">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2">Description</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{data.description}</p>
            </section>
          )}

          {/* Posted By */}
          <section className="bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-2xl p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-3">Posted By</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={data.agentName} color={data.agentAvatarColor} size={44} />
                <div>
                  <div className="font-semibold text-[var(--text-primary)] text-base">{data.agentName}</div>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-[var(--bg-raised)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                    {ownerLabel}
                  </span>
                </div>
              </div>
              <button
                onClick={onMail}
                className="p-2.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Approve / Reject */}
          {data.approval === "pending" && (
            <div className="flex gap-3">
              <button
                onClick={onReject}
                className="flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors"
                style={{ background: "rgba(60,10,10,0.7)", border: "1px solid rgba(153,27,27,0.4)", color: "#f87171" }}
              >
                <X className="w-5 h-5" /> Reject
              </button>
              <button
                onClick={onApprove}
                className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
              >
                <CheckCheck className="w-5 h-5" /> Approve
              </button>
            </div>
          )}

          {/* Message Owner */}
          <button
            onClick={onMessage}
            className="w-full py-3.5 rounded-2xl bg-[var(--bg-sunken)] border border-[var(--border-color)] text-[var(--text-secondary)] font-medium flex items-center justify-center gap-2 hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Message Owner
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="w-full py-3 rounded-2xl bg-red-500/8 text-red-400/70 text-sm font-medium hover:bg-red-500/15 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Listing
          </button>
        </div>
      </div>

      {/* Fullscreen image lightbox */}
      <ImageLightbox
        src={lightbox ?? ""}
        alt={data.title}
        open={!!lightbox}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FeatureBox({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)]">
      <Icon className="w-5 h-5 text-[var(--text-muted)]" />
      <span className="text-xl font-bold text-[var(--text-primary)]">{value}</span>
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-1.5 last:pb-1.5">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Icon className="w-4 h-4 shrink-0" />
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
          className="w-full h-52"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
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
        className="w-full h-52 rounded-xl border border-[var(--border-color)] bg-black"
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
