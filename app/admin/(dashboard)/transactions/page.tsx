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
  Search,
  Receipt
} from 'lucide-react'
import { useState } from 'react'

export default function TransactionsPage() {
  const { transactions } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all')

  // Calculate stats from real transactions
  const totalRevenue = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
  const totalTransactions = transactions.length

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || t.type === typeFilter
    return matchesSearch && matchesType
  })

  // Export transactions to Excel/CSV
  const handleExport = () => {
    if (transactions.length === 0) return
    
    const headers = ['Transaction ID', 'Type', 'Title', 'Amount', 'Date']
    const csvContent = [
      headers.join(','),
      ...transactions.map(txn => [
        `TXN-${txn.id.padStart(6, '0')}`,
        txn.type,
        txn.title,
        txn.amount,
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
              {totalRevenue > 0 && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> Active
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">N{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Revenue</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">N{totalDebits.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Debits</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{totalTransactions}</p>
            <p className="text-sm text-gray-400">Total Transactions</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">N{(totalRevenue - totalDebits).toLocaleString()}</p>
            <p className="text-sm text-gray-400">Net Revenue</p>
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="all">All Types</option>
              <option value="credit">Credits</option>
              <option value="debit">Debits</option>
            </select>
            <button 
              onClick={handleExport}
              disabled={transactions.length === 0}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed border border-purple-500 disabled:border-gray-600 rounded-xl text-sm text-white transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No transactions yet</h3>
              <p className="text-gray-400 text-sm">Transactions will appear here when users make payments</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800/50">
                      <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Transaction ID</th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Description</th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Type</th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Amount</th>
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
                          <span className="text-sm text-white">{txn.title}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            txn.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              txn.type === 'credit' ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                            {txn.type === 'credit' ? 'Credit' : 'Debit'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-sm font-semibold ${
                            txn.type === 'credit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {txn.type === 'credit' ? '+' : '-'}N{txn.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400">
                          {txn.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-4 border-t border-gray-800/50 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Showing {filteredTransactions.length} of {transactions.length} transactions
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
    </div>
  )
}
