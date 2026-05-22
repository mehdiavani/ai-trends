import { useMemo } from 'react'
import { PROVIDERS } from './providers.js'

function pct(a, b) {
  if (!b || b === 0) return 0
  return ((a - b) / b) * 100
}

export default function HotRightNow({ snapshots }) {
  const cards = useMemo(() => {
    if (snapshots.length < 2) return []

    const latest = snapshots[snapshots.length - 1]
    const prev   = snapshots[snapshots.length - 2]

    return PROVIDERS
      .filter(p => latest?.pypi?.[p.pkg] && prev?.pypi?.[p.pkg])
      .map(p => {
        const cur  = latest.pypi[p.pkg].last_week
        const old  = prev.pypi[p.pkg].last_week
        const diff = pct(cur, old)
        return { ...p, cur, diff }
      })
      .sort((a, b) => b.diff - a.diff)
  }, [snapshots])

  if (!cards.length) return null

  const winner = cards[0]
  const top5   = cards.slice(0, 5)

  return (
    <section style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>

        {/* Winner card — big */}
        <div className="card" style={{
          flex: '1 1 280px',
          position: 'relative',
          overflow: 'hidden',
          borderColor: winner.color + '44',
          background: `linear-gradient(135deg, var(--bg-card) 60%, ${winner.color}18)`,
        }}>
          {/* Glow blob */}
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '120px', height: '120px',
            background: winner.color,
            borderRadius: '50%',
            opacity: 0.08,
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }} />

          <div className="section-label">🔥 Hot Right Now</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>{winner.emoji}</span>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: winner.color }}>
                {winner.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {winner.pkg}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span className="mono" style={{ fontSize: '2rem', fontWeight: 600, color: winner.color }}>
              +{winner.diff.toFixed(1)}%
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              week-over-week
            </span>
          </div>

          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span className="mono">{(winner.cur / 1_000_000).toFixed(2)}M</span> downloads this week
          </div>
        </div>

        {/* Mini leaderboard */}
        <div className="card" style={{ flex: '2 1 360px' }}>
          <div className="section-label">Weekly Download Trend</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            {top5.map((p, i) => {
              const isPositive = p.diff >= 0
              const barMax = Math.max(...top5.map(x => Math.abs(x.diff)))
              const barWidth = Math.abs(p.diff) / barMax * 100

              return (
                <div key={p.pkg} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Rank */}
                  <span className="mono" style={{
                    width: '1.2rem',
                    fontSize: '0.75rem',
                    color: i === 0 ? '#ffd700' : 'var(--text-muted)',
                    fontWeight: 600,
                  }}>
                    {i + 1}
                  </span>

                  {/* Emoji + name */}
                  <span style={{ fontSize: '1rem' }}>{p.emoji}</span>
                  <span style={{ flex: '0 0 90px', fontSize: '0.82rem', fontWeight: 500 }}>
                    {p.name}
                  </span>

                  {/* Bar */}
                  <div style={{ flex: 1, height: '6px', background: 'var(--bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      background: p.color,
                      borderRadius: '3px',
                      transition: 'width 0.8s ease',
                    }} />
                  </div>

                  {/* Pct */}
                  <span className="mono" style={{
                    width: '5rem',
                    textAlign: 'right',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: isPositive ? '#39d353' : '#f85149',
                  }}>
                    {isPositive ? '+' : ''}{p.diff.toFixed(1)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
