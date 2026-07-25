'use client'

import { useState, useRef, useEffect } from 'react'
import type { TicketDetail, TicketMessage } from '@/lib/api/support'

const CANNED = [
  'Hi! How can I help you today?',
  'I understand your concern. Let me look into this for you.',
  'I have escalated this to our admin team.',
  'This has been resolved. Is there anything else I can help with?',
  'Please allow 24–48 hours for the refund to reflect.',
]

interface ChatPanelProps {
  detail: TicketDetail | null
  detailLoading: boolean
  sending: boolean
  onSendMessage: (ticketId: string, text: string) => Promise<void>
  onSendAdminMessage: (ticketId: string, text: string) => Promise<void>
  onEscalate: (ticketId: string) => Promise<void>
  onResolve: (ticketId: string) => Promise<void>
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPanel({
  detail,
  detailLoading,
  sending,
  onSendMessage,
  onSendAdminMessage,
  onEscalate,
  onResolve,
}: ChatPanelProps) {
  const [chatTab, setChatTab] = useState<'user' | 'admin'>('user')
  const [input, setInput] = useState('')
  const [actionError, setActionError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [detail?.messages, detail?.admin_messages, chatTab])

  // Reset to user tab when ticket changes
  useEffect(() => {
    setChatTab('user')
    setInput('')
    setActionError('')
  }, [detail?.ticket?.id])

  if (!detail && !detailLoading) {
    return (
      <div className="sp-chat-panel sp-chat-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
        <div className="sp-chat-empty-icon" style={{ fontSize: 32 }}>💬</div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--sp-text-primary)' }}>No ticket selected</p>
        <p style={{ fontSize: 12, color: 'var(--sp-text-muted)', textAlign: 'center', maxWidth: 220 }}>
          Select a ticket from the list to start chatting.
        </p>
      </div>
    )
  }

  if (detailLoading && !detail) {
    return (
      <div className="sp-chat-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--sp-text-muted)', fontSize: 13 }}>
        Loading…
      </div>
    )
  }

  const { ticket, messages, admin_messages } = detail!
  const resolved = ticket.status === 'resolved' || ticket.status === 'closed'

  async function send() {
    const text = input.trim()
    if (!text || resolved || sending) return
    setActionError('')
    try {
      if (chatTab === 'user') await onSendMessage(ticket.id, text)
      else await onSendAdminMessage(ticket.id, text)
      setInput('')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Send failed')
    }
  }

  async function handleEscalate() {
    setActionError('')
    try { await onEscalate(ticket.id) } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Escalation failed')
    }
  }

  async function handleResolve() {
    setActionError('')
    try { await onResolve(ticket.id) } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to resolve')
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const displayMessages: TicketMessage[] = chatTab === 'user' ? messages : admin_messages

  return (
    <div className="sp-chat-panel">
      {/* Header */}
      <div className="sp-chat-header">
        <div className="sp-avatar sp-av-blue" style={{ width: 36, height: 36, fontSize: 13 }}>
          {ticket.user_name.slice(0, 2).toUpperCase()}
        </div>
        <div className="sp-chat-header-info">
          <p className="sp-chat-name">{ticket.user_name}</p>
          <p className="sp-chat-sub">#{ticket.id.slice(0, 8)} · {ticket.subject}</p>
        </div>
        <div className="sp-chat-header-actions">
          {resolved ? (
            <span className="sp-resolved-tag">✓ {ticket.status}</span>
          ) : (
            <>
              {ticket.escalated_to_admin && (
                <span className="sp-escalated-tag">⚠ Escalated</span>
              )}
              {!ticket.escalated_to_admin && (
                <button className="sp-btn sp-btn-small" onClick={handleEscalate}>
                  ↑ Escalate
                </button>
              )}
              <button className="sp-btn sp-btn-small sp-btn-resolve" onClick={handleResolve}>
                ✓ Resolve
              </button>
            </>
          )}
        </div>
      </div>

      {actionError && (
        <div style={{ padding: '6px 16px', background: 'rgba(220,38,38,0.08)', color: 'var(--sp-trend-down)', fontSize: 12 }}>
          {actionError}
        </div>
      )}

      {/* Tab bar */}
      <div className="sp-chat-tab-bar">
        <button className={`sp-chat-tab${chatTab === 'user' ? ' active' : ''}`} onClick={() => setChatTab('user')}>
          💬 Chat with User
        </button>
        <button className={`sp-chat-tab${chatTab === 'admin' ? ' active' : ''}`} onClick={() => setChatTab('admin')}>
          🔐 Admin Escalation
          {ticket.escalated_to_admin && admin_messages.length === 0 && (
            <span className="sp-tab-dot" />
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="sp-chat-content">
        {chatTab === 'admin' && !ticket.escalated_to_admin ? (
          <div className="sp-escalate-placeholder">
            <div className="sp-escalate-icon" style={{ fontSize: 28 }}>🔐</div>
            <h3>Admin Escalation</h3>
            <p>Escalate this ticket to bring admin attention. Use this for payment disputes, policy violations, or issues beyond your scope.</p>
            <button className="sp-btn sp-btn-primary sp-escalate-btn" onClick={handleEscalate}>
              ↑ Escalate to Admin
            </button>
          </div>
        ) : (
          <>
            {chatTab === 'admin' && (
              <div className="sp-admin-info-banner">
                ⚠ This thread is visible to admin only — not the user.
              </div>
            )}
            <div className={`sp-chat-messages${chatTab === 'admin' ? ' sp-admin-chat-messages' : ''}`}>
              {displayMessages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--sp-text-muted)', fontSize: 13, padding: 20 }}>
                  {chatTab === 'user' ? 'No messages yet.' : 'No escalation messages yet.'}
                </div>
              )}
              {displayMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`sp-msg sp-msg-${msg.sender === 'user' ? 'user' : 'agent'}${msg.sender === 'admin' ? ' sp-admin-msg' : ''}`}
                >
                  {msg.sender === 'admin' && (
                    <span className="sp-msg-sender-label">Admin</span>
                  )}
                  <div className="sp-msg-bubble">{msg.text}</div>
                  <span className="sp-msg-time">{formatTime(msg.created_at)}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {!resolved && (
              <div className="sp-canned-bar">
                {CANNED.map((c, i) => (
                  <button key={i} className="sp-canned-btn" onClick={() => setInput(c)}>
                    {c.slice(0, 30)}{c.length > 30 ? '…' : ''}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      {(!resolved && (chatTab === 'user' || ticket.escalated_to_admin)) && (
        <div className={`sp-chat-input-area${chatTab === 'admin' ? ' sp-admin-wrapper' : ''}`}>
          <button className="sp-send-btn sp-mic-btn" title="Voice">🎤</button>
          <input
            className="sp-chat-input"
            placeholder={chatTab === 'user' ? 'Type a reply…' : 'Message admin…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={sending}
          />
          <button
            className="sp-send-btn"
            onClick={send}
            disabled={!input.trim() || sending}
            title="Send"
          >
            {sending ? '…' : '➤'}
          </button>
        </div>
      )}
    </div>
  )
}
