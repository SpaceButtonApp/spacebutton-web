'use client'

import { useState, useEffect } from 'react'
import { supportApi, type AdminUser } from '@/lib/api/support'

type VerifTab = 'verified' | 'pending' | 'partial'

interface VerifiedUser {
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string | null
  role: string
  id_type: string | null
}

interface VerifRecord {
  user_id: string
  id_type: string | null
  id_verification_status: string
  live_verification_status: string
  is_identity_verified: boolean
  is_live_verified: boolean
  created_at: string | null
}

const ID_LABEL: Record<string, string> = {
  NIN: 'NIN',
  PASSPORT: 'Passport',
  DRIVERS_LICENSE: "Driver's Licence",
  VOTER_CARD: 'Voter Card',
}

const STATUS_COLOR: Record<string, string> = {
  approved: '#10b981',
  pending: '#f59e0b',
  rejected: '#ef4444',
  none: 'var(--sp-text-muted)',
}

function StatusDot({ status }: { status: string }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 8, height: 8, borderRadius: '50%',
      background: STATUS_COLOR[status] ?? STATUS_COLOR.none,
      marginRight: 5,
    }} />
  )
}

function getInitials(first: string, last: string) {
  return `${(first || '')[0] ?? ''}${(last || '')[0] ?? ''}`.toUpperCase() || '?'
}

const AVATAR_COLORS = ['sp-av-blue', 'sp-av-amber', 'sp-av-teal', 'sp-av-coral', 'sp-av-purple']

export default function VerificationsView() {
  const [activeTab, setActiveTab] = useState<VerifTab>('verified')

  const [verified, setVerified] = useState<VerifiedUser[]>([])
  const [pending, setPending] = useState<VerifRecord[]>([])
  const [partial, setPartial] = useState<VerifRecord[]>([])
  const [userMap, setUserMap] = useState<Record<string, AdminUser>>({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([
      supportApi.getVerifiedUsers(),
      supportApi.getPendingVerifications(),
      supportApi.getPartialVerifications(),
      supportApi.getUsers({ page_size: 100 }),
    ])
      .then(([verifiedData, pendingData, partialData, usersData]) => {
        setVerified(verifiedData.users)
        setPending(pendingData)
        setPartial(partialData)
        const map: Record<string, AdminUser> = {}
        usersData.users.forEach(u => { map[u.id] = u })
        setUserMap(map)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load verifications'))
      .finally(() => setLoading(false))
  }, [])

  function resolveName(userId: string): { name: string; email: string } {
    const u = userMap[userId]
    if (!u) return { name: userId.slice(0, 8) + '…', email: '—' }
    const name = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—'
    return { name, email: u.email }
  }

  const TABS: { key: VerifTab; label: string; count: number }[] = [
    { key: 'verified', label: 'Verified', count: verified.length },
    { key: 'pending', label: 'Pending Review', count: pending.length },
    { key: 'partial', label: 'Incomplete', count: partial.length },
  ]

  return (
    <>
      <div className="sp-split-layout">
        {/* Left — tab nav */}
        <div className="sp-split-left">
          <p className="sp-section-title" style={{ marginTop: 0 }}>Verification Status</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {TABS.map(t => (
              <button
                key={t.key}
                className={`sp-request-item${activeTab === t.key ? ' active' : ''}`}
                onClick={() => setActiveTab(t.key)}
                style={{ justifyContent: 'space-between' }}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</span>
                <span style={{
                  background: 'var(--sp-surface-2)',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  color: 'var(--sp-text-muted)',
                }}>
                  {loading ? '…' : t.count}
                </span>
              </button>
            ))}
          </div>

          <div style={{
            marginTop: 12,
            padding: '10px 12px',
            background: 'rgba(245,158,11,0.08)',
            borderRadius: 8,
            border: '1px solid rgba(245,158,11,0.2)',
            fontSize: 12,
            color: '#f59e0b',
            lineHeight: 1.5,
          }}>
            ℹ️ Support agents can view verification status only. Approvals and rejections are handled by admins.
          </div>
        </div>

        {/* Right — content */}
        <div className="sp-split-right">
          {error ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--sp-trend-down)', fontSize: 13 }}>
              {error}
            </div>
          ) : loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--sp-text-muted)', fontSize: 13 }}>
              Loading verifications…
            </div>
          ) : activeTab === 'verified' ? (
            <VerifiedList users={verified} />
          ) : activeTab === 'pending' ? (
            <VerifRecordList records={pending} label="Pending Review" resolveName={resolveName} />
          ) : (
            <VerifRecordList records={partial} label="Incomplete" resolveName={resolveName} />
          )}
        </div>
      </div>
    </>
  )
}

function VerifiedList({ users }: { users: VerifiedUser[] }) {
  if (users.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--sp-text-muted)', fontSize: 13 }}>
        No verified users yet.
      </div>
    )
  }
  return (
    <div className="sp-table-card" style={{ margin: 0 }}>
      <table className="sp-data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>ID Type</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.user_id}>
              <td>
                <div className="sp-table-user-cell">
                  <div className={`sp-avatar sp-table-avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {getInitials(u.first_name, u.last_name)}
                  </div>
                  <div>
                    <div className="sp-user-name-strong">
                      {`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>{u.email}</div>
                  </div>
                </div>
              </td>
              <td style={{ fontSize: 12 }}>{u.id_type ? (ID_LABEL[u.id_type] ?? u.id_type) : '—'}</td>
              <td>
                <span className={`sp-role-badge role-${u.role.toLowerCase()}`}>{u.role}</span>
              </td>
              <td>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>✓ Fully Verified</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VerifRecordList({
  records,
  label,
  resolveName,
}: {
  records: VerifRecord[]
  label: string
  resolveName: (userId: string) => { name: string; email: string }
}) {
  if (records.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--sp-text-muted)', fontSize: 13 }}>
        No {label.toLowerCase()} verifications.
      </div>
    )
  }
  return (
    <div className="sp-table-card" style={{ margin: 0 }}>
      <table className="sp-data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>ID Type</th>
            <th>ID Status</th>
            <th>Selfie Status</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => {
            const { name, email } = resolveName(r.user_id)
            return (
              <tr key={r.user_id + i}>
                <td>
                  <div className="sp-table-user-cell">
                    <div className={`sp-avatar sp-table-avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="sp-user-name-strong">{name}</div>
                      <div style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>{email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 12 }}>{r.id_type ? (ID_LABEL[r.id_type] ?? r.id_type) : '—'}</td>
                <td>
                  <span style={{ fontSize: 12 }}>
                    <StatusDot status={r.id_verification_status ?? 'none'} />
                    {r.id_verification_status ?? 'none'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: 12 }}>
                    <StatusDot status={r.live_verification_status ?? 'none'} />
                    {r.live_verification_status ?? 'none'}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
