'use client'
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { RotateCw, AlertCircle, Search, MapPin, Snowflake, Play, Trash2, Undo2 } from "lucide-react"
import { adminApi, type AdminChat, type AdminChatMessage, type AdminChatInfo } from "@/lib/api/admin"
import { Avatar, EmptyState } from "@/components/admin/shared/Atoms"
import { StatusBadge } from "@/components/admin/shared/Badge"
import { ConfirmModal } from "@/components/admin/shared/Modal"

interface ConnectionsPageProps {
  onViewListing?: (listingId: string) => void
}

const POLL_LIST = 10_000
const POLL_DETAIL = 6_000
const DEFAULT_PROPERTY_IMG = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'
const UNDO_WINDOW_MS = 30_000

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}

function formatPrice(price: string | null) {
  const n = Number(price)
  return Number.isFinite(n) ? `₦${n.toLocaleString()}` : price ?? ''
}

export function ConnectionsPage({ onViewListing }: ConnectionsPageProps) {
  const [chats, setChats] = useState<AdminChat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedIdRef = useRef<string | null>(null)
  selectedIdRef.current = selectedId

  const [messages, setMessages] = useState<AdminChatMessage[]>([])
  const [chatInfo, setChatInfo] = useState<AdminChatInfo | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ── load chat list ────────────────────────────────────────────────────────

  const loadChats = useCallback(async () => {
    try {
      const data = await adminApi.getAllChats()
      setChats(data.chats ?? [])
      setLoading(false)
      setError(null)
    } catch (e) {
      setLoading(false)
      setError(e instanceof Error ? e.message : 'Failed to load connections')
    }
  }, [])

  useEffect(() => {
    loadChats()
    const t = setInterval(loadChats, POLL_LIST)
    return () => clearInterval(t)
  }, [loadChats])

  const filteredChats = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return chats
    return chats.filter((c) =>
      c.user_name?.toLowerCase().includes(q) ||
      c.agent_name?.toLowerCase().includes(q) ||
      c.listing?.title?.toLowerCase().includes(q) ||
      c.last_message?.toLowerCase().includes(q)
    )
  }, [chats, query])

  // ── load messages for selected chat ─────────────────────────────────────

  const loadDetail = useCallback(async (chatId: string) => {
    setDetailLoading(true)
    setDetailError(null)
    try {
      const detail = await adminApi.getChatMessages(chatId)
      if (selectedIdRef.current === chatId) {
        setMessages(detail.messages ?? [])
        setChatInfo(detail.chat_info ?? null)
      }
    } catch (e) {
      if (selectedIdRef.current === chatId) {
        setDetailError(e instanceof Error ? e.message : 'Failed to load conversation')
      }
    } finally {
      if (selectedIdRef.current === chatId) setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    setActionError(null)
    if (!selectedId) { setMessages([]); setChatInfo(null); return }
    loadDetail(selectedId)
    const t = setInterval(() => {
      if (selectedIdRef.current) loadDetail(selectedIdRef.current)
    }, POLL_DETAIL)
    return () => clearInterval(t)
  }, [selectedId, loadDetail])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── freeze / unfreeze ────────────────────────────────────────────────────

  const [freezeBusy, setFreezeBusy] = useState(false)
  const isFrozen = chatInfo?.status === 'blocked'

  async function handleToggleFreeze() {
    if (!selectedId || freezeBusy) return
    setFreezeBusy(true)
    setActionError(null)
    try {
      if (isFrozen) {
        await adminApi.unfreezeChat(selectedId)
        setChatInfo((prev) => (prev ? { ...prev, status: 'active' } : prev))
      } else {
        await adminApi.freezeChat(selectedId)
        setChatInfo((prev) => (prev ? { ...prev, status: 'blocked' } : prev))
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not update this conversation.')
    } finally {
      setFreezeBusy(false)
    }
  }

  // ── delete message (confirm -> delete -> 30s undo window) ────────────────

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [pendingUndo, setPendingUndo] = useState<{ chatId: string; message: AdminChatMessage } | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearUndoTimer() {
    if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); undoTimerRef.current = null }
  }

  function requestDeleteMessage(messageId: string) {
    setConfirmDeleteId(messageId)
  }

  async function confirmDeleteMessage() {
    const messageId = confirmDeleteId
    setConfirmDeleteId(null)
    if (!selectedId || !messageId || deletingId) return
    const target = messages.find((m) => m.id === messageId)
    setDeletingId(messageId)
    setActionError(null)
    const prev = messages
    // Optimistic — it vanishes immediately, same as it will for the two users next time they load the chat.
    setMessages((m) => m.filter((msg) => msg.id !== messageId))
    try {
      await adminApi.deleteChatMessage(selectedId, messageId)
      clearUndoTimer()
      if (target) setPendingUndo({ chatId: selectedId, message: target })
      undoTimerRef.current = setTimeout(() => setPendingUndo(null), UNDO_WINDOW_MS)
    } catch (e) {
      setMessages(prev)
      setActionError(e instanceof Error ? e.message : 'Could not delete that message.')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleUndoDelete() {
    if (!pendingUndo) return
    const { chatId, message } = pendingUndo
    clearUndoTimer()
    setPendingUndo(null)
    try {
      await adminApi.restoreChatMessage(chatId, message.id)
      // Only splice it back in if we're still looking at that same chat.
      if (selectedIdRef.current === chatId) {
        setMessages((m) => (m.some((x) => x.id === message.id) ? m : [...m, message].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )))
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not restore that message.')
    }
  }

  // Switching conversations clears any in-flight confirm/undo state for the previous one.
  useEffect(() => {
    setConfirmDeleteId(null)
    clearUndoTimer()
    setPendingUndo(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  useEffect(() => () => clearUndoTimer(), [])

  const selectedChat = chats.find((c) => c.id === selectedId)
  const listing = chatInfo?.listing

  return (
    <div className="flex h-full">
      {/* ── Left: connection list ── */}
      <div className="w-[360px] shrink-0 border-r border-[var(--border-color)] flex flex-col">
        <div className="p-4 flex items-center justify-between gap-2 border-b border-[var(--border-color)]">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Connections
            {chats.length > 0 && (
              <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">{chats.length} total</span>
            )}
          </span>
          <button
            onClick={loadChats}
            className="p-2 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b border-[var(--border-color)]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or property…"
              className="w-full pl-9 pr-3 py-2 bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && chats.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-[var(--text-muted)]">Loading…</div>
          ) : error ? (
            <div className="p-4 flex flex-col items-center gap-2 text-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-xs text-[var(--text-muted)]">{error}</p>
              <button onClick={loadChats} className="text-xs text-violet-400 hover:underline">Retry</button>
            </div>
          ) : filteredChats.length === 0 ? (
            <EmptyState label={chats.length === 0 ? "No users have connected yet." : "No matches."} />
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedId(chat.id)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 border-l-2 text-left transition-colors ${
                  selectedId === chat.id
                    ? 'bg-violet-600/10 border-violet-500'
                    : 'border-transparent hover:bg-[var(--bg-hover)]'
                }`}
              >
                <div className="flex -space-x-2 shrink-0">
                  <Avatar name={chat.user_name} color="#0891b2" size={32} />
                  <Avatar name={chat.agent_name} color="#7c3aed" size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[var(--text-primary)] font-medium text-sm truncate">
                      {chat.user_name} ↔ {chat.agent_name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">{timeAgo(chat.updated_at)}</span>
                  </div>
                  {chat.listing?.title && (
                    <div className="text-xs text-violet-400 truncate mt-0.5">{chat.listing.title}</div>
                  )}
                  <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                    {chat.last_message ?? 'No messages yet'}
                  </div>
                  <div className="mt-1.5">
                    <StatusBadge status={chat.status} />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right: transcript ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChat ? (
          <>
            {/* header */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[var(--border-color)] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex -space-x-2 shrink-0">
                  <Avatar name={selectedChat.user_name} color="#0891b2" size={38} />
                  <Avatar name={selectedChat.agent_name} color="#7c3aed" size={38} />
                </div>
                <div className="min-w-0">
                  <div className="text-[var(--text-primary)] font-semibold text-sm truncate">
                    {selectedChat.user_name} ↔ {selectedChat.agent_name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] truncate">
                    {selectedChat.user_email}{selectedChat.agent_email ? ` · ${selectedChat.agent_email}` : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={chatInfo?.status ?? selectedChat.status} />
                <button
                  onClick={handleToggleFreeze}
                  disabled={freezeBusy}
                  title={isFrozen ? 'Unfreeze — let them message each other again' : 'Freeze — they will not be able to message each other'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border disabled:opacity-50 ${
                    isFrozen
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
                      : 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border-sky-500/20'
                  }`}
                >
                  {isFrozen ? <Play className="w-3.5 h-3.5" /> : <Snowflake className="w-3.5 h-3.5" />}
                  {isFrozen ? 'Unfreeze' : 'Freeze'}
                </button>
              </div>
            </div>

            {isFrozen && (
              <div className="px-6 py-2 bg-sky-500/10 border-b border-sky-500/20 text-xs text-sky-400 shrink-0">
                This conversation is frozen — neither user can send a new message until you unfreeze it.
              </div>
            )}

            {actionError && (
              <div className="px-6 py-2 bg-red-500/10 border-b border-red-500/20 text-xs text-red-400 shrink-0">
                {actionError}
              </div>
            )}

            {/* property banner — mirrors the in-app chat page's listing strip */}
            {listing && (
              <button
                onClick={() => listing.id && onViewListing?.(listing.id)}
                className="w-full flex items-center gap-3 px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-raised)]/50 hover:bg-[var(--bg-raised)] transition-colors text-left shrink-0"
              >
                <img
                  src={listing.cover_image ?? DEFAULT_PROPERTY_IMG}
                  alt={listing.title ?? ''}
                  className="w-13 h-13 rounded-xl object-cover shrink-0"
                  style={{ width: 52, height: 52 }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{listing.title}</p>
                  {(listing.city || listing.state) && (
                    <p className="text-xs text-[var(--text-muted)] truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {[listing.city, listing.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <p className="text-violet-400 font-bold text-sm">{formatPrice(listing.price)}</p>
                </div>
              </button>
            )}

            {/* messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {detailLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-sm text-[var(--text-muted)]">Loading…</div>
              ) : detailError ? (
                <div className="flex flex-col items-center gap-2 text-center py-8">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <p className="text-xs text-[var(--text-muted)]">{detailError}</p>
                </div>
              ) : messages.length === 0 ? (
                <EmptyState label="No messages in this conversation yet." />
              ) : (
                messages.map((m) => {
                  const isAgent = m.sender_id === chatInfo?.agent_id
                  const senderName = isAgent ? chatInfo?.agent_name : chatInfo?.user_name
                  return (
                    <div key={m.id} className={`group flex items-center gap-2 ${isAgent ? 'justify-end' : 'justify-start'}`}>
                      {!isAgent && (
                        <button
                          onClick={() => requestDeleteMessage(m.id)}
                          disabled={deletingId === m.id}
                          title="Delete this message — the user will not be notified"
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                          isAgent
                            ? 'bg-violet-600 text-white'
                            : 'bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-primary)]'
                        }`}
                      >
                        <div className={`text-[10px] font-semibold mb-1 ${isAgent ? 'text-violet-200' : 'text-[var(--text-muted)]'}`}>
                          {senderName ?? 'Unknown'}
                        </div>
                        <div>{m.content}</div>
                        <div className={`text-[10px] mt-1 ${isAgent ? 'text-violet-200' : 'text-[var(--text-muted)]'}`}>
                          {formatTime(m.created_at)}
                        </div>
                      </div>
                      {isAgent && (
                        <button
                          onClick={() => requestDeleteMessage(m.id)}
                          disabled={deletingId === m.id}
                          title="Delete this message — the user will not be notified"
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {pendingUndo && pendingUndo.chatId === selectedId && (
              <div className="px-4 py-2.5 border-t border-[var(--border-color)] bg-[var(--bg-raised)] flex items-center justify-between gap-3 shrink-0">
                <span className="text-xs text-[var(--text-secondary)]">Message deleted.</span>
                <button
                  onClick={handleUndoDelete}
                  className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" /> Undo
                </button>
              </div>
            )}

            <div className="px-4 py-3 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] shrink-0">
              Read-only — admin cannot send messages in a user-to-user conversation.
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState label="Select a connection to view the conversation." />
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Delete this message?"
        description="The user will not be notified — it will simply disappear from their conversation. You can undo this for 30 seconds after deleting."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        icon={<Trash2 className="w-6 h-6 text-red-400" />}
        onConfirm={confirmDeleteMessage}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}
