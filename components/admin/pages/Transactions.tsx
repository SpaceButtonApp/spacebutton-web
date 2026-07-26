'use client'
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Wallet, Link2, Receipt, AlertTriangle } from "lucide-react";
import { adminApi, type AdminTransaction } from "@/lib/api/admin";
import { StatCard } from "@/components/admin/shared/StatCard";
import { SearchInput, ExportButton, EmptyState } from "@/components/admin/shared/Atoms";
import { StatusBadge, Badge } from "@/components/admin/shared/Badge";
import { formatDate, formatNaira, exportToExcel, truncateId } from "@/lib/utils/admin-format";

type TypeFilter = "all" | "purchase" | "deduction" | "bonus" | "referral";
type StatusFilter = "all" | "success" | "pending" | "failed";

const TYPE_LABELS: Record<string, string> = {
  purchase: "Purchase",
  deduction: "Deduction",
  bonus: "Bonus",
  referral: "Referral",
};

const TYPE_TONE: Record<string, "info" | "purple" | "success" | "neutral"> = {
  purchase: "info",
  deduction: "neutral",
  bonus: "success",
  referral: "purple",
};

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getTransactions(1, 200);
      setTransactions(data.transactions ?? []);
      setTotal(data.total ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalRevenue = transactions
    .filter((t) => t.status === "success" && t.transaction_type === "purchase")
    .reduce((s, t) => s + (t.amount_kobo ?? 0), 0);

  const totalConnects = transactions
    .filter((t) => t.status === "success")
    .reduce((s, t) => s + (t.connects_qty ?? 0), 0);

  const failedPending = transactions.filter((t) => t.status !== "success").length;

  const filtered = useMemo(() => {
    let list = transactions;
    if (typeFilter !== "all") list = list.filter((t) => t.transaction_type === typeFilter);
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.user_name.toLowerCase().includes(q) ||
          t.user_email.toLowerCase().includes(q) ||
          (t.paystack_reference ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [transactions, typeFilter, statusFilter, search]);

  function handleExport() {
    exportToExcel(
      "transactions",
      filtered.map((t) => ({
        TransactionID: t.id,
        User: t.user_name,
        Email: t.user_email,
        Amount: t.amount_kobo / 100,
        Connects: t.connects_qty,
        Type: TYPE_LABELS[t.transaction_type] ?? t.transaction_type,
        Reference: t.paystack_reference ?? "",
        Date: formatDate(t.created_at),
        Status: t.status,
      })),
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value={loading ? "—" : formatNaira(totalRevenue / 100)}
          icon={Wallet}
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-400"
          valueColor="text-emerald-400"
        />
        <StatCard
          label="Total Connects"
          value={loading ? "—" : totalConnects}
          icon={Link2}
          iconBg="bg-violet-500/15"
          iconColor="text-violet-400"
        />
        <StatCard
          label="Total Transactions"
          value={loading ? "—" : total}
          icon={Receipt}
          iconBg="bg-blue-500/15"
          iconColor="text-blue-400"
        />
        <StatCard
          label="Failed / Pending"
          value={loading ? "—" : failedPending}
          icon={AlertTriangle}
          iconBg="bg-amber-500/15"
          iconColor="text-amber-400"
          valueColor="text-amber-400"
        />
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by ID, user, or reference…" />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="purchase">Purchase</option>
          <option value="deduction">Deduction</option>
          <option value="bonus">Bonus</option>
          <option value="referral">Referral</option>
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                    Loading transactions…
                  </td>
                </tr>
              ) : filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)]"
                >
                  <td className="px-6 py-3.5 font-mono text-xs text-[var(--text-secondary)]">
                    {truncateId(t.id, 12)}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="font-medium text-[var(--text-primary)]">{t.user_name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{t.user_email}</div>
                  </td>
                  <td className="px-6 py-3.5 text-[var(--text-primary)]">
                    {t.amount_kobo ? formatNaira(t.amount_kobo / 100) : "—"}
                  </td>
                  <td className="px-6 py-3.5 text-[var(--text-tertiary)]">{t.connects_qty}</td>
                  <td className="px-6 py-3.5">
                    <Badge tone={TYPE_TONE[t.transaction_type] ?? "neutral"}>
                      {TYPE_LABELS[t.transaction_type] ?? t.transaction_type}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-[var(--text-secondary)]">{formatDate(t.created_at)}</td>
                  <td className="px-6 py-3.5"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <EmptyState label="No transactions match your filters." />}
        </div>
      </div>
    </div>
  );
}
