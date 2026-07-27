'use client'

import type { SupportUser } from '@/lib/api/support'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'messages', label: 'Messages', icon: '💬', badge: '5', badgeColor: 'red' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'verifications', label: 'Verifications', icon: '🪪', badge: '2', badgeColor: 'green' },
  { id: 'listings', label: 'Listings', icon: '🏠' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
  { id: 'reports', label: 'Reports', icon: '🚩' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  user: SupportUser | null
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export default function Sidebar({ activeTab, onTabChange, onLogout, user, collapsed, onToggleCollapse }: SidebarProps) {
  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : 'SA'
  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Support Agent'

  return (
    <aside className={`sp-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sp-sidebar-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png"
          alt="SpaceButton"
          className="sp-logo-image"
        />
        <div className="sp-logo-text-group">
          <span className="sp-logo-title">SpaceButton</span>
          <span className="sp-logo-subtitle">Support Portal</span>
        </div>
      </div>

      <button
        className="sp-sidebar-collapse-btn"
        onClick={onToggleCollapse}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          padding: '2px 6px',
          marginBottom: 2,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--sp-text-muted)',
          fontSize: 16,
          borderRadius: 6,
          width: '100%',
          lineHeight: 1,
          transition: 'color 0.15s',
        }}
      >
        {collapsed ? '›' : '‹'}
      </button>

      {!collapsed && <p className="sp-section-title" style={{ marginTop: 0 }}>Navigation</p>}

      <nav className="sp-sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sp-nav-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onTabChange(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span className={`sp-badge sp-badge-${item.badgeColor}`}>{item.badge}</span>
            )}
          </button>
        ))}

        <button
          className="sp-nav-item sp-sidebar-logout"
          onClick={onLogout}
          title={collapsed ? 'Log out' : undefined}
        >
          <span style={{ fontSize: 16 }}>↩</span>
          <span>Log out</span>
        </button>
      </nav>

      <div className="sp-agent-profile" style={{ marginTop: 12 }}>
        <div className="sp-avatar sp-av-purple" style={{ width: 34, height: 34, fontSize: 12 }}>
          {initials}
        </div>
        <div className="sp-agent-profile-details">
          <span className="sp-agent-name">{displayName}</span>
          <span className="sp-agent-status">
            <span className="sp-online-dot" />
            Online
          </span>
        </div>
      </div>
    </aside>
  )
}
