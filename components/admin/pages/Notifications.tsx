'use client'
import React, { useState } from "react";
import { Bell, Send } from "lucide-react";
import { adminApi } from "@/lib/api/admin";

export function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ text: string; ok: boolean } | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      const res = await adminApi.broadcastNotification(title.trim(), body.trim());
      setResult({ text: `Sent to ${res.total_users} user${res.total_users === 1 ? "" : "s"} (${res.push_sent} received a push).`, ok: true });
      setTitle("");
      setBody("");
    } catch (err) {
      setResult({ text: err instanceof Error ? err.message : "Failed to send broadcast.", ok: false });
    } finally {
      setSending(false);
      setConfirming(false);
    }
  }

  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sending;

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-11 h-11 rounded-2xl bg-violet-500/15 flex items-center justify-center">
          <Bell className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Send Notification</h2>
          <p className="text-sm text-[var(--text-secondary)]">Sends a push notification and in-app message to every user, right now.</p>
        </div>
      </div>

      <div className="mt-6 space-y-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
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
              <Send className="w-4 h-4" /> Send to All Users
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
            <span className="text-sm text-amber-300 flex-1">Send this to every user right now?</span>
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
    </div>
  );
}
