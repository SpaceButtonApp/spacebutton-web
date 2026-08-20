'use client'
import { useCallback, useEffect, useState } from "react";
import { Star, AlertCircle, MessageSquareOff, ShieldCheck, ChevronDown } from "lucide-react";
import { supportApi } from "@/lib/api/support";
import type { AdminReview, AdminReviewStats } from "@/lib/api/admin";
import { StatCard } from "@/components/admin/shared/StatCard";
import { Avatar, EmptyState } from "@/components/admin/shared/Atoms";
import { formatDate } from "@/lib/utils/admin-format";

type RatingFilter = 0 | 1 | 2 | 3 | 4 | 5;

const AVATAR_COLORS = ["#7c3aed", "#a855f7", "#8b5cf6", "#6366f1", "#c026d3", "#9333ea"];
function avatarColor(id: string) {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400 fill-amber-400" : "text-[var(--text-muted)]"}`}
        />
      ))}
    </div>
  );
}

const RATING_FILTERS: { key: RatingFilter; label: string }[] = [
  { key: 0, label: "All Ratings" },
  { key: 5, label: "5 Stars" },
  { key: 4, label: "4 Stars" },
  { key: 3, label: "3 Stars" },
  { key: 2, label: "2 Stars" },
  { key: 1, label: "1 Star" },
];

const PAGE_SIZE = 20;

export default function ReviewsView() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [stats, setStats] = useState<AdminReviewStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>(0);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const load = useCallback(async (targetPage: number, rating: RatingFilter, append: boolean) => {
    if (append) setLoadingMore(true); else setLoading(true);
    setError(null);
    try {
      const res = await supportApi.getReviews(targetPage, PAGE_SIZE, rating || undefined);
      setReviews((prev) => (append ? [...prev, ...res.reviews] : res.reviews));
      setStats(res.stats);
      setTotal(res.total);
      setPage(targetPage);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load reviews");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load(1, ratingFilter, false); }, [load, ratingFilter]);

  return (
    <div className="admin-root dark" style={{ height: 'auto', overflow: 'visible' }}>
      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Reviews" value={stats?.total ?? 0} icon={MessageSquareOff} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
          <StatCard label="Average Rating" value={stats && stats.total > 0 ? stats.average_rating.toFixed(1) : "—"} icon={Star} iconBg="bg-amber-500/15" iconColor="text-amber-400" valueColor="text-amber-400" />
          <StatCard label="5 Star Reviews" value={stats?.five_star ?? 0} icon={Star} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
          <StatCard label="Low Reviews (1-2)" value={stats?.low_star ?? 0} icon={Star} iconBg="bg-red-500/15" iconColor="text-red-400" />
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="flex gap-3 mb-5 items-center justify-end">
          <div className="relative shrink-0">
            <button
              onClick={() => setShowFilterDropdown((v) => !v)}
              className="h-11 px-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm flex items-center gap-2 hover:text-[var(--text-primary)] transition-colors"
            >
              {RATING_FILTERS.find((f) => f.key === ratingFilter)?.label}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} />
            </button>
            {showFilterDropdown && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-[var(--bg-modal)] border border-[var(--border-strong)] rounded-xl shadow-2xl py-1.5 z-20">
                {RATING_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => { setRatingFilter(f.key); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2 text-sm hover:bg-[var(--bg-hover)] transition-colors ${ratingFilter === f.key ? "text-violet-400" : "text-[var(--text-secondary)]"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                  <th className="px-6 py-4 font-medium">Agent</th>
                  <th className="px-6 py-4 font-medium">Reviewer</th>
                  <th className="px-6 py-4 font-medium">Rating</th>
                  <th className="px-6 py-4 font-medium">Comment</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">Loading reviews…</td></tr>
                ) : reviews.length === 0 ? (
                  <tr><td colSpan={5}><EmptyState label={ratingFilter ? "No reviews at this rating." : "No reviews yet."} /></td></tr>
                ) : reviews.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)] align-top">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.agent.name} color={avatarColor(r.agent.id)} size={34} />
                        <div>
                          <div className="text-[var(--text-primary)] font-medium">{r.agent.name}</div>
                          {r.agent.email && <div className="text-xs text-[var(--text-muted)]">{r.agent.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.reviewer.name} color={avatarColor(r.reviewer.id)} size={28} />
                        <div className="text-[var(--text-secondary)]">{r.reviewer.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <StarRow rating={r.rating} />
                        {r.is_verified_deal && (
                          <span title="Verified deal" className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)] max-w-xs">
                      {r.comment ? <span>{r.comment}</span> : <span className="text-[var(--text-muted)] italic">No comment</span>}
                    </td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)] text-xs whitespace-nowrap">{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && reviews.length < total && (
            <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-center">
              <button
                onClick={() => load(page + 1, ratingFilter, true)}
                disabled={loadingMore}
                className="px-4 py-2 rounded-xl bg-[var(--bg-sunken)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
              >
                {loadingMore ? "Loading…" : `Load More (${reviews.length} of ${total})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
