'use client'
import React, { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import {
  ArrowLeft, Mail, MessageCircle, UserX, UserCheck, Trash2,
  ShieldCheck, ShieldX, MapPin, Phone, Calendar, User, RefreshCw,
  AlertCircle, Copy, Check, Zap,
} from "lucide-react"
import { adminApi } from "@/lib/api/admin"
import type { AdminUserFullProfile } from "@/lib/api/admin"
import { StatusBadge } from "@/components/admin/shared/Badge"
import { ConfirmModal } from "@/components/admin/shared/Modal"
import { formatDate } from "@/lib/utils/admin-format"
import type { AppUser } from "@/lib/types/admin"

const AVATAR_COLORS = ["#7c3aed","#a855f7","#8b5cf6","#6366f1","#c026d3","#9333ea"]
function avatarColor(id: string) {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

interface UserDetailPageProps {
  userId: string
  onBack: () => void
  onMessageUser: (user: AppUser) => void
  onMailUser: (user: AppUser) => void
}

type ConfirmType = "suspend" | "reinstate" | "delete"

function GrantConnectsModal({ name, onConfirm, onCancel }: { name: string; onConfirm: (amount: number) => Promise<void>; onCancel: () => void }) {
  const [amount, setAmount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (amount < 1 || amount > 100) return
    setLoading(true)
    setError(null)
    try {
      await onConfirm(amount)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to grant connects")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Grant Connects</h2>
            <p className="text-xs text-[var(--text-muted)]">{name}</p>
          </div>
        </div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Amount (1–100)</label>
        <input
          type="number"
          min={1}
          max={100}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-violet-500 mb-4"
        />
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-secondary)] text-sm hover:bg-[var(--bg-subtle-strong)] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || amount < 1 || amount > 100}
            className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {loading ? "Granting…" : `Grant ${amount}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function CopyField({ label, value }: { label: string; value: string | null | undefined }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    if (!value) return
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)] last:border-0">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--text-primary)] font-medium">{value || "—"}</span>
        {value && (
          <button onClick={copy} className="p-1 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)] last:border-0">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span className="text-sm text-[var(--text-primary)] font-medium">{value || "—"}</span>
    </div>
  )
}

export function UserDetailPage({ userId, onBack, onMessageUser, onMailUser }: UserDetailPageProps) {
  const [profile, setProfile] = useState<AdminUserFullProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmType | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showGrantConnects, setShowGrantConnects] = useState(false)
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getUserFullProfile(userId)
      setProfile(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  async function handleConfirm() {
    if (!profile || !confirmAction) return
    setActionLoading(true)
    try {
      if (confirmAction === "suspend") {
        await adminApi.suspendUser(profile.id)
        setProfile((p) => p ? { ...p, status: "suspended" } : p)
      } else if (confirmAction === "reinstate") {
        await adminApi.activateUser(profile.id)
        setProfile((p) => p ? { ...p, status: "active" } : p)
      } else if (confirmAction === "delete") {
        await adminApi.deleteUser(profile.id)
        onBack()
      }
    } catch {
      // keep current state on failure
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  function toAppUser(): AppUser {
    if (!profile) throw new Error("no profile")
    const name = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || profile.email
    return {
      id: profile.id,
      userId: profile.id.slice(-8).toUpperCase(),
      name,
      email: profile.email,
      phone: profile.phone_number ?? "",
      role: profile.role === "agent" ? "agent" : "individual",
      status: (profile.status ?? "active").toLowerCase() === "suspended" ? "suspended" : "active",
      joinDate: profile.created_at,
      avatarColor: avatarColor(profile.id),
      referralCode: profile.referral_code ?? "",
      referralsMade: profile.referrals_made ?? 0,
      connects: 0,
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-sm text-[var(--text-secondary)]">Loading profile…</span>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-[var(--text-secondary)]">{error ?? "User not found"}</p>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  const name = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || profile.email
  const isSuspended = (profile.status ?? "").toLowerCase() === "suspended"
  const color = avatarColor(profile.id)
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
  const idVerified = profile.is_identity_verified
  const selfieVerified = profile.is_live_verified
  const fullyVerified = idVerified && selfieVerified

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* Hero card */}
      <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-6 mb-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar / Photo */}
          <div className="relative shrink-0">
            {profile.profile_photo_url ? (
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[var(--border-color)]">
                <Image
                  src={profile.profile_photo_url}
                  alt={name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: color }}
              >
                {initials}
              </div>
            )}
            {fullyVerified && (
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[var(--bg-raised)]">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] truncate">{name}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{profile.email}</p>
            {profile.agency_name && (
              <p className="text-sm text-violet-400 mt-0.5">{profile.agency_name}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <StatusBadge status={profile.status} />
              <span className="text-xs font-medium capitalize px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                {profile.role === "agent" ? "Agent" : "Individual"}
              </span>
              {fullyVerified ? (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-500/15 text-[var(--text-tertiary)] border border-slate-500/20 flex items-center gap-1">
                  <ShieldX className="w-3 h-3" /> Unverified
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => onMessageUser(toAppUser())}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Message
            </button>
            <button
              onClick={() => onMailUser(toAppUser())}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors"
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            {isSuspended ? (
              <button
                onClick={() => setConfirmAction("reinstate")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-sm transition-colors"
              >
                <UserCheck className="w-4 h-4" /> Reinstate
              </button>
            ) : (
              <button
                onClick={() => setConfirmAction("suspend")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-sm transition-colors"
              >
                <UserX className="w-4 h-4" /> Suspend
              </button>
            )}
            <button
              onClick={() => setShowGrantConnects(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 text-sm transition-colors"
            >
              <Zap className="w-4 h-4" /> Grant Connects
            </button>
            <button
              onClick={() => setConfirmAction("delete")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Account details */}
        <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Account Details</h2>
          <div className="space-y-0">
            <InfoRow label="User ID" value={profile.id.slice(-12).toUpperCase()} />
            <InfoRow label="Phone" value={profile.phone_number} />
            <InfoRow label="Gender" value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : null} />
            <InfoRow label="Date of Birth" value={profile.date_of_birth ? formatDate(profile.date_of_birth) : null} />
            <InfoRow label="Location" value={[profile.city, profile.state].filter(Boolean).join(", ") || null} />
            <InfoRow label="Joined" value={formatDate(profile.created_at)} />
            <InfoRow label="Email Verified" value={profile.is_email_verified ? "Yes" : "No"} />
            {profile.role === "agent" && profile.years_of_experience != null && (
              <InfoRow label="Experience" value={`${profile.years_of_experience} yr${profile.years_of_experience !== 1 ? "s" : ""}`} />
            )}
          </div>
        </div>

        {/* Referrals */}
        <div className="bg-[var(--bg-raised)] border border-[var(--border-color)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Referrals</h2>
          <CopyField label="Referral Code" value={profile.referral_code} />
          <InfoRow label="Users Referred" value={String(profile.referrals_made ?? 0)} />

          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mt-5 mb-3">Verification</h2>
          <div className="space-y-0">
            <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)]">
              <span className="text-sm text-[var(--text-muted)]">ID Document</span>
              <div className="flex items-center gap-2">
                {profile.id_type && (
                  <span className="text-xs text-[var(--text-muted)] uppercase">{profile.id_type.replace(/_/g, " ")}</span>
                )}
                <StatusBadge status={profile.id_verification_status || "none"} />
              </div>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-[var(--text-muted)]">Selfie / Liveness</span>
              <StatusBadge status={profile.live_verification_status || "none"} />
            </div>
          </div>
        </div>
      </div>

      {showGrantConnects && (
        <GrantConnectsModal
          name={name}
          onConfirm={async (amount) => {
            await adminApi.grantConnects(profile.id, amount)
            setShowGrantConnects(false)
            setGrantSuccess(`${amount} connect${amount !== 1 ? 's' : ''} granted to ${name}`)
            setTimeout(() => setGrantSuccess(null), 4000)
          }}
          onCancel={() => setShowGrantConnects(false)}
        />
      )}

      {grantSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 text-white text-sm font-medium shadow-xl">
          <Zap className="w-4 h-4" /> {grantSuccess}
        </div>
      )}

      <ConfirmModal
        open={!!confirmAction}
        title={
          confirmAction === "delete" ? "Delete user?" :
          confirmAction === "reinstate" ? "Reinstate user?" : "Suspend user?"
        }
        description={
          confirmAction === "delete"
            ? `This will permanently remove ${name} from the platform.`
            : confirmAction === "reinstate"
            ? `${name} will regain full access to the platform.`
            : `${name} will lose access to the platform until reinstated.`
        }
        confirmLabel={confirmAction === "delete" ? "Delete" : confirmAction === "reinstate" ? "Reinstate" : "Suspend"}
        danger={confirmAction !== "reinstate"}
        icon={<UserX className="w-6 h-6 text-red-400" />}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
