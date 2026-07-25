'use client'

import { useState, useRef, useEffect } from 'react'

const CANNED = [
  'Hi! How can I help you today?',
  'I understand your concern. Let me look into this for you.',
  'I have escalated this to our admin team.',
  'This has been resolved. Is there anything else I can help with?',
  'Please allow 24–48 hours for the refund to reflect.',
]

type Message = { id: number; from: string; text: string; time: string }
type Ticket = {
  id: string
  user: { name: string; initials: string; color: string }
  subject: string
  status: string
  escalated: boolean
  messages: Message[]
  adminMessages: Message[]
}

interface ChatPanelProps {
  ticket: Ticket | null
  onSendMessage: (ticketId: string, text: string) => void
  onSendAdminMessage: (ticketId: string, text: string) => void
  onEscalate: (ticketId: string) => void
  onResolve: (ticketId: string) => void
}

export default function ChatPanel({ ticket, onSendMessage, onSendAdminMessage, onEscalate, onResolve }: ChatPanelProps) {
  const [chatTab, setChatTab] = useState<'user' | 'admin'>('user')
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages, ticket?.adminMessages, chatTab])

  if (!ticket) {
    return (
      <div className="sp-chat-panel sp-chat-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
        <div className="sp-chat-empty-icon" style={{ fontSize: 32 }}>💬</div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--sp-text-primary)' }}>No ticket selected</p>
        <p style={{ fontSize: 12, color: 'var(--sp-text-muted)', textAlign: 'center', maxWidth: 220 }}>
          Select a ticket from the list to start chatting with the user.
        </p>
      </div>
    )
  }

  const resolved = ticket.status === 'resolved'

  function send() {
    const text = input.trim()
    if (!text || resolved) return
    if (chatTab === 'user') onSendMessage(ticket!.id, text)
    else onSendAdminMessage(ticket!.id, text)
    setInput('')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const messages = chatTab === 'user' ? ticket.messages : ticket.adminMessages

  return (
    <div className="sp-chat-panel">
      {/* Header */}
      <div className="sp-chat-header">
        <div className="sp-avatar sp-av-blue" style={{ width: 36, height: 36, fontSize: 13 }}>
          {ticket.user.initials}
        </div>
        <div className="sp-chat-header-info">
          <p className="sp-chat-name">{ticket.user.name}</p>
          <p className="sp-chat-sub">{ticket.id} · {ticket.subject}</p>
        </div>
        <div className="sp-chat-header-actions">
          {resolved ? (
            <span className="sp-resolved-tag">✓ Resolved</span>
          ) : (
            <>
              {ticket.escalated && (
                <span className="sp-escalated-tag">⚠ Escalated</span>
              )}
              {!ticket.escalated && (
                <button className="sp-btn sp-btn-small" onClick={() => onEscalate(ticket.id)}>
                  ↑ Escalate
                </button>
              )}
              <button className="sp-btn sp-btn-small sp-btn-resolve" onClick={() => onResolve(ticket.id)}>
                ✓ Resolve
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="sp-chat-tab-bar">
        <button
          className={`sp-chat-tab${chatTab === 'user' ? ' active' : ''}`}
          onClick={() => setChatTab('user')}
        >
          💬 Chat with User
        </button>
        <button
          className={`sp-chat-tab${chatTab === 'admin' ? ' active' : ''}`}
          onClick={() => setChatTab('admin')}
        >
          🔐 Admin Escalation
          {ticket.escalated && <span className="sp-tab-dot" />}
        </button>
      </div>

      {/* Messages */}
      <div className="sp-chat-content">
        {chatTab === 'admin' && !ticket.escalated ? (
          <div className="sp-escalate-placeholder">
            <div className="sp-escalate-icon" style={{ fontSize: 28 }}>🔐</div>
            <h3>Admin Escalation</h3>
            <p>Escalate this ticket to bring admin attention. Use this for payment disputes, policy violations, or issues beyond your scope.</p>
            <button
              className="sp-btn sp-btn-primary sp-escalate-btn"
              onClick={() => onEscalate(ticket.id)}
            >
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
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`sp-msg sp-msg-${msg.from}${msg.from === 'admin' ? ' sp-admin-msg' : ''}`}
                >
                  {msg.from === 'admin' && (
                    <span className="sp-msg-sender-label">Admin</span>
                  )}
                  <div className="sp-msg-bubble">{msg.text}</div>
                  <span className="sp-msg-time">{msg.time}</span>
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
      {(!resolved && (chatTab === 'user' || ticket.escalated)) && (
        <div className={`sp-chat-input-area${chatTab === 'admin' ? ' sp-admin-wrapper' : ''}`}>
          <button className="sp-send-btn sp-mic-btn" title="Voice">🎤</button>
          <input
            className="sp-chat-input"
            placeholder={chatTab === 'user' ? 'Type a message…' : 'Message admin…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={resolved}
          />
          <button className="sp-send-btn" onClick={send} disabled={!input.trim()} title="Send">
            ➤
          </button>
        </div>
      )}
    </div>
  )
}
