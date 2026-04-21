import { useState } from 'react'

export default function PhaseCard({ phase, index }) {
  const [open, setOpen] = useState(true)

  return (
    <div style={{ border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'var(--bg-phase)',
          border: 'none',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--text-primary)',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--accent)', minWidth: 24, fontFamily: 'var(--font-mono)' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 1 }}>{phase.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{phase.focus}</div>
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '10px 14px 12px', background: 'var(--bg-panel)' }}>
          {phase.tasks.map((task, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '5px 0',
                borderBottom: i < phase.tasks.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}
            >
              <span style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--accent)',
                marginTop: 6,
                flexShrink: 0,
                opacity: 0.7,
              }} />
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{task}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
