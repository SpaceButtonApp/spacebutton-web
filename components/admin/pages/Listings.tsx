'use client'
import React, { useMemo, useState } from "react";
import { Building2, CheckCircle2, Clock, XCircle, List, LayoutGrid, Eye, Trash2, MessageCircle, Mail, MapPin, Bed, Bath, Car, CheckCheck, X } from "lucide-react";
import { useAdminStore, getUserById } from "@/lib/admin-store";
import { StatCard } from "@/components/admin/shared/StatCard";
import { SearchInput, ExportButton, ActionMenu, FilterPill, Avatar, EmptyState } from "@/components/admin/shared/Atoms";
import { StatusBadge } from "@/components/admin/shared/Badge";
import { Modal, ConfirmModal } from "@/components/admin/shared/Modal";
import { formatDate, exportToExcel, formatNaira, truncateId } from "@/lib/utils/admin-format";
import type { Listing, AppUser } from "@/lib/types/admin";

type ApprovalFilter = "all" | "pending" | "approved" | "rejected";
type ViewMode = "table" | "grid";

interface ListingsPageProps {
  onMessageUser?: (user: AppUser) => void;
  onMailUser?: (user: AppUser) => void;
  focusListingId?: string | null;
  onFocusConsumed?: () => void;
}

export function ListingsPage({ onMessageUser, onMailUser, focusListingId, onFocusConsumed }: ListingsPageProps) {
  const listings = useAdminStore((s) => s.listings);
  const users = useAdminStore((s) => s.users);
  const approveListing = useAdminStore((s) => s.approveListing);
  const rejectListing = useAdminStore((s) => s.rejectListing);
  const deleteListing = useAdminStore((s) => s.deleteListing);

  const [filter, setFilter] = useState<ApprovalFilter>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [detailListing, setDetailListing] = useState<Listing | null>(
    focusListingId ? listings.find((l) => l.id === focusListingId) ?? null : null
  );
  const [confirmDel, setConfirmDel] = useState<Listing | null>(null);

  // If a focusListingId was provided open its detail; then clear it.
  React.useEffect(() => {
    if (focusListingId) {
      const l = listings.find((li) => li.id === focusListingId);
      if (l) setDetailListing(l);
      onFocusConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusListingId]);

  const totalActive = listings.filter((l) => l.status === "active").length;
  const pending = listings.filter((l) => l.approval === "pending").length;
  const approved = listings.filter((l) => l.approval === "approved").length;
  const rejected = listings.filter((l) => l.approval === "rejected").length;

  const filtered = useMemo(() => {
    let list = listings;
    if (filter === "pending") list = list.filter((l) => l.approval === "pending");
    else if (filter === "approved") list = list.filter((l) => l.approval === "approved");
    else if (filter === "rejected") list = list.filter((l) => l.approval === "rejected");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l) => l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }, [listings, filter, search]);

  function handleExport() {
    exportToExcel(
      "listings",
      filtered.map((l) => {
        const owner = getUserById(users, l.ownerId);
        return {
          Title: l.title, Location: l.location, Price: l.price, Type: l.type,
          Status: l.status, Approval: l.approval, Owner: owner?.name ?? "—", Listed: formatDate(l.createdDate),
        };
      })
    );
  }

  function openDetail(l: Listing) { setDetailListing(l); }

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Listings" value={totalActive} icon={Building2} iconBg="bg-blue-500/15" iconColor="text-blue-400" />
        <StatCard label="Pending Approval" value={pending} icon={Clock} iconBg="bg-amber-500/15" iconColor="text-amber-400" valueColor="text-amber-400" />
        <StatCard label="Approved" value={approved} icon={CheckCircle2} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" valueColor="text-emerald-400" />
        <StatCard label="Rejected" value={rejected} icon={XCircle} iconBg="bg-red-500/15" iconColor="text-red-400" valueColor="text-red-400" />
      </div>

      <div className="flex gap-2 mb-4">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>All</FilterPill>
        <FilterPill active={filter === "pending"} onClick={() => setFilter("pending")}>Pending</FilterPill>
        <FilterPill active={filter === "approved"} onClick={() => setFilter("approved")}>Approved</FilterPill>
        <FilterPill active={filter === "rejected"} onClick={() => setFilter("rejected")}>Rejected</FilterPill>
      </div>

      <div className="flex gap-3 mb-5 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title or location..." />
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
        <ExportButton onClick={handleExport} />
      </div>

      {viewMode === "table" ? (
        <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                  <th className="px-6 py-4 font-medium">Listing</th>
                  <th className="px-6 py-4 font-medium">Owner</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Approval</th>
                  <th className="px-6 py-4 font-medium">Listed</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const owner = getUserById(users, l.ownerId);
                  return (
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
                        {owner ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={owner.name} color={owner.avatarColor} size={28} />
                            <span className="text-[var(--text-secondary)]">{owner.name}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-[var(--text-secondary)] capitalize">{l.type}</td>
                      <td className="px-6 py-3.5 text-[var(--text-primary)]">{formatNaira(l.price)}</td>
                      <td className="px-6 py-3.5"><StatusBadge status={l.status} /></td>
                      <td className="px-6 py-3.5"><StatusBadge status={l.approval} /></td>
                      <td className="px-6 py-3.5 text-[var(--text-secondary)]">{formatDate(l.createdDate)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <ActionMenu
                          items={[
                            { label: "View details", icon: <Eye className="w-4 h-4" />, onClick: () => openDetail(l) },
                            owner ? { label: "Message owner", icon: <MessageCircle className="w-4 h-4" />, onClick: () => onMessageUser?.(owner) } : null,
                            owner ? { label: "Email owner", icon: <Mail className="w-4 h-4" />, onClick: () => onMailUser?.(owner) } : null,
                            l.approval === "pending" ? { label: "Approve", icon: <CheckCheck className="w-4 h-4" />, onClick: () => approveListing(l.id) } : null,
                            l.approval === "pending" ? { label: "Reject", icon: <X className="w-4 h-4" />, onClick: () => rejectListing(l.id, ""), danger: true } : null,
                            { label: "Delete", icon: <Trash2 className="w-4 h-4" />, onClick: () => setConfirmDel(l), danger: true },
                          ].filter(Boolean) as Parameters<typeof ActionMenu>[0]["items"]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <EmptyState label="No listings found." />}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} onView={() => openDetail(l)} />
          ))}
          {filtered.length === 0 && <div className="col-span-3"><EmptyState label="No listings found." /></div>}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!detailListing} onClose={() => setDetailListing(null)} title="Listing Details" maxWidth="max-w-2xl">
        {detailListing && (
          <ListingDetail
            listing={detailListing}
            owner={getUserById(users, detailListing.ownerId)}
            onApprove={() => { approveListing(detailListing.id); setDetailListing(null); }}
            onReject={() => { rejectListing(detailListing.id, ""); setDetailListing(null); }}
            onDelete={() => { setDetailListing(null); setConfirmDel(detailListing); }}
            onMessage={(u) => { onMessageUser?.(u); setDetailListing(null); }}
            onMail={(u) => { onMailUser?.(u); setDetailListing(null); }}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!confirmDel}
        title="Delete listing?"
        description={`"${confirmDel?.title}" will be permanently removed from the platform.`}
        confirmLabel="Delete"
        icon={<Trash2 className="w-6 h-6 text-red-400" />}
        onConfirm={() => { if (confirmDel) deleteListing(confirmDel.id); setConfirmDel(null); }}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}

function ListingCard({ listing, onView }: { listing: Listing; onView: () => void }) {
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
          <div className="text-violet-400 font-bold text-sm">{formatNaira(listing.price)}<span className="text-xs text-[var(--text-muted)] font-normal">/mo</span></div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            {listing.bedrooms && <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" />{listing.bedrooms}</span>}
            {listing.bathrooms && <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" />{listing.bathrooms}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingDetail({
  listing, owner, onApprove, onReject, onDelete, onMessage, onMail,
}: {
  listing: Listing;
  owner?: AppUser;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onMessage: (u: AppUser) => void;
  onMail: (u: AppUser) => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  return (
    <div>
      {listing.images.length > 0 && (
        <div className="relative mb-5">
          <img src={listing.images[imgIdx]} alt={listing.title} className="w-full h-52 object-cover rounded-xl border border-[var(--border-color)]" />
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
        </div>
      )}

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

      <div className="text-2xl font-bold text-violet-400 mb-4">{formatNaira(listing.price)}<span className="text-sm text-[var(--text-muted)] font-normal">/mo</span></div>

      {listing.description && (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{listing.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {listing.bedrooms !== undefined && <FeatureBox icon={Bed} label={`${listing.bedrooms} Bed${listing.bedrooms !== 1 ? "s" : ""}`} />}
        {listing.bathrooms !== undefined && <FeatureBox icon={Bath} label={`${listing.bathrooms} Bath${listing.bathrooms !== 1 ? "s" : ""}`} />}
        {listing.balconies > 0 && <FeatureBox icon={Car} label={`${listing.balconies} Balcon${listing.balconies !== 1 ? "ies" : "y"}`} />}
      </div>

      {owner && (
        <div className="flex items-center justify-between bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl p-3.5 mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={owner.name} color={owner.avatarColor} size={36} />
            <div>
              <div className="text-[var(--text-primary)] font-medium text-sm">{owner.name}</div>
              <div className="text-xs text-[var(--text-muted)] capitalize">{owner.role}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onMessage(owner)} className="p-2 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Message">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button onClick={() => onMail(owner)} className="p-2 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Email">
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {listing.approval === "pending" && (
        <div className="flex gap-3 mb-3">
          <button onClick={onReject} className="flex-1 py-2.5 rounded-xl bg-red-500/15 text-red-400 font-medium hover:bg-red-500/25 transition-colors flex items-center justify-center gap-2">
            <X className="w-4 h-4" /> Reject
          </button>
          <button onClick={onApprove} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
            <CheckCheck className="w-4 h-4" /> Approve
          </button>
        </div>
      )}

      <button onClick={onDelete} className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400/80 text-sm font-medium hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center justify-center gap-2">
        <Trash2 className="w-4 h-4" /> Delete Listing
      </button>
    </div>
  );
}

function FeatureBox({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
      <Icon className="w-3.5 h-3.5 text-violet-400" />{label}
    </div>
  );
}
