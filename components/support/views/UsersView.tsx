'use client'

import { useState } from 'react'
import { users as initialUsers } from '@/lib/data/supportMockData'
import { exportSupportTable } from '@/lib/utils/support-export'

const COLOR_MAP: Record<string, string> = { blue: 'sp-av-blue', amber: 'sp-av-amber', teal: 'sp-av-teal', coral: 'sp-av-coral', purple: 'sp-av-purple' }

type User = typeof initialUsers[0]

export default function UsersView() {
  const [users, setUsers] = useState(initialUsers)
  const [roleFilter, setRoleFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [profileUser, setProfileUser] = useState<User | null>(null)

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'All' || u.role === roleFilter
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  function toggleStatus(id: string) {
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
      : u
    ))
  }

  return (
    <div className="sp-view-container">
      <div className="sp-view-header-row">
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Users</h2>
          <p style={{ fontSize: 12, color: 'var(--sp-text-muted)', marginTop: 2 }}>{users.length} total users</p>
        </div>
        <button className="sp-btn-excel" onClick={() => exportSupportTable(users as unknown as Record<string, unknown>[], 'users')}>
          📊 Export
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="sp-role-filter-group">
          {['All', 'Individual', 'Agent'].map(r => (
            <button key={r} className={`sp-filter-tab${roleFilter === r ? ' active' : ''}`} onClick={() => setRoleFilter(r)}>
              {r}
            </button>
          ))}
        </div>
        <input
          className="sp-form-input"
          style={{ maxWidth: 240 }}
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="sp-table-card">
        <table className="sp-data-table">
          <thead>
            <tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>OS</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="sp-table-user-cell">
                    <div className={`sp-avatar sp-table-avatar ${COLOR_MAP[u.color] ?? 'sp-av-blue'}`}>{u.initials}</div>
                    <div>
                      <div className="sp-user-name-strong">{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`sp-role-badge role-${u.role.toLowerCase()}`}>{u.role}</span>
                </td>
                <td><span className={`sp-status-badge sp-status-${u.status}`}>{u.status.replace('_', ' ')}</span></td>
                <td style={{ color: 'var(--sp-text-muted)' }}>{u.joined}</td>
                <td style={{ color: 'var(--sp-text-muted)' }}>{u.os}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="sp-btn sp-btn-small" onClick={() => setProfileUser(u)}>View</button>
                    <button
                      className={`sp-btn sp-btn-small ${u.status === 'active' ? 'sp-btn-suspend' : 'sp-btn-activate'}`}
                      onClick={() => toggleStatus(u.id)}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="sp-table-empty-row">No users match your filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Profile modal */}
      {profileUser && (
        <div className="sp-lightbox" onClick={() => setProfileUser(null)}>
          <div className="sp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h3>User Profile</h3>
              <button className="sp-btn sp-btn-small" onClick={() => setProfileUser(null)}>✕ Close</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div className={`sp-avatar ${COLOR_MAP[profileUser.color] ?? 'sp-av-blue'}`} style={{ width: 52, height: 52, fontSize: 18 }}>
                {profileUser.initials}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{profileUser.name}</p>
                <p style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>{profileUser.email}</p>
              </div>
            </div>
            <div className="sp-profile-grid">
              <div className="sp-profile-item"><span className="sp-profile-label">Role</span><span className="sp-profile-value">{profileUser.role}</span></div>
              <div className="sp-profile-item"><span className="sp-profile-label">Status</span><span className="sp-profile-value">{profileUser.status}</span></div>
              <div className="sp-profile-item"><span className="sp-profile-label">Joined</span><span className="sp-profile-value">{profileUser.joined}</span></div>
              <div className="sp-profile-item"><span className="sp-profile-label">Device OS</span><span className="sp-profile-value">{profileUser.os}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
