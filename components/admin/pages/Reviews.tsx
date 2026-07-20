'use client'
import React, { useMemo, useState } from "react";
import { Star, Flag, Eye, Building2 } from "lucide-react";
import { useAdminStore, getUserById } from "@/lib/admin-store";
import { StatCard } from "@/components/admin/shared/StatCard";
import { SearchInput, Avatar, EmptyState } from "@/components/admin/shared/Atoms";
import { Modal, ConfirmModal } from "@/components/admin/shared/Modal";
import { formatRelativeTime } from "@/lib/utils/admin-format";
import type { Review } from "@/lib/types/admin";

export function ReviewsPage() {
  const reviews = useAdminStore((s) => s.reviews);
  const users = useAdminStore((s) => s.users);
  const flagReview = useAdminStore((s) => s.flagReview);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Review | null>(null);
  const [flagging, setFlagging] = useState<Review | null>(null);

  const total = reviews.length;
  const avgRating = total ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : "0";
  const fiveStar = reviews.filter((r) => r.rating === 5).length;
  const lowReviews = reviews.filter((r) => r.rating <= 2).length;

  const filtered = useMemo(() => {
    let list = reviews;
    if (ratingFilter !== "all") {
      const [min, max] = ratingFilter.split("-").map(Number);
      list = list.filter((r) => r.rating >= min && r.rating <= max);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => {
        const reviewer = getUserById(users, r.reviewerId);
        const reviewee = getUserById(users, r.revieweeId);
        return reviewer?.name.toLowerCase().includes(q) || reviewee?.name.toLowerCase().includes(q);
      });
    }
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reviews, ratingFilter, search, users]);

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Reviews" value={total} icon={Star} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
        <StatCard label="Average Rating" value={`${avgRating} ★`} icon={Star} iconBg="bg-amber-500/15" iconColor="text-amber-400" />
        <StatCard label="5 Star Reviews" value={fiveStar} icon={Star} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" valueColor="text-emerald-400" />
        <StatCard label="Low Reviews (1-2)" value={lowReviews} icon={Flag} iconBg="bg-red-500/15" iconColor="text-red-400" valueColor="text-red-400" />
      </div>

      <div className="flex gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search reviews..." />
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none"
        >
          <option value="all">All Ratings</option>
          <option value="4-5">4-5 Stars</option>
          <option value="3-3">3 Stars</option>
          <option value="1-2">1-2 Stars</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((r) => {
          const reviewer = getUserById(users, r.reviewerId);
          const reviewee = getUserById(users, r.revieweeId);
          if (!reviewer || !reviewee) return null;
          return (
            <div key={r.id} className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Avatar name={reviewer.name} color={reviewer.avatarColor} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-[var(--text-primary)] font-semibold">{reviewer.name}</span>
                    <span className="text-[var(--text-muted)] text-sm">reviewed</span>
                    <span className="text-violet-400 font-semibold">{reviewee.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRow rating={r.rating} />
                    <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(r.date)}</span>
                    {r.status === "flagged" && (
                      <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                        <Flag className="w-3 h-3" /> Flagged
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-tertiary)]">{r.comment}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => setSelected(r)} className="p-2 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" title="View full review">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => setFlagging(r)} className="p-2 rounded-lg bg-[var(--bg-subtle)] text-red-400 hover:text-red-300 transition-colors" title="Flag inappropriate content">
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <EmptyState label="No reviews match your search." />}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Review Details" maxWidth="max-w-lg">
        {selected && (() => {
          const reviewer = getUserById(users, selected.reviewerId);
          const reviewee = getUserById(users, selected.revieweeId);
          return (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={reviewer?.name ?? "?"} color={reviewer?.avatarColor} size={44} />
                <div>
                  <div className="text-[var(--text-primary)] font-semibold">{reviewer?.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">reviewed {reviewee?.name}</div>
                </div>
              </div>
              <StarRow rating={selected.rating} />
              <p className="text-sm text-[var(--text-tertiary)] mt-3 leading-relaxed">{selected.comment}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Building2 className="w-3.5 h-3.5" /> View property listing
              </div>
            </div>
          );
        })()}
      </Modal>

      <ConfirmModal
        open={!!flagging}
        title="Flag this review?"
        description="This review will be marked as flagged for inappropriate content and hidden from public view."
        confirmLabel="Flag Review"
        icon={<Flag className="w-6 h-6 text-red-400" />}
        onConfirm={() => { if (flagging) flagReview(flagging.id); setFlagging(null); }}
        onCancel={() => setFlagging(null)}
      />
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-4 h-4 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
      ))}
    </div>
  );
}
