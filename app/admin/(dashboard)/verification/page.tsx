'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { AdminHeader } from '@/components/admin/header'
import { adminApi } from '@/lib/api/admin'
import type { PendingVerification, VerifiedUser } from '@/lib/api/admin'
import {
  ShieldCheck,
  ShieldX,
  IdCard,
  Camera,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  ExternalLink,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

type Tab = 'pending' | 'verified'
type ActionType = 'id-approve' | 'id-reject' | 'live-approve' | 'live-reject'

const PAGE_SIZE = 50

function statusBadge(status: string) {
  const s = (status || 'none').toLowerCase()
  if (s === 'pending') return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />Pending</span>
  if (s === 'approved') return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/20 text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Approved</span>
  if (s === 'rejected') return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/20 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Rejected</span>
  return <span className="text-xs text-gray-600">None</span>
}

export default function VerificationPage() {
  const [tab, setTab] = useState<Tab>('pending')

  // ── Pending tab state ──────────────────────────────────────────────────────
  const [verifications, setVerifications] = useState<PendingVerification[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ userId: string; type: 'id' | 'live' } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // ── Verified tab state ─────────────────────────────────────────────────────
  const [verifiedUsers, setVerifiedUsers] = useState<VerifiedUser[]>([])
  const [verifiedTotal, setVerifiedTotal] = useState(0)
  const [verifiedPage, setVerifiedPage] = useState(1)
  const [verifiedLoading, setVerifiedLoading] = useState(false)
  const [verifiedSearch, setVerifiedSearch] = useState('')

  // ── Load pending ───────────────────────────────────────────────────────────
  const loadPending = useCallback(async () => {
    setPendingLoading(true)
    try {
      const list = await adminApi.getPendingVerifications()
      setVerifications(list)
    } catch { /* show empty */ }
    finally { setPendingLoading(false) }
  }, [])

  // ── Load verified ──────────────────────────────────────────────────────────
  const loadVerified = useCallback(async (p = verifiedPage) => {
    setVerifiedLoading(true)
    try {
      const data = await adminApi.getVerifiedUsers(p, PAGE_SIZE)
      setVerifiedUsers(data.users ?? [])
      setVerifiedTotal(data.total ?? 0)
    } catch { /* show empty */ }
    finally { setVerifiedLoading(false) }
  }, [verifiedPage])

  useEffect(() => { loadPending() }, [loadPending])
  useEffect(() => {
    if (tab === 'verified') loadVerified(verifiedPage)
  }, [tab, verifiedPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const selected = verifications.find((v) => v.user_id === selectedId) ?? verifications[0] ?? null

  const handleAction = async (userId: string, action: ActionType, reason?: string) => {
    const key = `${userId}-${action}`
    setActionLoading(key)
    setActionError(null)
    try {
      if (action === 'id-approve') await adminApi.approveIdVerification(userId)
      else if (action === 'id-reject') await adminApi.rejectIdVerification(userId, reason || 'Does not meet requirements')
      else if (action === 'live-approve') await adminApi.approveLiveVerification(userId)
      else if (action === 'live-reject') await adminApi.rejectLiveVerification(userId, reason || 'Does not meet requirements')

      setVerifications((prev) => prev.map((v) => {
        if (v.user_id !== userId) return v
        const approved = action.endsWith('approve')
        if (action.startsWith('id')) {
          return { ...v, id_verification_status: approved ? 'approved' : 'rejected', is_identity_verified: approved }
        } else {
          return { ...v, live_verification_status: approved ? 'approved' : 'rejected', is_live_verified: approved }
        }
      }))

      setRejectModal(null)
      setRejectReason('')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    }
    finally { setActionLoading(null) }
  }

  const pendingCount = verifications.filter((v) =>
    v.id_verification_status === 'pending' || v.live_verification_status === 'pending',
  ).length
  const verifiedCount = verifications.filter((v) => v.is_identity_verified && v.is_live_verified).length
  const notVerifiedCount = verifications.length - verifiedCount

  const filteredVerified = verifiedUsers.filter((u) => {
    if (!verifiedSearch) return true
    const q = verifiedSearch.toLowerCase()
    return `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.user_id.toLowerCase().includes(q)
  })

  const verifiedPages = Math.ceil(verifiedTotal / PAGE_SIZE)

  const handleExportVerified = () => {
    const rows = verifiedUsers.map((u) => [
      u.user_id,
      `${u.first_name} ${u.last_name}`,
      u.email,
      u.id_type || '',
    ].join(','))
    const csv = ['User ID,Name,Email,ID Type', ...rows].join('\n')
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `verified_users_${new Date().toISOString().split('T')[0]}.csv`,
    })
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Verifications" />

      <div className="p-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Total Submissions</p>
            <p className="text-2xl font-bold text-white">{pendingLoading ? '—' : verifications.length}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Fully Verified</p>
            <p className="text-2xl font-bold text-green-400">{pendingLoading ? '—' : verifiedTotal || verifiedCount}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Not Verified</p>
            <p className="text-2xl font-bold text-red-400">{pendingLoading ? '—' : notVerifiedCount}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-400">{pendingLoading ? '—' : pendingCount}</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-[#12121a] border border-gray-800 p-1 rounded-xl w-fit mb-6">
          <button
            onClick={() => setTab('pending')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'pending' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Pending Review
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500 text-black text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('verified')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'verified' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Verified Users
          </button>
        </div>

        {actionError && (
          <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-red-400/60 hover:text-red-400">✕</button>
          </div>
        )}

        {/* ── PENDING TAB ── */}
        {tab === 'pending' && (
          pendingLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : verifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ShieldCheck className="w-16 h-16 text-gray-700 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No pending verifications</h3>
              <p className="text-gray-400 text-sm">All verification requests have been processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List panel */}
              <div className="lg:col-span-1 bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-800/50">
                  <h3 className="font-semibold text-white">Submissions</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{verifications.length} total</p>
                </div>
                <div className="overflow-y-auto max-h-[600px]">
                  {verifications.map((v) => {
                    const hasPending = v.id_verification_status === 'pending' || v.live_verification_status === 'pending'
                    return (
                      <button
                        key={v.user_id}
                        onClick={() => setSelectedId(v.user_id)}
                        className={`w-full p-4 text-left border-b border-gray-800/30 hover:bg-gray-800/30 transition-colors ${
                          (selected?.user_id === v.user_id) ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate font-mono">{v.user_id.slice(0, 16)}…</p>
                            <div className="flex items-center gap-2 mt-1">
                              {hasPending && <span className="text-xs text-yellow-400 font-medium">● Pending</span>}
                              {v.is_identity_verified && v.is_live_verified && <span className="text-xs text-green-400">✓ Verified</span>}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            <div>{v.id_type || '—'}</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Detail panel */}
              {selected && (
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">User ID</p>
                        <p className="text-white font-mono text-sm">{selected.user_id}</p>
                      </div>
                      <a
                        href={`/user/${selected.user_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {selected.created_at && (
                      <p className="text-xs text-gray-600 mt-2">
                        Submitted {new Date(selected.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* ID Verification Card */}
                  <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <IdCard className="w-5 h-5 text-blue-400" />
                        <h4 className="font-semibold text-white">ID Verification</h4>
                      </div>
                      {statusBadge(selected.id_verification_status)}
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-3 text-sm">
                        <span className="text-gray-500 w-32">ID Type</span>
                        <span className="text-white">{selected.id_type || '—'}</span>
                      </div>
                      {selected.id_document_number && (
                        <div className="flex gap-3 text-sm">
                          <span className="text-gray-500 w-32">Document No.</span>
                          <span className="text-white font-mono">{selected.id_document_number}</span>
                        </div>
                      )}
                    </div>

                    {selected.id_document_url ? (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Document Image</p>
                        <div
                          className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-800 cursor-pointer group"
                          onClick={() => setPreviewImage(selected.id_document_url!)}
                        >
                          <Image src={selected.id_document_url} alt="ID document" fill className="object-contain" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 h-24 bg-gray-800/50 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-gray-600">No document uploaded yet</p>
                      </div>
                    )}

                    {selected.id_verification_status === 'pending' && selected.id_document_url && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleAction(selected.user_id, 'id-approve')}
                          disabled={!!actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-400 text-white font-medium rounded-xl disabled:opacity-50"
                        >
                          {actionLoading === `${selected.user_id}-id-approve`
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <CheckCircle className="w-4 h-4" />
                          }
                          Approve ID
                        </button>
                        <button
                          onClick={() => setRejectModal({ userId: selected.user_id, type: 'id' })}
                          disabled={!!actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-xl border border-red-500/30 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Reject ID
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Live Verification Card */}
                  <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-purple-400" />
                        <h4 className="font-semibold text-white">Live (Selfie) Verification</h4>
                      </div>
                      {statusBadge(selected.live_verification_status)}
                    </div>

                    {selected.selfie_url ? (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Selfie Image</p>
                        <div
                          className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-800 cursor-pointer group"
                          onClick={() => setPreviewImage(selected.selfie_url!)}
                        >
                          <Image src={selected.selfie_url} alt="Selfie" fill className="object-contain" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 bg-gray-800/50 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-gray-600">No selfie uploaded yet</p>
                      </div>
                    )}

                    {selected.live_verification_status === 'pending' && selected.selfie_url && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleAction(selected.user_id, 'live-approve')}
                          disabled={!!actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-400 text-white font-medium rounded-xl disabled:opacity-50"
                        >
                          {actionLoading === `${selected.user_id}-live-approve`
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <CheckCircle className="w-4 h-4" />
                          }
                          Approve Selfie
                        </button>
                        <button
                          onClick={() => setRejectModal({ userId: selected.user_id, type: 'live' })}
                          disabled={!!actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-xl border border-red-500/30 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Reject Selfie
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Approve both at once */}
                  {selected.id_verification_status === 'pending' && selected.live_verification_status === 'pending' && selected.id_document_url && selected.selfie_url && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                      <p className="text-sm text-green-300 font-medium mb-3">Both documents look good? Approve everything at once:</p>
                      <button
                        onClick={async () => {
                          setActionLoading('both')
                          try {
                            await Promise.all([
                              adminApi.approveIdVerification(selected.user_id),
                              adminApi.approveLiveVerification(selected.user_id),
                            ])
                            setVerifications((prev) => prev.map((v) =>
                              v.user_id === selected.user_id
                                ? { ...v, id_verification_status: 'approved', live_verification_status: 'approved', is_identity_verified: true, is_live_verified: true }
                                : v,
                            ))
                          } catch { /* ignore */ }
                          finally { setActionLoading(null) }
                        }}
                        disabled={!!actionLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl disabled:opacity-50"
                      >
                        {actionLoading === 'both' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                        Approve ID + Selfie (Fully Verify)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}

        {/* ── VERIFIED USERS TAB ── */}
        {tab === 'verified' && (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, or user ID..."
                  value={verifiedSearch}
                  onChange={(e) => setVerifiedSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <button
                onClick={handleExportVerified}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
              {verifiedLoading ? (
                <div className="p-12 flex justify-center">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : filteredVerified.length === 0 ? (
                <div className="p-12 text-center">
                  <ShieldCheck className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No verified users found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800/50">
                          {['User', 'Email', 'User ID', 'ID Type', ''].map((h) => (
                            <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVerified.map((u) => {
                          const name = `${u.first_name} ${u.last_name}`.trim() || 'Unknown'
                          return (
                            <tr key={u.user_id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                    {(u.first_name || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{name}</p>
                                    <span className="inline-flex items-center gap-1 text-xs text-green-400 mt-0.5">
                                      <ShieldCheck className="w-3 h-3" /> Fully Verified
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-300">{u.email}</td>
                              <td className="px-5 py-4">
                                <span className="text-xs font-mono text-gray-400">{u.user_id.slice(0, 20)}…</span>
                              </td>
                              <td className="px-5 py-4">
                                {u.id_type ? (
                                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                    {u.id_type.replace('_', ' ')}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-600">—</span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <a
                                  href={`mailto:${u.email}`}
                                  className="text-xs text-purple-400 hover:text-purple-300"
                                >
                                  Email
                                </a>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-4 border-t border-gray-800/50 flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      Page {verifiedPage} of {verifiedPages || 1} · {verifiedTotal} verified users
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVerifiedPage((p) => Math.max(1, p - 1))}
                        disabled={verifiedPage === 1}
                        className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 disabled:opacity-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm">{verifiedPage}</span>
                      <button
                        onClick={() => setVerifiedPage((p) => Math.min(verifiedPages, p + 1))}
                        disabled={verifiedPage >= verifiedPages}
                        className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 disabled:opacity-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <ShieldX className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white text-center mb-1">
              Reject {rejectModal.type === 'id' ? 'ID' : 'Selfie'} Verification
            </h3>
            <p className="text-gray-400 text-sm text-center mb-4">Provide a reason so the user knows what to fix.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Image is blurry, ID is expired, face not visible..."
              rows={3}
              className="w-full px-3 py-2.5 bg-[#1a1a24] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl">Cancel</button>
              <button
                onClick={() => handleAction(rejectModal.userId, `${rejectModal.type}-reject` as ActionType, rejectReason)}
                disabled={!!actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-medium rounded-xl disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image preview lightbox */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl w-full max-h-[80vh]">
            <Image src={previewImage} alt="Preview" width={800} height={600} className="object-contain w-full h-full rounded-xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
