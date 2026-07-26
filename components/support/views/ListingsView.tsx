'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supportApi } from '@/lib/api/support'
import type { AdminListing, AdminAgent } from '@/lib/api/admin'

// ─── Data mapping ────────────────────────────────────────────────────────────

const CONDITION_LABELS: Record<string, string> = {
  for_rent: 'Rent', need_roommate: 'Roommate', flatmate: 'Flatmate', subletting: 'Vacating',
}
const PROP_TYPE_LABELS: Record<string, string> = {
  apartment: 'Flat', house: 'House', self_contain: 'Self Contain',
  room_and_parlour: 'Room & Parlour', duplex: 'Duplex', storey: 'Storey', penthouse: 'Penthouse',
}
const LANDLORD_LABELS: Record<string, string> = {
  stays: 'Landlord stays in compound',
  'not-stays': 'Does not live in compound',
}

interface ListingRow {
  id: string
  title: string
  description: string
  location: string
  price: number
  rentPeriod: string
  categoryDisplay: string
  condition: string
  approval: 'pending' | 'approved' | 'rejected'
  status: 'active' | 'closed'
  bedrooms?: number
  bathrooms?: number
  sittingRooms?: number
  balconies?: number
  rentDueDate?: string | null
  landlordPresence?: string
  facilities: string[]
  ownerType: string
  totalPackage?: number
  images: string[]
  videoUrl?: string
  agentId: string
  agentName: string
  agentEmail: string
  createdDate: string
}

