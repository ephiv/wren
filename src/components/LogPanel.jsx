import { useState, useRef, useEffect } from 'react'
import LogCard from './LogCard.jsx'
import { ModelPicker, ThemePicker } from './Toolbar.jsx'
import { SendIcon, AttachIcon } from './icons.jsx'
import { readFileForAPI, buildAPIContent, fileIcon, fmtSize } from '../utils/files.js'
import { callModel } from '../utils/api.js'
import { LOG_SYSTEM, LOG_CHIPS } from '../constants/prompts.js'

export default function LogPanel({
  entries, setEntries,
  model, onModelChange,
  theme, onThemeChange,
  apiKey, openaiKey, anthropicKey, googleKey,
  onError,
  onSave,
}) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({})
  const endRef = useRef(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [entries])

  async function handleFileAdd(e) {
    const picked = Array.from(e.target.files || [])
    if (!picked.length) return
    const processed = await Promise.all(picked.map(readFileForAPI))
    setFiles(prev => [...prev, ...processed])
    e.target.value = ''
  }

  async function submitLog() {
    const txt = text.trim()
    if ((!txt && files.length === 0) || loading) return

    const id = Date.now()
    const snapshot = [...files]
    const newEntry = { id, text: txt, files: snapshot, ts: Date.now(), feedback: null, loading: true }
    const withEntry = [...entries, newEntry]

    setEntries(withEntry)
    setText('')
    setFiles([])
    setLoading(true)

    try {
      const content = buildAPIContent(txt, snapshot)
      // flatten to string for text-only models; keep array for vision models
      const msgContent = content.length === 1 && content[0].type === 'text'
        ? content[0].text
        : content

      const feedback = await callModel({
        apiKey, openaiKey, anthropicKey, googleKey,
        model,
        system: LOG_SYSTEM,
        messages: [{ role: 'user', content: msgContent }],
      })

      const finished = withEntry.map(e =>
        e.id === id ? { ...e, feedback: feedback.trim(), loading: false } : e
      )
      setEntries(finished)
      onSave({ logEntries: finished })
    } catch (err) {
      const errEntry = withEntry.map(e =>
        e.id === id ? { ...e, feedback: `(wren couldn't respond: ${err.message})`, loading: false } : e
      )
      setEntries(errEntry)
      onSave({ logEntries: errEntry })
      onError(err.message)
    } finally {
      setLoading(false)
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  const canSubmit = (text.trim() || files.length > 0) && !loading

  return (
    <>
      {/* feed */}
      <div className="no-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, background: 'var(--bg-panel)' }}>
        {entries.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: 260, textAlign: 'center',
            gap: 10, padding: '40px 24px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>start logging.</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, maxWidth: 340 }}>
              drop what you built.<br />wren will read it.
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 290, lineHeight: 1.65, marginTop: 6 }}>
              screenshots, notes, docs, audio — anything from your session. this is your build archive.
            </div>
          </div>
        ) : (
          <div style={{ padding: '22px 24px 8px' }}>
            {entries.map(entry => (
              <LogCard
                key={entry.id}
                entry={entry}
                expanded={!!expanded[entry.id]}
                onToggle={() => setExpanded(p => ({ ...p, [entry.id]: !p[entry.id] }))}
              />
            ))}
            <div ref={endRef} style={{ height: 8 }} />
          </div>
        )}
      </div>

      {/* input area */}
      <div style={{ flexShrink: 0, borderTop: '1px solid var(--border)', background: 'var(--bg-main)', padding: '10px 24px 14px' }}>
        {/* chips */}
        <div className="no-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10, paddingBottom: 2 }}>
          {LOG_CHIPS.map(c => (
            <button key={c} className="chip" onClick={() => { setText(t => t ? t + ' ' + c : c); textareaRef.current?.focus() }}>{c}</button>
          ))}
        </div>

        {/* file previews */}
        {files.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {files.map((f, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 12, color: 'var(--text-secondary)',
                background: 'var(--bg-phase)', border: '1px solid var(--border-light)',
                padding: '4px 6px 4px 10px',
              }}>
                {f.kind === 'image' && f.preview
                  ? <img src={f.preview} alt={f.name} style={{ width: 18, height: 18, objectFit: 'cover' }} />
                  : <span style={{ fontSize: 13 }}>{fileIcon(f.kind)}</span>}
                <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                {f.size && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fmtSize(f.size)}</span>}
                <button
                  onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 15, lineHeight: 1, padding: '0 3px', display: 'flex', alignItems: 'center' }}
                >×</button>
              </span>
            ))}
          </div>
        )}

        {/* bar */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '10px 12px' }}>
          <button className="icon-btn" onClick={() => fileInputRef.current?.click()} title="attach files">
            <AttachIcon />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,text/*,audio/*,video/*,.md,.txt,.json,.csv,.js,.ts,.jsx,.tsx,.py,.rs,.go"
            style={{ display: 'none' }}
            onChange={handleFileAdd}
          />
          <textarea
            ref={textareaRef}
            rows={2}
            placeholder="what did you build today? drop a note, screenshot, doc — anything goes."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submitLog() } }}
            style={{ minHeight: 44, maxHeight: 160, fontSize: 14 }}
          />
          <button className="send-btn" onClick={submitLog} disabled={!canSubmit}><SendIcon /></button>
        </div>

        {/* toolbar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <ModelPicker value={model} onChange={onModelChange} />
          <ThemePicker value={theme} onChange={onThemeChange} />
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>⌘/ctrl+enter · attach anything</span>
        </div>
      </div>
    </>
  )
}
