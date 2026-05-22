import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import HotRightNow from './components/HotRightNow.jsx'
import TrendChart from './components/TrendChart.jsx'
import PyPIChart from './components/PyPIChart.jsx'
import ComparisonTable from './components/ComparisonTable.jsx'
import Footer from './components/Footer.jsx'

const BASE = import.meta.env.BASE_URL

export default function App() {
  const [history, setHistory] = useState(null)
  const [error, setError]   = useState(null)

  useEffect(() => {
    fetch(`${BASE}history.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setHistory)
      .catch(e => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="error-screen">
        <div style={{ fontSize: '2.5rem' }}>⚠️</div>
        <h2>Could not load data</h2>
        <p>{error}</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          If you're running locally, make sure <code>frontend/public/history.json</code> exists.<br />
          Run <code>python scripts/seed_data.py</code> first, then copy it to <code>frontend/public/</code>.
        </p>
      </div>
    )
  }

  if (!history) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Loading AI trends data…</span>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <Header lastUpdated={history.last_updated} />
      <div className="fade-up fade-up-1">
        <HotRightNow snapshots={history.snapshots} />
      </div>
      <div className="fade-up fade-up-2 section-gap">
        <TrendChart snapshots={history.snapshots} />
      </div>
      <div className="fade-up fade-up-3 section-gap">
        <PyPIChart snapshots={history.snapshots} />
      </div>
      <div className="fade-up fade-up-4 section-gap">
        <ComparisonTable snapshots={history.snapshots} />
      </div>
      <Footer />
    </div>
  )
}
