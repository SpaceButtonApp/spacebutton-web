'use client'

type Ticket = {
  id: string
  user: { name: string; initials: string; color: string }
  subject: string
  preview: string
  status: string
  time: string
  escalated: boolean
}

interface TicketItemProps {
  ticket: Ticket
  selected: boolean
  onClick: () => void
}

const COLOR_MAP: Record<string, string> = {
  blue: 'sp-av-blue',
  amber: 'sp-av-amber',
  teal: 'sp-av-teal',
  coral: 'sp-av-coral',
  purple: 'sp-av-purple',
}

export default function TicketItem({ ticket, selected, onClick }: TicketItemProps) {
  return (
    <button
      className={`sp-ticket-item${selected ? ' selected' : ''}`}
      onClick={onClick}
    >
      <div className={`sp-avatar ${COLOR_MAP[ticket.user.color] ?? 'sp-av-blue'}`} style={{ width: 36, height: 36, fontSize: 12 }}>
        {ticket.user.initials}
      </div>

      <div className="sp-ticket-info">
        <span className="sp-ticket-name">{ticket.user.name}</span>
        <span className="sp-ticket-preview">{ticket.preview}</span>
      </div>

      <div className="sp-ticket-meta">
        <span className="sp-ticket-time">{ticket.time}</span>
        <span className={`sp-pill sp-pill-${ticket.status}`}>{ticket.status}</span>
        {ticket.escalated && (
          <span className="sp-pill" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>↑ escalated</span>
        )}
      </div>
    </button>
  )
}
