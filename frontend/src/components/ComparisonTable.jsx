import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer, LabelList,
} from 'recharts'
import { PROVIDERS, BY_REPO } from './providers.js'

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function Arrow({ up }) {
  return (
    <span style={{ color: up ? '#39d353' : '#f85149', fontSize: '0.7rem' }}>
      {up ? '▲' : '▼'}
    </span>
  )
}

const GitHubTooltip = ({ active, payload }) => {
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
      <div style={{ color: d.color, fontWeight: 600, marginBottom: '0.4rem' }}>{d.emoji} {d.name}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Stars</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmt(d.stars)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Forks</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(d.forks)}</span>
      </div>
    </div>
  )
}

export default function ComparisonTable({ snapshots }) {
  const { rows, starsData } = useMemo(() => {
    if (!snapshots.length) return { rows: [], starsData: [] }
    const latest = snapshots[snapshots.length - 1]
    const prev   = snapshots.length > 7 ? snapshots[snapshots.length - 8] : snapshots[0]

    const rows = PROVIDERS.map(p => {
      const pypi    = latest?.pypi?.[p.pkg]
      const pypiOld = prev?.pypi?.[p.pkg]
      const gh      = p.repo ? latest?.github?.[p.repo] : null

      const weekDiff = (pypi?.last_week && pypiOld?.last_week)
        ? ((pypi.last_week - pypiOld.last_week) / pypiOld.last_week * 100)
        : null

      return {
        ...p,
        last_day:   pypi?.last_day   ?? null,
        last_week:  pypi?.last_week  ?? null,
        last_month: pypi?.last_month ?? null,
        weekDiff,
        stars: gh?.stars ?? null,
        forks: gh?.forks ?? null,
      }
    }).filter(r => r.last_week != null || r.stars != null)

    const starsData = rows
      .filter(r => r.stars != null)
      .sort((a, b) => b.stars - a.stars)
      .map(r => ({ ...r }))

    return { rows: rows.sort((a, b) => (b.last_week ?? 0) - (a.last_week ?? 0)), starsData }
  }, [snapshots])

  return (
    <section>
      <div className="section-label">🏆 Full Comparison</div>
      <div className="section-title">All Providers, Side by Side</div>
      <div className="section-sub">Latest snapshot • 7-day trend vs prior week</div>

      {/* GitHub stars bar chart */}
      {starsData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            ⭐ GITHUB STARS
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={starsData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={fmt}
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<GitHubTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="stars" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="stars"
                  position="top"
                  formatter={fmt}
                  style={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                />
                {starsData.map(d => <Cell key={d.pkg} fill={d.color} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Data table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.83rem',
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Provider', 'Last Day', 'Last Week', '7d Trend', 'Last Month', 'GitHub Stars', 'GitHub Forks'].map(h => (
                  <th key={h} style={{
                    padding: '0.75rem 1rem',
                    textAlign: h === 'Provider' ? 'left' : 'right',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.key}
                  style={{
                    borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Provider name */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: r.color, flexShrink: 0,
                      }} />
                      <span style={{ fontWeight: 600 }}>{r.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                        {r.pkg}
                      </span>
                    </div>
                  </td>

                  <td className="mono" style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                    {fmt(r.last_day)}
                  </td>

                  <td className="mono" style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {fmt(r.last_week)}
                  </td>

                  <td className="mono" style={{ textAlign: 'right', padding: '0.75rem 1rem' }}>
                    {r.weekDiff != null ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        color: r.weekDiff >= 0 ? '#39d353' : '#f85149',
                        fontWeight: 600,
                      }}>
                        <Arrow up={r.weekDiff >= 0} />
                        {Math.abs(r.weekDiff).toFixed(1)}%
                      </span>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>

                  <td className="mono" style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                    {fmt(r.last_month)}
                  </td>

                  <td className="mono" style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                    {fmt(r.stars)}
                  </td>

                  <td className="mono" style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                    {fmt(r.forks)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
