'use client'

interface GenericListViewProps {
  tab: string
}

export default function GenericListView({ tab }: GenericListViewProps) {
  if (tab === 'reviews') return <ReviewsPlaceholder />
  return null
}

// ─── Reviews placeholder ──────────────────────────────────────────────────────

function ReviewsPlaceholder() {
  return (
    <div className="sp-view-container">
      <div className="sp-view-header-row">
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Reviews</h2>
      </div>
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--sp-text-muted)', fontSize: 13 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
        <p>Agent reviews will be shown here.</p>
        <p style={{ fontSize: 12, marginTop: 6 }}>Coming soon.</p>
      </div>
    </div>
  )
}
