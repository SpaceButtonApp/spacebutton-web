'use client'
import React, { useMemo, useState } from "react";
import { Wallet, Link2, Receipt, AlertTriangle } from "lucide-react";
import { useAdminStore, getUserById } from "@/lib/admin-store";
import { StatCard } from "@/components/admin/shared/StatCard";
import { SearchInput, ExportButton, EmptyState } from "@/components/admin/shared/Atoms";
import { StatusBadge, Badge } from "@/components/admin/shared/Badge";
import { formatDate, formatNaira, exportToExcel, truncateId } from "@/lib/utils/admin-format";

type TypeFilter = "all" | "paystack" | "apple_iap";
type StatusFilter = "all" | "success" | "pending" | "failed";

export function TransactionsPage() {
  const transactions = useAdminStore((s) => s.transactions);
  const users = useAdminStore((s) => s.users);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const totalRevenue = transactions.filter((t) => t.status === "success").reduce((s, t) => s + t.amount, 0);
  const totalConnects = transactions.filter((t) => t.status === "success").reduce((s, t) => s + t.connects, 0);
  const totalCount = transactions.length;
  const failedPending = transactions.filter((t) => t.status !== "success").length;

  const filtered = useMemo(() => {
    let list = transactions;
    if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => {
        const u = getUserById(users, t.userId);
        return t.id.toLowerCase().includes(q) || u?.name.toLowerCase().includes(q);
      });
    }
    return list;
  }, [transactions, typeFilter, statusFilter, search, users]);

  function handleExport() {
    exportToExcel(
      "transactions",
      filtered.map((t) => {
        const u = getUserById(users, t.userId);
        return {
          TransactionID: t.id, User: u?.name ?? "—", Amount: t.amount, Connects: t.connects,
          Type: t.type === "apple_iap" ? "Apple IAP" : "Paystack", Date: formatDate(t.date), Status: t.status,
        };
      })
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={formatNaira(totalRevenue)} icon={Wallet} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" valueColor="text-emerald-400" />
        <StatCard label="Total Connects" value={totalConnects} icon={Link2} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
        <StatCard label="Total Transactions" value={totalCount} icon={Receipt} iconBg="bg-blue-500/15" iconColor="text-blue-400" />
        <StatCard label="Failed / Pending" value={failedPending} icon={AlertTriangle} iconBg="bg-amber-500/15" iconColor="text-amber-400" valueColor="text-amber-400" />
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by transaction ID or user..." />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="paystack">Paystack</option>
          <option value="apple_iap">Apple IAP</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <ExportButton onClick={handleExport} />
      </div>

      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Connects</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const u = getUserById(users, t.userId);
                return (
                  <tr key={t.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)]">
                    <td className="px-6 py-3.5 font-mono text-xs text-[var(--text-secondary)]">{truncateId(t.id, 12)}</td>
                    <td className="px-6 py-3.5 text-[var(--text-primary)] font-medium">{u?.name ?? "—"}</td>
                    <td className="px-6 py-3.5 text-[var(--text-primary)]">{formatNaira(t.amount)}</td>
                    <td className="px-6 py-3.5 text-[var(--text-tertiary)]">{t.connects}</td>
                    <td className="px-6 py-3.5">
                      <Badge tone={t.type === "apple_iap" ? "purple" : "info"}>
                        {t.type === "apple_iap" ? "Apple IAP" : "Paystack"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-[var(--text-secondary)]">{formatDate(t.date)}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={t.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState label="No transactions match your filters." />}
        </div>
      </div>
    </div>
  );
}
