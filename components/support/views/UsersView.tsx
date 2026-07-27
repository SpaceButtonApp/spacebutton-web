'use client'

import { useState, useEffect, useCallback } from 'react'
import { supportApi, type AdminUser } from '@/lib/api/support'
import { exportSupportTable } from '@/lib/utils/support-export'

const STATUS_CLASS: Record<string, string> = {
  active: 'sp-status-active',
  inactive: 'sp-status-inactive',
  suspended: 'sp-status-suspended',
  pending_verification: 'sp-status-pending',
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  pending_verification: 'Pending Verification',
}

function getInitials(first: string | null, last: string | null) {
  return `${(first ?? '')[0] ?? ''}${(last ?? '')[0] ?? ''}`.toUpperCase() || '?'
}

const AVATAR_COLORS = ['sp-av-blue', 'sp-av-amber', 'sp-av-teal', 'sp-av-coral', 'sp-av-purple']

const PAGE_SIZE = 50

export default function UsersView() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [profileUser, setProfileUser] = useState<AdminUser | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await supportApi.getUsers({ page, page_size: PAGE_SIZE, role: roleFilter === 'all' ? undefined : roleFilter })
      setUsers(data.users)
      setTotal(data.total)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [roleFilter, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Reset to page 1 when role changes
  useEffect(() => { setPage(1) }, [roleFilter])

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (u.first_name ?? '').toLowerCase().includes(q) ||
      (u.last_name ?? '').toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  })

  async function toggleStatus(user: AdminUser) {
    setActionLoading(user.id)
    try {
      if (user.status === 'active') {
        await supportApi.suspendUser(user.id)
      } else {
        await supportApi.activateUser(user.id)
      }
      await fetchUsers()
      if (profileUser?.id === user.id) setProfileUser(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="sp-view-container">
      <div className="sp-view-header-row">
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Users</h2>
          <p style={{ fontSize: 12, color: 'var(--sp-text-muted)', marginTop: 2 }}>
            {loading ? 'Loading…' : `${total} total users`}
          </p>
        </div>
        <button
          className="sp-btn-excel"
          onClick={() => exportSupportTable(users as unknown as Record<string, unknown>[], 'users')}
        >
          📊 Export
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="sp-role-filter-group">
          {[
            { value: 'all', label: 'All' },
            { value: 'user', label: 'Individual' },
            { value: 'agent', label: 'Agent' },
          ].map(r => (
            <button
              key={r.value}
              className={`sp-filter-tab${roleFilter === r.value ? ' active' : ''}`}
              onClick={() => setRoleFilter(r.value)}
            >
              {r.label}
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

      {error && (
        <div style={{ color: 'var(--sp-trend-down)', fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div className="sp-table-card" style={{ marginBottom: 16 }}>
        <table className="sp-data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Email Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="sp-table-empty-row">Loading users…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="sp-table-empty-row">No users match your filter.</td></tr>
            ) : filtered.map((u, i) => (
              <tr key={u.id}>
                <td>
                  <div className="sp-table-user-cell">
                    <div className={`sp-avatar sp-table-avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      {getInitials(u.first_name, u.last_name)}
                    </div>
                    <div>
                      <div className="sp-user-name-strong">
                        {u.first_name || u.last_name ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() : '—'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`sp-role-badge role-${u.role.toLowerCase()}`}>{u.role}</span>
                </td>
                <td>
                  <span className={`sp-status-badge ${STATUS_CLASS[u.status] ?? ''}`}>
                    {STATUS_LABEL[u.status] ?? u.status}
                  </span>
                </td>
                <td>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: u.is_email_verified ? 'var(--sp-trend-up, #10b981)' : 'var(--sp-text-muted)',
                  }}>
                    {u.is_email_verified ? '✓ Verified' : '✗ Not verified'}
                  </span>
                </td>
                <td style={{ color: 'var(--sp-text-muted)', fontSize: 12 }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="sp-btn sp-btn-small" onClick={() => setProfileUser(u)}>View</button>
                    {u.status !== 'pending_verification' && (
                      <button
                        className={`sp-btn sp-btn-small ${u.status === 'active' ? 'sp-btn-suspend' : 'sp-btn-activate'}`}
                        onClick={() => toggleStatus(u)}
                        disabled={actionLoading === u.id}
                      >
                        {actionLoading === u.id ? '…' : u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            className="sp-btn sp-btn-small"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | 'gap')[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('gap')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === 'gap' ? (
                <span key={`gap-${i}`} style={{ color: 'var(--sp-text-muted)', fontSize: 12 }}>…</span>
              ) : (
                <button
                  key={p}
                  className="sp-btn sp-btn-small"
                  onClick={() => setPage(p as number)}
                  disabled={loading}
                  style={{
                    minWidth: 30,
                    background: page === p ? 'var(--sp-text-accent)' : undefined,
                    color: page === p ? '#fff' : undefined,
                    borderColor: page === p ? 'transparent' : undefined,
                    fontWeight: page === p ? 700 : 500,
                  }}
                >
                  {p}
                </button>
              )
            )
          }

          <button
            className="sp-btn sp-btn-small"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Next →
          </button>

          <span style={{ fontSize: 12, color: 'var(--sp-text-muted)', marginLeft: 4 }}>
            {total} total
          </span>
        </div>
      )}

      {profileUser && (
        <div className="sp-lightbox" onClick={() => setProfileUser(null)}>
          <div className="sp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h3>User Profile</h3>
              <button className="sp-btn sp-btn-small" onClick={() => setProfileUser(null)}>✕ Close</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div className="sp-avatar sp-av-blue" style={{ width: 52, height: 52, fontSize: 18 }}>
                {getInitials(profileUser.first_name, profileUser.last_name)}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16 }}>
                  {`${profileUser.first_name ?? ''} ${profileUser.last_name ?? ''}`.trim() || '—'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>{profileUser.email}</p>
              </div>
            </div>
            <div className="sp-profile-grid">
              <div className="sp-profile-item">
                <span className="sp-profile-label">Role</span>
                <span className="sp-profile-value">{profileUser.role}</span>
              </div>
              <div className="sp-profile-item">
                <span className="sp-profile-label">Status</span>
                <span className="sp-profile-value">{STATUS_LABEL[profileUser.status] ?? profileUser.status}</span>
              </div>
              <div className="sp-profile-item">
                <span className="sp-profile-label">Email Verified</span>
                <span className="sp-profile-value">{profileUser.is_email_verified ? 'Yes' : 'No'}</span>
              </div>
              <div className="sp-profile-item">
                <span className="sp-profile-label">Phone</span>
                <span className="sp-profile-value">{profileUser.phone_number ?? '—'}</span>
              </div>
              <div className="sp-profile-item">
                <span className="sp-profile-label">Joined</span>
                <span className="sp-profile-value">{new Date(profileUser.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
              {profileUser.status !== 'pending_verification' && (
                <button
                  className={`sp-btn ${profileUser.status === 'active' ? 'sp-btn-suspend' : 'sp-btn-activate'}`}
                  onClick={() => toggleStatus(profileUser)}
                  disabled={actionLoading === profileUser.id}
                >
                  {actionLoading === profileUser.id
                    ? '…'
                    : profileUser.status === 'active' ? 'Suspend User' : 'Activate User'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
