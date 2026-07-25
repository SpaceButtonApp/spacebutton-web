'use client'

import { useState, useEffect } from 'react'
import type { SupportUser } from '@/lib/api/support'

const ALERTS = [
  '2 urgent tickets need immediate attention',
  '5 new verification requests pending',
  '3 new user reports filed today',
  'Payment disputes spiked by 12% this week',
]

interface TopbarProps {
  activeTab: string
  theme: string
  onThemeToggle: () => void
  user: SupportUser | null
}

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  messages: 'Messages & Tickets',
  users: 'Users',
  verifications: 'Verifications',
  listings: 'Listings',
  transactions: 'Transactions',
  reviews: 'Reviews',
  reports: 'User Reports',
  notifications: 'Notifications',
  settings: 'Settings',
}

export default function Topbar({ activeTab, theme, onThemeToggle, user }: TopbarProps) {
  const [alertIndex, setAlertIndex] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const t = setInterval(() => setAlertIndex(i => (i + 1) % ALERTS.length), 4000)
    return () => clearInterval(t)
  }, [])

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : 'SA'
  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Support Agent'

  return (
    <header className="sp-topbar">
      <h1 className="sp-page-title">{TAB_LABELS[activeTab] ?? activeTab}</h1>

      <div className="sp-topbar-right">
        <div className="sp-rolling-alert-strip">
          <span className="sp-alert-ticker-dot" />
          {ALERTS[alertIndex]}
        </div>

        <div className="sp-search-wrapper">
          <span className="sp-search-icon" style={{ fontSize: 13 }}>🔍</span>
          <input
            className="sp-search-input"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <button className="sp-icon-btn" onClick={onThemeToggle} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button className="sp-icon-btn" title="Notifications">
          🔔
          <span className="sp-notification-dot" />
        </button>

        <button className="sp-icon-btn" title="Settings">⚙️</button>

        <div className="sp-admin-profile-badge">
          <div className="sp-avatar sp-av-purple sp-admin-avatar">{initials}</div>
          <div className="sp-admin-info">
            <span className="sp-admin-name">{displayName}</span>
            <span className="sp-admin-role-label">Support Agent</span>
          </div>
        </div>
      </div>
    </header>
  )
}
