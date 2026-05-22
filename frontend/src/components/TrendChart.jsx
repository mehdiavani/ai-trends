import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { PROVIDERS } from './providers.js'

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function fmtDate(d) {
  const [, m, day] = d.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[+m - 1]} ${+day}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const sorted = [...payload].sort((a, b) => b.value - a.value)
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-med)',
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      fontSize: '0.8rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      minWidth: '180px',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
        {fmtDate(label)}
      </div>
      {sorted.map(({ name, value, color }) => (
        <div key={name} style={{
          display: 'flex', justifyContent: 'space-between', gap: '1rem',
          padding: '0.1rem 0', color: 'var(--text-primary)',
        }}>
          <span style={{ color }}>{name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmt(value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendChart({ snapshots }) {
  const [hidden, setHidden] = useState(new Set())

  const { chartData, activeProviders } = useMemo(() => {
    const last90 = snapshots.slice(-90)
    const active = PROVIDERS.filter(p =>
      last90.some(s => s?.pypi?.[p.pkg]?.last_week != null)
    )
    const data = last90.map(s => {
      const row = { date: s.date }
      active.forEach(p => {
        row[p.name] = s?.pypi?.[p.pkg]?.last_week ?? null
      })
      return row
    })
    return { chartData: data, activeProviders: active }
  }, [snapshots])

  const toggle = (name) => setHidden(prev => {
    const next = new Set(prev)
    next.has(name) ? next.delete(name) : next.add(name)
    return next
  })

  return (
    <section className="card" style={{ padding: '1.75rem' }}>
      <div className="section-label">📦 PyPI Downloads</div>
      <div className="section-title">Weekly Downloads Over Time</div>
      <div className="section-sub">
        How many times each AI SDK was installed in the last 90 days
      </div>

      {/* Legend toggle */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {activeProviders.map(p => (
          <button
            key={p.key}
            onClick={() => toggle(p.name)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.3rem 0.7rem',
              borderRadius: '20px',
              border: `1px solid ${hidden.has(p.name) ? 'var(--border)' : p.color + '55'}`,
              background: hidden.has(p.name) ? 'transparent' : p.color + '1a',
              color: hidden.has(p.name) ? 'var(--text-muted)' : p.color,
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: hidden.has(p.name) ? 'var(--text-muted)' : p.color,
            }} />
            {p.name}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          {activeProviders.map(p => (
            <Line
              key={p.key}
              type="monotone"
              dataKey={p.name}
              stroke={p.color}
              strokeWidth={hidden.has(p.name) ? 0 : 2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}
