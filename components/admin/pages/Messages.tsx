'use client'
import React, { useEffect, useMemo, useState } from "react";
import { Send, RotateCw } from "lucide-react";
import { useAdminStore, getUserById } from "@/lib/admin-store";
import { SearchInput, Avatar, EmptyState } from "@/components/admin/shared/Atoms";
import { formatDate } from "@/lib/utils/admin-format";

interface MessagesPageProps {
  /** Set by another page (e.g. Users → Message) to jump straight into a thread. */
  openUserId?: string | null;
  onOpenUserConsumed?: () => void;
}

export function MessagesPage({ openUserId, onOpenUserConsumed }: MessagesPageProps) {
  const messages = useAdminStore((s) => s.messages);
  const users = useAdminStore((s) => s.users);
  const sendMessage = useAdminStore((s) => s.sendMessage);
  const markThreadRead = useAdminStore((s) => s.markThreadRead);
  const startThreadWithUser = useAdminStore((s) => s.startThreadWithUser);

  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(messages[0]?.id ?? null);
  const [draft, setDraft] = useState("");

  // If another page asked us to open a specific user's thread, do that once.
  useEffect(() => {
    if (!openUserId) return;
    const threadId = startThreadWithUser(openUserId);
    setActiveId(threadId);
    markThreadRead(threadId);
    onOpenUserConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openUserId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter((t) => getUserById(users, t.userId)?.name.toLowerCase().includes(q));
  }, [messages, search, users]);

  const activeThread = messages.find((t) => t.id === activeId);
  const activeUser = activeThread ? getUserById(users, activeThread.userId) : undefined;

  function openThread(id: string) {
    setActiveId(id);
    markThreadRead(id);
  }

  function handleSend() {
    if (!draft.trim() || !activeId) return;
    sendMessage(activeId, draft.trim());
    setDraft("");
  }

  return (
    <div className="flex h-full">
      <div className="w-[340px] shrink-0 border-r border-[var(--border-color)] flex flex-col">
        <div className="p-4 flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search conversations..." />
          <button className="p-3 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && <EmptyState label="No conversations found." />}
          {filtered.map((t) => {
            const u = getUserById(users, t.userId);
            if (!u) return null;
            return (
              <button
                key={t.id}
                onClick={() => openThread(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 border-l-2 text-left transition-colors ${
                  activeId === t.id ? "bg-violet-600/10 border-violet-500" : "border-transparent hover:bg-[var(--bg-hover)]"
                }`}
              >
                <Avatar name={u.name} color={u.avatarColor} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-primary)] font-medium text-sm truncate">{u.name}</span>
                    <span className="text-xs text-[var(--text-muted)] shrink-0 ml-2">{formatDate(t.lastMessageDate)}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] truncate">{t.lastMessage || "No messages yet"}</div>
                </div>
                {t.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {t.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeThread && activeUser ? (
          <>
            <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--border-color)]">
              <Avatar name={activeUser.name} color={activeUser.avatarColor} size={40} />
              <div>
                <div className="text-[var(--text-primary)] font-semibold">{activeUser.name}</div>
                <div className="text-xs text-[var(--text-muted)]">Support conversation</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeThread.messages.length === 0 && (
                <EmptyState label="No messages yet. Say hello!" />
              )}
              {activeThread.messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                      m.sender === "admin" ? "bg-violet-600 text-white" : "bg-[var(--bg-hover-strong)] text-[var(--text-tertiary)]"
                    }`}
                  >
                    <div>{m.text}</div>
                    <div className={`text-[10px] mt-1 ${m.sender === "admin" ? "text-violet-200" : "text-[var(--text-muted)]"}`}>
                      {new Date(m.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[var(--border-color)] flex items-center gap-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a reply..."
                className="flex-1 bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              <button
                onClick={handleSend}
                className="w-11 h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shrink-0 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <EmptyState label="Select a conversation to view messages." />
        )}
      </div>
    </div>
  );
}
