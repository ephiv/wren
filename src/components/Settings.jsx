import { useState } from 'react'
import { MODELS } from '../constants/models.js'
import { THEMES } from '../constants/themes.js'

export default function Settings({ settings, onSave, onClose }) {
  const [local, setLocal] = useState({ ...settings })
  const [showKey, setShowKey] = useState({ openrouter: false, openai: false, anthropic: false, google: false })

  function set(k, v) { setLocal(s => ({ ...s, [k]: v })) }
  function toggleShow(provider) { setShowKey(s => ({ ...s, [provider]: !s[provider] })) }

  function handleSave() {
    onSave(local)
    onClose()
  }

  const keyFields = [
    { key: 'apiKey', label: 'OPENROUTER API KEY', placeholder: 'sk-or-...', provider: 'openrouter', help: 'get a key at openrouter.ai/keys — required for free models' },
    { key: 'openaiKey', label: 'OPENAI API KEY', placeholder: 'sk-...', provider: 'openai', help: 'optional — for GPT-4o, o1, o3' },
    { key: 'anthropicKey', label: 'ANTHROPIC API KEY', placeholder: 'sk-ant-...', provider: 'anthropic', help: 'optional — for Claude models' },
    { key: 'googleKey', label: 'GOOGLE API KEY', placeholder: 'AIza...', provider: 'google', help: 'optional — for Gemini models' },
  ]

  return (
    <>
      {/* backdrop */}
      <div className="modal-overlay" style={{ alignItems: 'stretch', justifyContent: 'flex-end' }} onClick={onClose}>
        <div className="settings-panel" onClick={e => e.stopPropagation()}>

          {/* header */}
          <div style={{
            flexShrink: 0,
            height: 52,
            padding: '0 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>settings</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--text-muted)', lineHeight: 1, padding: '0 2px' }}>×</button>
          </div>

          {/* content */}
          <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>

            {/* API Keys */}
            {keyFields.map(field => (
              <div className="settings-row" key={field.key}>
                <div className="settings-label">{field.label}</div>
                <div style={{ position: 'relative' }}>
                  <input
                    className="settings-input"
                    type={showKey[field.provider] ? 'text' : 'password'}
                    placeholder={field.placeholder}
                    value={local[field.key] || ''}
                    onChange={e => set(field.key, e.target.value)}
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    onClick={() => toggleShow(field.provider)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11 }}
                  >
                    {showKey[field.provider] ? 'hide' : 'show'}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.6 }}>
                  {field.help}
                </p>
              </div>
            ))}

            {/* Model */}
            <div className="settings-row">
              <div className="settings-label">DEFAULT MODEL</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {MODELS.map(m => (
                  <label key={m.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '8px 10px',
                    border: `1px solid ${local.model === m.id ? 'var(--accent)' : 'var(--border-light)'}`,
                    background: local.model === m.id ? 'var(--accent-bg)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                  }}>
                    <input
                      type="radio"
                      name="model"
                      value={m.id}
                      checked={local.model === m.id}
                      onChange={() => set('model', m.id)}
                      style={{ marginTop: 2, accentColor: 'var(--accent)', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{m.desc} · ctx {m.ctx}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="settings-row">
              <div className="settings-label">THEME</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => set('theme', t.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      padding: '10px 10px 8px',
                      border: `1px solid ${local.theme === t.id ? 'var(--accent)' : 'var(--border-light)'}`,
                      background: local.theme === t.id ? 'var(--accent-bg)' : 'var(--bg-input)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.1s',
                      borderLeft: local.theme === t.id ? `3px solid var(--accent)` : '1px solid var(--border-light)',
                    }}
                  >
                    {/* color dots */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {t.colors.map((c, i) => (
                        <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* footer */}
          <div style={{ flexShrink: 0, padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '8px 18px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13 }}>
              cancel
            </button>
            <button onClick={handleSave} style={{ padding: '8px 20px', border: 'none', background: 'var(--accent)', color: 'white', fontSize: 13 }}>
              save
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
