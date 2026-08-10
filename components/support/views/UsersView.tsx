'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Users as UsersIcon, UserCheck, Briefcase, Ban, Eye, UserX, RefreshCw, AlertCircle, MailCheck, MailX, ShieldCheck, Phone } from 'lucide-react'
import { supportApi, type AdminUser } from '@/lib/api/support'
import { StatCard } from '@/components/admin/shared/StatCard'
import { SearchInput, ExportButton, ActionMenu, FilterPill, Avatar, EmptyState } from '@/components/admin/shared/Atoms'
import { StatusBadge } from '@/components/admin/shared/Badge'
import { ConfirmModal, Modal } from '@/components/admin/shared/Modal'
import { formatDate, exportToExcel, truncateId } from '@/lib/utils/admin-format'

type UserFilter = 'all' | 'individual' | 'agent'

interface Row {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  role: 'individual' | 'agent' | string
  status: string
  joinDate: string
  avatarColor: string
  isEmailVerified: boolean
}

const AVATAR_COLORS = ['#7c3aed', '#a855f7', '#8b5cf6', '#6366f1', '#c026d3', '#9333ea']
function avatarColorForId(id: string) {
  const n = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

function mapUser(u: AdminUser): Row {
  return {
    id: u.id,
    userId: u.id.slice(-8).toUpperCase(),
    name: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.email,
    email: u.email,
    phone: u.phone_number ?? '',
    role: u.role === 'agent' ? 'agent' : u.role === 'user' ? 'individual' : u.role,
    status: (u.status ?? 'active').toLowerCase() === 'suspended' ? 'suspended' : 'active',
    joinDate: u.created_at,
    avatarColor: avatarColorForId(u.id),
    isEmailVerified: u.is_email_verified,
  }
}

export default function UsersView() {
  const [users, setUsers] = useState<Row[]>([])
  const [identityVerifiedIds, setIdentityVerifiedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filter, setFilter] = useState<UserFilter>('all')
  const [search, setSearch] = useState('')
  const [confirmAction, setConfirmAction] = useState<{ type: 'suspend' | 'reinstate'; user: Row } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [profileUser, setProfileUser] = useState<Row | null>(null)
  const [listingsCountMap, setListingsCountMap] = useState<Map<string, number>>(new Map())
  const [ratingMap, setRatingMap] = useState<Map<string, { avg: number; count: number }>>(new Map())

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let all: AdminUser[] = []
      let page = 1
      const pageSize = 100
      while (true) {
        const res = await supportApi.getUsers({ page, page_size: pageSize })
        const batch = res.users ?? []
        all = [...all, ...batch]
        if (all.length >= (res.total ?? 0) || batch.length < pageSize) break
        page++
      }
      setUsers(all.map(mapUser))

      try {
        let verifiedIds: string[] = []
        let vPage = 1
        while (true) {
          const vRes = await supportApi.getVerifiedUsers(vPage)
          const batch = vRes.users ?? []
          verifiedIds = [...verifiedIds, ...batch.map((v) => v.user_id)]
          if (verifiedIds.length >= (vRes.total ?? 0) || batch.length < 100) break
          vPage++
        }
        setIdentityVerifiedIds(new Set(verifiedIds))
      } catch {
        // verified users endpoint unavailable — badge just won't show
      }

      try {
        let allListings: Awaited<ReturnType<typeof supportApi.getListings>>['listings'] = []
        let lPage = 1
        while (true) {
          const r = await supportApi.getListings(lPage, 100)
          allListings = [...allListings, ...(r.listings ?? [])]
          if (allListings.length >= (r.total ?? 0) || (r.listings?.length ?? 0) < 100) break
          lPage++
        }
        const counts = new Map<string, number>()
        for (const l of allListings) counts.set(l.agent_id, (counts.get(l.agent_id) ?? 0) + 1)
        setListingsCountMap(counts)
      } catch {
        // listings count just won't show
      }

      try {
        let allAgents: Awaited<ReturnType<typeof supportApi.getAgents>>['agents'] = []
        let aPage = 1
        while (true) {
          const r = await supportApi.getAgents(aPage, 100)
          allAgents = [...allAgents, ...(r.agents ?? [])]
          if (allAgents.length >= (r.total ?? 0) || (r.agents?.length ?? 0) < 100) break
          aPage++
        }
        const ratings = new Map<string, { avg: number; count: number }>()
        for (const a of allAgents) {
          if (a.average_rating != null) {
            ratings.set(a.id, { avg: a.average_rating, count: a.total_reviews ?? 0 })
            if (a.user_id) ratings.set(a.user_id, { avg: a.average_rating, count: a.total_reviews ?? 0 })
          }
        }
        setRatingMap(ratings)
      } catch {
        // rating just won't show
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const individualCount = users.filter((u) => u.role === 'individual').length
  const agentCount = users.filter((u) => u.role === 'agent').length
  const suspendedCount = users.filter((u) => u.status === 'suspended').length

  const filtered = useMemo(() => {
    let list = users
    if (filter === 'individual') list = list.filter((u) => u.role === 'individual')
    if (filter === 'agent') list = list.filter((u) => u.role === 'agent')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.userId.toLowerCase().includes(q),
      )
    }
    return [...list].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
  }, [users, filter, search])

  function handleExport() {
    exportToExcel(
      'users',
      filtered.map((u) => ({
        UserID: u.userId, Name: u.name, Email: u.email, Phone: u.phone, Role: u.role,
        Status: u.status, Joined: formatDate(u.joinDate),
      })),
    )
  }

  async function handleConfirm() {
    if (!confirmAction) return
    setActionLoading(true)
    try {
      if (confirmAction.type === 'suspend') {
        await supportApi.suspendUser(confirmAction.user.id)
        setUsers((prev) => prev.map((u) => u.id === confirmAction.user.id ? { ...u, status: 'suspended' } : u))
      }
      if (confirmAction.type === 'reinstate') {
        await supportApi.activateUser(confirmAction.user.id)
        setUsers((prev) => prev.map((u) => u.id === confirmAction.user.id ? { ...u, status: 'active' } : u))
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  return (
    <div className="admin-root dark" style={{ height: 'auto', overflow: 'visible' }}>
      <div className="p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-secondary)]">Loading users…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-[var(--text-secondary)] text-center max-w-xs">{error}</p>
            <button
              onClick={loadUsers}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Users" value={users.length} icon={UsersIcon} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
              <StatCard label="Individuals" value={individualCount} icon={UserCheck} iconBg="bg-blue-500/15" iconColor="text-blue-400" />
              <StatCard label="Agents" value={agentCount} icon={Briefcase} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
              <StatCard label="Suspended Users" value={suspendedCount} icon={Ban} iconBg="bg-red-500/15" iconColor="text-red-400" valueColor="text-red-400" />
            </div>

            <div className="flex gap-2 mb-4">
              <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>Users</FilterPill>
              <FilterPill active={filter === 'individual'} onClick={() => setFilter('individual')}>Individual</FilterPill>
              <FilterPill active={filter === 'agent'} onClick={() => setFilter('agent')}>Agent</FilterPill>
            </div>

            <div className="flex gap-3 mb-5">
              <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, or ID..." />
              <ExportButton onClick={handleExport} />
              <button onClick={loadUsers} className="p-2.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wide border-b border-[var(--border-color)]">
                      <th className="px-6 py-4 font-medium">User</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Phone</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Joined</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)]">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={u.name} color={u.avatarColor} size={36} />
                            <div>
                              <div className="text-[var(--text-primary)] font-medium flex items-center gap-1.5">
                                {u.name}
                                {identityVerifiedIds.has(u.id) && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-label="Identity verified" />
                                )}
                              </div>
                              <div className="text-xs text-[var(--text-muted)]">{truncateId(u.userId, 10)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[var(--text-secondary)]">{u.email}</span>
                            {u.isEmailVerified
                              ? <MailCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-label="Email verified" />
                              : <MailX className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-label="Email not verified" />
                            }
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-[var(--text-secondary)]">{u.phone || '—'}</td>
                        <td className="px-6 py-3.5">
                          <span className="text-xs font-medium capitalize px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-3.5"><StatusBadge status={u.status} /></td>
                        <td className="px-6 py-3.5 text-[var(--text-secondary)]">{formatDate(u.joinDate)}</td>
                        <td className="px-6 py-3.5 text-right">
                          <ActionMenu
                            items={[
                              { label: 'View profile', icon: <Eye className="w-4 h-4" />, onClick: () => setProfileUser(u) },
                              u.status === 'suspended'
                                ? { label: 'Reinstate', icon: <UserCheck className="w-4 h-4" />, onClick: () => setConfirmAction({ type: 'reinstate', user: u }) }
                                : { label: 'Suspend', icon: <UserX className="w-4 h-4" />, onClick: () => setConfirmAction({ type: 'suspend', user: u }), danger: true },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <EmptyState label="No users match your search." />}
              </div>
            </div>
          </>
        )}

        <ConfirmModal
          open={!!confirmAction}
          title={confirmAction?.type === 'reinstate' ? 'Reinstate user?' : 'Suspend user?'}
          description={
            confirmAction?.type === 'reinstate'
              ? `${confirmAction.user.name} will regain full access to the platform.`
              : `${confirmAction?.user.name} will lose access to the platform until reinstated.`
          }
          confirmLabel={confirmAction?.type === 'reinstate' ? 'Reinstate' : 'Suspend'}
          danger={confirmAction?.type !== 'reinstate'}
          icon={<UserX className="w-6 h-6 text-red-400" />}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />

        <Modal open={!!profileUser} onClose={() => setProfileUser(null)} title="User Profile" maxWidth="max-w-md">
          {profileUser && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <Avatar name={profileUser.name} color={profileUser.avatarColor} size={52} />
                <div>
                  <div className="flex items-center gap-1.5 text-base font-semibold text-[var(--text-primary)]">
                    {profileUser.name}
                    {identityVerifiedIds.has(profileUser.id) && (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-label="Identity verified" />
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{profileUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-[var(--text-muted)] mb-1">Role</p>
                  <p className="text-sm text-[var(--text-primary)] capitalize">{profileUser.role}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-[var(--text-muted)] mb-1">Status</p>
                  <StatusBadge status={profileUser.status} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-[var(--text-muted)] mb-1">Email Verified</p>
                  <p className="text-sm text-[var(--text-primary)]">{profileUser.isEmailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                  <p className="text-sm text-[var(--text-primary)]">{profileUser.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-[var(--text-muted)] mb-1">Joined</p>
                  <p className="text-sm text-[var(--text-primary)]">{formatDate(profileUser.joinDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-[var(--text-muted)] mb-1">Listings</p>
                  <p className="text-sm text-[var(--text-primary)]">{listingsCountMap.get(profileUser.id) ?? 0}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-[var(--text-muted)] mb-1">Rating</p>
                  <p className="text-sm text-[var(--text-primary)]">
                    {ratingMap.has(profileUser.id)
                      ? `${ratingMap.get(profileUser.id)!.avg.toFixed(1)} ★ (${ratingMap.get(profileUser.id)!.count} review${ratingMap.get(profileUser.id)!.count !== 1 ? 's' : ''})`
                      : 'No reviews yet'}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                {profileUser.status === 'suspended' ? (
                  <button
                    onClick={() => { setConfirmAction({ type: 'reinstate', user: profileUser }); setProfileUser(null) }}
                    className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
                  >
                    Reinstate User
                  </button>
                ) : (
                  <button
                    onClick={() => { setConfirmAction({ type: 'suspend', user: profileUser }); setProfileUser(null) }}
                    className="w-full py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                  >
                    Suspend User
                  </button>
                )}
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  )
}
