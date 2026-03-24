'use client'

import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'
import { 
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Search
} from 'lucide-react'
import { useState } from 'react'

// Mock transactions for display
const mockTransactions = [
  { id: '1', user: 'John Doe', email: 'john@example.com', type: 'Subscription', amount: 5000, status: 'completed', date: '2024-05-20' },
  { id: '2', user: 'Jane Smith', email: 'jane@example.com', type: 'Connect Pack', amount: 2500, status: 'completed', date: '2024-05-19' },
  { id: '3', user: 'Mike Johnson', email: 'mike@example.com', type: 'Wallet Top-up', amount: 10000, status: 'completed', date: '2024-05-18' },
  { id: '4', user: 'Sarah Williams', email: 'sarah@example.com', type: 'Subscription', amount: 5000, status: 'pending', date: '2024-05-17' },
  { id: '5', user: 'David Brown', email: 'david@example.com', type: 'Connect Single', amount: 500, status: 'completed', date: '2024-05-16' },
  { id: '6', user: 'Emily Davis', email: 'emily@example.com', type: 'Subscription', amount: 50000, status: 'completed', date: '2024-05-15' },
  { id: '7', user: 'Chris Wilson', email: 'chris@example.com', type: 'Wallet Top-up', amount: 20000, status: 'failed', date: '2024-05-14' },
  { id: '8', user: 'Lisa Anderson', email: 'lisa@example.com', type: 'Connect Pack', amount: 2500, status: 'completed', date: '2024-05-13' },
]

export default function TransactionsPage() {
  const { transactions } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')

  const totalRevenue = mockTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
  const pendingAmount = mockTransactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)

  const filteredTransactions = mockTransactions.filter(t => {
    const matchesSearch = t.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Export transactions to Excel/CSV
  const handleExport = () => {
    const headers = ['Transaction ID', 'User', 'Email', 'Type', 'Amount', 'Status', 'Date']
    const csvContent = [
      headers.join(','),
      ...mockTransactions.map(txn => [
        `TXN-${txn.id.padStart(6, '0')}`,
        txn.user,
        txn.email,
        txn.type,
        txn.amount,
        txn.status,
        txn.date
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `spacebutton_transactions_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Transactions" />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +12.5%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">N{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Revenue</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">N{pendingAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Pending</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{mockTransactions.length}</p>
            <p className="text-sm text-gray-400">Total Transactions</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{mockTransactions.filter(t => t.status === 'completed').length}</p>
            <p className="text-sm text-gray-400">Successful</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search transactions..."
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
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

        {/* Transactions Table */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Transaction ID</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">User</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Type</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                    <td className="px-5 py-4">
                      <span className="text-sm font-mono text-gray-400">TXN-{txn.id.padStart(6, '0')}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">{txn.user}</p>
                        <p className="text-xs text-gray-500">{txn.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-300">{txn.type}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-white">N{txn.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        txn.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        txn.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          txn.status === 'completed' ? 'bg-green-400' :
                          txn.status === 'pending' ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`} />
                        {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-4 border-t border-gray-800/50 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {filteredTransactions.length} transactions
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
        </div>
      </div>
    </div>
  )
}
