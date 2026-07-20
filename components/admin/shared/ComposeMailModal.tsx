'use client'
import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Modal } from "@/components/admin/shared/Modal";

interface ComposeMailModalProps {
  open: boolean;
  to: { name: string; email: string } | null;
  onClose: () => void;
}

export function ComposeMailModal({ open, to, onClose }: ComposeMailModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setSubject("");
      setBody("");
      setSent(false);
    }
  }, [open, to]);

  function handleSend() {
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 900);
  }

  return (
    <Modal open={open} onClose={onClose} title="Compose Mail" maxWidth="max-w-lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">To</label>
          <div className="w-full bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)]">
            {to ? `${to.name} <${to.email}>` : "—"}
          </div>
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject..."
            className="w-full bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Write your message..."
            className="w-full bg-[var(--bg-sunken)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-tertiary)] font-medium hover:bg-[var(--bg-subtle-strong)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!subject.trim() || !body.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            <Send className="w-4 h-4" /> {sent ? "Sent!" : "Send Mail"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
