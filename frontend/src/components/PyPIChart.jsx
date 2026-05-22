import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer,
} from 'recharts'
import { PROVIDERS, BY_PKG } from './providers.js'

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-med)',
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      fontSize: '0.8rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ color: d.color, fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
        {d.emoji} {d.name}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Last day</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmt(d.last_day)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Last week</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmt(d.last_week)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Last month</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmt(d.last_month)}</span>
        </div>
      </div>
    </div>
  )
}

export default function PyPIChart({ snapshots }) {
  const { weekData, monthData } = useMemo(() => {
    const latest = snapshots[snapshots.length - 1]
    if (!latest?.pypi) return { weekData: [], monthData: [] }

    const rows = PROVIDERS
      .filter(p => latest.pypi[p.pkg])
      .map(p => ({
        name:      p.name,
        pkg:       p.pkg,
        color:     p.color,
        emoji:     p.emoji,
        last_day:  latest.pypi[p.pkg].last_day  || 0,
        last_week: latest.pypi[p.pkg].last_week  || 0,
        last_month:latest.pypi[p.pkg].last_month || 0,
      }))

    return {
      weekData:  [...rows].sort((a, b) => b.last_week  - a.last_week),
      monthData: [...rows].sort((a, b) => b.last_month - a.last_month),
    }
  }, [snapshots])

  if (!weekData.length) return null

  return (
    <section>
      <div className="section-label">📊 Latest Snapshot</div>
      <div className="section-title">Downloads — Current Period</div>
      <div className="section-sub">Most recent data from PyPI. Click bars to explore.</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>

        {/* Weekly */}
        <div className="card">
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            WEEKLY DOWNLOADS
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weekData} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={fmt}
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="last_week" radius={[0, 4, 4, 0]} label={{
                position: 'right',
                formatter: fmt,
                fill: 'var(--text-muted)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}>
                {weekData.map(d => <Cell key={d.pkg} fill={d.color} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly */}
        <div className="card">
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            MONTHLY DOWNLOADS
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthData} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={fmt}
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="last_month" radius={[0, 4, 4, 0]} label={{
                position: 'right',
                formatter: fmt,
                fill: 'var(--text-muted)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}>
                {monthData.map(d => <Cell key={d.pkg} fill={d.color} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </section>
  )
}
