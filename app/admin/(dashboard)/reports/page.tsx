'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { adminApi } from '@/lib/api/admin'
import type { AdminUserReport, AdminListingReport, AdminChatMessagesResponse } from '@/lib/api/admin'
import {
  Flag,
  Building2,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const PAGE_SIZE = 20

type ReportsTab = 'user' | 'listing'

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  harassment: 'Harassment',
  scam: 'Scam / Fraud',
  fake: 'Fake / Misleading',
  inappropriate: 'Inappropriate Content',
  other: 'Other',
  inaccurate_info: 'Inaccurate Info',
  wrong_price: 'Wrong Price',
  already_rented: 'Already Rented',
  duplicate: 'Duplicate Listing',
}

const REASON_COLORS: Record<string, string> = {
  spam: 'bg-orange-500/20 text-orange-400',
  harassment: 'bg-red-500/20 text-red-400',
  scam: 'bg-red-600/20 text-red-500',
  fake: 'bg-yellow-500/20 text-yellow-400',
  inappropriate: 'bg-pink-500/20 text-pink-400',
  other: 'bg-purple-500/20 text-purple-400',
  inaccurate_info: 'bg-yellow-500/20 text-yellow-400',
  wrong_price: 'bg-orange-500/20 text-orange-400',
  already_rented: 'bg-blue-500/20 text-blue-400',
  duplicate: 'bg-gray-500/20 text-gray-400',
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  actioned: 'bg-green-500/20 text-green-400',
  dismissed: 'bg-gray-500/20 text-gray-400',
}

