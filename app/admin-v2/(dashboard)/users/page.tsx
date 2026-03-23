'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin-v2/header'
import { useAppStore } from '@/lib/store'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Trash2, 
  Ban, 
  Eye,
  UserPlus,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'

// Mock users data - in production this would come from database
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+234 812 345 6789', status: 'active', type: 'individual', listings: 3, joined: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+234 813 456 7890', status: 'active', type: 'agent', listings: 12, joined: '2024-02-20' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '+234 814 567 8901', status: 'suspended', type: 'individual', listings: 0, joined: '2024-03-10' },
  { id: '4', name: 'Sarah Williams', email: 'sarah@example.com', phone: '+234 815 678 9012', status: 'active', type: 'agent', listings: 8, joined: '2024-03-25' },
  { id: '5', name: 'David Brown', email: 'david@example.com', phone: '+234 816 789 0123', status: 'active', type: 'individual', listings: 1, joined: '2024-04-05' },
  { id: '6', name: 'Emily Davis', email: 'emily@example.com', phone: '+234 817 890 1234', status: 'inactive', type: 'individual', listings: 0, joined: '2024-04-15' },
  { id: '7', name: 'Chris Wilson', email: 'chris@example.com', phone: '+234 818 901 2345', status: 'active', type: 'agent', listings: 15, joined: '2024-05-01' },
  { id: '8', name: 'Lisa Anderson', email: 'lisa@example.com', phone: '+234 819 012 3456', status: 'active', type: 'individual', listings: 2, joined: '2024-05-10' },
]

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'inactive'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'agent'>('all')
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null)
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesType = typeFilter === 'all' || user.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="min-h-screen">
      <AdminHeader title="Users" />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-white">{mockUsers.length}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Active Users</p>
            <p className="text-2xl font-bold text-green-400">{mockUsers.filter(u => u.status === 'active').length}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Agents</p>
            <p className="text-2xl font-bold text-purple-400">{mockUsers.filter(u => u.type === 'agent').length}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Suspended</p>
            <p className="text-2xl font-bold text-red-400">{mockUsers.filter(u => u.status === 'suspended').length}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="agent">Agent</option>
            </select>
            <button className="px-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">User</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Contact</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Type</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Listings</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Joined</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-white">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.type === 'agent' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.type === 'agent' ? 'Agent' : 'Individual'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-white">{user.listings}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        user.status === 'active' ? 'text-green-400' :
                        user.status === 'suspended' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'active' ? 'bg-green-400' :
                          user.status === 'suspended' ? 'bg-red-400' :
                          'bg-gray-400'
                        }`} />
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(user.joined).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block">
                        <button 
                          onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                          className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showActionMenu === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a24] border border-gray-800 rounded-lg shadow-xl z-10 overflow-hidden">
                            <button className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                            <button className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                              <Mail className="w-4 h-4" /> Send Email
                            </button>
                            <button className="w-full px-4 py-2.5 text-left text-sm text-yellow-400 hover:bg-gray-800 flex items-center gap-2">
                              <Ban className="w-4 h-4" /> Suspend
                            </button>
                            <button className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2">
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-4 border-t border-gray-800/50 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {filteredUsers.length} of {mockUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-medium">1</button>
              <button className="px-3 py-1.5 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition-colors">2</button>
              <button className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
