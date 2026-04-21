import { useState, useRef, useEffect } from 'react'
import { MODELS } from '../constants/models'
import { THEMES } from '../constants/themes.js'
import { ModelIcon, PaletteIcon, MemoryIcon, ChevronDown } from './icons.jsx'

function useClickOutside(ref, handler) {
  useEffect(() => {
    function listener(e) { if (ref.current && !ref.current.contains(e.target)) handler() }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

export function ModelPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  const current = MODELS.find(m => m.id === value) || MODELS[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className={`icon-btn${open ? ' active' : ''}`}
        style={{ width: 'auto', gap: 5, padding: '0 8px', fontSize: 11, whiteSpace: 'nowrap' }}
        onClick={() => setOpen(o => !o)}
        title="select model"
      >
        <ModelIcon />
        <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>{current.name}</span>
        <ChevronDown />
      </button>
      {open && (
        <div className="dropdown" style={{ bottom: 'calc(100% + 8px)', left: 0, minWidth: 260 }}>
          {MODELS.map(m => (
            <div
              key={m.id}
              className={`dropdown-item${m.id === value ? ' selected' : ''}`}
              onClick={() => { onChange(m.id); setOpen(false) }}
            >
              <span className="item-label">{m.name}</span>
              <span className="item-sub">{m.desc} · ctx {m.ctx}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ThemePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  const current = THEMES.find(t => t.id === value) || THEMES[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className={`icon-btn${open ? ' active' : ''}`}
        style={{ width: 'auto', gap: 5, padding: '0 8px', fontSize: 11, whiteSpace: 'nowrap' }}
        onClick={() => setOpen(o => !o)}
        title="select theme"
      >
        <PaletteIcon />
        <span>{current.name}</span>
        <ChevronDown />
      </button>
      {open && (
        <div className="dropdown" style={{ bottom: 'calc(100% + 8px)', left: 0 }}>
          <div className="theme-grid">
            {THEMES.map(t => (
              <div
                key={t.id}
                className={`theme-swatch${t.id === value ? ' selected' : ''}`}
                onClick={() => { onChange(t.id); setOpen(false) }}
              >
                <div className="swatch-dots">
                  {t.colors.map((c, i) => (
                    <div key={i} className="dot-circle" style={{ background: c, border: '1px solid rgba(128,128,128,0.2)' }} />
                  ))}
                </div>
                <div className="swatch-name">{t.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function MemoryBadge({ memory }) {
  if (!memory?.summary) return null
  return (
    <div className="memory-badge" title={`memory: ${memory.summary}`}>
      <MemoryIcon />
      mem
    </div>
  )
}
