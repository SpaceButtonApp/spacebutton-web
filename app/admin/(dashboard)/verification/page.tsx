'use client'

import { useState } from 'react'
import { ChevronLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface VerificationRequest {
  id: string
  userId: string
  userName: string
  email: string
  idType: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  rejectionReason?: string
}

// Mock data for verifications
const mockVerifications: VerificationRequest[] = [
  {
    id: '1',
    userId: 'user-001',
    userName: 'Damerite A.',
    email: 'damerite@email.com',
    idType: 'NIN',
    status: 'pending',
    submittedAt: '2024-01-22 10:30 AM'
  },
  {
    id: '2',
    userId: 'user-002',
    userName: 'John Smith',
    email: 'john@email.com',
    idType: 'International Passport',
    status: 'pending',
    submittedAt: '2024-01-21 02:15 PM'
  },
  {
    id: '3',
    userId: 'user-003',
    userName: 'Sarah Johnson',
    email: 'sarah@email.com',
    idType: 'Driver\'s License',
    status: 'approved',
    submittedAt: '2024-01-20 09:00 AM'
  },
  {
    id: '4',
    userId: 'user-004',
    userName: 'Mike Wilson',
    email: 'mike@email.com',
    idType: 'Voter\'s Card',
    status: 'rejected',
    rejectionReason: 'Document is not clear. Please resubmit with better quality.',
    submittedAt: '2024-01-19 05:30 PM'
  }
]

export default function VerificationPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>(mockVerifications)
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const handleApprove = (id: string) => {
    setVerifications(verifications.map(v => 
      v.id === id ? { ...v, status: 'approved' } : v
    ))
    setSelectedVerification(null)
  }

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) return
    setVerifications(verifications.map(v => 
      v.id === id ? { ...v, status: 'rejected', rejectionReason } : v
    ))
    setRejectionReason('')
    setShowRejectModal(false)
    setSelectedVerification(null)
  }

  const pendingCount = verifications.filter(v => v.status === 'pending').length
  const approvedCount = verifications.filter(v => v.status === 'approved').length
  const rejectedCount = verifications.filter(v => v.status === 'rejected').length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Identity Verification</h1>
            <p className="text-sm text-muted-foreground">Approve or reject user identity documents</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-6 grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Approved</p>
          <p className="text-3xl font-bold text-success">{approvedCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Rejected</p>
          <p className="text-3xl font-bold text-destructive">{rejectedCount}</p>
        </div>
      </div>

      {/* Verification List */}
      <div className="px-6 py-6 space-y-3">
        {verifications.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No verifications to display</p>
          </div>
        ) : (
          verifications.map((verification) => (
            <div
              key={verification.id}
              className={`bg-card border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-all ${
                verification.status === 'pending' ? 'border-amber-500/30' : 'border-border'
              }`}
              onClick={() => setSelectedVerification(verification)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{verification.userName}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      verification.status === 'pending' ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100' :
                      verification.status === 'approved' ? 'bg-success/20 text-success' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{verification.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {verification.idType} • {verification.submittedAt}
                  </p>
                </div>
                <div className="text-right">
                  {verification.status === 'approved' && (
                    <CheckCircle className="w-6 h-6 text-success" />
                  )}
                  {verification.status === 'rejected' && (
                    <XCircle className="w-6 h-6 text-destructive" />
                  )}
                  {verification.status === 'pending' && (
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Verification Details</h2>
              <button
                onClick={() => setSelectedVerification(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Name</p>
                <p className="text-foreground">{selectedVerification.userName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Email</p>
                <p className="text-foreground">{selectedVerification.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">ID Type</p>
                <p className="text-foreground">{selectedVerification.idType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Submitted</p>
                <p className="text-foreground">{selectedVerification.submittedAt}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Status</p>
                <p className={`font-semibold ${
                  selectedVerification.status === 'approved' ? 'text-success' :
                  selectedVerification.status === 'rejected' ? 'text-destructive' :
                  'text-amber-500'
                }`}>
                  {selectedVerification.status.charAt(0).toUpperCase() + selectedVerification.status.slice(1)}
                </p>
              </div>
              {selectedVerification.rejectionReason && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Rejection Reason</p>
                  <p className="text-destructive text-sm">{selectedVerification.rejectionReason}</p>
                </div>
              )}
            </div>

            {selectedVerification.status === 'pending' && (
              <div className="space-y-3">
                <Button
                  onClick={() => handleApprove(selectedVerification.id)}
                  className="w-full h-10 rounded-lg bg-success hover:bg-success/90 text-success-foreground"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  className="w-full h-10 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}

            {selectedVerification.status !== 'pending' && (
              <Button
                onClick={() => setSelectedVerification(null)}
                variant="outline"
                className="w-full h-10 rounded-lg"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-foreground mb-4">Rejection Reason</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting this verification.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full h-24 p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowRejectModal(false)}
                variant="outline"
                className="flex-1 h-10 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleReject(selectedVerification.id)}
                disabled={!rejectionReason.trim()}
                className="flex-1 h-10 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50"
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
