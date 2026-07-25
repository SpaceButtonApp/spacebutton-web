'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'
import Image from 'next/image'
import {
  CheckCircle, Clock, XCircle, Upload, ShieldCheck, AlertCircle, Camera,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/back-button'
import { verificationApi } from '@/lib/api/users'
import type { VerificationStatus } from '@/lib/types/user'

const ID_TYPES = [
  { value: 'NIN', label: 'NIN (National ID Number)', numberLabel: 'NIN Number', placeholder: '11-digit NIN', maxLength: 11 },
  { value: 'PASSPORT', label: 'International Passport', numberLabel: 'Passport Number', placeholder: 'e.g. A12345678', maxLength: 20 },
  { value: 'DRIVERS_LICENSE', label: "Driver's License", numberLabel: "License Number", placeholder: 'e.g. ABC12345DE', maxLength: 20 },
  { value: 'VOTER_CARD', label: "Voter's Card", numberLabel: "Voter ID Number", placeholder: 'e.g. 1234567890', maxLength: 20 },
]

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
      <CheckCircle className="w-4 h-4" /> Verified
    </span>
  )
  if (status === 'pending') return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-medium">
      <Clock className="w-4 h-4" /> Under Review
    </span>
  )
  if (status === 'rejected') return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
      <XCircle className="w-4 h-4" /> Rejected
    </span>
  )
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
      <AlertCircle className="w-4 h-4" /> Not Submitted
    </span>
  )
}

function FileDropZone({
  preview, accept, capture, label, icon: Icon, onChange,
}: {
  preview: string | null
  accept: string
  capture?: 'user' | 'environment'
  label: string
  icon: React.ElementType
  onChange: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors bg-secondary/50 min-h-[140px] relative overflow-hidden"
    >
      {preview ? (
        <Image src={preview} alt="Preview" fill className="object-cover rounded-xl" unoptimized />
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground text-center">{label}</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        {...(capture ? { capture } : {})}
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0]
          if (file) onChange(file)
        }}
      />
    </button>
  )
}

type ApiErr = { response?: { data?: { message?: string } } }

