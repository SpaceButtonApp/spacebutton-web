'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X } from 'lucide-react'
import { supportApi, AdminUser, NotificationBroadcastRequest, NotificationTargetType } from '@/lib/api/support'

const AUDIENCE_OPTIONS: { value: NotificationTargetType; label: string }[] = [
  { value: 'all', label: 'All Users' },
  { value: 'agent', label: 'Agents Only' },
  { value: 'user', label: 'Individuals Only' },
  { value: 'specific', label: 'Specific User' },
]

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  pending: { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  sent: { background: 'rgba(52,211,153,0.15)', color: '#34d399' },
  rejected: { background: 'rgba(248,113,113,0.15)', color: '#f87171' },
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NotificationsView() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState<{ text: string; ok: boolean } | null>(null)

  const [targetType, setTargetType] = useState<NotificationTargetType>('all')
  const [userQuery, setUserQuery] = useState('')
  const [userResults, setUserResults] = useState<AdminUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([])
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [mine, setMine] = useState<NotificationBroadcastRequest[]>([])
  const [mineLoading, setMineLoading] = useState(true)

  const loadMine = useCallback(async () => {
    try {
      const res = await supportApi.getMyNotifications()
      setMine(res.requests || [])
    } catch {
      // Non-critical — history list just stays empty on failure
    } finally {
      setMineLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMine()
  }, [loadMine])

  useEffect(() => {
    if (targetType !== 'specific' || userQuery.trim().length < 2) {
      setUserResults([])
      return
    }
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(async () => {
      try {
        const res = await supportApi.getUsers({ page: 1, page_size: 10, search: userQuery.trim() })
        setUserResults(res.users || [])
      } catch {
        setUserResults([])
      }
    }, 350)
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current)
    }
  }, [userQuery, targetType])

  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sending && (targetType !== 'specific' || selectedUsers.length > 0)

  async function handleSend() {
    setSending(true)
    setResult(null)
    try {
      const label = selectedUsers.length > 0
        ? selectedUsers.map((u) => `${u.first_name} ${u.last_name}`.trim() || u.email).join(', ')
        : undefined
      const res = await supportApi.broadcastNotification(title.trim(), body.trim(), targetType, selectedUsers.map((u) => u.id), label)
      setResult({
        text: res.status === 'pending' || res.total_users == null
          ? 'Submitted for admin approval.'
          : `Sent to ${res.total_users} user${res.total_users === 1 ? '' : 's'} (${res.push_sent} received a push).`,
        ok: true,
      })
      setTitle('')
      setBody('')
      setSelectedUsers([])
      setUserQuery('')
      setTargetType('all')
      loadMine()
    } catch (err) {
      setResult({ text: err instanceof Error ? err.message : 'Failed to submit notification.', ok: false })
    } finally {
      setSending(false)
      setConfirming(false)
    }
  }

  return (
    <div className="sp-view-container">
      <div className="sp-view-header-row">
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Send Notification</h2>
      </div>

      <div className="sp-settings-card" style={{ maxWidth: 560 }}>
        <h3>Notify Users</h3>
        <p className="sp-section-desc">Submitted notifications need admin approval before they go out — direct pushes/in-app messages, sent when approved.</p>

        <div className="sp-form-group">
          <label className="sp-form-input-label">Audience</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AUDIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="sp-btn"
                style={targetType === opt.value ? { background: 'var(--sp-accent)', color: '#fff', borderColor: 'var(--sp-accent)' } : undefined}
                onClick={() => {
                  setTargetType(opt.value)
                  if (opt.value !== 'specific') {
                    setSelectedUsers([])
                    setUserQuery('')
                  }
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {targetType === 'specific' && (
          <div className="sp-form-group">
            <label className="sp-form-input-label">Users</label>
            {selectedUsers.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {selectedUsers.map((u) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--sp-border)', borderRadius: 999, padding: '6px 8px 6px 14px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{u.first_name} {u.last_name}</span>
                    <button
                      className="sp-btn"
                      onClick={() => setSelectedUsers((prev) => prev.filter((x) => x.id !== u.id))}
                      style={{ padding: 4 }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <input
                className="sp-form-input"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
              />
              {userResults.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 10, marginTop: 4, width: '100%', background: 'var(--sp-bg-card)', border: '1px solid var(--sp-border)', borderRadius: 10, maxHeight: 220, overflowY: 'auto' }}>
                  {userResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUsers((prev) => (prev.some((x) => x.id === u.id) ? prev : [...prev, u]))
                        setUserQuery('')
                        setUserResults([])
                      }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{u.first_name} {u.last_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>{u.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="sp-form-group">
          <label className="sp-form-input-label">Title</label>
          <input
            className="sp-form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Happy New Month! 🎉"
            maxLength={80}
          />
        </div>
        <div className="sp-form-group">
          <label className="sp-form-input-label">Message</label>
          <textarea
            className="sp-form-input"
            style={{ resize: 'none' }}
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write what you want users to see..."
            maxLength={300}
          />
        </div>

        {result && (
          <div
            className="sp-settings-msg"
            style={{ color: result.ok ? 'var(--sp-trend-up)' : 'var(--sp-trend-down)', borderLeft: `3px solid ${result.ok ? 'var(--sp-trend-up)' : 'var(--sp-trend-down)'}` }}
          >
            {result.text}
          </div>
        )}

        {!confirming ? (
          <button
            className="sp-btn sp-btn-primary"
            style={{ padding: '10px 24px', alignSelf: 'flex-start' }}
            disabled={!canSend}
            onClick={() => setConfirming(true)}
          >
            Submit Notification
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--sp-text-muted)', flex: 1 }}>Submit this for admin approval?</span>
            <button className="sp-btn" onClick={() => setConfirming(false)}>Cancel</button>
            <button className="sp-btn sp-btn-primary" disabled={sending} onClick={handleSend}>
              {sending ? 'Submitting…' : 'Yes, Submit'}
            </button>
          </div>
        )}
      </div>

      <div className="sp-settings-card" style={{ maxWidth: 560, marginTop: 20 }}>
        <h3>Your Submissions</h3>
        {mineLoading ? (
          <p className="sp-section-desc">Loading…</p>
        ) : mine.length === 0 ? (
          <p className="sp-section-desc">Nothing submitted yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mine.map((r) => (
              <div key={r.id} style={{ border: '1px solid var(--sp-border)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--sp-text-muted)', marginTop: 2 }}>{r.body}</div>
                    <div style={{ fontSize: 11, color: 'var(--sp-text-muted)', marginTop: 6 }}>
                      {r.target_type === 'specific' ? (r.target_label || '1 user') : AUDIENCE_OPTIONS.find((o) => o.value === r.target_type)?.label} · {timeAgo(r.created_at)}
                    </div>
                    {r.status === 'rejected' && r.rejection_reason && (
                      <div style={{ fontSize: 12, color: '#f87171', marginTop: 6, background: 'rgba(248,113,113,0.08)', borderRadius: 8, padding: '6px 10px' }}>
                        Reason: {r.rejection_reason}
                      </div>
                    )}
                  </div>
                  <span className="sp-pill" style={STATUS_STYLE[r.status]}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
