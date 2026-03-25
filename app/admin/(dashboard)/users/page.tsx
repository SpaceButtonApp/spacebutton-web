'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'
import { 
  Search, 
  MoreVertical, 
  Mail, 
  Trash2, 
  Ban, 
  Download,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UsersPage() {
  const router = useRouter()
  const { registeredUsers, updateRegisteredUser, deleteRegisteredUser, addSupportMessage, supportChats } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'inactive'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'agent'>('all')
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [showSuspendModal, setShowSuspendModal] = useState<string | null>(null)

  const filteredUsers = registeredUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesType = typeFilter === 'all' || user.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Export users to Excel/CSV
  const handleExport = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Type', 'Listings', 'Joined']
    const csvContent = [
      headers.join(','),
      ...registeredUsers.map(user => [
        user.id,
        user.name,
        user.email,
        user.phone,
        user.status,
        user.type,
        user.listings,
        user.joined
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `spacebutton_users_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Send email to user
  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`
    setShowActionMenu(null)
  }

  // Suspend user
  const handleSuspend = (userId: string) => {
    const user = registeredUsers.find(u => u.id === userId)
    if (user) {
      updateRegisteredUser(userId, { 
        status: user.status === 'suspended' ? 'active' : 'suspended' 
      })
    }
    setShowSuspendModal(null)
    setShowActionMenu(null)
  }

  // Delete user
  const handleDelete = (userId: string) => {
    deleteRegisteredUser(userId)
    setShowDeleteModal(null)
    setShowActionMenu(null)
  }

  // Message user - creates new chat or opens existing
  const handleMessage = (userId: string, userName: string) => {
    // Check if chat already exists
    const existingChat = supportChats.find(c => c.userId === userId)
    
    if (!existingChat) {
      // Create initial message to start conversation
      addSupportMessage(userId, userName, 'Hello! How can I help you today?', 'admin')
    }
    
    // Navigate to messages with user selected
    router.push(`/admin/messages?user=${userId}`)
    setShowActionMenu(null)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Users" />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-white">{registeredUsers.length}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Active Users</p>
            <p className="text-2xl font-bold text-green-400">{registeredUsers.filter(u => u.status === 'active').length}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Agents</p>
            <p className="text-2xl font-bold text-purple-400">{registeredUsers.filter(u => u.type === 'agent').length}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Suspended</p>
            <p className="text-2xl font-bold text-red-400">{registeredUsers.filter(u => u.status === 'suspended').length}</p>
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
            <button 
              onClick={handleExport}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 border border-purple-500 rounded-xl text-sm text-white transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
          {registeredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No users yet</h3>
              <p className="text-gray-400 text-sm">Users who sign up will appear here</p>
            </div>
          ) : (
            <>
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
                              <div className="absolute right-0 top-full mt-1 w-44 bg-[#1a1a24] border border-gray-800 rounded-lg shadow-xl z-10 overflow-hidden">
                                <button 
                                  onClick={() => handleSendEmail(user.email)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                >
                                  <Mail className="w-4 h-4" /> Send Email
                                </button>
                                <button 
                                  onClick={() => handleMessage(user.id, user.name)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                >
                                  <MessageSquare className="w-4 h-4" /> Message
                                </button>
                                <button 
                                  onClick={() => setShowSuspendModal(user.id)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-yellow-400 hover:bg-gray-800 flex items-center gap-2"
                                >
                                  {user.status === 'suspended' ? (
                                    <><CheckCircle className="w-4 h-4" /> Unsuspend</>
                                  ) : (
                                    <><Ban className="w-4 h-4" /> Suspend</>
                                  )}
                                </button>
                                <button 
                                  onClick={() => setShowDeleteModal(user.id)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                                >
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
                  Showing {filteredUsers.length} of {registeredUsers.length} users
                </p>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-medium">1</button>
                  <button className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <Ban className="w-7 h-7 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white text-center mb-2">
              {registeredUsers.find(u => u.id === showSuspendModal)?.status === 'suspended' 
                ? 'Unsuspend User?' 
                : 'Suspend User?'}
            </h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              {registeredUsers.find(u => u.id === showSuspendModal)?.status === 'suspended' 
                ? 'This will restore the user\'s access to the platform.'
                : 'This will prevent the user from accessing the platform until they are unsuspended.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuspendModal(null)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSuspend(showSuspendModal)}
                className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-xl transition-colors"
              >
                {registeredUsers.find(u => u.id === showSuspendModal)?.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white text-center mb-2">Delete User?</h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              This action cannot be undone. The user will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-medium rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