function id8(id?: string | null) {
  return id ? id.slice(0, 8) + '…' : '–'
}

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportsTab>('user')

  // User reports state
  const [userReports, setUserReports] = useState<AdminUserReport[]>([])
  const [userTotal, setUserTotal] = useState(0)
  const [userPage, setUserPage] = useState(1)
  const [userLoading, setUserLoading] = useState(true)
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null)
  const [selectedUserReport, setSelectedUserReport] = useState<AdminUserReport | null>(null)

  // Listing reports state
  const [listingReports, setListingReports] = useState<AdminListingReport[]>([])
  const [listingTotal, setListingTotal] = useState(0)
  const [listingPage, setListingPage] = useState(1)
  const [listingLoading, setListingLoading] = useState(false)
  const [listingActionLoading, setListingActionLoading] = useState<string | null>(null)
  const [selectedListingReport, setSelectedListingReport] = useState<AdminListingReport | null>(null)

  // Chat evidence modal
  const [chatData, setChatData] = useState<AdminChatMessagesResponse | null>(null)
  const [chatLoading, setChatLoading] = useState(false)

  const loadUserReports = useCallback(async (p: number) => {
    setUserLoading(true)
    try {
      const data = await adminApi.getUserReports(p, PAGE_SIZE)
      setUserReports(data.reports ?? [])
      setUserTotal(data.total ?? 0)
    } catch { /* show empty */ }
    finally { setUserLoading(false) }
  }, [])

  const loadListingReports = useCallback(async (p: number) => {
    setListingLoading(true)
    try {
      const data = await adminApi.getListingReports(p, PAGE_SIZE)
      setListingReports(data.reports ?? [])
      setListingTotal(data.total ?? 0)
    } catch { /* show empty */ }
    finally { setListingLoading(false) }
  }, [])

  useEffect(() => { loadUserReports(userPage) }, [userPage]) // eslint-disable-line
  useEffect(() => {
    if (tab === 'listing') loadListingReports(listingPage)
  }, [tab, listingPage]) // eslint-disable-line

  const handleUserAction = async (id: string, status: 'actioned' | 'dismissed') => {
    setUserActionLoading(id)
    try {
      await adminApi.updateUserReport(id, status)
      setUserReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
      if (selectedUserReport?.id === id) setSelectedUserReport((r) => r ? { ...r, status } : null)
    } catch { /* ignore */ }
    finally { setUserActionLoading(null) }
  }

  const handleListingAction = async (id: string, status: 'actioned' | 'dismissed') => {
    setListingActionLoading(id)
    try {
      await adminApi.updateListingReport(id, status)
      setListingReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
      if (selectedListingReport?.id === id) setSelectedListingReport((r) => r ? { ...r, status } : null)
    } catch { /* ignore */ }
    finally { setListingActionLoading(null) }
  }

  const openChat = async (chatId: string) => {
    setChatLoading(true)
    try {
      const data = await adminApi.getChatMessages(chatId)
      setChatData(data)
    } catch { /* ignore */ }
    finally { setChatLoading(false) }
  }

  const userPages = Math.ceil(userTotal / PAGE_SIZE)
  const listingPages = Math.ceil(listingTotal / PAGE_SIZE)

  const pendingUser = userReports.filter((r) => r.status === 'pending').length
  const pendingListing = listingReports.filter((r) => r.status === 'pending').length

  return (
    <div className="min-h-screen">
      <AdminHeader title="Reports" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'User Reports', value: userTotal, color: 'text-red-400', Icon: Flag },
            { label: 'Pending (Users)', value: pendingUser, color: 'text-yellow-400', Icon: AlertCircle },
            { label: 'Listing Reports', value: listingTotal, color: 'text-orange-400', Icon: Building2 },
            { label: 'Pending (Listings)', value: pendingListing, color: 'text-yellow-400', Icon: AlertCircle },
          ].map(({ label, value, color, Icon }) => (
            <div key={label} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <p className="text-sm text-gray-400">{label}</p>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#12121a] border border-gray-800 p-1 rounded-xl w-fit">
          {([
            { key: 'user' as ReportsTab, label: 'User Reports' },
            { key: 'listing' as ReportsTab, label: 'Listing Reports' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === key ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── User Reports Tab ── */}
        {tab === 'user' && (
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
            {userLoading ? (
              <div className="p-12 flex justify-center">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : userReports.length === 0 ? (
              <div className="p-12 text-center">
                <Flag className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">No user reports yet</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/50">
                        {['Reported User', 'Reporter', 'Reason', 'Details', 'Status', 'Date', 'Actions'].map((h) => (
                          <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {userReports.map((r) => (
                        <tr key={r.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                          <td className="px-5 py-4 text-sm font-mono text-red-400">{id8(r.reported_user_id)}</td>
                          <td className="px-5 py-4 text-sm font-mono text-blue-400">{id8(r.reporter_id)}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${REASON_COLORS[r.reason] ?? 'bg-gray-500/20 text-gray-400'}`}>
                              {REASON_LABELS[r.reason] ?? r.reason}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-400 max-w-[180px] truncate" title={r.details ?? ''}>
                            {r.details || '—'}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[r.status ?? ''] ?? 'bg-gray-500/20 text-gray-400'}`}>
                              {(r.status || 'unknown').charAt(0).toUpperCase() + (r.status || 'unknown').slice(1)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => setSelectedUserReport(r)}
                                className="px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                              {r.chat_id && (
                                <button
                                  onClick={() => openChat(r.chat_id!)}
                                  disabled={chatLoading}
                                  className="px-2 py-1 rounded-lg text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50 flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3 h-3" /> Chat
                                </button>
                              )}
                              {r.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUserAction(r.id, 'actioned')}
                                    disabled={userActionLoading === r.id}
                                    className="px-2 py-1 rounded-lg text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                                  >
                                    Action
                                  </button>
                                  <button
                                    onClick={() => handleUserAction(r.id, 'dismissed')}
                                    disabled={userActionLoading === r.id}
                                    className="px-2 py-1 rounded-lg text-xs bg-gray-700 text-gray-400 hover:bg-gray-600 disabled:opacity-50"
                                  >
                                    Dismiss
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-4 border-t border-gray-800/50 flex items-center justify-between">
                  <p className="text-sm text-gray-400">Page {userPage} of {userPages || 1} · {userTotal} reports</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1} className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm">{userPage}</span>
                    <button onClick={() => setUserPage((p) => Math.min(userPages, p + 1))} disabled={userPage >= userPages} className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Listing Reports Tab ── */}
        {tab === 'listing' && (
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
            {listingLoading ? (
              <div className="p-12 flex justify-center">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : listingReports.length === 0 ? (
              <div className="p-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">No listing reports yet</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/50">
                        {['Listing', 'Reporter', 'Reason', 'Details', 'Status', 'Date', 'Actions'].map((h) => (
                          <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {listingReports.map((r) => (
                        <tr key={r.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                          <td className="px-5 py-4">
                            <p className="text-sm text-white">{r.listing_title || id8(r.listing_id)}</p>
                            <p className="text-xs text-gray-500 font-mono">{id8(r.listing_id)}</p>
                          </td>
                          <td className="px-5 py-4 text-sm font-mono text-blue-400">{id8(r.reporter_id)}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${REASON_COLORS[r.reason] ?? 'bg-gray-500/20 text-gray-400'}`}>
                              {REASON_LABELS[r.reason] ?? r.reason}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-400 max-w-[180px] truncate" title={r.details ?? ''}>
                            {r.details || '—'}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[r.status ?? ''] ?? 'bg-gray-500/20 text-gray-400'}`}>
                              {(r.status || 'unknown').charAt(0).toUpperCase() + (r.status || 'unknown').slice(1)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => setSelectedListingReport(r)}
                                className="px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                              {r.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleListingAction(r.id, 'actioned')}
                                    disabled={listingActionLoading === r.id}
                                    className="px-2 py-1 rounded-lg text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                                  >
                                    Action
                                  </button>
                                  <button
                                    onClick={() => handleListingAction(r.id, 'dismissed')}
                                    disabled={listingActionLoading === r.id}
                                    className="px-2 py-1 rounded-lg text-xs bg-gray-700 text-gray-400 hover:bg-gray-600 disabled:opacity-50"
                                  >
                                    Dismiss
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-4 border-t border-gray-800/50 flex items-center justify-between">
                  <p className="text-sm text-gray-400">Page {listingPage} of {listingPages || 1} · {listingTotal} reports</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setListingPage((p) => Math.max(1, p - 1))} disabled={listingPage === 1} className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm">{listingPage}</span>
                    <button onClick={() => setListingPage((p) => Math.min(listingPages, p + 1))} disabled={listingPage >= listingPages} className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── User Report Details Modal ── */}
      {selectedUserReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">User Report Details</h2>
              <button onClick={() => setSelectedUserReport(null)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800/30 rounded-xl p-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reported User</p>
                  <p className="text-xs font-mono text-red-400 break-all">{selectedUserReport.reported_user_id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reported By</p>
                  <p className="text-xs font-mono text-blue-400 break-all">{selectedUserReport.reporter_id}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Reason</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${REASON_COLORS[selectedUserReport.reason] ?? 'bg-gray-500/20 text-gray-400'}`}>
                  {REASON_LABELS[selectedUserReport.reason] ?? selectedUserReport.reason}
                </span>
              </div>
              {selectedUserReport.details && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Details</p>
                  <p className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3">{selectedUserReport.details}</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[selectedUserReport.status ?? ''] ?? 'bg-gray-500/20 text-gray-400'}`}>
                    {(selectedUserReport.status || 'unknown').charAt(0).toUpperCase() + (selectedUserReport.status || 'unknown').slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-xs text-gray-400">{new Date(selectedUserReport.created_at).toLocaleString()}</p>
                </div>
              </div>
              {selectedUserReport.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  {selectedUserReport.chat_id && (
                    <button
                      onClick={() => { openChat(selectedUserReport.chat_id!); setSelectedUserReport(null) }}
                      disabled={chatLoading}
                      className="flex-1 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <MessageSquare className="w-4 h-4" /> View Chat
                    </button>
                  )}
                  <button
                    onClick={() => handleUserAction(selectedUserReport.id, 'actioned')}
                    disabled={userActionLoading === selectedUserReport.id}
                    className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Action
                  </button>
                  <button
                    onClick={() => handleUserAction(selectedUserReport.id, 'dismissed')}
                    disabled={userActionLoading === selectedUserReport.id}
                    className="flex-1 py-2.5 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm font-medium disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Listing Report Details Modal ── */}
      {selectedListingReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Listing Report Details</h2>
              <button onClick={() => setSelectedListingReport(null)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Listing</p>
                <p className="text-sm text-white font-medium">{selectedListingReport.listing_title || 'Unknown'}</p>
                <p className="text-xs font-mono text-gray-500">{selectedListingReport.listing_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Reported By</p>
                <p className="text-xs font-mono text-blue-400 break-all">{selectedListingReport.reporter_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Reason</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${REASON_COLORS[selectedListingReport.reason] ?? 'bg-gray-500/20 text-gray-400'}`}>
                  {REASON_LABELS[selectedListingReport.reason] ?? selectedListingReport.reason}
                </span>
              </div>
              {selectedListingReport.details && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Details</p>
                  <p className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3">{selectedListingReport.details}</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[selectedListingReport.status ?? ''] ?? 'bg-gray-500/20 text-gray-400'}`}>
                    {(selectedListingReport.status || 'unknown').charAt(0).toUpperCase() + (selectedListingReport.status || 'unknown').slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-xs text-gray-400">{new Date(selectedListingReport.created_at).toLocaleString()}</p>
                </div>
              </div>
              {selectedListingReport.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleListingAction(selectedListingReport.id, 'actioned')}
                    disabled={listingActionLoading === selectedListingReport.id}
                    className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Action
                  </button>
                  <button
                    onClick={() => handleListingAction(selectedListingReport.id, 'dismissed')}
                    disabled={listingActionLoading === selectedListingReport.id}
                    className="flex-1 py-2.5 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm font-medium disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Evidence Modal ── */}
      {chatData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white">Chat Evidence</h2>
                {chatData.chat_info && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    User {id8(chatData.chat_info.user_id ?? '')} · Agent {id8(chatData.chat_info.agent_id ?? '')}
                  </p>
                )}
              </div>
              <button onClick={() => setChatData(null)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatData.messages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No messages found</p>
              ) : (
                chatData.messages.map((msg) => (
                  <div key={msg.id} className="bg-gray-800/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-mono text-blue-400">{id8(msg.sender_id)}</p>
                      <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-gray-200">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-800 shrink-0">
              <p className="text-xs text-gray-500 text-center">{chatData.total} messages total · showing page {chatData.page}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
