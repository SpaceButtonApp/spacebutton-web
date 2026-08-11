'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { SupportUser } from '@/lib/api/support'
import { useTickets } from '@/lib/hooks/useTickets'
import Sidebar from './layout/Sidebar'
import Topbar from './layout/Topbar'
import DashboardView from './views/DashboardView'
import UsersView from './views/UsersView'
import VerificationsView from './views/VerificationsView'
import ListingsView from './views/ListingsView'
import SettingsView from './views/SettingsView'
import GenericListView from './views/GenericListView'
import TicketList from './tickets/TicketList'
import ChatPanel from './chat/ChatPanel'

const NO_SCROLL_WRAPPER_TABS = new Set(['messages', 'verifications'])

export default function SupportApp() {
  const router = useRouter()
  const [user, setUser] = useState<SupportUser | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [theme, setTheme] = useState('dark')
  const [ready, setReady] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const {
    tickets,
    loading: ticketsLoading,
    error: ticketsError,
    detail,
    detailLoading,
    sending,
    selectedId,
    selectTicket,
    seenCounts,
    sendMessage,
    sendAdminMessage,
    escalateTicket,
    resolveTicket,
    claimTicket,
    unclaimTicket,
  } = useTickets()

  useEffect(() => {
    const token = localStorage.getItem('support-token')
    if (!token) { router.replace('/support/login'); return }
    try {
      const stored = localStorage.getItem('support-user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
    const savedTheme = localStorage.getItem('support-theme') ?? 'dark'
    setTheme(savedTheme)
    setReady(true)
  }, [router])

  function handleThemeToggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('support-theme', next)
  }

  function handleLogout() {
    localStorage.removeItem('support-token')
    localStorage.removeItem('support-user')
    localStorage.removeItem('support-theme')
    router.push('/support/login')
  }

  const messagesUnread = tickets.reduce((sum, t) => sum + (t.unread_count ?? 0), 0)

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: '#0b0c10', color: '#94a3b8', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  const noScrollWrapper = NO_SCROLL_WRAPPER_TABS.has(activeTab)

  function renderContent() {
    switch (activeTab) {
      case 'dashboard': return <DashboardView onTabChange={setActiveTab} />
      case 'users': return <UsersView />
      case 'verifications': return <VerificationsView />
      case 'listings': return <ListingsView />
      case 'settings': return <SettingsView user={user} />
      case 'reviews':
      case 'reports':
      case 'notifications':
        return <GenericListView tab={activeTab} />
      case 'messages':
        return (
          <div className="sp-messages-grid">
            <ChatPanel
              detail={detail}
              detailLoading={detailLoading}
              sending={sending}
              currentUserId={user?.id ?? ''}
              onSendMessage={sendMessage}
              onSendAdminMessage={sendAdminMessage}
              onEscalate={escalateTicket}
              onResolve={resolveTicket}
              onClaim={claimTicket}
              onUnclaim={unclaimTicket}
            />
            <TicketList
              tickets={tickets}
              loading={ticketsLoading}
              error={ticketsError}
              selectedId={selectedId}
              onSelect={selectTicket}
              currentUserId={user?.id ?? ''}
              seenCounts={seenCounts}
            />
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="support-portal-root" data-sp-theme={theme}>
      <div className={`sp-dashboard-container${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          user={user}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          badgeCounts={{ messages: messagesUnread }}
        />
        <div className="sp-content-area">
          <Topbar
            activeTab={activeTab}
            theme={theme}
            onThemeToggle={handleThemeToggle}
            user={user}
          />
          {noScrollWrapper ? renderContent() : (
            <div className="sp-content-body">{renderContent()}</div>
          )}
        </div>
      </div>
    </div>
  )
}
