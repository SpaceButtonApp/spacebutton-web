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

// These tabs use their own full-height layout instead of sp-content-body scroll wrapper
const NO_SCROLL_WRAPPER_TABS = new Set(['messages', 'verifications'])

export default function SupportApp() {
  const router = useRouter()
  const [user, setUser] = useState<SupportUser | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [theme, setTheme] = useState('dark')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const { tickets, sendMessage, sendAdminMessage, escalateTicket, resolveTicket } = useTickets()

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

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: '#0b0c10', color: '#94a3b8', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) ?? null
  const noScrollWrapper = NO_SCROLL_WRAPPER_TABS.has(activeTab)

  function renderContent() {
    switch (activeTab) {
      case 'dashboard': return <DashboardView onTabChange={setActiveTab} />
      case 'users': return <UsersView />
      case 'verifications': return <VerificationsView />
      case 'listings': return <ListingsView />
      case 'settings': return <SettingsView user={user} />
      case 'transactions':
      case 'reviews':
      case 'reports':
      case 'notifications':
        return <GenericListView tab={activeTab} />
      case 'messages':
        return (
          <div className="sp-messages-grid">
            <TicketList
              tickets={tickets}
              selectedId={selectedTicketId}
              onSelect={setSelectedTicketId}
            />
            <ChatPanel
              ticket={selectedTicket}
              onSendMessage={sendMessage}
              onSendAdminMessage={sendAdminMessage}
              onEscalate={escalateTicket}
              onResolve={resolveTicket}
            />
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="support-portal-root" data-sp-theme={theme}>
      <div className="sp-dashboard-container">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          user={user}
        />

        <div className="sp-content-area">
          <Topbar
            activeTab={activeTab}
            theme={theme}
            onThemeToggle={handleThemeToggle}
            user={user}
          />

          {noScrollWrapper ? (
            renderContent()
          ) : (
            <div className="sp-content-body">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
