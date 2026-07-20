'use client'
import React from "react";

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/15 text-red-400 border-red-500/20",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  neutral: "bg-slate-500/15 text-[var(--text-tertiary)] border-slate-500/20",
  purple: "bg-violet-500/15 text-violet-400 border-violet-500/20",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

// Convenience mappers so pages don't repeat tone logic ----------------------

export function statusBadgeTone(status: string): BadgeTone {
  switch (status) {
    case "active":
    case "approved":
    case "verified":
    case "resolved":
    case "success":
    case "reviewed":
      return "success";
    case "pending":
    case "pending_verification":
    case "flagged":
      return "warning";
    case "suspended":
    case "closed":
    case "rejected":
    case "not_verified":
    case "failed":
      return "danger";
    default:
      return "neutral";
  }
}

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ");
  return (
    <Badge tone={statusBadgeTone(status)}>
      <span className="capitalize">{label}</span>
    </Badge>
  );
}
