'use client'

import { useState, useEffect, useCallback } from 'react'
import { supportApi } from '@/lib/api/support'
import type { AdminUserReport } from '@/lib/api/admin'

interface GenericListViewProps {
  tab: string
}

export default function GenericListView({ tab }: GenericListViewProps) {
  if (tab === 'reports') return <ReportsView />
  if (tab === 'reviews') return <ReviewsPlaceholder />
  if (tab === 'notifications') return <NotificationsPlaceholder />
  return null
}

// ─── Reports ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { bg: string; color: string }> = {
  pending:   { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  actioned:  { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  dismissed: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
}

function ReportStatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
      {status}
    </span>
  )
}

function ReportsView() {
  const [reports, setReports] = useState<AdminUserReport[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await supportApi.getUserReports(1, 100)
      setReports(data.reports)
      setTotal(data.total)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load reports')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAction(reportId: string, status: 'actioned' | 'dismissed') {
    setActionLoading(reportId)
    try {
      await supportApi.updateUserReport(reportId, status)
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Action failed')
    } finally { setActionLoading(null) }
  }

  const filtered = reports.filter(r => filter === 'all' || r.status === filter)
  const pending = reports.filter(r => r.status === 'pending').length

  return (
    <div className="sp-view-container">
      <div className="sp-view-header-row">
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>User Reports</h2>
          <p style={{ fontSize: 12, color: 'var(--sp-text-muted)', marginTop: 2 }}>
            {loading ? 'Loading…' : `${total} total · ${pending} pending`}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div className="sp-role-filter-group">
          {['all', 'pending', 'actioned', 'dismissed'].map(f => (
            <button
              key={f}
              className={`sp-filter-tab${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ color: 'var(--sp-trend-down)', fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div className="sp-table-card">
        <table className="sp-data-table">
          <thead>
            <tr>
              <th>Reported User</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="sp-table-empty-row">Loading reports…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="sp-table-empty-row">No reports match your filter.</td></tr>
            ) : filtered.map(r => (
              <>
                <tr key={r.id} style={{ cursor: r.details ? 'pointer' : 'default' }} onClick={() => r.details && setExpanded(expanded === r.id ? null : r.id)}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.reported_user_id.slice(0, 8)}…</div>
                    <div style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>Reporter: {r.reporter_id.slice(0, 8)}…</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{r.reason}</td>
                  <td><ReportStatusBadge status={r.status} /></td>
                  <td style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="sp-btn sp-btn-small sp-btn-activate"
                          disabled={actionLoading === r.id}
                          onClick={e => { e.stopPropagation(); handleAction(r.id, 'actioned') }}
                        >
                          {actionLoading === r.id ? '…' : '✓ Action'}
                        </button>
                        <button
                          className="sp-btn sp-btn-small"
                          disabled={actionLoading === r.id}
                          onClick={e => { e.stopPropagation(); handleAction(r.id, 'dismissed') }}
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                {expanded === r.id && r.details && (
                  <tr key={r.id + '-detail'}>
                    <td colSpan={5} style={{ background: 'var(--sp-surface-2)', padding: '10px 16px' }}>
                      <p style={{ fontSize: 12, color: 'var(--sp-text-muted)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--sp-text-primary)' }}>Details: </strong>{r.details}
                      </p>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Reviews placeholder ──────────────────────────────────────────────────────

function ReviewsPlaceholder() {
  return (
    <div className="sp-view-container">
      <div className="sp-view-header-row">
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Reviews</h2>
      </div>
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--sp-text-muted)', fontSize: 13 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
        <p>Agent reviews will be shown here.</p>
        <p style={{ fontSize: 12, marginTop: 6 }}>Coming soon.</p>
      </div>
    </div>
  )
}

// ─── Notifications placeholder ────────────────────────────────────────────────

function NotificationsPlaceholder() {
  return (
    <div className="sp-view-container">
      <div className="sp-view-header-row">
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Notifications</h2>
      </div>
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--sp-text-muted)', fontSize: 13 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
        <p>Real-time notifications coming soon.</p>
      </div>
    </div>
  )
}
