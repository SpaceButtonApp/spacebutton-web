'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/lib/store'
import { 
  Users, 
  TrendingUp,
  MoreVertical,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Copy
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const weeklyData = [
  { day: 'Sun', value: 15000 },
  { day: 'Mon', value: 22000 },
  { day: 'Tue', value: 25000 },
  { day: 'Wed', value: 30000 },
  { day: 'Thu', value: 25400 },
  { day: 'Fri', value: 35000 },
  { day: 'Sat', value: 45000 },
]

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john.doe@mail.com', phone: '+1234567890', connect: 10, totalSpend: 20000, status: 'Active' },
  { id: 2, name: 'John Doe', email: 'john.doe@mail.com', phone: '+1234567890', connect: 25, totalSpend: 3450, status: 'Active' },
  { id: 3, name: 'John Doe', email: 'john.doe@mail.com', phone: '+1234567890', connect: 16, totalSpend: 35000, status: 'Active' },
  { id: 4, name: 'John Doe', email: 'john.doe@mail.com', phone: '+1234567890', connect: 25, totalSpend: 3450, status: 'Active' },
  { id: 5, name: 'Jane Smith', email: 'jane.smith@mail.com', phone: '+1234567890', connect: 5, totalSpend: 250, status: 'Inactive' },
  { id: 6, name: 'Emily Davis', email: 'john.doe@mail.com', phone: '+1234567890', connect: 11, totalSpend: 46000, status: 'VIP' },
  { id: 7, name: 'Jane Smith', email: 'jane.doe@mail.com', phone: '+1234567890', connect: 25, totalSpend: 25000, status: 'Inactive' },
  { id: 8, name: 'John Doe', email: 'john.doe@mail.com', phone: '+1234567890', connect: 20, totalSpend: 20000, status: 'Active' },
  { id: 9, name: 'Emily Davis', email: 'emily.doe@mail.com', phone: '+1234567890', connect: 30, totalSpend: 60000, status: 'VIP' },
  { id: 10, name: 'Jane Smith', email: 'jane.doe@mail.com', phone: '+1234567890', connect: 5, totalSpend: 25000, status: 'Inactive' },
]

export default function UsersPage() {
  const { properties } = useAppStore()
  const [selectedUser, setSelectedUser] = useState(mockUsers[0])
  const [currentPage, setCurrentPage] = useState(1)
  const [activeWeek, setActiveWeek] = useState<'this' | 'last'>('this')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-500'
      case 'Inactive': return 'text-red-500'
      case 'VIP': return 'text-amber-500'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm text-muted-foreground">Total users</span>
          </div>
          <p className="text-3xl font-bold mb-1">200,000</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              5%
            </span>
            <span className="text-muted-foreground">+120 this month</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">New Users</span>
            <button className="p-1 hover:bg-secondary rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <p className="text-3xl font-bold mb-1">2,370</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              20%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Users</span>
            <button className="p-1 hover:bg-secondary rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <p className="text-3xl font-bold mb-1">11,040</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              14.4%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
        </div>
      </div>

      {/* Users Overview Chart */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Users Overview</h2>
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

        {/* Overview Stats */}
        <div className="flex gap-12 mb-6">
          <div>
            <p className="text-2xl font-bold">25k</p>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </div>
          <div>
            <p className="text-2xl font-bold">200k</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <div>
            <p className="text-2xl font-bold">180k</p>
            <p className="text-sm text-muted-foreground">Visitors</p>
          </div>
          <div>
            <p className="text-2xl font-bold">+5.5%</p>
            <p className="text-sm text-muted-foreground">Growth Rate</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
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
                        <p className="text-lg font-bold">{(payload[0].value as number).toLocaleString()}</p>
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
                fill="url(#colorUsers)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Table and Profile */}
      <div className="grid grid-cols-4 gap-6">
        {/* Table */}
        <div className="col-span-3 bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Connect</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total Spend</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className="border-t border-border hover:bg-secondary/30 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="px-4 py-3 text-sm">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{user.phone}</td>
                  <td className="px-4 py-3 text-sm">{user.connect}</td>
                  <td className="px-4 py-3 text-sm">{user.totalSpend.toLocaleString()}.00</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-sm ${getStatusColor(user.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-secondary rounded">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-1.5 hover:bg-secondary rounded">
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  }`}
                >
                  {page}
                </button>
              ))}
              <span className="px-2">.....</span>
              <button className="w-8 h-8 rounded-lg text-sm hover:bg-secondary">24</button>
            </div>
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="text-center mb-6">
            <Image
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              alt={selectedUser.name}
              width={80}
              height={80}
              className="rounded-full mx-auto mb-3"
            />
            <h3 className="font-semibold">{selectedUser.name}</h3>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <span>{selectedUser.email.replace('@mail.com', '@example.com')}</span>
              <button className="p-1 hover:bg-secondary rounded">
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Customer Info</p>
              <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span>📞</span>
                  <span>{selectedUser.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>✉️</span>
                  <span>{selectedUser.email.replace('@mail.com', '@example.com')}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Activity</p>
              <div className="text-sm space-y-1">
                <p>Registration: 15.01.2025</p>
                <p>Last post: 10.01.2025</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Post overview</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-border rounded-lg p-3 text-center">
                  <p className="text-xl font-bold">150</p>
                  <p className="text-xs text-muted-foreground">Total Post</p>
                </div>
                <div className="border border-border rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-green-500">140</p>
                  <p className="text-xs text-muted-foreground">Active Post</p>
                </div>
                <div className="border border-border rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-red-500">10</p>
                  <p className="text-xs text-muted-foreground">Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
