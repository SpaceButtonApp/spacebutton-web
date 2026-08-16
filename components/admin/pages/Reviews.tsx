'use client'
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Star, AlertCircle, MessageSquareOff, ChevronDown } from "lucide-react";
import { adminApi, type AdminAgent } from "@/lib/api/admin";
import { StatCard } from "@/components/admin/shared/StatCard";
import { SearchInput, Avatar, EmptyState } from "@/components/admin/shared/Atoms";
import { formatDate } from "@/lib/utils/admin-format";

type RatingFilter = "all" | "5" | "4" | "3" | "low";

const AVATAR_COLORS = ["#7c3aed", "#a855f7", "#8b5cf6", "#6366f1", "#c026d3", "#9333ea"];
function avatarColor(id: string) {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rounded ? "text-amber-400 fill-amber-400" : "text-[var(--text-muted)]"}`}
        />
      ))}
    </div>
  );
}

const RATING_FILTERS: { key: RatingFilter; label: string }[] = [
  { key: "all", label: "All Ratings" },
  { key: "5", label: "5 Stars" },
  { key: "4", label: "4+ Stars" },
  { key: "3", label: "3+ Stars" },
  { key: "low", label: "Low (1-2)" },
];

export function ReviewsPage() {
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let all: AdminAgent[] = [];
      let page = 1;
      while (true) {
        const res = await adminApi.getAgents(page, 100);
        const batch = res.agents ?? [];
        all = [...all, ...batch];
        if (all.length >= (res.total ?? 0) || batch.length < 100) break;
        page++;
      }
      setAgents(all);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const rated = useMemo(() => agents.filter((a) => (a.total_reviews ?? 0) > 0 && a.average_rating != null), [agents]);

  const totalReviews = rated.reduce((sum, a) => sum + (a.total_reviews ?? 0), 0);
  const avgRating = totalReviews > 0
    ? rated.reduce((sum, a) => sum + (a.average_rating ?? 0) * (a.total_reviews ?? 0), 0) / totalReviews
    : 0;

  const filtered = useMemo(() => {
    let list = rated;
    if (ratingFilter === "5") list = list.filter((a) => Math.round(a.average_rating ?? 0) === 5);
    else if (ratingFilter === "4") list = list.filter((a) => (a.average_rating ?? 0) >= 4);
    else if (ratingFilter === "3") list = list.filter((a) => (a.average_rating ?? 0) >= 3);
    else if (ratingFilter === "low") list = list.filter((a) => (a.average_rating ?? 0) < 3);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        `${a.first_name ?? ""} ${a.last_name ?? ""}`.toLowerCase().includes(q) ||
        (a.agency_name ?? "").toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
  }, [rated, ratingFilter, search]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-sm text-[var(--text-secondary)]">Loading reviews…</span>
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

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Reviews" value={totalReviews} icon={MessageSquareOff} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
        <StatCard label="Average Rating" value={totalReviews > 0 ? avgRating.toFixed(1) : "—"} icon={Star} iconBg="bg-amber-500/15" iconColor="text-amber-400" valueColor="text-amber-400" />
        <StatCard label="5 Star Reviews" value="N/A" icon={Star} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" sublabel="needs per-review data" />
        <StatCard label="Low Reviews (1-2)" value="N/A" icon={Star} iconBg="bg-red-500/15" iconColor="text-red-400" sublabel="needs per-review data" />
      </div>

      <div className="flex gap-3 mb-5 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search agent by name, agency or email..." />
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
        <div className="px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Agent Ratings</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Aggregate rating per agent. Individual review comments will appear here once that data is available from the backend.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                <th className="px-6 py-4 font-medium">Agent</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Reviews</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Agent Since</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5}><EmptyState label={rated.length === 0 ? "No agents have received reviews yet." : "No agents match your filter."} /></td></tr>
              ) : filtered.map((a) => {
                const name = [a.first_name, a.last_name].filter(Boolean).join(" ") || a.agency_name || "Unknown";
                return (
                  <tr key={a.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)]">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={name} color={avatarColor(a.id)} size={34} />
                        <div>
                          <div className="text-[var(--text-primary)] font-medium">{name}</div>
                          {a.agency_name && <div className="text-xs text-[var(--text-muted)]">{a.agency_name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <StarRow rating={a.average_rating ?? 0} />
                        <span className="text-[var(--text-secondary)] text-xs font-medium">{(a.average_rating ?? 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)]">{a.total_reviews ?? 0}</td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)]">{[a.city, a.state].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)] text-xs">{a.created_at ? formatDate(a.created_at) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
