import { useState, useRef } from 'react'
import { fmtRelative } from '../utils/time.js'
import { PlusIcon, TrashIcon, SettingsIcon, DownloadIcon, UploadIcon } from './icons.jsx'
import { exportSession, importSession } from '../utils/storage'

export default function Sidebar({ sessions, activeId, onSwitch, onCreate, onDelete, onSettings, onImport, saving }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const fileInputRef = useRef(null)

  function handleDelete(e, id) {
    e.stopPropagation()
    if (deleteConfirm === id) {
      onDelete(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 2500)
    }
  }

  function handleExport(e, id) {
    e.stopPropagation()
    const json = exportSession(id)
    if (!json) return
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const title = sessions.find(s => s.id === id)?.title || 'game'
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_wren.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = importSession(reader.result)
      if (result) onImport(result)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div style={{
      width: 200,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
    }}>
      {/* header */}
      <div style={{
        flexShrink: 0,
        height: 52,
        padding: '0 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{ width: 7, height: 7, background: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', flex: 1 }}>
          wren
        </span>
        <button
          className="icon-btn"
          style={{ width: 26, height: 26, border: 'none' }}
          onClick={handleImportClick}
          title="import game"
        >
          <UploadIcon />
        </button>
        {saving && (
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>saving…</span>
        )}
        <button
          className="icon-btn"
          style={{ width: 26, height: 26, border: 'none' }}
          onClick={onSettings}
          title="settings"
        >
          <SettingsIcon />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>

      {/* label */}
      <div style={{ padding: '10px 14px 6px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
        GAMES
      </div>

      {/* session list */}
      <div className="no-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {sessions.map(s => (
          <div
            key={s.id}
            className={`sess-row${s.id === activeId ? ' active' : ''}`}
            onClick={() => s.id !== activeId && onSwitch(s.id)}
          >
            <div style={{ flex: 1, padding: '10px 8px 10px 12px', minWidth: 0 }}>
              <div style={{
                fontSize: 12.5,
                fontWeight: s.id === activeId ? 500 : 400,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: 2,
              }}>
                {s.title}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{fmtRelative(s.updatedAt)}</div>
            </div>
            <button
              className="del-btn"
              onClick={e => handleExport(e, s.id)}
              title="export"
              style={{ opacity: 0.5 }}
            >
              <DownloadIcon />
            </button>
            <button
              className="del-btn"
              onClick={e => handleDelete(e, s.id)}
              title={deleteConfirm === s.id ? 'click again to confirm' : 'delete'}
              style={{ color: deleteConfirm === s.id ? 'var(--danger)' : undefined, opacity: deleteConfirm === s.id ? 1 : undefined }}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            no games yet. start one below.
          </div>
        )}
      </div>

      {/* new game */}
      <button className="new-btn" onClick={onCreate}>
        <PlusIcon /> new game
      </button>
    </div>
  )
}
