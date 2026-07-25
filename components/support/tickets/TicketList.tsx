'use client'

import type { Ticket } from '@/lib/api/support'
import MiniCharts from '../analytics/MiniCharts'

interface TicketListProps {
  tickets: Ticket[]
  loading: boolean
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

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'sp-pill-urgent',
  normal: 'sp-pill-open',
  low: 'sp-pill-resolved',
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

export default function TicketList({ tickets, loading, selectedId, onSelect, currentUserId }: TicketListProps) {
  const open = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed')

  return (
    <div className="sp-main-panel">
      <div className="sp-inner-topbar">
        <h2>Active Tickets</h2>
        <div className="sp-inner-topbar-actions">
          {loading ? (
            <span style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>Refreshing…</span>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>
              {open.length} open · {tickets.length} total
            </span>
          )}
        </div>
      </div>

      <div className="sp-tickets-area">
        {loading && tickets.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--sp-text-muted)', padding: 40, fontSize: 13 }}>
            Loading tickets…
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--sp-text-muted)', padding: 40, fontSize: 13 }}>
            No tickets yet.
          </div>
        ) : (
          tickets.map(ticket => (
            <button
              key={ticket.id}
              className={`sp-ticket-item${ticket.id === selectedId ? ' selected' : ''}`}
              onClick={() => onSelect(ticket.id)}
            >
              <div className="sp-avatar sp-av-blue" style={{ width: 36, height: 36, fontSize: 12 }}>
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
                    borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 6px',
                  }}>
                    🔒 {ticket.assigned_to === currentUserId ? 'You' : 'Claimed'}
                  </span>
                )}
                {ticket.unread_count > 0 && (
                  <span style={{ background: 'var(--sp-trend-down)', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>
                    {ticket.unread_count}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <p className="sp-section-title">Analytics</p>
        <div className="sp-charts-section">
          <MiniCharts />
        </div>
      </div>
    </div>
  )
}
