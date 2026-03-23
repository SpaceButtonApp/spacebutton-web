'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/lib/store'
import { 
  Users, 
  CheckCircle2, 
  ListChecks, 
  Wallet,
  MoreVertical,
  TrendingUp,
  ChevronDown
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

const weeklyData = [
  { day: 'Sun', value: 15000 },
  { day: 'Mon', value: 22000 },
  { day: 'Tue', value: 25000 },
  { day: 'Wed', value: 30000 },
  { day: 'Thu', value: 14000 },
  { day: 'Fri', value: 35000 },
  { day: 'Sat', value: 45000 },
]

const usersByState = [
  { state: 'Lagos', count: '30k', rate: 25.8, up: true },
  { state: 'Ogun', count: '3k', rate: 15.8, up: false },
  { state: 'Abuja', count: '2k', rate: 35.8, up: true },
]

const pendingReviews = [
  { id: 1, user: '@Kanyin', action: 'just made a new listing', time: '30 mins ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: 2, user: '@Peru and @Tunde', action: 'just completed a deal', time: '1 hour ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: 3, user: '@Michael', action: 'just dropped a feedback', time: '3 hours ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
]

export default function AdminDashboardPage() {
  const { properties, closedProperties, reviews, user } = useAppStore()
  const [adminName, setAdminName] = useState('DAME')
  const [activeWeek, setActiveWeek] = useState<'this' | 'last'>('this')

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth) {
      const admin = JSON.parse(adminAuth)
      setAdminName(admin.name.split(' ')[0].toUpperCase())
    }
  }, [])

  const totalUsers = 200000
  const doneDeals = closedProperties.length > 0 ? closedProperties.length * 1000 : 70000
  const totalListings = properties.length > 0 ? properties.length * 1000 : 143000
  const totalRevenue = 90000000

  const stats = [
    { 
      label: 'Total users', 
      value: totalUsers.toLocaleString(), 
      change: '+5%', 
      subtext: '+120 this month',
      icon: Users,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600'
    },
    { 
      label: 'Done Deals', 
      value: doneDeals.toLocaleString(), 
      change: '+10%', 
      subtext: '+200 this month',
      icon: CheckCircle2,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600'
    },
    { 
      label: 'Total Listings', 
      value: totalListings.toLocaleString(), 
      change: '+8%', 
      subtext: '+20 this month',
      icon: ListChecks,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600'
    },
    { 
      label: 'Total revenue generated', 
      value: `₦${(totalRevenue / 1000000).toFixed(0)},000,000`, 
      change: '+10%', 
      subtext: '+₦2,000,000 this month',
      icon: Wallet,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600'
    },
  ]

  const reportStats = [
    { label: 'Users', value: '52k' },
    { label: 'Total listings', value: '3.5k' },
    { label: 'Done Deals', value: '2.5k' },
    { label: 'Closed listings', value: '3.5k' },
    { label: 'Revenue', value: '250k' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hello {adminName}!</h1>
          <p className="text-muted-foreground">
            Welcome to your dashboard, here you can see an overview of the SPACEBUTTON platform.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-card">
          <span className="text-sm">This month</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
                <span className="text-muted-foreground">{stat.subtext}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Report and Users Section */}
      <div className="grid grid-cols-3 gap-6">
        {/* Report Chart */}
        <div className="col-span-2 bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Report for this week</h2>
            <div className="flex items-center gap-2">
              <div className="flex bg-secondary rounded-lg p-1">
                <button 
                  onClick={() => setActiveWeek('this')}
                  className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                    activeWeek === 'this' ? 'bg-card shadow-sm' : ''
                  }`}
                >
                  This week
                </button>
                <button 
                  onClick={() => setActiveWeek('last')}
                  className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                    activeWeek === 'last' ? 'bg-card shadow-sm' : ''
                  }`}
                >
                  Last week
                </button>
              </div>
              <button className="p-2 hover:bg-secondary rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Report Stats */}
          <div className="flex gap-8 mb-6">
            {reportStats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-lg font-bold">{(payload[0].value as number / 1000).toFixed(0)}k</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users by State */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Users in last 30 minutes</p>
              <p className="text-3xl font-bold">21.5K</p>
            </div>
            <button className="p-2 hover:bg-secondary rounded-lg">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-2">Users per minute</p>
          <div className="flex gap-1 mb-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-green-500 rounded-full"
                style={{ height: `${Math.random() * 30 + 10}px` }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="font-medium">Users by State</p>
            <p className="text-sm text-muted-foreground">Rate%</p>
          </div>

          <div className="space-y-4">
            {usersByState.map((state) => (
              <div key={state.state} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{state.count}</p>
                  <p className="text-sm text-muted-foreground">{state.state}</p>
                </div>
                <span className={`text-sm ${state.up ? 'text-green-500' : 'text-red-500'}`}>
                  {state.up ? '↗' : '↘'} {state.rate}%
                </span>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
            View Insight
          </button>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h2 className="text-lg font-semibold mb-4">Pending reviews</h2>
        <div className="space-y-4">
          {pendingReviews.map((review) => (
            <div key={review.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Image
                  src={review.avatar}
                  alt={review.user}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{review.user}</span> {review.action}
                  </p>
                  <p className="text-xs text-muted-foreground">{review.time}</p>
                </div>
              </div>
              <button className="text-primary text-sm font-medium hover:underline">
                Review
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
