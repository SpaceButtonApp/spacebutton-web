'use client'
import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  valueColor?: string;
  sublabel?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg = "bg-violet-500/15",
  iconColor = "text-violet-400",
  valueColor = "text-[var(--text-primary)]",
  sublabel,
}: StatCardProps) {
  return (
    <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col gap-3 min-w-0">
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      )}
      <div>
        <div className={`text-3xl font-bold leading-tight ${valueColor}`}>{value}</div>
        <div className="text-sm text-[var(--text-secondary)] mt-1">{label}</div>
        {sublabel && <div className="text-xs text-[var(--text-muted)] mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}
