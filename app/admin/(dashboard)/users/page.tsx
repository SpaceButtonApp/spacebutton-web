'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { adminApi } from '@/lib/api/admin'
import type { AdminUser } from '@/lib/api/admin'
import {
  Search,
  MoreVertical,
  Mail,
  Ban,
  CheckCircle,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const PAGE_SIZE = 20

type Tab = 'users' | 'agents'

function statusLabel(status: string) {
  return (status || '').toLowerCase()
}

export default function UsersPage() {
  const [tab, setTab] = useState<Tab>('users')

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([])
  const [userTotal, setUserTotal] = useState(0)
  const [userPage, setUserPage] = useState(1)
  const [usersLoading, setUsersLoading] = useState(true)
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [suspendModal, setSuspendModal] = useState<AdminUser | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Agents state
  const [agents, setAgents] = useState<AdminUser[]>([])
  const [agentTotal, setAgentTotal] = useState(0)
  const [agentPage, setAgentPage] = useState(1)
  const [agentsLoading, setAgentsLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  // Load users
  const loadUsers = useCallback(async (p = userPage) => {
    setUsersLoading(true)
    try {
      const data = await adminApi.getUsers(p, PAGE_SIZE)
      setUsers(data.users ?? [])
      setUserTotal(data.total ?? 0)
    } catch { /* show empty */ }
    finally { setUsersLoading(false) }
  }, [userPage])

  // Load agents
  const loadAgents = useCallback(async (p = agentPage) => {
    setAgentsLoading(true)
    try {
      const data = await adminApi.getUsers(p, PAGE_SIZE, 'agent')
      setAgents(data.users ?? [])
      setAgentTotal(data.total ?? 0)
    } catch { /* show empty */ }
    finally { setAgentsLoading(false) }
  }, [agentPage])

  useEffect(() => { loadUsers(userPage) }, [userPage]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tab === 'agents') loadAgents(agentPage)
  }, [tab, agentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
           u.email.toLowerCase().includes(q) ||
           u.id.toLowerCase().includes(q)
  })

  const handleExport = () => {
    const rows = users.map((u) => [
      u.id, `${u.first_name} ${u.last_name}`, u.email, u.role,
      statusLabel(u.status), new Date(u.created_at).toLocaleDateString(),
    ].join(','))
    const csv = ['ID,Name,Email,Role,Status,Joined', ...rows].join('\n')
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `users_${new Date().toISOString().split('T')[0]}.csv`,
    })
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const handleToggleSuspend = async (user: AdminUser) => {
    setActionLoading(true)
    const isSuspended = statusLabel(user.status) === 'suspended'
    try {
      if (isSuspended) {
        await adminApi.activateUser(user.id)
      } else {
        await adminApi.suspendUser(user.id)
      }
      setUsers((prev) => prev.map((u) =>
        u.id === user.id ? { ...u, status: isSuspended ? 'active' : 'suspended' } : u,
      ))
    } catch { /* ignore */ }
    finally { setActionLoading(false); setSuspendModal(null); setShowActionMenu(null) }
  }

  const userPages = Math.ceil(userTotal / PAGE_SIZE)
  const agentPages = Math.ceil(agentTotal / PAGE_SIZE)

  return (
    <div className="min-h-screen">
      <AdminHeader title="Users" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: userTotal, color: 'text-white' },
            { label: 'Active', value: users.filter((u) => statusLabel(u.status) === 'active').length, color: 'text-green-400' },
            { label: 'Agents', value: agentTotal, color: 'text-purple-400' },
            { label: 'Suspended', value: users.filter((u) => statusLabel(u.status) === 'suspended').length, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>
                {usersLoading ? <span className="inline-block w-12 h-7 bg-gray-800 rounded animate-pulse" /> : value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#12121a] border border-gray-800 p-1 rounded-xl w-fit">
          {(['users', 'agents'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {tab === 'users' && (
          <>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <button onClick={handleExport} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm text-white flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>

            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
              {usersLoading ? (
                <div className="p-12 flex justify-center">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-gray-400">No users found</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800/50">
                          {['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                            <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => {
                          const st = statusLabel(u.status)
                          return (
                            <tr key={u.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium shrink-0">
                                    {(u.first_name || '?').charAt(0)}
                                  </div>
                                  <p className="text-sm font-medium text-white">{u.first_name} {u.last_name}</p>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-300">{u.email}</td>
                              <td className="px-5 py-4 text-sm text-gray-300">{u.phone_number || <span className="text-gray-600">—</span>}</td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                  u.role === 'agent' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                  st === 'suspended' ? 'text-red-400' : st === 'active' ? 'text-green-400' : 'text-gray-400'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    st === 'suspended' ? 'bg-red-400' : st === 'active' ? 'bg-green-400' : 'bg-gray-400'
                                  }`} />
                                  {st.charAt(0).toUpperCase() + st.slice(1)}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                              <td className="px-5 py-4 text-right">
                                <div className="relative inline-block">
                                  <button onClick={() => setShowActionMenu(showActionMenu === u.id ? null : u.id)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                  {showActionMenu === u.id && (
                                    <div className="absolute right-0 top-full mt-1 w-44 bg-[#1a1a24] border border-gray-800 rounded-lg shadow-xl z-10 overflow-hidden">
                                      <a href={`mailto:${u.email}`} className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2" onClick={() => setShowActionMenu(null)}>
                                        <Mail className="w-4 h-4" /> Send Email
                                      </a>
                                      <button onClick={() => setSuspendModal(u)} className="w-full px-4 py-2.5 text-left text-sm text-yellow-400 hover:bg-gray-800 flex items-center gap-2">
                                        {st === 'suspended'
                                          ? <><CheckCircle className="w-4 h-4" /> Unsuspend</>
                                          : <><Ban className="w-4 h-4" /> Suspend</>
                                        }
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-4 border-t border-gray-800/50 flex items-center justify-between">
                    <p className="text-sm text-gray-400">Page {userPage} of {userPages || 1} · {userTotal} users</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1} className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                      <span className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm">{userPage}</span>
                      <button onClick={() => setUserPage((p) => Math.min(userPages, p + 1))} disabled={userPage >= userPages} className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Agents tab */}
        {tab === 'agents' && (
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
            {agentsLoading ? (
              <div className="p-12 flex justify-center">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : agents.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No agents found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/50">
                        {['Agent', 'Email', 'Verified', 'Status', 'Joined', 'Actions'].map((h) => (
                          <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((a) => {
                        const name = [a.first_name, a.last_name].filter(Boolean).join(' ') || 'Agent'
                        const st = (a.status || '').toLowerCase()
                        return (
                        <tr key={a.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium shrink-0">
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-sm text-white font-medium">{name}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-300">{a.email}</td>
                          <td className="px-5 py-4 text-sm">
                            {a.is_email_verified
                              ? <span className="text-green-400">Email verified</span>
                              : <span className="text-gray-500">Unverified</span>
                            }
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              st === 'suspended' ? 'text-red-400' : st === 'active' ? 'text-green-400' : 'text-gray-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                st === 'suspended' ? 'bg-red-400' : st === 'active' ? 'bg-green-400' : 'bg-gray-400'
                              }`} />
                              {st ? st.charAt(0).toUpperCase() + st.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-400">{new Date(a.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-4 text-right">
                            <a href={`/user/${a.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300">
                              View Profile
                            </a>
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-4 border-t border-gray-800/50 flex items-center justify-between">
                  <p className="text-sm text-gray-400">Page {agentPage} of {agentPages || 1} · {agentTotal} agents</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAgentPage((p) => Math.max(1, p - 1))} disabled={agentPage === 1} className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm">{agentPage}</span>
                    <button onClick={() => setAgentPage((p) => Math.min(agentPages, p + 1))} disabled={agentPage >= agentPages} className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Suspend Modal */}
      {suspendModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <Ban className="w-7 h-7 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white text-center mb-2">
              {statusLabel(suspendModal.status) === 'suspended' ? 'Unsuspend User?' : 'Suspend User?'}
            </h3>
            <p className="text-sm text-gray-400 text-center mb-2 font-medium text-white">
              {suspendModal.first_name} {suspendModal.last_name}
            </p>
            <p className="text-gray-400 text-sm text-center mb-6">
              {statusLabel(suspendModal.status) === 'suspended'
                ? "This will restore the user's access."
                : 'This will block the user from the platform.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSuspendModal(null)} className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl">Cancel</button>
              <button
                onClick={() => handleToggleSuspend(suspendModal)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-xl disabled:opacity-50"
              >
                {actionLoading ? 'Loading...' : statusLabel(suspendModal.status) === 'suspended' ? 'Unsuspend' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
