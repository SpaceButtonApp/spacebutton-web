'use client'
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Bell, Send, Check, X, Search, Loader2 } from "lucide-react";
import { adminApi, AdminUser, NotificationBroadcastRequest, NotificationTargetType } from "@/lib/api/admin";

const AUDIENCE_OPTIONS: { value: NotificationTargetType; label: string }[] = [
  { value: "all", label: "All Users" },
  { value: "agent", label: "Agents Only" },
  { value: "user", label: "Individuals Only" },
  { value: "specific", label: "Specific User" },
];

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ text: string; ok: boolean } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const [targetType, setTargetType] = useState<NotificationTargetType>("all");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<AdminUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pending, setPending] = useState<NotificationBroadcastRequest[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    try {
      const res = await adminApi.getPendingNotifications();
      setPending(res.requests || []);
    } catch {
      // Non-critical — approval queue just stays empty on failure
    } finally {
      setPendingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  useEffect(() => {
    if (targetType !== "specific" || userQuery.trim().length < 2) {
      setUserResults([]);
      return;
    }
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await adminApi.getUsers(1, 10, undefined, userQuery.trim());
        setUserResults(res.users || []);
      } catch {
        setUserResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [userQuery, targetType]);

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      const label = selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}`.trim() || selectedUser.email : undefined;
      const res = await adminApi.broadcastNotification(title.trim(), body.trim(), targetType, selectedUser?.id, label);
      setResult({
        text: res.total_users != null
          ? `Sent to ${res.total_users} user${res.total_users === 1 ? "" : "s"} (${res.push_sent} received a push).`
          : "Sent.",
        ok: true,
      });
      setTitle("");
      setBody("");
      setSelectedUser(null);
      setUserQuery("");
      setTargetType("all");
    } catch (err) {
      setResult({ text: err instanceof Error ? err.message : "Failed to send broadcast.", ok: false });
    } finally {
      setSending(false);
      setConfirming(false);
    }
  }

  async function handleDecide(id: string, action: "approve" | "reject") {
    setDecidingId(id);
    try {
      if (action === "approve") await adminApi.approveNotification(id);
      else await adminApi.rejectNotification(id);
      setPending((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // leave it in the list — the admin can retry
    } finally {
      setDecidingId(null);
    }
  }

  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sending && (targetType !== "specific" || !!selectedUser);

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-11 h-11 rounded-2xl bg-violet-500/15 flex items-center justify-center">
          <Bell className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Send Notification</h2>
          <p className="text-sm text-[var(--text-secondary)]">Sends a push notification and in-app message right now.</p>
        </div>
      </div>

      <div className="mt-6 space-y-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">Audience</label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTargetType(opt.value);
                  if (opt.value !== "specific") {
                    setSelectedUser(null);
                    setUserQuery("");
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  targetType === opt.value
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "bg-[var(--bg-sunken)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {targetType === "specific" && (
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">User</label>
            {selectedUser ? (
              <div className="flex items-center justify-between bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl px-4 py-2.5">
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{selectedUser.first_name} {selectedUser.last_name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{selectedUser.email}</div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
                {searching && <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] animate-spin" />}
                {userResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg max-h-56 overflow-y-auto">
                    {userResults.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { setSelectedUser(u); setUserResults([]); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[var(--bg-sunken)] transition-colors"
                      >
                        <div className="text-sm font-medium text-[var(--text-primary)]">{u.first_name} {u.last_name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{u.email}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Happy New Month! 🎉"
            maxLength={80}
            className="w-full bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Write what you want users to see..."
            maxLength={300}
            className="w-full bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
          />
        </div>

        {result && (
          <div
            className="text-sm rounded-xl px-4 py-3"
            style={{
              color: result.ok ? "#34d399" : "#f87171",
              background: result.ok ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
              border: `1px solid ${result.ok ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
            }}
          >
            {result.text}
          </div>
        )}

        {!confirming ? (
          <div className="flex justify-end">
            <button
              onClick={() => setConfirming(true)}
              disabled={!canSend}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              <Send className="w-4 h-4" /> Send Now
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
            <span className="text-sm text-amber-300 flex-1">
              Send this to {targetType === "all" ? "every user" : targetType === "agent" ? "all agents" : targetType === "user" ? "all individual users" : selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "this user"} right now?
            </span>
            <button
              onClick={() => setConfirming(false)}
              className="px-4 py-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-tertiary)] font-medium hover:bg-[var(--bg-subtle-strong)] transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-medium transition-colors text-sm"
            >
              {sending ? "Sending…" : "Yes, Send Now"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">Pending Approval</h3>
        {pendingLoading ? (
          <div className="text-sm text-[var(--text-muted)]">Loading…</div>
        ) : pending.length === 0 ? (
          <div className="text-sm text-[var(--text-muted)]">Nothing waiting on your approval.</div>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <div key={r.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{r.title}</div>
                    <div className="text-sm text-[var(--text-secondary)] mt-0.5">{r.body}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-2">
                      From {r.created_by_name} · {r.target_type === "specific" ? (r.target_label || "1 user") : AUDIENCE_OPTIONS.find((o) => o.value === r.target_type)?.label} · {timeAgo(r.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDecide(r.id, "reject")}
                      disabled={decidingId === r.id}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-colors"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDecide(r.id, "approve")}
                      disabled={decidingId === r.id}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors"
                      title="Approve & Send"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
