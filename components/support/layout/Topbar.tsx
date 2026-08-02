'use client'

import { useState } from 'react'
import type { SupportUser } from '@/lib/api/support'

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
  const [search, setSearch] = useState('')

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : 'SA'
  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Support Agent'

  return (
    <header className="sp-topbar">
      <h1 className="sp-page-title">{TAB_LABELS[activeTab] ?? activeTab}</h1>

      <div className="sp-topbar-right">
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
