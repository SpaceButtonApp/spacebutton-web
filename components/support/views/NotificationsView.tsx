'use client'

import { useState } from 'react'
import { supportApi } from '@/lib/api/support'

export default function NotificationsView() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState<{ text: string; ok: boolean } | null>(null)

  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sending

  async function handleSend() {
    setSending(true)
    setResult(null)
    try {
      const res = await supportApi.broadcastNotification(title.trim(), body.trim())
      setResult({ text: `Sent to ${res.total_users} user${res.total_users === 1 ? '' : 's'} (${res.push_sent} received a push).`, ok: true })
      setTitle('')
      setBody('')
    } catch (err) {
      setResult({ text: err instanceof Error ? err.message : 'Failed to send broadcast.', ok: false })
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
        <h3>Notify All Users</h3>
        <p className="sp-section-desc">Sends a push notification and in-app message to every user, right now.</p>

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
            Send to All Users
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--sp-text-muted)', flex: 1 }}>Send this to every user right now?</span>
            <button className="sp-btn" onClick={() => setConfirming(false)}>Cancel</button>
            <button className="sp-btn sp-btn-primary" disabled={sending} onClick={handleSend}>
              {sending ? 'Sending…' : 'Yes, Send Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
