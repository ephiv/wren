import { useState } from 'react'
import { renderInline } from '../utils/markdown.jsx'
import { fmtTime, fmtJournalDate } from '../utils/time.js'
import { fileIcon, fmtSize } from '../utils/files.js'

export default function LogCard({ entry, expanded, onToggle }) {
  const [audioPlaying, setAudioPlaying] = useState(null)

  const imgFiles    = entry.files?.filter(f => f.kind === 'image' && f.preview) || []
  const audioFiles  = entry.files?.filter(f => f.kind === 'audio' && f.preview) || []
  const otherFiles  = entry.files?.filter(f =>
    !(f.kind === 'image' && f.preview) && !(f.kind === 'audio' && f.preview)
  ) || []

  return (
    <div style={{ border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16, background: 'var(--bg-main)' }}>

      <div style={{ padding: '16px 18px 14px' }}>
        {/* meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtJournalDate(entry.ts)}</span>
            <span style={{ fontSize: 11, color: 'var(--border)' }}>·</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtTime(entry.ts)}</span>
          </div>
          <span style={{
            fontSize: 10,
            fontWeight: 500,
            color: 'var(--accent)',
            background: 'var(--accent-bg)',
            padding: '2px 9px',
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-mono)',
          }}>dev log</span>
        </div>

        {/* text */}
        {entry.text && (
          <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.75, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {expanded || entry.text.length < 280 ? entry.text : entry.text.slice(0, 260) + '…'}
          </p>
        )}
        {entry.text && entry.text.length >= 280 && (
          <button onClick={onToggle} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-muted)', padding: 0, marginBottom: 10, display: 'block' }}>
            {expanded ? 'show less' : 'read more'}
          </button>
        )}

        {/* image grid */}
        {imgFiles.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: imgFiles.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 6,
            marginBottom: (audioFiles.length || otherFiles.length) ? 10 : 0,
          }}>
            {imgFiles.map((f, i) => (
              <div key={i} style={{
                overflow: 'hidden',
                aspectRatio: imgFiles.length === 1 ? '16/9' : '1',
                background: 'var(--bg-phase)',
                border: '1px solid var(--border-light)',
                maxHeight: imgFiles.length === 1 ? 260 : undefined,
              }}>
                <img
                  src={f.preview}
                  alt={f.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* audio players */}
        {audioFiles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: otherFiles.length ? 8 : 0 }}>
            {audioFiles.map((f, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                background: 'var(--bg-phase)',
                border: '1px solid var(--border-light)',
              }}>
                <span style={{ fontSize: 16 }}>🎵</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                  {f.size && <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{fmtSize(f.size)}</div>}
                </div>
                {f.preview && (
                  <audio controls src={f.preview} style={{ height: 28, maxWidth: 160, borderRadius: 0 }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* other file chips */}
        {otherFiles.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: (imgFiles.length || audioFiles.length) ? 8 : 0 }}>
            {otherFiles.map((f, i) => (
              <span key={i} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11.5,
                color: 'var(--text-secondary)',
                background: 'var(--bg-phase)',
                border: '1px solid var(--border-light)',
                padding: '4px 10px',
              }}>
                <span style={{ fontSize: 13 }}>{fileIcon(f.kind)}</span>
                {f.name}
                {f.size && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fmtSize(f.size)}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* wren loading indicator */}
      {entry.loading && (
        <div style={{
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bubble-wren)',
          padding: '12px 18px',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 9, color: 'white', flexShrink: 0,
            fontFamily: 'var(--font-mono)',
          }}>w</div>
          <span className="dot" style={{ fontSize: 20, color: 'var(--accent)' }}>·</span>
          <span className="dot" style={{ fontSize: 20, color: 'var(--accent)', animationDelay: '0.2s' }}>·</span>
          <span className="dot" style={{ fontSize: 20, color: 'var(--accent)', animationDelay: '0.4s' }}>·</span>
        </div>
      )}

      {/* wren feedback */}
      {entry.feedback && (
        <div style={{
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bubble-wren)',
          padding: '13px 18px',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 9, color: 'white', flexShrink: 0, marginTop: 2,
            fontFamily: 'var(--font-mono)',
          }}>w</div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {renderInline(entry.feedback)}
          </p>
        </div>
      )}
    </div>
  )
}
