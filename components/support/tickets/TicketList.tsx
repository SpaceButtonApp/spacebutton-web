'use client'

import TicketItem from './TicketItem'
import MiniCharts from '../analytics/MiniCharts'

type Ticket = {
  id: string
  user: { name: string; initials: string; color: string }
  subject: string
  preview: string
  status: string
  time: string
  escalated: boolean
  messages: unknown[]
  adminMessages: unknown[]
}

interface TicketListProps {
  tickets: Ticket[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function TicketList({ tickets, selectedId, onSelect }: TicketListProps) {
  return (
    <div className="sp-main-panel">
      <div className="sp-inner-topbar">
        <h2>Active Tickets</h2>
        <div className="sp-inner-topbar-actions">
          <span style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>
            {tickets.filter(t => t.status !== 'resolved').length} open
          </span>
        </div>
      </div>

      <div className="sp-tickets-area">
        {tickets.map(ticket => (
          <TicketItem
            key={ticket.id}
            ticket={ticket}
            selected={ticket.id === selectedId}
            onClick={() => onSelect(ticket.id)}
          />
        ))}
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
