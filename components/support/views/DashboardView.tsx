'use client'

import MiniCharts from '../analytics/MiniCharts'

interface DashboardViewProps {
  onTabChange: (tab: string) => void
}

const METRICS = [
  { label: 'Open Tickets', value: '14', sub: '↑ 3 from yesterday', subClass: 'sp-trend-up', iconTheme: 'theme-blue', icon: '🎫' },
  { label: 'Avg. Response Time', value: '4.2m', sub: 'Last 7 days', subClass: 'sp-trend-neutral', iconTheme: 'theme-indigo', icon: '⏱' },
  { label: 'Resolved Today', value: '9', sub: '↑ 2 from yesterday', subClass: 'sp-trend-up', iconTheme: 'theme-green', icon: '✓' },
  { label: 'Urgent Tickets', value: '2', sub: 'Needs attention', subClass: 'sp-trend-urgent', iconTheme: 'theme-red', icon: '⚠' },
]

const QUICK_ACTIONS = [
  { label: 'View Messages', desc: 'Open tickets and active conversations', tab: 'messages', icon: '💬' },
  { label: 'Review Verifications', desc: 'Approve or reject pending ID verifications', tab: 'verifications', icon: '🪪' },
  { label: 'Check Reports', desc: 'Review user and listing reports', tab: 'reports', icon: '🚩' },
  { label: 'Manage Users', desc: 'View user accounts and activity', tab: 'users', icon: '👥' },
]

export default function DashboardView({ onTabChange }: DashboardViewProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="sp-view-container">
      <div className="sp-welcome-banner">
        <h2>{greeting}, Support Agent 👋</h2>
        <p>Here is your support dashboard overview for today.</p>
        <div className="sp-welcome-glow" />
      </div>

      <div className="sp-metrics-grid">
        {METRICS.map(m => (
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