export default function VerificationPage() {
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const [idType, setIdType] = useState('NIN')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const [documentNumber, setDocumentNumber] = useState('')
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    verificationApi.getStatus()
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const refresh = async () => {
    const s = await verificationApi.getStatus()
    setStatus(s)
    setIdFile(null); setIdPreview(null)
    setSelfieFile(null); setSelfiePreview(null)
  }

  const handleSubmitBoth = async () => {
    if (!idFile) { setError('Please upload your ID document.'); return }
    if (!selfieFile) { setError('Please upload a selfie photo.'); return }
    setSubmitting(true); setError(''); setMessage('')
    try {
      const msg = await verificationApi.submitBoth(idType, idFile, selfieFile, documentNumber.trim() || undefined)
      setMessage(msg)
      await refresh()
    } catch (err) {
      const e = err as ApiErr
      setError(e?.response?.data?.message ?? 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitId = async () => {
    if (!idFile) { setError('Please upload your ID document.'); return }
    setSubmitting(true); setError(''); setMessage('')
    try {
      const msg = await verificationApi.submitId(idType, idFile, documentNumber.trim() || undefined)
      setMessage(msg)
      await refresh()
    } catch (err) {
      const e = err as ApiErr
      setError(e?.response?.data?.message ?? 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitSelfie = async () => {
    if (!selfieFile) { setError('Please upload a selfie photo.'); return }
    setSubmitting(true); setError(''); setMessage('')
    try {
      const msg = await verificationApi.submitSelfie(selfieFile)
      setMessage(msg)
      await refresh()
    } catch (err) {
      const e = err as ApiErr
      setError(e?.response?.data?.message ?? 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const idStatus = status?.id_verification_status ?? 'none'
  const selfieStatus = status?.live_verification_status ?? 'none'
  const anyPending = idStatus === 'pending' || selfieStatus === 'pending'
  const idApproved = idStatus === 'approved'
  const selfieApproved = selfieStatus === 'approved'
  const fullyVerified = idApproved && selfieApproved

  // combined: neither is approved yet — first time or both rejected
  const showCombined = !anyPending && !fullyVerified && !idApproved && !selfieApproved
  // id-only: selfie already approved, ID needs action (rejected or none)
  const showIdOnly = !anyPending && !fullyVerified && selfieApproved && !idApproved
  // selfie-only: ID already approved, selfie needs action (rejected or none)
  const showSelfieOnly = !anyPending && !fullyVerified && idApproved && !selfieApproved

  const overallStatus = fullyVerified ? 'fully' : (idApproved || selfieApproved) ? 'partial' : 'none'
  const selected = ID_TYPES.find(t => t.value === idType)!

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <BackButton />
        <h1 className="text-lg font-bold">Verify Account</h1>
      </div>

      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">

        {/* Overall status banner */}
        {!loading && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            overallStatus === 'fully' ? 'bg-green-500/10 border-green-500/20'
              : overallStatus === 'partial' ? 'bg-yellow-500/10 border-yellow-500/20'
                : 'bg-secondary border-border'
          }`}>
            <ShieldCheck className={`w-8 h-8 flex-shrink-0 ${
              overallStatus === 'fully' ? 'text-green-600'
                : overallStatus === 'partial' ? 'text-yellow-600'
                  : 'text-muted-foreground'
            }`} />
            <div>
              <p className="font-semibold text-foreground">
                {overallStatus === 'fully' ? 'Fully Verified'
                  : overallStatus === 'partial' ? 'Partially Verified'
                    : 'Not Yet Verified'}
              </p>
              <p className="text-sm text-muted-foreground">
                {overallStatus === 'fully'
                  ? 'Your account is fully verified. You can post listings.'
                  : overallStatus === 'partial'
                    ? 'One document is verified. Complete the other to unlock posting.'
                    : 'Submit your ID document and a selfie to unlock all features.'}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-48 rounded-xl bg-secondary animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Pending — show status cards; user must wait */}
            {anyPending && (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">ID Document</p>
                    {idStatus === 'approved' && <p className="text-sm text-green-600 mt-0.5">Verified</p>}
                    {idStatus === 'pending' && <p className="text-sm text-muted-foreground mt-0.5">Under review — we&apos;ll notify you when done</p>}
                    {idStatus === 'rejected' && (
                      <>
                        <p className="text-sm text-destructive mt-0.5">Rejected</p>
                        {status?.id_rejection_reason && <p className="text-xs text-muted-foreground mt-0.5">{status.id_rejection_reason}</p>}
                      </>
                    )}
                  </div>
                  <StatusBadge status={idStatus} />
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Selfie</p>
                    {selfieStatus === 'approved' && <p className="text-sm text-green-600 mt-0.5">Verified</p>}
                    {selfieStatus === 'pending' && <p className="text-sm text-muted-foreground mt-0.5">Under review — we&apos;ll notify you when done</p>}
                    {selfieStatus === 'rejected' && (
                      <>
                        <p className="text-sm text-destructive mt-0.5">Rejected</p>
                        {status?.live_rejection_reason && <p className="text-xs text-muted-foreground mt-0.5">{status.live_rejection_reason}</p>}
                      </>
                    )}
                  </div>
                  <StatusBadge status={selfieStatus} />
                </div>
              </div>
            )}

            {/* Combined form — first-time or both rejected */}
            {showCombined && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-secondary/50">
                  <p className="font-semibold text-foreground">Submit Verification Documents</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Both your ID document and a selfie are required</p>
                </div>
                <div className="p-4 space-y-5">

                  {/* ID section */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">1. ID Document</p>
                    {status?.id_rejection_reason && (
                      <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">Previous ID was rejected</p>
                          <p className="text-sm text-muted-foreground">{status.id_rejection_reason}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">ID Type</label>
                      <select
                        value={idType}
                        onChange={e => { setIdType(e.target.value); setDocumentNumber('') }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {selected.numberLabel}{' '}
                        <span className="text-muted-foreground font-normal">
                          {idType === 'NIN' ? '(optional — enables instant approval)' : '(optional — prevents duplicate submissions)'}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={documentNumber}
                        onChange={e => setDocumentNumber(e.target.value)}
                        placeholder={selected.placeholder}
                        maxLength={selected.maxLength}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      {idType === 'NIN' && documentNumber && !/^\d{11}$/.test(documentNumber) && (
                        <p className="text-xs text-destructive mt-1">NIN must be exactly 11 digits</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">ID Photo</label>
                      <FileDropZone
                        preview={idPreview}
                        accept="image/*"
                        label="Tap to upload a clear photo of your ID"
                        icon={Upload}
                        onChange={f => { setIdFile(f); setIdPreview(URL.createObjectURL(f)); setError('') }}
                      />
                      {idPreview && (
                        <button onClick={() => { setIdFile(null); setIdPreview(null) }} className="text-xs text-muted-foreground mt-1.5 hover:text-destructive">
                          Remove photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Selfie section */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">2. Selfie Photo</p>
                    {status?.live_rejection_reason && (
                      <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">Previous selfie was rejected</p>
                          <p className="text-sm text-muted-foreground">{status.live_rejection_reason}</p>
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Take a clear selfie with your face visible. Make sure you&apos;re in good lighting.
                    </p>
                    <FileDropZone
                      preview={selfiePreview}
                      accept="image/*"
                      capture="user"
                      label="Tap to take a selfie with your front camera"
                      icon={Camera}
                      onChange={f => { setSelfieFile(f); setSelfiePreview(URL.createObjectURL(f)); setError('') }}
                    />
                    {selfiePreview && (
                      <button onClick={() => { setSelfieFile(null); setSelfiePreview(null) }} className="text-xs text-muted-foreground mt-1.5 hover:text-destructive">
                        Remove photo
                      </button>
                    )}
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}
                  {message && <p className="text-sm text-green-600">{message}</p>}

                  <Button onClick={handleSubmitBoth} disabled={submitting || !idFile || !selfieFile} className="w-full">
                    {submitting ? 'Submitting...' : 'Submit Both Documents'}
                  </Button>
                </div>
              </div>
            )}

            {/* ID-only resubmission — selfie already approved */}
            {showIdOnly && (
              <>
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-green-600">Selfie verified successfully</p>
                </div>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-secondary/50 flex items-center justify-between">
                    <span className="font-semibold">ID Document</span>
                    <StatusBadge status={idStatus} />
                  </div>
                  <div className="p-4 space-y-4">
                    {status?.id_rejection_reason && (
                      <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">Rejection reason</p>
                          <p className="text-sm text-muted-foreground">{status.id_rejection_reason}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">ID Type</label>
                      <select
                        value={idType}
                        onChange={e => { setIdType(e.target.value); setDocumentNumber('') }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {selected.numberLabel}{' '}
                        <span className="text-muted-foreground font-normal">
                          {idType === 'NIN' ? '(optional — enables instant approval)' : '(optional — prevents duplicate submissions)'}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={documentNumber}
                        onChange={e => setDocumentNumber(e.target.value)}
                        placeholder={selected.placeholder}
                        maxLength={selected.maxLength}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      {idType === 'NIN' && documentNumber && !/^\d{11}$/.test(documentNumber) && (
                        <p className="text-xs text-destructive mt-1">NIN must be exactly 11 digits</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Upload ID Photo</label>
                      <FileDropZone
                        preview={idPreview}
                        accept="image/*"
                        label="Tap to upload a clear photo of your ID"
                        icon={Upload}
                        onChange={f => { setIdFile(f); setIdPreview(URL.createObjectURL(f)); setError('') }}
                      />
                      {idPreview && (
                        <button onClick={() => { setIdFile(null); setIdPreview(null) }} className="text-xs text-muted-foreground mt-1.5 hover:text-destructive">
                          Remove photo
                        </button>
                      )}
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {message && <p className="text-sm text-green-600">{message}</p>}
                    <Button onClick={handleSubmitId} disabled={submitting || !idFile} className="w-full">
                      {submitting ? 'Submitting...' : 'Resubmit ID Document'}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Selfie-only resubmission — ID already approved */}
            {showSelfieOnly && (
              <>
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-green-600">ID document verified successfully</p>
                </div>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-secondary/50 flex items-center justify-between">
                    <span className="font-semibold">Selfie Verification</span>
                    <StatusBadge status={selfieStatus} />
                  </div>
                  <div className="p-4 space-y-4">
                    {status?.live_rejection_reason && (
                      <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">Rejection reason</p>
                          <p className="text-sm text-muted-foreground">{status.live_rejection_reason}</p>
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Take a clear selfie with your face visible. Make sure you&apos;re in good lighting.
                    </p>
                    <FileDropZone
                      preview={selfiePreview}
                      accept="image/*"
                      capture="user"
                      label="Tap to take a selfie with your front camera"
                      icon={Camera}
                      onChange={f => { setSelfieFile(f); setSelfiePreview(URL.createObjectURL(f)); setError('') }}
                    />
                    {selfiePreview && (
                      <button onClick={() => { setSelfieFile(null); setSelfiePreview(null) }} className="text-xs text-muted-foreground mt-1.5 hover:text-destructive">
                        Remove photo
                      </button>
                    )}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {message && <p className="text-sm text-green-600">{message}</p>}
                    <Button onClick={handleSubmitSelfie} disabled={submitting || !selfieFile} className="w-full">
                      {submitting ? 'Submitting...' : 'Resubmit Selfie'}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Info note */}
            <div className="flex gap-2 p-3 rounded-lg bg-secondary border border-border">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Your documents are securely stored and only used for identity verification.
                NIN submissions with a valid number are approved instantly.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
