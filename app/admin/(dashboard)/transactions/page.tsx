'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/lib/store'
import { 
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react'
import { Input } from '@/components/ui/input'

const mockTransactions = [
  { id: 1, name: 'John Doe', email: 'john.doe@mail.com', date: '01-01-2026', total: 5000, method: 'CC', status: 'Complete' },
  { id: 2, name: 'John Doe', email: 'john.doe@mail.com', date: '01-01-2026', total: 15000, method: 'Bank', status: 'Complete' },
  { id: 3, name: 'John Doe', email: 'john.doe@mail.com', date: '01-01-2026', total: 2000, method: 'CC', status: 'Complete' },
  { id: 4, name: 'John Doe', email: 'john.doe@mail.com', date: '01-01-2026', total: 10000, method: 'Bank', status: 'Complete' },
  { id: 5, name: 'Jane Smith', email: 'jane.smith@mail.com', date: '01-01-2026', total: 50000, method: 'CC', status: 'Canceled' },
  { id: 6, name: 'Emily Davis', email: 'emily.davis@mail.com', date: '01-01-2026', total: 30000, method: 'Bank', status: 'Pending' },
  { id: 7, name: 'Jane Smith', email: 'jane.smith@mail.com', date: '01-01-2026', total: 20000, method: 'Bank', status: 'Canceled' },
  { id: 8, name: 'John Doe', email: 'john.doe@mail.com', date: '01-01-2026', total: 30000, method: 'CC', status: 'Complete' },
  { id: 9, name: 'Emily Davis', email: 'emily.smith@mail.com', date: '01-01-2026', total: 5000, method: 'Wallet', status: 'Pending' },
  { id: 10, name: 'Jane Smith', email: 'jane.smith@mail.com', date: '01-01-2026', total: 2000, method: 'Bank', status: 'Canceled' },
]

export default function TransactionsPage() {
  const { transactions } = useAppStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending' | 'canceled'>('all')

  const filteredTransactions = activeTab === 'all' 
    ? mockTransactions 
    : mockTransactions.filter(t => t.status.toLowerCase() === activeTab)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'text-green-500'
      case 'Pending': return 'text-amber-500'
      case 'Canceled': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Total Revenue</span>
            <button className="p-1 hover:bg-secondary rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <p className="text-2xl font-bold mb-1">₦9,045,000</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              14.4%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Completed Transactions</span>
            <button className="p-1 hover:bg-secondary rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <p className="text-2xl font-bold mb-1">3,150</p>
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
            <span className="text-sm text-muted-foreground">Pending Transactions</span>
            <button className="p-1 hover:bg-secondary rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <p className="text-2xl font-bold mb-1">150</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              85%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Failed Transactions</span>
            <button className="p-1 hover:bg-secondary rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <p className="text-2xl font-bold mb-1">75</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-500 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              15%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
        </div>

        {/* Payment Method Card */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Payment Method</span>
            <button className="p-1 hover:bg-secondary rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-4">
            {/* Card Visual */}
            <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 p-2 text-white text-[6px] flex flex-col justify-between">
              <span className="text-[8px] font-medium">Finaci</span>
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <span key={i} className="tracking-wider">****</span>
                ))}
                <span>2345</span>
              </div>
              <div className="flex justify-between text-[5px]">
                <div>
                  <p className="opacity-70">Card Holder name</p>
                  <p>Noman Manzoor</p>
                </div>
                <div className="text-right">
                  <p className="opacity-70">Expiry Date</p>
                  <p>02/30</p>
                </div>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-500 font-medium">Active</span>
              </div>
              <p><span className="text-muted-foreground">Transactions:</span> 11,250</p>
              <p><span className="text-muted-foreground">Revenue:</span> ₦90,000,000</p>
              <button className="text-primary text-xs hover:underline">View Transactions</button>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2 border border-border rounded-lg text-xs flex items-center justify-center gap-1 hover:bg-secondary">
              <Plus className="w-3 h-3" />
              Add Card
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-medium">
              Deactivate
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Tabs and Search */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex gap-2">
            {(['all', 'completed', 'pending', 'canceled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'all' ? `All Transaction (240)` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Search payment history"
                className="w-64 h-9 pl-4 pr-10 rounded-lg"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <button className="p-2 hover:bg-secondary rounded-lg border border-border">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-lg border border-border">
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-lg border border-border">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Mail</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Date</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Total</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Method</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-6 py-4 text-sm font-medium">{tx.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{tx.email}</td>
                <td className="px-6 py-4 text-sm">{tx.date}</td>
                <td className="px-6 py-4 text-sm">₦{tx.total.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">{tx.method}</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 text-sm ${getStatusColor(tx.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-primary text-sm font-medium hover:underline">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
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
    </div>
  )
}
