import PhaseCard from './PhaseCard.jsx'

export default function RoadmapPanel({ roadmap }) {
  if (!roadmap) return null

  return (
    <div style={{
      width: 264,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-panel)',
      borderLeft: '1px solid var(--border)',
    }}>
      {/* header */}
      <div style={{
        flexShrink: 0,
        height: 52,
        padding: '0 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          marginBottom: 3,
          fontFamily: 'var(--font-mono)',
        }}>
          YOUR ROADMAP
        </div>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {roadmap.title}
        </div>
      </div>

      {/* phases */}
      <div className="no-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '12px 14px' }}>
        {roadmap.phases.map((phase, i) => (
          <PhaseCard key={phase.id || i} phase={phase} index={i} />
        ))}
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
          tell wren more to refine this
        </p>
      </div>
    </div>
  )
}
