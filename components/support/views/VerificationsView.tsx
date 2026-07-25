'use client'

import { useState } from 'react'
import { verifications as initialVerifications } from '@/lib/data/supportMockData'

const COLOR_MAP: Record<string, string> = { blue: 'sp-av-blue', amber: 'sp-av-amber', teal: 'sp-av-teal', coral: 'sp-av-coral', purple: 'sp-av-purple' }

type Verification = typeof initialVerifications[0] & { reason?: string }

export default function VerificationsView() {
  const [verifications, setVerifications] = useState<Verification[]>(initialVerifications)
  const [selectedId, setSelectedId] = useState<string | null>(initialVerifications[0]?.id ?? null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  const selected = verifications.find(v => v.id === selectedId) ?? null

  function approve(id: string) {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'approved' } : v))
    setShowRejectForm(false)
  }

  function reject(id: string) {
    if (!rejectReason.trim()) return
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'rejected', reason: rejectReason } : v))
    setRejectReason('')
    setShowRejectForm(false)
  }

  return (
    <>
      <div className="sp-split-layout">
        {/* Left — request queue */}
        <div className="sp-split-left">
          <p className="sp-section-title" style={{ marginTop: 0 }}>
            Verification Requests ({verifications.filter(v => v.status === 'pending').length} pending)
          </p>
          <div className="sp-request-list">
            {verifications.map(v => (
              <button
                key={v.id}
                className={`sp-request-item${selectedId === v.id ? ' active' : ''}`}
                onClick={() => { setSelectedId(v.id); setShowRejectForm(false) }}
              >
                <div className={`sp-avatar sp-request-avatar ${COLOR_MAP[v.user.color] ?? 'sp-av-blue'}`}>{v.user.initials}</div>
                <div className="sp-request-info">
                  <span className="sp-request-name">{v.user.name}</span>
                  <span className="sp-request-meta">{v.docType} · {v.submittedAt}</span>
                </div>
                <span className={`sp-status-badge sp-status-${v.status}`}>{v.status}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right — auditor panel */}
        <div className="sp-split-right">
          {!selected ? (
            <div className="sp-auditor-empty">
              <span style={{ fontSize: 28 }}>🪪</span>
              <p>Select a verification request to review</p>
            </div>
          ) : (
            <div className="sp-auditor-panel">
              <div className="sp-auditor-header">
                <div>
                  <h3>Identity Verification</h3>
                  <p>Review the submitted documents carefully before making a decision.</p>
                </div>
                <span className={`sp-status-badge sp-status-${selected.status}`}>{selected.status}</span>
              </div>

              <div className="sp-auditor-profile-card">
                <div className={`sp-avatar sp-auditor-avatar ${COLOR_MAP[selected.user.color] ?? 'sp-av-blue'}`}>{selected.user.initials}</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{selected.user.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>{selected.user.email}</p>
                  <div className="sp-doc-meta-badge">
                    🪪 {selected.docType} · {selected.docNumber}
                  </div>
                </div>
              </div>

              <div className="sp-doc-preview-grid">
                <div className="sp-preview-box">
                  <span className="sp-preview-label">ID Document</span>
                  <div className="sp-preview-image-wrapper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.docImage}
                      alt="ID document"
                      className="sp-preview-img"
                      onClick={() => setLightboxImg(selected.docImage)}
                    />
                  </div>
                </div>
                <div className="sp-preview-box">
                  <span className="sp-preview-label">Selfie Photo</span>
                  <div className="sp-preview-image-wrapper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.selfieImage}
                      alt="Selfie"
                      className="sp-preview-img"
                      onClick={() => setLightboxImg(selected.selfieImage)}
                    />
                  </div>
                </div>
              </div>

              <div className="sp-auditor-actions">
                {selected.status === 'pending' ? (
                  <>
                    <div className="sp-auditor-action-btns" style={{ marginBottom: showRejectForm ? 16 : 0 }}>
                      <button className="sp-btn sp-btn-primary sp-btn-approve" onClick={() => approve(selected.id)}>
                        ✓ Approve
                      </button>
                      <button className="sp-btn sp-btn-reject" onClick={() => setShowRejectForm(s => !s)}>
                        ✕ Reject
                      </button>
                    </div>
                    {showRejectForm && (
                      <div className="sp-reject-form">
                        <label className="sp-form-label">Reason for rejection</label>
                        <textarea
                          className="sp-form-textarea"
                          placeholder="e.g. Document photo is blurry or does not match the selfie."
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                        />
                        <div className="sp-form-action-btns">
                          <button className="sp-btn sp-btn-small" onClick={() => setShowRejectForm(false)}>Cancel</button>
                          <button className="sp-btn sp-btn-small sp-btn-primary" onClick={() => reject(selected.id)} disabled={!rejectReason.trim()}>
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="sp-auditor-result">
                    {selected.status === 'approved' ? (
                      <div className="sp-result-approved">✓ Approved — identity verified</div>
                    ) : (
                      <div className="sp-result-rejected">
                        <span>✕ Rejected</span>
                        {selected.reason && <span style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>Reason: {selected.reason}</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxImg && (
        <div className="sp-lightbox" onClick={() => setLightboxImg(null)}>
          <div className="sp-lightbox-content">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxImg} alt="Preview" className="sp-lightbox-img" />
            <button className="sp-btn-close-lightbox" onClick={() => setLightboxImg(null)}>✕ Close</button>
          </div>
        </div>
      )}
    </>
  )
}
