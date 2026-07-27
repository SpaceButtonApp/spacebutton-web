'use client'

import { useState, useMemo } from 'react'
import type { Ticket } from '@/lib/api/support'

interface TicketListProps {
  tickets: Ticket[]
  loading: boolean
  error: string | null
  selectedId: string | null
  onSelect: (id: string) => void
  currentUserId: string
}

const COLOR_MAP: Record<string, string> = {
  open: 'sp-pill-open',
  pending: 'sp-pill-pending',
  urgent: 'sp-pill-urgent',
  resolved: 'sp-pill-resolved',
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

type TabKey = 'active' | 'mine' | 'claimed' | 'resolved'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'mine', label: 'My Tickets' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'resolved', label: 'Resolved' },
]

function isResolved(t: Ticket) {
  return t.status === 'resolved' || t.status === 'closed'
}

export default function TicketList({ tickets, loading, error, selectedId, onSelect, currentUserId }: TicketListProps) {
  const [tab, setTab] = useState<TabKey>('active')

  const filtered = useMemo(() => {
    switch (tab) {
      case 'active':   return tickets.filter(t => !isResolved(t) && !t.assigned_to)
      case 'mine':     return tickets.filter(t => t.assigned_to === currentUserId && !isResolved(t))
      case 'claimed':  return tickets.filter(t => !!t.assigned_to && t.assigned_to !== currentUserId && !isResolved(t))
      case 'resolved': return tickets.filter(t => isResolved(t))
    }
  }, [tickets, tab, currentUserId])

  const counts = useMemo(() => ({
    active:   tickets.filter(t => !isResolved(t) && !t.assigned_to).length,
    mine:     tickets.filter(t => t.assigned_to === currentUserId && !isResolved(t)).length,
    claimed:  tickets.filter(t => !!t.assigned_to && t.assigned_to !== currentUserId && !isResolved(t)).length,
    resolved: tickets.filter(t => isResolved(t)).length,
  }), [tickets, currentUserId])

  const emptyLabel: Record<TabKey, string> = {
    active: 'No active tickets.',
    mine: 'No tickets claimed by you.',
    claimed: 'No tickets claimed by others.',
    resolved: 'No resolved tickets.',
  }

  return (
    <div className="sp-main-panel">
      <div className="sp-inner-topbar">
        <h2>Messages</h2>
        <div className="sp-inner-topbar-actions">
          {loading ? (
            <span style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>Refreshing…</span>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>
              {tickets.length} total
            </span>
          )}
        </div>
      </div>

      {/* Status tabs */}
      <div style={{
        display: 'flex',
        gap: 2,
        padding: '6px 12px',
        borderBottom: '1px solid var(--sp-border-primary)',
        overflowX: 'auto',
        flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '4px 9px',
              borderRadius: 12,
              border: 'none',
              fontSize: 11,
              fontWeight: tab === t.key ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: tab === t.key ? 'var(--sp-nav-active-bg)' : 'transparent',
              color: tab === t.key ? 'var(--sp-nav-active-text)' : 'var(--sp-text-muted)',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span style={{
                background: tab === t.key ? 'var(--sp-text-accent)' : 'var(--sp-input-border)',
                color: tab === t.key ? '#fff' : 'var(--sp-text-muted)',
                borderRadius: 8,
                fontSize: 10,
                padding: '1px 5px',
                fontWeight: 700,
                minWidth: 16,
                textAlign: 'center',
              }}>
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="sp-tickets-area">
        {error && tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, fontSize: 13 }}>
            <div style={{ color: 'var(--sp-trend-down)', fontWeight: 600, marginBottom: 6 }}>Failed to load tickets</div>
            <div style={{ color: 'var(--sp-text-muted)', fontSize: 11, wordBreak: 'break-all' }}>{error}</div>
          </div>
        ) : loading && tickets.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--sp-text-muted)', padding: 40, fontSize: 13 }}>
            Loading tickets…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--sp-text-muted)', padding: 40, fontSize: 13 }}>
            {emptyLabel[tab]}
          </div>
        ) : (
          filtered.map(ticket => (
            <button
              key={ticket.id}
              className={`sp-ticket-item${ticket.id === selectedId ? ' selected' : ''}`}
              onClick={() => onSelect(ticket.id)}
            >
              <div className="sp-avatar sp-av-blue" style={{ width: 34, height: 34, fontSize: 11 }}>
                {getInitials(ticket.user_name)}
              </div>

              <div className="sp-ticket-info">
                <span className="sp-ticket-name">{ticket.user_name}</span>
                <span className="sp-ticket-preview">
                  {ticket.last_message ?? ticket.subject}
                </span>
              </div>

              <div className="sp-ticket-meta">
                <span className="sp-ticket-time">{timeAgo(ticket.updated_at)}</span>
                <div className="sp-ticket-pills">
                  <span className={`sp-pill ${COLOR_MAP[ticket.status] ?? 'sp-pill-open'}`}>
                    {ticket.status}
                  </span>
                  {ticket.priority === 'urgent' && (
                    <span className="sp-pill sp-pill-urgent">urgent</span>
                  )}
                  {ticket.escalated_to_admin && (
                    <span className="sp-pill" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                      ↑ escalated
                    </span>
                  )}
                  {ticket.assigned_to && (
                    <span style={{
                      background: ticket.assigned_to === currentUserId ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: ticket.assigned_to === currentUserId ? '#10b981' : '#f59e0b',
                      borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 5px',
                    }}>
                      🔒 {ticket.assigned_to === currentUserId ? 'You' : 'Claimed'}
                    </span>
                  )}
                  {ticket.unread_count > 0 && (
                    <span style={{ background: 'var(--sp-trend-down)', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 5px' }}>
                      {ticket.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
