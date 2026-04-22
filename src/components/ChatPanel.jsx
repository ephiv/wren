import { useState, useRef, useEffect } from 'react'
import Bubble from './Bubble.jsx'
import { ModelPicker, ThemePicker, MemoryBadge } from './Toolbar.jsx'
import { SendIcon } from './icons.jsx'
import { groupByDate } from '../utils/time.js'
import { callWithMemory } from '../utils/api.js'
import { CHAT_SYSTEM, CHAT_CHIPS } from '../constants/prompts.js'

function parseResponse(text) {
  let roadmap = null
  let prose = text

  // Try <roadmap></roadmap> tags (primary format)
  let match = text.match(/<roadmap>([\s\S]*?)<\/roadmap>/)
  if (match) {
    prose = text.replace(/<roadmap>[\s\S]*?<\/roadmap>/, '').trim()
  } else {
    // Try markdown code blocks: ```json ... ``` or ``` ... ```
    match = text.match(/```json?\s*([\s\S]*?)```/)
  }

  if (match) {
    try {
      let jsonStr = match[1].trim()
      // Remove leading/trailing backticks if present
      jsonStr = jsonStr.replace(/^`+/, '').replace(/`+$/, '').trim()
      roadmap = JSON.parse(jsonStr)
    } catch (e) {
      console.warn('roadmap parse failed:', e)
    }
  }

  return { prose, roadmap }
}

export default function ChatPanel({
  msgs, setMsgs,
  roadmap, setRoadmap,
  started, setStarted,
  memory, setMemory,
  model, onModelChange,
  theme, onThemeChange,
  apiKey, openaiKey, anthropicKey, googleKey,
  onError,
  onSave,
}) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  async function startChat() {
    setStarted(true)
    setLoading(true)
    try {
      const text = await callWithMemory({
        apiKey, openaiKey, anthropicKey, googleKey, model,
        system: CHAT_SYSTEM,
        allMessages: [{ role: 'user', content: 'hi' }],
        memory: null,
        onMemoryUpdate: setMemory,
      })
      const { prose, roadmap: rm } = parseResponse(text)
      const newMsgs = [{ role: 'assistant', content: prose, _raw: text, ts: Date.now() }]
      setMsgs(newMsgs)
      if (rm) setRoadmap(rm)
      onSave({ chatMsgs: newMsgs, roadmap: rm, started: true })
    } catch (e) {
      onError(e.message)
      setStarted(false)
    } finally {
      setLoading(false)
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  async function sendMessage() {
    const txt = input.trim()
    if (!txt || loading) return
    const withUser = [...msgs, { role: 'user', content: txt, ts: Date.now() }]
    setMsgs(withUser)
    setInput('')
    setLoading(true)

    try {
      const apiMsgs = withUser.map(m => ({ role: m.role, content: m._raw || m.content }))
      const text = await callWithMemory({
        apiKey, openaiKey, anthropicKey, googleKey, model,
        system: CHAT_SYSTEM,
        allMessages: apiMsgs,
        memory,
        onMemoryUpdate: mem => {
          setMemory(mem)
          onSave({ memory: mem })
        },
      })
      const { prose, roadmap: rm } = parseResponse(text)
      if (rm) setRoadmap(rm)
      const withReply = [...withUser, { role: 'assistant', content: prose, _raw: text, ts: Date.now() }]
      setMsgs(withReply)
      onSave({ chatMsgs: withReply, roadmap: rm ?? roadmap })
    } catch (e) {
      onError(e.message)
    } finally {
      setLoading(false)
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  const groups = groupByDate(msgs)

  return (
    <>
      {/* scrollable message feed */}
      <div className="no-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!started ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: 16, paddingBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>start planning.</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, maxWidth: 320 }}>
              what game are<br />you building?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.65, marginTop: 4 }}>
              tell wren your idea — no matter how rough. you'll get a roadmap built around your game, not a generic template.
            </div>
            <button className="start-btn" onClick={startChat} disabled={loading}>
              {loading ? 'starting…' : 'let\'s talk →'}
            </button>
          </div>
        ) : (
          <>
            {groups.map((item, i) =>
              item.type === 'sep'
                ? (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
                    <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{item.label}</span>
                    <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
                  </div>
                )
                : <Bubble key={`${item.msg.ts}-${item.msg.role}`} msg={item.msg} />
            )}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>w</div>
                <div style={{ background: 'var(--bubble-wren)', borderRadius: '4px 14px 14px 14px', padding: '11px 16px' }}>
                  <span className="dot" style={{ fontSize: 18, color: 'var(--accent)' }}>·</span>
                  <span className="dot" style={{ fontSize: 18, color: 'var(--accent)' }}>·</span>
                  <span className="dot" style={{ fontSize: 18, color: 'var(--accent)' }}>·</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </>
        )}
      </div>

      {/* input bar */}
      {started && (
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--border)', background: 'var(--bg-main)', padding: '10px 24px 14px' }}>
          {/* chips */}
          <div className="no-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10, paddingBottom: 2 }}>
            {CHAT_CHIPS.map(c => (
              <button key={c} className="chip" onClick={() => { setInput(c); setTimeout(() => textareaRef.current?.focus(), 50) }}>{c}</button>
            ))}
          </div>

          {/* bar */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '10px 12px' }}>
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="tell wren about your game…"
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px' }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              style={{ minHeight: 22, maxHeight: 100, fontSize: 14 }}
            />
            <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || loading}><SendIcon /></button>
          </div>

          {/* toolbar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <ModelPicker value={model} onChange={onModelChange} />
            <ThemePicker value={theme} onChange={onThemeChange} />
            <MemoryBadge memory={memory} />
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>enter · shift+enter for newline</span>
          </div>
        </div>
      )}
    </>
  )
}
