'use client'

import { useState } from 'react'
import type { SupportUser } from '@/lib/api/support'
import { supportApi } from '@/lib/api/support'

interface SettingsViewProps {
  user: SupportUser | null
}

const NOTIF_TOGGLES = [
  { id: 'new_tickets', label: 'New Tickets', desc: 'Alert when a new support ticket is opened' },
  { id: 'escalations', label: 'Escalations', desc: 'Alert when a ticket is escalated by admin' },
  { id: 'resolved', label: 'Resolved Tickets', desc: 'Alert when a ticket is resolved' },
  { id: 'reports', label: 'New Reports', desc: 'Alert when a new user or listing report is filed' },
]

export default function SettingsView({ user }: SettingsViewProps) {
  const [subTab, setSubTab] = useState<'profile' | 'security' | 'notifications'>('profile')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [pwLoading, setPwLoading] = useState(false)
  const [toggles, setToggles] = useState<Record<string, boolean>>({ new_tickets: true, escalations: true, resolved: false, reports: true })

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (newPw !== confirmPw) { setPwMsg({ text: 'New passwords do not match.', ok: false }); return }
    if (newPw.length < 6) { setPwMsg({ text: 'Password must be at least 6 characters.', ok: false }); return }
    setPwLoading(true)
    try {
      await supportApi.changePassword(currentPw, newPw)
      setPwMsg({ text: 'Password changed successfully.', ok: true })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      setPwMsg({ text: err instanceof Error ? err.message : 'Failed to change password.', ok: false })
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="sp-view-container">
      <div className="sp-settings-view">
        <div className="sp-settings-subbar">
          {(['profile', 'security', 'notifications'] as const).map(t => (
            <button
              key={t}
              className={`sp-settings-subtab${subTab === t ? ' active' : ''}`}
              onClick={() => setSubTab(t)}
            >
              {t === 'profile' ? '👤' : t === 'security' ? '🔒' : '🔔'} {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {subTab === 'profile' && (
          <div className="sp-settings-card">
            <h3>Profile Information</h3>
            <p className="sp-section-desc">Your account details managed by admin.</p>
            <div className="sp-profile-grid">
              <div className="sp-profile-item">
                <span className="sp-profile-label">First Name</span>
                <span className="sp-profile-value">{user?.first_name ?? '—'}</span>
              </div>
              <div className="sp-profile-item">
                <span className="sp-profile-label">Last Name</span>
                <span className="sp-profile-value">{user?.last_name ?? '—'}</span>
              </div>
              <div className="sp-profile-item">
                <span className="sp-profile-label">Email</span>
                <span className="sp-profile-value">{user?.email ?? '—'}</span>
              </div>
              <div className="sp-profile-item">
                <span className="sp-profile-label">Role</span>
                <span className="sp-profile-value">{user?.role ?? 'Support Agent'}</span>
              </div>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--sp-text-muted)', marginTop: 16 }}>
              To update your profile information, contact your system administrator.
            </p>
          </div>
        )}

        {subTab === 'security' && (
          <div className="sp-settings-card">
            <h3>Change Password</h3>
            <p className="sp-section-desc">Update your login password. Use a strong password.</p>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pwMsg && (
                <div
                  className="sp-settings-msg"
                  style={{ color: pwMsg.ok ? 'var(--sp-trend-up)' : 'var(--sp-trend-down)', borderLeft: `3px solid ${pwMsg.ok ? 'var(--sp-trend-up)' : 'var(--sp-trend-down)'}` }}
                >
                  {pwMsg.text}
                </div>
              )}
              <div className="sp-form-group" style={{ marginBottom: 0 }}>
                <label className="sp-form-input-label">Current Password</label>
                <input type="password" className="sp-form-input" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
              </div>
              <div className="sp-form-group" style={{ marginBottom: 0 }}>
                <label className="sp-form-input-label">New Password</label>
                <input type="password" className="sp-form-input" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} />
              </div>
              <div className="sp-form-group" style={{ marginBottom: 0 }}>
                <label className="sp-form-input-label">Confirm New Password</label>
                <input type="password" className="sp-form-input" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
              </div>
              <button type="submit" className="sp-btn sp-btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }} disabled={pwLoading}>
                {pwLoading ? 'Saving…' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {subTab === 'notifications' && (
          <div className="sp-settings-card">
            <h3>Notification Preferences</h3>
            <p className="sp-section-desc">Choose which events trigger a notification.</p>
            <div className="sp-toggle-list">
              {NOTIF_TOGGLES.map(n => (
                <div key={n.id} className="sp-toggle-row">
                  <div className="sp-toggle-info">
                    <h4>{n.label}</h4>
                    <p>{n.desc}</p>
                  </div>
                  <button
                    className={`sp-toggle-switch${toggles[n.id] ? ' active' : ''}`}
                    onClick={() => setToggles(prev => ({ ...prev, [n.id]: !prev[n.id] }))}
                  />
                </div>
              ))}
            </div>
            <button className="sp-btn sp-btn-primary" style={{ padding: '10px 24px' }}>
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
