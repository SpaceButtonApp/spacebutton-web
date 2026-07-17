'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { adminApi } from '@/lib/api/admin'
import type { AdminStats, WaitlistEntry } from '@/lib/api/admin'
import { Users, Building2, CreditCard, TrendingUp, ShieldCheck, Clock, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const PAGE_SIZE = 50

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingVerifCount, setPendingVerifCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [waitlistTotal, setWaitlistTotal] = useState(0)
  const [waitlistPage, setWaitlistPage] = useState(1)
  const [waitlistLoading, setWaitlistLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      adminApi.getStats(),
      adminApi.getPendingVerifications(),
    ]).then(([statsRes, verifRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      if (verifRes.status === 'fulfilled') setPendingVerifCount(verifRes.value.length)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    setWaitlistLoading(true)
    adminApi.getWaitlist(waitlistPage, PAGE_SIZE)
      .then((res) => {
        setWaitlist(res.entries ?? [])
        setWaitlistTotal(res.total ?? 0)
      })
      .catch(() => {})
      .finally(() => setWaitlistLoading(false))
  }, [waitlistPage])

  const totalUsers = stats?.users?.total_users ?? 0
  const totalAgents = stats?.users?.total_agents ?? 0
  const suspended = stats?.users?.total_suspended ?? 0
  const activeListings = stats?.listings?.active_listings ?? 0
  const pendingListings = stats?.listings?.pending_listings ?? 0
  const totalListings = stats?.listings?.total_listings ?? 0

  const statCards = [
    {
      label: 'Total Users',
      value: loading ? '—' : totalUsers.toLocaleString(),
      sub: `${totalAgents} agents`,
      icon: Users,
      color: 'purple',
      href: '/admin/users',
    },
    {
      label: 'Active Listings',
      value: loading ? '—' : activeListings.toString(),
      sub: `${pendingListings} pending · ${totalListings} total`,
      icon: Building2,
      color: 'blue',
      href: '/admin/listings',
    },
    {
      label: 'Pending Verifications',
      value: loading || pendingVerifCount === null ? '—' : pendingVerifCount.toString(),
      sub: 'awaiting admin review',
      icon: ShieldCheck,
      color: 'green',
      href: '/admin/verification',
    },
    {
      label: 'Suspended Users',
      value: loading ? '—' : suspended.toString(),
      sub: 'blocked from platform',
      icon: CreditCard,
      color: 'orange',
      href: '/admin/users',
    },
  ]

  return (
    <div className="min-h-screen">
      <AdminHeader title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Admin!</h2>
          <p className="text-gray-400">Here&apos;s what&apos;s happening with SpaceButton today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <Link key={i} href={stat.href} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors block">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'purple' ? 'bg-purple-500/20' :
                  stat.color === 'blue' ? 'bg-blue-500/20' :
                  stat.color === 'green' ? 'bg-green-500/20' : 'bg-orange-500/20'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'purple' ? 'text-purple-400' :
                    stat.color === 'blue' ? 'text-blue-400' :
                    stat.color === 'green' ? 'text-green-400' : 'text-orange-400'
                  }`} />
                </div>
              </div>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-7 w-20 bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-28 bg-gray-800 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{stat.sub}</p>
                </>
              )}
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users" className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 hover:border-purple-500/50 transition-all group">
              <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white mb-1">Manage Users</h4>
              <p className="text-sm text-gray-400">View users and agents, suspend accounts</p>
            </Link>
            <Link href="/admin/listings" className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 hover:border-blue-500/50 transition-all group">
              <Building2 className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white mb-1">Manage Listings</h4>
              <p className="text-sm text-gray-400">
                Review and approve listings
                {pendingListings > 0 && <span className="ml-1 text-yellow-400">({pendingListings} pending)</span>}
              </p>
            </Link>
            <Link href="/admin/verification" className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 hover:border-green-500/50 transition-all group">
              <ShieldCheck className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white mb-1">Verifications</h4>
              <p className="text-sm text-gray-400">
                Review ID &amp; selfie submissions
                {pendingVerifCount !== null && pendingVerifCount > 0 && (
                  <span className="ml-1 text-green-400">({pendingVerifCount} pending)</span>
                )}
              </p>
            </Link>
            <Link href="/admin/transactions" className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 hover:border-orange-500/50 transition-all group">
              <TrendingUp className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white mb-1">Transactions</h4>
              <p className="text-sm text-gray-400">Track connects purchases and usage</p>
            </Link>
          </div>
        </div>

        {/* Pending items banner */}
        {(pendingListings > 0 || (pendingVerifCount !== null && pendingVerifCount > 0)) && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-4">
            <Clock className="w-6 h-6 text-yellow-400 shrink-0" />
            <div className="flex-1">
              <p className="text-yellow-300 font-medium">Action required</p>
              <p className="text-yellow-400/70 text-sm">
                {[
                  pendingListings > 0 && `${pendingListings} listing${pendingListings > 1 ? 's' : ''} awaiting approval`,
                  pendingVerifCount && pendingVerifCount > 0 && `${pendingVerifCount} verification${pendingVerifCount > 1 ? 's' : ''} pending review`,
                ].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex gap-2">
              {pendingListings > 0 && (
                <Link href="/admin/listings?status=pending" className="text-xs text-yellow-400 border border-yellow-500/40 px-3 py-1.5 rounded-lg hover:bg-yellow-500/10">
                  Listings
                </Link>
              )}
              {pendingVerifCount !== null && pendingVerifCount > 0 && (
                <Link href="/admin/verification" className="text-xs text-yellow-400 border border-yellow-500/40 px-3 py-1.5 rounded-lg hover:bg-yellow-500/10">
                  Verifications
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Waitlist Card */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Waitlist</h3>
                <p className="text-xs text-gray-500">
                  {waitlistLoading ? '…' : `${waitlistTotal.toLocaleString()} sign-up${waitlistTotal !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            {waitlistTotal > PAGE_SIZE && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWaitlistPage((p) => Math.max(1, p - 1))}
                  disabled={waitlistPage === 1 || waitlistLoading}
                  className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500">
                  {waitlistPage} / {Math.ceil(waitlistTotal / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setWaitlistPage((p) => p + 1)}
                  disabled={waitlistPage >= Math.ceil(waitlistTotal / PAGE_SIZE) || waitlistLoading}
                  className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {waitlistLoading ? (
            <div className="divide-y divide-gray-800/50">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3 animate-pulse">
                  <div className="h-4 w-48 bg-gray-800 rounded" />
                  <div className="h-3 w-24 bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          ) : waitlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
              <Mail className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No waitlist sign-ups yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {waitlist.map((entry, i) => (
                <div key={entry.id ?? i} className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-purple-400 font-medium">
                        {entry.email[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-200">{entry.email}</span>
                  </div>
                  <span className="text-xs text-gray-600 flex-shrink-0">
                    {new Date(entry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
