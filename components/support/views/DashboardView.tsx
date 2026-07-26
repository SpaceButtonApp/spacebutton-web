'use client'

import { useEffect, useState } from 'react'
import MiniCharts from '../analytics/MiniCharts'
import { supportApi, type Ticket } from '@/lib/api/support'

interface DashboardViewProps {
  onTabChange: (tab: string) => void
}

interface Metrics {
  open: number
  urgent: number
  resolvedToday: number
  total: number
}

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

function computeMetrics(tickets: Ticket[]): Metrics {
  const open = tickets.filter(t => t.status === 'open' || t.status === 'pending').length
  const urgent = tickets.filter(
    t => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed'
  ).length
  const resolvedToday = tickets.filter(t => t.status === 'resolved' && isToday(t.updated_at)).length
  return { open, urgent, resolvedToday, total: tickets.length }
}

const QUICK_ACTIONS = [
  { label: 'View Messages', desc: 'Open tickets and active conversations', tab: 'messages', icon: '💬' },
  { label: 'Review Verifications', desc: 'Approve or reject pending ID verifications', tab: 'verifications', icon: '🪪' },
  { label: 'Check Reports', desc: 'Review user and listing reports', tab: 'reports', icon: '🚩' },
  { label: 'Manage Users', desc: 'View user accounts and activity', tab: 'users', icon: '👥' },
]

export default function DashboardView({ onTabChange }: DashboardViewProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supportApi
      .getTickets({ page_size: 200 })
      .then(data => setMetrics(computeMetrics(data.tickets)))
      .catch(() => setMetrics({ open: 0, urgent: 0, resolvedToday: 0, total: 0 }))
      .finally(() => setLoading(false))
  }, [])

  const v = (n: number | undefined) => (loading ? '…' : String(n ?? 0))

  const metricCards = [
    {
      label: 'Open Tickets',
      value: v(metrics?.open),
      sub: loading ? '' : `${metrics?.total ?? 0} total across all statuses`,
      subClass: 'sp-trend-neutral',
      iconTheme: 'theme-blue',
      icon: '🎫',
    },
    {
      label: 'Avg. Response Time',
      value: '—',
      sub: 'Coming soon',
      subClass: 'sp-trend-neutral',
      iconTheme: 'theme-indigo',
      icon: '⏱',
    },
    {
      label: 'Resolved Today',
      value: v(metrics?.resolvedToday),
      sub: loading ? '' : 'Tickets closed since midnight',
      subClass: (metrics?.resolvedToday ?? 0) > 0 ? 'sp-trend-up' : 'sp-trend-neutral',
      iconTheme: 'theme-green',
      icon: '✓',
    },
    {
      label: 'Urgent Tickets',
      value: v(metrics?.urgent),
      sub: loading ? '' : (metrics?.urgent ?? 0) > 0 ? 'Needs attention' : 'None right now',
      subClass: (metrics?.urgent ?? 0) > 0 ? 'sp-trend-urgent' : 'sp-trend-neutral',
      iconTheme: 'theme-red',
      icon: '⚠',
    },
  ]

  return (
    <div className="sp-view-container">
      <div className="sp-welcome-banner">
        <h2>{greeting}, Support Agent 👋</h2>
        <p>Here is your support dashboard overview for today.</p>
        <div className="sp-welcome-glow" />
      </div>

      <div className="sp-metrics-grid">
        {metricCards.map(m => (
          <div key={m.label} className="sp-metric-card">
            <div className="sp-metric-card-header">
              <span style={{ fontSize: 12, color: 'var(--sp-text-muted)', fontWeight: 600 }}>{m.label}</span>
              <div className={`sp-metric-icon-wrapper ${m.iconTheme}`}>{m.icon}</div>
            </div>
            <div className="sp-metric-value">{m.value}</div>
            <div className={`sp-metric-sub ${m.subClass}`}>{m.sub}</div>
          </div>
        ))}
      </div>

      <p className="sp-section-title">Quick Actions</p>
      <div className="sp-quick-actions-grid">
        {QUICK_ACTIONS.map(a => (
          <button key={a.tab} className="sp-quick-action-card" onClick={() => onTabChange(a.tab)}>
            <div className="sp-quick-action-icon">{a.icon}</div>
            <div className="sp-quick-action-content">
              <h4>{a.label}</h4>
              <p>{a.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="sp-section-title">Ticket Analytics</p>
      <div className="sp-charts-section">
        <MiniCharts />
      </div>
    </div>
  )
}
