'use client'

import { transactions, reviews, userReports } from '@/lib/data/supportMockData'
import { exportSupportTable } from '@/lib/utils/support-export'

const COLOR_MAP: Record<string, string> = { blue: 'sp-av-blue', amber: 'sp-av-amber', teal: 'sp-av-teal', coral: 'sp-av-coral', purple: 'sp-av-purple' }

interface GenericListViewProps {
  tab: string
}

export default function GenericListView({ tab }: GenericListViewProps) {
  if (tab === 'transactions') {
    return (
      <div className="sp-view-container">
        <div className="sp-view-header-row">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Transactions</h2>
            <p style={{ fontSize: 12, color: 'var(--sp-text-muted)', marginTop: 2 }}>{transactions.length} records</p>
          </div>
          <button className="sp-btn-excel" onClick={() => exportSupportTable(transactions as unknown as Record<string, unknown>[], 'transactions')}>
            📊 Export
          </button>
        </div>
        <div className="sp-table-card">
          <table className="sp-data-table">
            <thead>
              <tr>
                <th>ID</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Gateway</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td><span className="sp-tx-cell-id">🧾 {tx.id}</span></td>
                  <td>{tx.user}</td>
                  <td>{tx.type}</td>
                  <td style={{ fontWeight: 600 }}>{tx.amount}</td>
                  <td><span className={`sp-status-badge sp-status-${tx.status}`}>{tx.status}</span></td>
                  <td>{tx.gateway}</td>
                  <td style={{ color: 'var(--sp-text-muted)' }}>{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (tab === 'reviews') {
    return (
      <div className="sp-view-container">
        <div className="sp-view-header-row">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Reviews</h2>
            <p style={{ fontSize: 12, color: 'var(--sp-text-muted)', marginTop: 2 }}>{reviews.length} reviews</p>
          </div>
          <button className="sp-btn-excel" onClick={() => exportSupportTable(reviews as unknown as Record<string, unknown>[], 'reviews')}>
            📊 Export
          </button>
        </div>
        <div className="sp-table-card">
          <table className="sp-data-table">
            <thead>
              <tr>
                <th>ID</th><th>User</th><th>Target</th><th>Rating</th><th>Review</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--sp-text-muted)', fontSize: 12 }}>{r.id}</td>
                  <td>{r.user}</td>
                  <td>{r.target}</td>
                  <td>
                    <span className="sp-rating-badge">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} {r.rating}</span>
                  </td>
                  <td><span className="sp-review-snippet">{r.text}</span></td>
                  <td><span className={`sp-status-badge sp-status-${r.status}`}>{r.status}</span></td>
                  <td style={{ color: 'var(--sp-text-muted)' }}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (tab === 'reports') {
    return (
      <div className="sp-view-container">
        <div className="sp-view-header-row">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>User Reports</h2>
            <p style={{ fontSize: 12, color: 'var(--sp-text-muted)', marginTop: 2 }}>{userReports.length} reports</p>
          </div>
          <button className="sp-btn-excel" onClick={() => exportSupportTable(userReports as unknown as Record<string, unknown>[], 'user_reports')}>
            📊 Export
          </button>
        </div>
        <div className="sp-table-card">
          <table className="sp-data-table">
            <thead>
              <tr>
                <th>ID</th><th>Reported User</th><th>Reporter</th><th>Reason</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {userReports.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--sp-text-muted)', fontSize: 12 }}>{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.reportedUser}</td>
                  <td>{r.reporter}</td>
                  <td><span className="sp-report-reason" title={r.reason}>{r.reason}</span></td>
                  <td><span className={`sp-status-badge sp-status-${r.status}`}>{r.status}</span></td>
                  <td style={{ color: 'var(--sp-text-muted)' }}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (tab === 'notifications') {
    const NOTIFS = [
      { icon: '🎫', title: 'New urgent ticket from Taiwo Ibrahim', time: '2 min ago' },
      { icon: '🪪', title: 'Verification request submitted by Chidi Anozie', time: '15 min ago' },
      { icon: '🚩', title: 'New user report filed by Seun Okafor', time: '1h ago' },
      { icon: '💳', title: 'Payment dispute raised — TXN-003', time: '2h ago' },
      { icon: '⭐', title: 'New review flagged — Agent Ngozi (2★)', time: '3h ago' },
    ]
    return (
      <div className="sp-view-container">
        <div className="sp-view-header-row">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Notifications</h2>
        </div>
        <div className="sp-log-list">
          {NOTIFS.map((n, i) => (
            <div key={i} className="sp-log-item">
              <div className="sp-log-icon">{n.icon}</div>
              <div className="sp-log-details">
                <h4>{n.title}</h4>
                <span className="sp-log-time">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}