function mapListing(l: AdminListing, agentMap: Map<string, AdminAgent>): ListingRow {
  const agent = agentMap.get(l.agent_id)
  const agentName = agent
    ? [agent.first_name, agent.last_name].filter(Boolean).join(' ') || agent.agency_name || 'Unknown'
    : 'Unknown'
  const price = parseFloat(l.price ?? '0') || 0
  const statusRaw = (l.status ?? '').toLowerCase()
  let approval: ListingRow['approval']
  let status: ListingRow['status']
  if (statusRaw === 'pending') { approval = 'pending'; status = 'closed' }
  else if (statusRaw === 'rejected') { approval = 'rejected'; status = 'closed' }
  else if (statusRaw === 'active') { approval = 'approved'; status = 'active' }
  else if (statusRaw === 'closed') { approval = 'approved'; status = 'closed' }
  else { approval = 'pending'; status = 'closed' }

  let facilities: string[] = []
  try { if (l.facilities) facilities = JSON.parse(l.facilities) as string[] } catch { /* ignore */ }

  return {
    id: l.id,
    title: l.title,
    description: l.description ?? '',
    location: [l.address, l.city, l.state].filter(Boolean).join(', ') || '—',
    price,
    rentPeriod: l.rent_period ?? '',
    categoryDisplay: PROP_TYPE_LABELS[l.property_type ?? ''] ?? l.property_type ?? '—',
    condition: CONDITION_LABELS[l.category ?? ''] ?? '',
    approval,
    status,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    sittingRooms: l.sitting_rooms,
    balconies: l.balconies,
    rentDueDate: l.rent_due_date,
    landlordPresence: LANDLORD_LABELS[l.landlord_presence ?? ''] ?? l.landlord_presence ?? '',
    facilities,
    ownerType: l.owner_type ?? 'user',
    totalPackage: l.total_package ? parseFloat(l.total_package) : undefined,
    images: (l.images ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(i => i.image_url).filter(Boolean),
    videoUrl: l.video_tour_url,
    agentId: l.agent_id,
    agentName,
    agentEmail: agent?.email ?? '',
    createdDate: l.created_at,
  }
}

function formatNaira(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Approval badge ──────────────────────────────────────────────────────────

function ApprovalBadge({ approval }: { approval: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Pending' },
    approved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Approved' },
    rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Rejected' },
  }
  const s = map[approval] ?? map.pending
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
      {s.label}
    </span>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ListingsView() {
  const [listings, setListings] = useState<ListingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [detail, setDetail] = useState<ListingRow | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [listData, agentsData] = await Promise.allSettled([
        supportApi.getListings(1, 100),
        supportApi.getAgents(1, 100),
      ])
      if (listData.status === 'rejected') throw listData.reason
      const agentMap = new Map<string, AdminAgent>()
      if (agentsData.status === 'fulfilled') {
        for (const a of agentsData.value.agents ?? []) {
          agentMap.set(a.id, a); agentMap.set(a.user_id, a)
        }
      }
      setListings(listData.value.listings.map(l => mapListing(l, agentMap)))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load listings')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    let list = listings
    if (filter !== 'all') list = list.filter(l => l.approval === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.agentName.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
  }, [listings, filter, search])

  async function handleApprove(id: string) {
    setActionLoading(true)
    try {
      await supportApi.approveListing(id)
      const upd = (l: ListingRow) => l.id === id ? { ...l, approval: 'approved' as const, status: 'active' as const } : l
      setListings(p => p.map(upd))
      setDetail(p => p ? upd(p) : p)
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed to approve') }
    finally { setActionLoading(false) }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) return
    setActionLoading(true)
    try {
      await supportApi.rejectListing(id, rejectReason)
      const upd = (l: ListingRow) => l.id === id ? { ...l, approval: 'rejected' as const, status: 'closed' as const } : l
      setListings(p => p.map(upd))
      setDetail(p => p ? upd(p) : p)
      setRejectReason(''); setShowRejectForm(false)
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed to reject') }
    finally { setActionLoading(false) }
  }

  // ── full-page detail ──────────────────────────────────────────────────────
  if (detail) {
    return (
      <ListingDetail
        listing={detail}
        actionLoading={actionLoading}
        rejectReason={rejectReason}
        showRejectForm={showRejectForm}
        onRejectReasonChange={setRejectReason}
        onToggleRejectForm={() => setShowRejectForm(s => !s)}
        onApprove={() => handleApprove(detail.id)}
        onReject={() => handleReject(detail.id)}
        onBack={() => { setDetail(null); setShowRejectForm(false); setRejectReason('') }}
      />
    )
  }

  const pendingCount = listings.filter(l => l.approval === 'pending').length
  const approvedCount = listings.filter(l => l.approval === 'approved').length
  const rejectedCount = listings.filter(l => l.approval === 'rejected').length

  return (
    <div className="sp-view-container">
      {/* Summary */}
      <div className="sp-listings-summary">
        {[
          { title: 'Total', value: listings.length, cls: '' },
          { title: 'Pending', value: pendingCount, cls: 'val-yellow' },
          { title: 'Approved', value: approvedCount, cls: 'val-green' },
          { title: 'Rejected', value: rejectedCount, cls: '' },
        ].map(s => (
          <div key={s.title} className="sp-summary-card">
            <div className="sp-summary-title">{s.title}</div>
            <div className={`sp-summary-value ${s.cls}`}>{loading ? '…' : s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="sp-listings-filter-bar">
        <div className="sp-filter-controls-left" style={{ gap: 8 }}>
          <div className="sp-role-filter-group">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                className={`sp-filter-tab${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <input
            className="sp-form-input"
            style={{ maxWidth: 220 }}
            placeholder="Search title, location, agent…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={`sp-view-toggle-btn${viewMode === 'table' ? ' active' : ''}`}
            onClick={() => setViewMode('table')}
          >≡ Table</button>
          <button
            className={`sp-view-toggle-btn${viewMode === 'grid' ? ' active' : ''}`}
            onClick={() => setViewMode('grid')}
          >⊞ Grid</button>
        </div>
      </div>

      {error && <div style={{ color: 'var(--sp-trend-down)', fontSize: 13, marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--sp-text-muted)', padding: 60, fontSize: 13 }}>Loading listings…</div>
      ) : viewMode === 'table' ? (
        <div className="sp-table-card">
          <table className="sp-data-table">
            <thead>
              <tr><th>Listing</th><th>Owner</th><th>Type</th><th>Price</th><th>Approval</th><th>Listed</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {l.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.images[0]} alt={l.title} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--sp-surface-2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏠</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{l.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>📍 {l.location}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>{l.agentName}</td>
                  <td style={{ fontSize: 12 }}>{l.categoryDisplay}</td>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{l.price ? formatNaira(l.price) : '—'}</td>
                  <td><ApprovalBadge approval={l.approval} /></td>
                  <td style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>{formatDate(l.createdDate)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="sp-btn sp-btn-small" onClick={() => setDetail(l)}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="sp-table-empty-row">No listings match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="sp-property-grid">
          {filtered.map(l => (
            <div key={l.id} className="sp-property-card" onClick={() => setDetail(l)} style={{ cursor: 'pointer' }}>
              <div className="sp-property-image">
                {l.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.images[0]} alt={l.title} className="sp-property-img" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, background: 'var(--sp-surface-2)' }}>🏠</div>
                )}
                <span style={{ position: 'absolute', top: 8, right: 8 }}><ApprovalBadge approval={l.approval} /></span>
              </div>
              <div className="sp-property-content">
                <div>
                  <p className="sp-property-title">{l.title}</p>
                  <p className="sp-property-location">📍 {l.location}</p>
                </div>
                <div className="sp-property-footer">
                  <span className="sp-property-price">
                    {l.price ? formatNaira(l.price) : '—'}
                    {l.rentPeriod && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--sp-text-muted)' }}>/{l.rentPeriod}</span>}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--sp-text-muted)', padding: 40 }}>
              No listings match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Full-page detail ────────────────────────────────────────────────────────

function ListingDetail({
  listing, actionLoading, rejectReason, showRejectForm,
  onRejectReasonChange, onToggleRejectForm, onApprove, onReject, onBack,
}: {
  listing: ListingRow
  actionLoading: boolean
  rejectReason: string
  showRejectForm: boolean
  onRejectReasonChange: (v: string) => void
  onToggleRejectForm: () => void
  onApprove: () => void
  onReject: () => void
  onBack: () => void
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [data, setData] = useState<ListingRow>(listing)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    setData(prev => ({ ...prev, approval: listing.approval, status: listing.status }))
  }, [listing.approval, listing.status])

  useEffect(() => {
    let cancelled = false
    setFetching(true)
    supportApi.getListing(listing.id).then(l => {
      if (cancelled) return
      let facilities: string[] = []
      try { if (l.facilities) facilities = JSON.parse(l.facilities) as string[] } catch { /* ignore */ }
      const freshImages = (l.images ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(i => i.image_url).filter(Boolean)
      setData(prev => ({
        ...prev,
        images: freshImages.length > 0 ? freshImages : prev.images,
        videoUrl: l.video_tour_url ?? prev.videoUrl,
        bedrooms: l.bedrooms ?? prev.bedrooms,
        bathrooms: l.bathrooms ?? prev.bathrooms,
        sittingRooms: l.sitting_rooms ?? prev.sittingRooms,
        balconies: l.balconies ?? prev.balconies,
        rentDueDate: l.rent_due_date ?? prev.rentDueDate,
        landlordPresence: l.landlord_presence
          ? (LANDLORD_LABELS[l.landlord_presence] ?? l.landlord_presence)
          : prev.landlordPresence,
        facilities: facilities.length > 0 ? facilities : prev.facilities,
        condition: l.category ? (CONDITION_LABELS[l.category] ?? prev.condition) : prev.condition,
        description: l.description ?? prev.description,
        totalPackage: l.total_package ? parseFloat(String(l.total_package)) : prev.totalPackage,
      }))
    }).finally(() => { if (!cancelled) setFetching(false) })
    return () => { cancelled = true }
  }, [listing.id])

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Back bar */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--sp-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button className="sp-btn sp-btn-small" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back to listings
        </button>
        {fetching && (
          <span style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>Loading full details…</span>
        )}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>

        {/* LEFT: image gallery (sticky) */}
        <div style={{ position: 'sticky', top: 0, alignSelf: 'flex-start', width: '45%', flexShrink: 0, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Main image */}
          <div
            style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#000', aspectRatio: '4/3', cursor: data.images[imgIdx] ? 'zoom-in' : 'default' }}
            onClick={() => data.images[imgIdx] && setLightbox(data.images[imgIdx])}
          >
            {data.images[imgIdx] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.images[imgIdx]} alt={data.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sp-surface-2)', fontSize: 48 }}>
                {fetching ? '⏳' : '🏠'}
              </div>
            )}

            {/* Approval badge overlay */}
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
              <ApprovalBadge approval={data.approval} />
            </div>

            {/* Image counter */}
            {data.images.length > 1 && (
              <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>
                {imgIdx + 1} / {data.images.length}
              </div>
            )}

            {/* Prev/Next arrows */}
            {data.images.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + data.images.length) % data.images.length) }}
                  style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >‹</button>
                <button
                  onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % data.images.length) }}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >›</button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {data.images.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {data.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  style={{
                    padding: 0, border: `2px solid ${i === imgIdx ? 'var(--sp-accent)' : 'transparent'}`,
                    borderRadius: 8, overflow: 'hidden', opacity: i === imgIdx ? 1 : 0.5, cursor: 'pointer', background: 'none', aspectRatio: '1',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: details */}
        <div style={{ flex: 1, minWidth: 0, borderLeft: '1px solid var(--sp-border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Title + location */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--sp-surface-2)', padding: '3px 10px', borderRadius: 10, color: 'var(--sp-text-muted)', marginBottom: 10, display: 'inline-block' }}>
              {data.ownerType === 'agent' ? 'Agent Listing' : 'User Listing'}
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 6px', color: 'var(--sp-text-primary)' }}>{data.title}</h2>
            <p style={{ fontSize: 13, color: 'var(--sp-text-muted)' }}>📍 {data.location}</p>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--sp-text-muted)', marginBottom: 4 }}>Rent</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--sp-accent)', lineHeight: 1 }}>
                {data.price ? formatNaira(data.price) : '—'}
                {data.rentPeriod && <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--sp-text-muted)' }}>/{data.rentPeriod}</span>}
              </p>
            </div>
            {data.totalPackage ? (
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--sp-text-muted)', marginBottom: 4 }}>Total Package</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--sp-text-primary)', lineHeight: 1 }}>{formatNaira(data.totalPackage)}</p>
              </div>
            ) : null}
          </div>

          {/* Property features */}
          {(data.bedrooms !== undefined || data.bathrooms !== undefined || data.sittingRooms !== undefined || data.balconies !== undefined) && (
            <div className="sp-auditor-panel" style={{ padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--sp-text-primary)' }}>Property Features</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {data.bedrooms !== undefined && <FeatureBox icon="🛏" label="Bedrooms" value={data.bedrooms} />}
                {data.bathrooms !== undefined && <FeatureBox icon="🚿" label="Bathrooms" value={data.bathrooms} />}
                {data.sittingRooms !== undefined && <FeatureBox icon="🛋" label="Sitting Rooms" value={data.sittingRooms} />}
                {data.balconies !== undefined && <FeatureBox icon="🌇" label="Balconies" value={data.balconies} />}
              </div>
            </div>
          )}

          {/* Additional info */}
          <div className="sp-auditor-panel" style={{ padding: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--sp-text-primary)' }}>Additional Information</p>
            {[
              { label: 'Category', value: data.categoryDisplay },
              data.condition ? { label: 'Condition', value: data.condition } : null,
              data.landlordPresence ? { label: 'Landlord', value: data.landlordPresence } : null,
              { label: 'Rent Due Date', value: data.rentDueDate ? formatDate(data.rentDueDate) : '—' },
            ].filter(Boolean).map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--sp-border)' : 'none' }}>
                <span style={{ fontSize: 13, color: 'var(--sp-text-muted)' }}>{row!.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sp-text-primary)', textAlign: 'right', maxWidth: '55%' }}>{row!.value}</span>
              </div>
            ))}
          </div>

          {/* Facilities */}
          {data.facilities.length > 0 && (
            <div className="sp-auditor-panel" style={{ padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--sp-text-primary)' }}>Facilities</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.facilities.map((f, i) => (
                  <span key={i} className="sp-doc-meta-badge">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {data.description && (
            <div className="sp-auditor-panel" style={{ padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--sp-text-primary)' }}>Description</p>
              <p style={{ fontSize: 13, color: 'var(--sp-text-muted)', lineHeight: 1.6 }}>{data.description}</p>
            </div>
          )}

          {/* Posted by */}
          <div className="sp-auditor-panel" style={{ padding: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--sp-text-primary)' }}>Posted By</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="sp-avatar sp-av-blue" style={{ width: 44, height: 44, fontSize: 16, flexShrink: 0 }}>
                {data.agentName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--sp-text-primary)' }}>{data.agentName}</p>
                <p style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>{data.agentEmail || '—'}</p>
                <span style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>{data.ownerType === 'agent' ? 'Agent' : 'User'}</span>
              </div>
            </div>
          </div>

          {/* Approve / Reject */}
          {data.approval === 'pending' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={onToggleRejectForm}
                  disabled={actionLoading}
                  style={{
                    flex: 1, padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 15,
                    background: 'rgba(60,10,10,0.7)', border: '1px solid rgba(153,27,27,0.4)', color: '#f87171', cursor: 'pointer',
                  }}
                >
                  ✕ Reject
                </button>
                <button
                  onClick={onApprove}
                  disabled={actionLoading}
                  style={{
                    flex: 1, padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 15,
                    background: '#10b981', border: 'none', color: '#fff', cursor: 'pointer',
                  }}
                >
                  {actionLoading ? '…' : '✓ Approve'}
                </button>
              </div>

              {showRejectForm && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label className="sp-form-label">Reason for rejection</label>
                  <textarea
                    className="sp-form-textarea"
                    placeholder="e.g. Listing has inaccurate information or images do not match the description."
                    value={rejectReason}
                    onChange={e => onRejectReasonChange(e.target.value)}
                    rows={3}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="sp-btn sp-btn-small" onClick={onToggleRejectForm}>Cancel</button>
                    <button
                      className="sp-btn sp-btn-small sp-btn-primary"
                      onClick={onReject}
                      disabled={!rejectReason.trim() || actionLoading}
                    >
                      {actionLoading ? '…' : 'Confirm Reject'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {data.approval !== 'pending' && (
            <div style={{
              padding: '12px 16px', borderRadius: 12,
              background: data.approval === 'approved' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              color: data.approval === 'approved' ? '#10b981' : '#ef4444',
              fontWeight: 600, fontSize: 13,
            }}>
              {data.approval === 'approved' ? '✓ This listing has been approved' : '✕ This listing has been rejected'}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="sp-lightbox" onClick={() => setLightbox(null)}>
          <div className="sp-lightbox-content">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="Preview" className="sp-lightbox-img" />
            <button className="sp-btn-close-lightbox" onClick={() => setLightbox(null)}>✕ Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

function FeatureBox({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 14px',
      borderRadius: 10, background: 'var(--sp-surface-2)', border: '1px solid var(--sp-border)',
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--sp-text-primary)' }}>{value}</span>
      <span style={{ fontSize: 11, color: 'var(--sp-text-muted)' }}>{label}</span>
    </div>
  )
}
