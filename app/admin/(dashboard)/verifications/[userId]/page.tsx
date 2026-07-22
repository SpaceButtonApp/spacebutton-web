'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { adminApi } from '@/lib/api/admin'
import type { PendingVerification, AdminUser } from '@/lib/api/admin'
import {
  ArrowLeft, ShieldCheck, ShieldX, Clock, Check, X, Maximize2, User, Mail, Phone,
} from 'lucide-react'
import { ReasonModal, ImageLightbox } from '@/components/admin/shared/Modal'

type DocStatus = 'pending' | 'approved' | 'rejected' | 'none'

function statusBadge(s: DocStatus) {
  if (s === 'approved') return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"><ShieldCheck className="w-3 h-3" />Approved</span>
  if (s === 'rejected') return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/20"><ShieldX className="w-3 h-3" />Rejected</span>
  if (s === 'pending') return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" />Pending Review</span>
  return <span className="text-xs text-[var(--text-muted)]">Not submitted</span>
}

export default function VerificationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [verif, setVerif] = useState<PendingVerification | null>(null)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [lightbox, setLightbox] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<'id' | 'live' | 'both' | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [pending, userData] = await Promise.all([
          adminApi.getPendingVerifications().catch(() => []),
          adminApi.getUser(userId).catch(() => null),
        ])
        const found = (pending as PendingVerification[]).find((p) => p.user_id === userId) ?? null
        setVerif(found)
        setUser(userData)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  const idStatus = (verif?.id_verification_status ?? 'none') as DocStatus
  const liveStatus = (verif?.live_verification_status ?? 'none') as DocStatus
  const bothPending = idStatus === 'pending' && liveStatus === 'pending'

  async function approveId() {
    setActionLoading('approve-id')
    try {
      await adminApi.approveIdVerification(userId)
      setVerif((v) => v ? { ...v, id_verification_status: 'approved', is_identity_verified: true } : v)
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setActionLoading(null) }
  }

  async function approveLive() {
    setActionLoading('approve-live')
    try {
      await adminApi.approveLiveVerification(userId)
      setVerif((v) => v ? { ...v, live_verification_status: 'approved', is_live_verified: true } : v)
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setActionLoading(null) }
  }

  async function approveBoth() {
    setActionLoading('approve-both')
    try {
      await Promise.all([
        adminApi.approveIdVerification(userId),
        adminApi.approveLiveVerification(userId),
      ])
      setVerif((v) => v ? { ...v, id_verification_status: 'approved', live_verification_status: 'approved', is_identity_verified: true, is_live_verified: true } : v)
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setActionLoading(null) }
  }

  async function handleReject(reason: string) {
    if (!rejectTarget) return
    setActionLoading('reject')
    try {
      if (rejectTarget === 'id' || rejectTarget === 'both') {
        await adminApi.rejectIdVerification(userId, reason)
        setVerif((v) => v ? { ...v, id_verification_status: 'rejected', id_document_url: undefined } : v)
      }
      if (rejectTarget === 'live' || rejectTarget === 'both') {
        await adminApi.rejectLiveVerification(userId, reason)
        setVerif((v) => v ? { ...v, live_verification_status: 'rejected', selfie_url: undefined } : v)
      }
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setActionLoading(null); setRejectTarget(null) }
  }

  const name = user ? [user.first_name, user.last_name].filter(Boolean).join(' ') || '—' : '—'

  return (
    <div className="admin-root flex flex-col h-screen overflow-hidden bg-[var(--bg-base)]">
      <AdminHeader />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Verifications
          </button>

          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center text-red-400 py-20">{error}</div>
          )}

          {!loading && !error && (
            <>
              {/* User Info */}
              <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-6 mb-6 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center shrink-0">
                    <User className="w-7 h-7 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold text-[var(--text-primary)]">{name}</div>
                    <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-[var(--text-secondary)]">
                      {user?.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{user.email}</span>}
                      {user?.phone_number && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{user.phone_number}</span>}
                      {user?.role && <span className="capitalize text-[var(--text-tertiary)]">{user.role}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono shrink-0">{userId.slice(0, 14)}…</div>
                </div>
              </div>

              {/* Documents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {/* ID Document */}
                <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-semibold text-[var(--text-primary)] mb-1">ID Document</div>
                      {verif?.id_type && <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{verif.id_type}</div>}
                    </div>
                    {statusBadge(idStatus)}
                  </div>

                  {verif?.id_document_url ? (
                    <div className="relative group mb-4">
                      <img
                        src={verif.id_document_url}
                        alt="ID Document"
                        className="w-full h-48 object-cover rounded-xl border border-[var(--border-color)]"
                      />
                      <button
                        onClick={() => setLightbox(verif.id_document_url!)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-48 rounded-xl border border-[var(--border-color)] bg-[var(--bg-sunken)] flex items-center justify-center mb-4">
                      <span className="text-sm text-[var(--text-muted)]">
                        {idStatus === 'rejected' ? 'Document removed after rejection' : 'No document submitted'}
                      </span>
                    </div>
                  )}

                  {verif?.id_document_number && (
                    <div className="text-xs text-[var(--text-muted)] mb-4 font-mono">Doc no: {verif.id_document_number}</div>
                  )}

                  {idStatus === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRejectTarget('id')}
                        disabled={!!actionLoading}
                        className="flex-1 py-2 rounded-xl bg-red-500/15 text-red-400 font-medium hover:bg-red-500/25 transition-colors flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
                      >
                        <X className="w-4 h-4" /> Reject ID
                      </button>
                      <button
                        onClick={approveId}
                        disabled={!!actionLoading}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
                      >
                        {actionLoading === 'approve-id' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve ID
                      </button>
                    </div>
                  )}
                </div>

                {/* Selfie */}
                <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold text-[var(--text-primary)]">Live Selfie</div>
                    {statusBadge(liveStatus)}
                  </div>

                  {verif?.selfie_url ? (
                    <div className="relative group mb-4">
                      <img
                        src={verif.selfie_url}
                        alt="Selfie"
                        className="w-full h-48 object-cover rounded-xl border border-[var(--border-color)]"
                      />
                      <button
                        onClick={() => setLightbox(verif.selfie_url!)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-48 rounded-xl border border-[var(--border-color)] bg-[var(--bg-sunken)] flex items-center justify-center mb-4">
                      <span className="text-sm text-[var(--text-muted)]">
                        {liveStatus === 'rejected' ? 'Selfie removed after rejection' : 'No selfie submitted'}
                      </span>
                    </div>
                  )}

                  {liveStatus === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRejectTarget('live')}
                        disabled={!!actionLoading}
                        className="flex-1 py-2 rounded-xl bg-red-500/15 text-red-400 font-medium hover:bg-red-500/25 transition-colors flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
                      >
                        <X className="w-4 h-4" /> Reject Selfie
                      </button>
                      <button
                        onClick={approveLive}
                        disabled={!!actionLoading}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
                      >
                        {actionLoading === 'approve-live' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve Selfie
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Approve / Reject Both — only when both are pending */}
              {bothPending && (
                <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
                  <div className="text-sm font-medium text-[var(--text-secondary)] mb-3">Bulk Action — both documents are pending</div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setRejectTarget('both')}
                      disabled={!!actionLoading}
                      className="flex-1 py-2.5 rounded-xl bg-red-500/15 text-red-400 font-medium hover:bg-red-500/25 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject Both
                    </button>
                    <button
                      onClick={approveBoth}
                      disabled={!!actionLoading}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading === 'approve-both' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve Both
                    </button>
                  </div>
                </div>
              )}

              {!verif && (
                <div className="text-center py-20 text-[var(--text-muted)]">
                  No pending verification found for this user.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {lightbox && (
        <ImageLightbox src={lightbox} alt="Document" open={!!lightbox} onClose={() => setLightbox(null)} />
      )}

      <ReasonModal
        open={!!rejectTarget}
        title={
          rejectTarget === 'both' ? 'Reason for rejecting both documents' :
          rejectTarget === 'id' ? 'Reason for rejecting ID document' :
          'Reason for rejecting selfie'
        }
        onSubmit={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  )
}
