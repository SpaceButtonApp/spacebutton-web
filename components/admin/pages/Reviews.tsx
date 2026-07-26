'use client'
import React from "react";
import { Star } from "lucide-react";

export function ReviewsPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/15 flex items-center justify-center mb-5">
        <Star className="w-8 h-8 text-amber-400" />
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Reviews</h2>
      <p className="text-[var(--text-secondary)] text-sm text-center max-w-sm">
        Agent and app reviews will appear here once the review system is live.
      </p>
      <span className="mt-4 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
        Coming Soon
      </span>
    </div>
  );
}
