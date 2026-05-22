import { useMemo } from 'react'

function timeAgo(isoString) {
  if (!isoString) return 'unknown'
  const diff = Date.now() - new Date(isoString).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function Header({ lastUpdated }) {
  const ago = useMemo(() => timeAgo(lastUpdated), [lastUpdated])

  return (
    <header style={{
      paddingTop: '2.5rem',
      paddingBottom: '2rem',
      borderBottom: '1px solid var(--border)',
      marginBottom: '0.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <span className="badge badge-live">LIVE DATA</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              updated {ago}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #e6edf3 30%, #8b949e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            AI Trends
          </h1>

          {/* Tagline */}
          <p style={{
            marginTop: '0.5rem',
            fontSize: 'clamp(0.85rem, 2vw, 1rem)',
            color: 'var(--text-secondary)',
            maxWidth: '520px',
          }}>
            Track which AI models developers are actually using —&nbsp;
            <span style={{ color: 'var(--text-accent)' }}>real data</span>, updated daily.
          </p>
        </div>

        {/* Data pills */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          alignItems: 'flex-end',
        }}>
          {[
            { label: 'PyPI Downloads', icon: '📦' },
            { label: 'GitHub Stars', icon: '⭐' },
            { label: 'Stack Overflow', icon: '💬' },
            { label: 'HuggingFace', icon: '🤗' },
          ].map(({ label, icon }) => (
            <div key={label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.7rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
            }}>
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
