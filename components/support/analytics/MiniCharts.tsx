'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { categoryData, trendData } from '@/lib/data/supportMockData'

export default function MiniCharts() {
  const barData = categoryData.labels.map((label, i) => ({ label, value: categoryData.values[i] }))
  const lineData = trendData.labels.map((label, i) => ({ label, value: trendData.values[i] }))

  return (
    <div className="sp-analytics-row">
      <div className="sp-chart-card">
        <p className="sp-chart-title">Tickets by Category</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--sp-text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--sp-text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--sp-bg-card)', border: '1px solid var(--sp-border-primary)', borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: 'var(--sp-hover-bg)' }}
            />
            <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="sp-chart-card">
        <p className="sp-chart-title">Resolution Trend (7 Days)</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={lineData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--sp-border-primary)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--sp-text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--sp-text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--sp-bg-card)', border: '1px solid var(--sp-border-primary)', borderRadius: 8, fontSize: 12 }}
            />
            <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3, fill: '#7c3aed' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
