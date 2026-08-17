'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supportApi as userSupportApi } from '@/lib/api/chat'
import { useAppStore } from '@/lib/store'

interface ListingRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ListingRequestModal({ isOpen, onClose }: ListingRequestModalProps) {
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const [propertyType, setPropertyType] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [other, setOther] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const canSubmit = propertyType.trim() && location.trim() && budget.trim()

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError('')
    try {
      await userSupportApi.init(user?.name || 'SpaceButton User')
      const message = [
        "🏠 Listing Request — I couldn't find what I'm looking for on the app:",
        `• Property type: ${propertyType}`,
        `• Location: ${location}`,
        `• Budget: ${budget}`,
        other.trim() ? `• Other: ${other.trim()}` : null,
        '',
        'Please help me find a matching listing. Thank you!',
      ].filter(Boolean).join('\n')
      await userSupportApi.send(message)
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function resetAndClose() {
    setSubmitted(false)
    setPropertyType('')
    setLocation('')
    setBudget('')
    setOther('')
    setError('')
    onClose()
  }

  function handleViewChat() {
    resetAndClose()
    router.push('/chat/admin-support')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="mx-4 w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-background p-6 shadow-lg max-h-[85vh] overflow-y-auto">
        {submitted ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Request Sent!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Thanks — we&apos;ve got your preferences. Our team will get back to you with matching listings within 24 hours.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Button onClick={handleViewChat} className="w-full rounded-xl h-12">View Chat</Button>
              <Button variant="outline" onClick={resetAndClose} className="w-full rounded-xl h-12">Done</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold">Can&apos;t Find Your Perfect Space?</h2>
              <button onClick={resetAndClose} className="text-muted-foreground" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Tell us what you&apos;re looking for and our team will find matching listings for you — usually within 24 hours.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Property Type</label>
                <input
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  placeholder="Two Bedroom Flat"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Preferred Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lekki, Lagos"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Budget</label>
                <input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. ₦800,000/year"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Other preferences <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <textarea
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  placeholder="Must haves, other e.t.c"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive mt-3">{error}</p>}

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full rounded-xl h-12 mt-5"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Request'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
