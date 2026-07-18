'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'
import Image from 'next/image'
import {
  CheckCircle, Clock, XCircle, Upload, ShieldCheck,
  AlertCircle, Camera, ChevronRight,
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
  preview,
  accept,
  capture,
  label,
  icon: Icon,
  onChange,
}: {
  preview: string | null
  accept: string
  capture?: 'user' | 'environment'
  label: string
  icon: React.ElementType
  onChange: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onChange(file)
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors bg-secondary/50 min-h-[140px] relative overflow-hidden"
    >
      {preview ? (
        <Image
          src={preview}
          alt="Preview"
          fill
          className="object-cover rounded-xl"
          unoptimized
        />
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
        onChange={handleChange}
      />
    </button>
  )
}

export default function VerificationPage() {
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // ID form state
  const [idType, setIdType] = useState('NIN')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const [documentNumber, setDocumentNumber] = useState('')
  const [idSubmitting, setIdSubmitting] = useState(false)
  const [idMessage, setIdMessage] = useState('')
  const [idError, setIdError] = useState('')

  // Selfie form state
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [selfieSubmitting, setSelfieSubmitting] = useState(false)
  const [selfieMessage, setSelfieMessage] = useState('')
  const [selfieError, setSelfieError] = useState('')

  useEffect(() => {
    verificationApi.getStatus()
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleIdFileChange = (file: File) => {
    setIdFile(file)
    setIdPreview(URL.createObjectURL(file))
    setIdError('')
  }

  const handleSelfieFileChange = (file: File) => {
    setSelfieFile(file)
    setSelfiePreview(URL.createObjectURL(file))
    setSelfieError('')
  }

  const handleSubmitId = async () => {
    if (!idFile) { setIdError('Please select a file.'); return }
    setIdSubmitting(true)
    setIdError('')
    setIdMessage('')
    try {
      const msg = await verificationApi.submitId(
        idType,
        idFile,
        documentNumber.trim() || undefined,
      )
      setIdMessage(msg)
      const updated = await verificationApi.getStatus()
      setStatus(updated)
      setIdFile(null)
      setIdPreview(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setIdError(e?.response?.data?.message ?? 'Submission failed. Please try again.')
    } finally {
      setIdSubmitting(false)
    }
  }

  const handleSubmitSelfie = async () => {
    if (!selfieFile) { setSelfieError('Please select a photo.'); return }
    setSelfieSubmitting(true)
    setSelfieError('')
    setSelfieMessage('')
    try {
      const msg = await verificationApi.submitSelfie(selfieFile)
      setSelfieMessage(msg)
      const updated = await verificationApi.getStatus()
      setStatus(updated)
      setSelfieFile(null)
      setSelfiePreview(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setSelfieError(e?.response?.data?.message ?? 'Submission failed. Please try again.')
    } finally {
      setSelfieSubmitting(false)
    }
  }

  const idStatus = status?.id_verification_status ?? 'none'
  const selfieStatus = status?.live_verification_status ?? 'none'
  const idLocked = idStatus === 'approved' || idStatus === 'pending'
  const selfieLocked = selfieStatus === 'approved' || selfieStatus === 'pending'
  // Selfie can only be submitted after ID is at least submitted
  const selfieBlocked = idStatus === 'none'

  const overallStatus = status?.is_fully_verified
    ? 'fully'
    : status?.is_identity_verified
      ? 'partial'
      : 'none'

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <BackButton />
        <h1 className="text-lg font-bold">Verify Account</h1>
      </div>

      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">

        {/* Overall status banner */}
        {!loading && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            overallStatus === 'fully'
              ? 'bg-green-500/10 border-green-500/20'
              : overallStatus === 'partial'
                ? 'bg-yellow-500/10 border-yellow-500/20'
                : 'bg-secondary border-border'
          }`}>
            <ShieldCheck className={`w-8 h-8 flex-shrink-0 ${
              overallStatus === 'fully' ? 'text-green-600'
                : overallStatus === 'partial' ? 'text-yellow-600'
                  : 'text-muted-foreground'
            }`} />
            <div>
              <p className="font-semibold text-foreground">
                {overallStatus === 'fully'
                  ? 'Fully Verified'
                  : overallStatus === 'partial'
                    ? 'Partially Verified'
                    : 'Not Yet Verified'}
              </p>
              <p className="text-sm text-muted-foreground">
                {overallStatus === 'fully'
                  ? 'Your account is fully verified. You can post listings.'
                  : overallStatus === 'partial'
                    ? 'ID verified. Complete selfie verification to post listings.'
                    : 'Verify your ID and selfie to unlock all features.'}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* ── STEP 1: ID VERIFICATION ── */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {idStatus === 'approved' ? <CheckCircle className="w-4 h-4" /> : '1'}
                  </span>
                  <span className="font-semibold text-foreground">ID Verification</span>
                </div>
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

                {idStatus === 'approved' ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">ID verified successfully</span>
                  </div>
                ) : idStatus === 'pending' ? (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">Your ID is being reviewed. We&apos;ll notify you once done.</span>
                  </div>
                ) : (
                  /* Upload form — shown when none or rejected */
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">ID Type</label>
                      <select
                        value={idType}
                        onChange={e => { setIdType(e.target.value); setDocumentNumber('') }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {ID_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {(() => {
                      const selected = ID_TYPES.find(t => t.value === idType)!
                      return (
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
                      )
                    })()}

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Upload ID Photo</label>
                      <FileDropZone
                        preview={idPreview}
                        accept="image/*"
                        label="Tap to upload a clear photo of your ID"
                        icon={Upload}
                        onChange={handleIdFileChange}
                      />
                      {idPreview && (
                        <button
                          onClick={() => { setIdFile(null); setIdPreview(null) }}
                          className="text-xs text-muted-foreground mt-1.5 hover:text-destructive"
                        >
                          Remove photo
                        </button>
                      )}
                    </div>

                    {idError && <p className="text-sm text-destructive">{idError}</p>}
                    {idMessage && <p className="text-sm text-green-600">{idMessage}</p>}

                    <Button
                      onClick={handleSubmitId}
                      disabled={idSubmitting || !idFile}
                      className="w-full"
                    >
                      {idSubmitting ? 'Submitting...' : 'Submit ID'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* ── STEP 2: SELFIE VERIFICATION ── */}
            <div className={`rounded-xl border bg-card overflow-hidden ${selfieBlocked ? 'opacity-60' : 'border-border'}`}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {selfieStatus === 'approved' ? <CheckCircle className="w-4 h-4" /> : '2'}
                  </span>
                  <span className="font-semibold text-foreground">Selfie Verification</span>
                </div>
                <StatusBadge status={selfieStatus} />
              </div>

              <div className="p-4 space-y-4">
                {selfieBlocked ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Complete Step 1 first before submitting your selfie.</span>
                  </div>
                ) : status?.live_rejection_reason ? (
                  <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Rejection reason</p>
                      <p className="text-sm text-muted-foreground">{status.live_rejection_reason}</p>
                    </div>
                  </div>
                ) : null}

                {!selfieBlocked && selfieStatus === 'approved' ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Selfie verified successfully</span>
                  </div>
                ) : !selfieBlocked && selfieStatus === 'pending' ? (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">Your selfie is being reviewed. We&apos;ll notify you once done.</span>
                  </div>
                ) : !selfieBlocked ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Take a clear selfie with your face visible. Make sure you&apos;re in good lighting.
                    </p>

                    <FileDropZone
                      preview={selfiePreview}
                      accept="image/*"
                      capture="user"
                      label="Tap to take a selfie with your front camera"
                      icon={Camera}
                      onChange={handleSelfieFileChange}
                    />
                    {selfiePreview && (
                      <button
                        onClick={() => { setSelfieFile(null); setSelfiePreview(null) }}
                        className="text-xs text-muted-foreground mt-1.5 hover:text-destructive"
                      >
                        Remove photo
                      </button>
                    )}

                    {selfieError && <p className="text-sm text-destructive">{selfieError}</p>}
                    {selfieMessage && <p className="text-sm text-green-600">{selfieMessage}</p>}

                    <Button
                      onClick={handleSubmitSelfie}
                      disabled={selfieSubmitting || !selfieFile}
                      className="w-full"
                    >
                      {selfieSubmitting ? 'Submitting...' : 'Submit Selfie'}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

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
