'use client'

import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'
import { Flag, Search, AlertCircle, CheckCircle, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'

export default function ReportsPage() {
  const { reports, registeredUsers, updateReport } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all')
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = 
        report.reportedUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus
      
      return matchesSearch && matchesStatus
    })
  }, [reports, searchQuery, filterStatus])

  const handleUpdateReportStatus = (reportId: string, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    updateReport(reportId, { status: newStatus })
    if (selectedReport?.id === reportId) {
      setSelectedReport({ ...selectedReport, status: newStatus })
    }
  }

  const stats = [
    {
      label: 'Total Reports',
      value: reports.length.toString(),
      icon: Flag,
      color: 'red',
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400'
    },
    {
      label: 'Pending',
      value: reports.filter(r => r.status === 'pending').length.toString(),
      icon: AlertCircle,
      color: 'yellow',
      bgColor: 'bg-yellow-500/20',
      textColor: 'text-yellow-400'
    },
    {
      label: 'Reviewed',
      value: reports.filter(r => r.status === 'reviewed').length.toString(),
      icon: Flag,
      color: 'blue',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      label: 'Resolved',
      value: reports.filter(r => r.status === 'resolved').length.toString(),
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400'
    }
  ]

  const reasonLabels: Record<string, string> = {
    scam: 'Scam or Fraud',
    harassment: 'Harassment or Abuse',
    fake: 'Fake or Misleading Content',
    other: 'Other'
  }

  const reasonColors: Record<string, string> = {
    scam: 'bg-red-500/20 text-red-400',
    harassment: 'bg-orange-500/20 text-orange-400',
    fake: 'bg-yellow-500/20 text-yellow-400',
    other: 'bg-purple-500/20 text-purple-400'
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="User Reports" />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user name or User ID (e.g., SB2600000001)"
              className="pl-10 h-12 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 rounded-xl"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'reviewed', 'resolved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-gray-800/50">
            <h3 className="font-semibold text-white">User Reports ({filteredReports.length})</h3>
          </div>
          <div className="overflow-x-auto">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Flag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No reports found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/50">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Report ID</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">User ID</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">User Name</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Offense</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Details</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => {
                    const reportedUser = registeredUsers.find(u => u.name === report.reportedUserName)
                    return (
                      <tr key={report.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                        <td className="px-5 py-4 text-sm font-mono text-purple-400">{report.id}</td>
                        <td className="px-5 py-4 text-sm font-mono text-blue-400">{reportedUser?.userId || `SB26${String(registeredUsers.length + 1).padStart(8, '0')}`}</td>
                        <td className="px-5 py-4 text-sm text-white">{report.reportedUserName}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${reasonColors[report.reason] || 'bg-gray-500/20 text-gray-400'}`}>
                            {reasonLabels[report.reason]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400 max-w-[200px] truncate" title={report.details}>
                          {report.details || 'No details provided'}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={report.status}
                            onChange={(e) => handleUpdateReportStatus(report.id, e.target.value as any)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer transition-colors ${
                              report.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : report.status === 'reviewed'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400">
                          {new Date(report.reportedAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Reporter Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#12121a] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Reported User */}
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Reported User</p>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                      {selectedReport.reportedUserName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{selectedReport.reportedUserName}</p>
                      <p className="text-sm font-mono text-blue-400">{(() => {
                        const user = registeredUsers.find(u => u.name === selectedReport.reportedUserName)
                        return user?.userId || `SB26${String(registeredUsers.length + 1).padStart(8, '0')}`
                      })()}</p>
                    </div>
                  </div>
                </div>

                {/* Reporter */}
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Reported By</p>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                      {selectedReport.reporterName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{selectedReport.reporterName}</p>
                      <p className="text-sm font-mono text-blue-400">{(() => {
                        const user = registeredUsers.find(u => u.name === selectedReport.reporterName)
                        return user?.userId || `SB26${String(registeredUsers.length + 1).padStart(8, '0')}`
                      })()}</p>
                    </div>
                  </div>
                </div>

                {/* Offense Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Offense Type</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${reasonColors[selectedReport.reason] || 'bg-gray-500/20 text-gray-400'}`}>
                      {reasonLabels[selectedReport.reason]}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Details</p>
                    <p className="text-gray-300 text-sm bg-gray-800/50 rounded-lg p-3">
                      {selectedReport.details || 'No additional details provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Reported On</p>
                    <p className="text-sm text-gray-300">
                      {new Date(selectedReport.reportedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Status</p>
                  <select
                    value={selectedReport.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as 'pending' | 'reviewed' | 'resolved'
                      handleUpdateReportStatus(selectedReport.id, newStatus)
                      setSelectedReport({ ...selectedReport, status: newStatus })
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                      selectedReport.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : selectedReport.status === 'reviewed'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-full py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
