'use client'

import { useState } from 'react'
import { listings } from '@/lib/data/supportMockData'

type Listing = typeof listings[0]

const SUMMARIES = [
  { title: 'Total Listings', value: listings.length, cls: '' },
  { title: 'Active', value: listings.filter(l => l.status === 'active').length, cls: 'val-green' },
  { title: 'Pending', value: listings.filter(l => l.status === 'pending').length, cls: 'val-yellow' },
  { title: 'Flagged', value: listings.filter(l => l.status === 'flagged').length, cls: '' },
  { title: 'Agent Listings', value: listings.filter(l => l.typeTag === 'Agent').length, cls: 'val-purple' },
]

export default function ListingsView() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [detailListing, setDetailListing] = useState<Listing | null>(null)

  const filtered = listings.filter(l => {
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    const matchType = typeFilter === 'all' || l.typeTag === typeFilter
    return matchStatus && matchType
  })

  return (
    <div className="sp-view-container">
      {/* Summary */}
      <div className="sp-listings-summary">
        {SUMMARIES.map(s => (
          <div key={s.title} className="sp-summary-card">
            <div className="sp-summary-title">{s.title}</div>
            <div className={`sp-summary-value ${s.cls}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="sp-listings-filter-bar">
        <div className="sp-filter-controls-left">
          <select className="sp-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
          </select>
          <select className="sp-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="Agent">Agent</option>
            <option value="Connect">Connect</option>
          </select>
        </div>
        <div className="sp-view-toggle">
          <button className={`sp-view-toggle-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')}>
            ⊞ Grid
          </button>
          <button className={`sp-view-toggle-btn${viewMode === 'table' ? ' active' : ''}`} onClick={() => setViewMode('table')}>
            ≡ Table
          </button>
        </div>
      </div>

      {/* Grid */}
      {viewMode === 'grid' && (
        <div className="sp-property-grid">
          {filtered.map(listing => (
            <div key={listing.id} className="sp-property-card">
              <div className="sp-property-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={listing.images?.[0]} alt={listing.title} className="sp-property-img" />
                <span className={`sp-badge-left ${listing.typeTag === 'Agent' ? 'sp-badge-agent' : 'sp-badge-connect'}`}>
                  {listing.typeTag}
                </span>
                <span className={`sp-badge-right status-${listing.status}`}>{listing.status}</span>
              </div>
              <div className="sp-property-content">
                <div>
                  <p className="sp-property-title">{listing.title}</p>
                  <p className="sp-property-location">📍 {listing.location}</p>
                </div>
                <div className="sp-property-footer">
                  <span className="sp-property-price">{listing.price}</span>
                  <div className="sp-property-actions">
                    <button className="sp-icon-circle" onClick={() => setDetailListing(listing)} title="View">👁</button>
                    <button className="sp-icon-circle danger" title="Flag">🚩</button>
                  </div>
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

      {/* Table */}
      {viewMode === 'table' && (
        <div className="sp-table-card">
          <table className="sp-data-table">
            <thead>
              <tr><th>Title</th><th>Location</th><th>Price</th><th>Owner</th><th>Type</th><th>Status</th><th>Views</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.title}</td>
                  <td style={{ color: 'var(--sp-text-muted)' }}>📍 {l.location}</td>
                  <td style={{ fontWeight: 600 }}>{l.price}</td>
                  <td>{l.owner}</td>
                  <td><span className={`sp-role-badge role-${l.typeTag.toLowerCase()}`}>{l.typeTag}</span></td>
                  <td><span className={`sp-status-badge sp-status-${l.status}`}>{l.status}</span></td>
                  <td style={{ color: 'var(--sp-text-muted)' }}>{l.views ?? '-'}</td>
                  <td>
                    <div className="sp-actions-group">
                      <button className="sp-btn sp-btn-small" onClick={() => setDetailListing(l)}>View</button>
                      <button className="sp-btn sp-btn-small sp-btn-flag">🚩 Flag</button>
                      {l.status === 'pending' && (
                        <button className="sp-btn sp-btn-small sp-btn-approve-listing">✓ Approve</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {detailListing && (
        <div className="sp-lightbox" onClick={() => setDetailListing(null)}>
          <div className="sp-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="sp-modal-header">
              <h3>{detailListing.title}</h3>
              <button className="sp-btn sp-btn-small" onClick={() => setDetailListing(null)}>✕</button>
            </div>
            {detailListing.images?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={detailListing.images[0]} alt={detailListing.title} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
            )}
            <div className="sp-profile-grid" style={{ marginBottom: 12 }}>
              <div className="sp-profile-item"><span className="sp-profile-label">Location</span><span className="sp-profile-value">{detailListing.location}</span></div>
              <div className="sp-profile-item"><span className="sp-profile-label">Price</span><span className="sp-profile-value">{detailListing.price}</span></div>
              <div className="sp-profile-item"><span className="sp-profile-label">Owner</span><span className="sp-profile-value">{detailListing.owner}</span></div>
              <div className="sp-profile-item"><span className="sp-profile-label">Status</span><span className="sp-profile-value">{detailListing.status}</span></div>
            </div>
            {detailListing.description && (
              <p style={{ fontSize: 13, color: 'var(--sp-text-muted)', lineHeight: 1.5 }}>{detailListing.description}</p>
            )}
            {detailListing.amenities && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                {detailListing.amenities.map((a: string) => (
                  <span key={a} className="sp-doc-meta-badge">{a}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
