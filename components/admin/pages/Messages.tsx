'use client'
import React, { useEffect, useState, useCallback, useRef } from "react"
import { Send, RotateCw, AlertCircle } from "lucide-react"
import { adminApi, type SupportTicket, type SupportTicketMessage } from "@/lib/api/admin"
import { Avatar, EmptyState } from "@/components/admin/shared/Atoms"
import { StatusBadge } from "@/components/admin/shared/Badge"

interface MessagesPageProps {
  openUserId?: string | null
  onOpenUserConsumed?: () => void
  onOpenTicket?: (ticketId: string) => void
}

const POLL_LIST = 10_000
const POLL_DETAIL = 6_000

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

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export function MessagesPage({ openUserId, onOpenUserConsumed, onOpenTicket }: MessagesPageProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedIdRef = useRef<string | null>(null)
  selectedIdRef.current = selectedId

  const [messages, setMessages] = useState<SupportTicketMessage[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ── load ticket list ──────────────────────────────────────────────────────

  const loadTickets = useCallback(async () => {
    try {
      const data = await adminApi.getSupportTickets()
      setTickets(data.tickets ?? [])
      setLoading(false)
      setError(null)
    } catch (e) {
      setLoading(false)
      setError(e instanceof Error ? e.message : 'Failed to load conversations')
    }
  }, [])

  useEffect(() => {
    loadTickets()
    const t = setInterval(loadTickets, POLL_LIST)
    return () => clearInterval(t)
  }, [loadTickets])

  // ── load messages for selected ticket ─────────────────────────────────────

  const loadDetail = useCallback(async (ticketId: string) => {
    setDetailLoading(true)
    try {
      const detail = await adminApi.getSupportTicketDetail(ticketId)
      if (selectedIdRef.current === ticketId) {
        setMessages(detail.messages ?? [])
      }
    } finally {
      if (selectedIdRef.current === ticketId) setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedId) { setMessages([]); return }
    loadDetail(selectedId)
    const t = setInterval(() => {
      if (selectedIdRef.current) loadDetail(selectedIdRef.current)
    }, POLL_DETAIL)
    return () => clearInterval(t)
  }, [selectedId, loadDetail])

  // auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── open thread for a specific user (called from Users page) ─────────────

  useEffect(() => {
    if (!openUserId || tickets.length === 0) return
    const match = tickets.find(t => t.user_id === openUserId)
    if (match) setSelectedId(match.id)
    onOpenUserConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openUserId, tickets])

  // ── send reply ────────────────────────────────────────────────────────────

  async function handleSend() {
    if (!draft.trim() || !selectedId || sending) return
    setSending(true); setSendError('')
    const text = draft.trim()
    setDraft('')
    try {
      const msg = await adminApi.replyToSupportTicket(selectedId, text)
      setMessages(prev => [...prev, msg])
      loadTickets()
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Send failed')
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  async function handleResolve(ticketId: string) {
    try {
      await adminApi.updateSupportTicketStatus(ticketId, 'resolved')
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t))
    } catch { /* ignore */ }
  }

  const selectedTicket = tickets.find(t => t.id === selectedId)

  return (
    <div className="flex h-full">
      {/* ── Left: ticket list ── */}
      <div className="w-[340px] shrink-0 border-r border-[var(--border-color)] flex flex-col">
        <div className="p-4 flex items-center justify-between gap-2 border-b border-[var(--border-color)]">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Support Tickets
            {tickets.length > 0 && (
              <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
                {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length} open
              </span>
            )}
          </span>
          <button
            onClick={loadTickets}
            className="p-2 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && tickets.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-[var(--text-muted)]">Loading…</div>
          ) : error ? (
            <div className="p-4 flex flex-col items-center gap-2 text-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-xs text-[var(--text-muted)]">{error}</p>
              <button onClick={loadTickets} className="text-xs text-violet-400 hover:underline">Retry</button>
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState label="No support messages yet." />
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => {
                  setSelectedId(ticket.id)
                  if (ticket.unread_count > 0) {
                    setTickets((prev) => prev.map((t) => t.id === ticket.id ? { ...t, unread_count: 0 } : t))
                    onOpenTicket?.(ticket.id)
                  }
                }}
                className={`w-full flex items-start gap-3 px-4 py-3.5 border-l-2 text-left transition-colors ${
                  selectedId === ticket.id
                    ? 'bg-violet-600/10 border-violet-500'
                    : 'border-transparent hover:bg-[var(--bg-hover)]'
                }`}
              >
                <Avatar name={ticket.user_name} color="#6d28d9" size={38} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[var(--text-primary)] font-medium text-sm truncate">{ticket.user_name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">{timeAgo(ticket.updated_at)}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                    {ticket.last_message ?? ticket.subject}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <StatusBadge status={ticket.status} />
                    {ticket.priority === 'urgent' && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-semibold">urgent</span>
                    )}
                    {ticket.escalated_to_admin && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-semibold">↑ escalated</span>
                    )}
                  </div>
                </div>
                {ticket.unread_count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {ticket.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right: messages ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedTicket ? (
          <>
            {/* header */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[var(--border-color)] shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={selectedTicket.user_name} color="#6d28d9" size={38} />
                <div>
                  <div className="text-[var(--text-primary)] font-semibold text-sm">{selectedTicket.user_name}</div>
                  <div className="text-xs text-[var(--text-muted)]">#{selectedTicket.id.slice(0, 8)} · {selectedTicket.subject}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={selectedTicket.status} />
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => handleResolve(selectedTicket.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                  >
                    ✓ Resolve
                  </button>
                )}
              </div>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {detailLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-sm text-[var(--text-muted)]">Loading…</div>
              ) : messages.length === 0 ? (
                <EmptyState label="No messages yet." />
              ) : (
                messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender !== 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                        m.sender !== 'user'
                          ? 'bg-violet-600 text-white'
                          : 'bg-[var(--bg-raised)] border border-[var(--border-color)] text-[var(--text-primary)]'
                      }`}
                    >
                      {m.sender === 'admin' && (
                        <div className="text-[10px] text-violet-200 font-semibold mb-1">Admin</div>
                      )}
                      {m.sender === 'agent' && (
                        <div className="text-[10px] text-violet-200 font-semibold mb-1">Support Agent</div>
                      )}
                      <div>{m.text}</div>
                      <div className={`text-[10px] mt-1 ${m.sender !== 'user' ? 'text-violet-200' : 'text-[var(--text-muted)]'}`}>
                        {formatTime(m.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* input */}
            {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' ? (
              <div className="p-4 border-t border-[var(--border-color)] shrink-0">
                {sendError && (
                  <p className="text-xs text-red-400 mb-2">{sendError}</p>
                )}
                <div className="flex items-center gap-3">
                  <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type a reply as admin…"
                    disabled={sending}
                    className="flex-1 bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim() || sending}
                    className="w-11 h-11 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
                This ticket is {selectedTicket.status}.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState label="Select a conversation to view messages." />
          </div>
        )}
      </div>
    </div>
  )
}
