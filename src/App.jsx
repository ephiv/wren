import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import LogPanel from './components/LogPanel.jsx'
import RoadmapPanel from './components/RoadmapPanel.jsx'
import Settings from './components/Settings.jsx'
import {
  loadIndex, saveIndex,
  loadSession, persistSession,
  deleteSession as deleteFromStorage,
  emptySession, makeId,
  loadSettings, saveSettings,
} from './utils/storage'

export default function App() {
  // ── settings / global prefs ─────────────────────────────────────────────
  const [settings, setSettings]   = useState(loadSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError]         = useState(null)

  // ── session index ────────────────────────────────────────────────────────
  const [sessions, setSessions]   = useState([])
  const [activeId, setActiveId]   = useState(null)
  const [saving, setSaving]       = useState(false)

  // ── active session state ─────────────────────────────────────────────────
  const [chatMsgs, setChatMsgs]   = useState([])
  const [roadmap, setRoadmap]     = useState(null)
  const [logEntries, setLogEntries] = useState([])
  const [started, setStarted]     = useState(false)
  const [memory, setMemory]       = useState(null)

  // ── ui ───────────────────────────────────────────────────────────────────
  const [mode, setMode]           = useState('chat')

  // ── bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    const idx = loadIndex()
    setSessions(idx)
    if (idx.length > 0) {
      loadAndSetSession(idx[0].id)
    } else {
      createNew(idx)
    }
  }, [])

  // apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  // clear error after 5s
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 5000)
    return () => clearTimeout(t)
  }, [error])

  // ── session helpers ───────────────────────────────────────────────────────
  function loadAndSetSession(id) {
    const data = loadSession(id)
    if (!data) return
    setChatMsgs(data.chatMsgs || [])
    setRoadmap(data.roadmap || null)
    setLogEntries(data.logEntries || [])
    setStarted(data.started || false)
    setMemory(data.memory || null)
    setActiveId(id)
    setMode('chat')
  }

  function createNew(existingIdx = sessions) {
    const id = makeId()
    const meta = { id, title: 'untitled game', updatedAt: Date.now(), started: false }
    const newIdx = [meta, ...existingIdx]
    setSessions(newIdx)
    saveIndex(newIdx)
    persistSession(id, emptySession(id))
    setChatMsgs([])
    setRoadmap(null)
    setLogEntries([])
    setStarted(false)
    setMemory(null)
    setActiveId(id)
    setMode('chat')
  }

  function switchSession(id) {
    loadAndSetSession(id)
  }

  function deleteSession(id) {
    deleteFromStorage(id)
    const newIdx = sessions.filter(s => s.id !== id)
    setSessions(newIdx)
    saveIndex(newIdx)
    if (id === activeId) {
      if (newIdx.length > 0) loadAndSetSession(newIdx[0].id)
      else createNew([])
    }
  }

  // ── persist helper (called by panels after mutations) ───────────────────
  const saveActive = useCallback((patch) => {
    if (!activeId) return
    setSaving(true)

    const current = loadSession(activeId) || emptySession(activeId)
    const updated = {
      ...current,
      chatMsgs:   patch.chatMsgs   ?? current.chatMsgs,
      roadmap:    patch.roadmap    !== undefined ? patch.roadmap : current.roadmap,
      logEntries: patch.logEntries ?? current.logEntries,
      started:    patch.started    !== undefined ? patch.started : current.started,
      memory:     patch.memory     !== undefined ? patch.memory : current.memory,
    }

    persistSession(activeId, updated)

    const title = updated.roadmap?.title || 'untitled game'
    setSessions(prev => {
      const next = prev.map(s =>
        s.id === activeId ? { ...s, title, updatedAt: Date.now(), started: updated.started } : s
      )
      next.sort((a, b) => b.updatedAt - a.updatedAt)
      saveIndex(next)
      return next
    })

    setTimeout(() => setSaving(false), 400)
  }, [activeId])

  // ── settings save ─────────────────────────────────────────────────────────
  function handleSettingsSave(next) {
    setSettings(next)
    saveSettings(next)
  }

  // ── model / theme quick-change from toolbar ───────────────────────────────
  function handleModelChange(m) {
    const next = { ...settings, model: m }
    setSettings(next)
    saveSettings(next)
  }
  function handleThemeChange(t) {
    const next = { ...settings, theme: t }
    setSettings(next)
    saveSettings(next)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* error toast */}
      {error && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--danger)', color: 'white',
          padding: '10px 20px', fontSize: 13, zIndex: 999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: 420, textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* sidebar */}
        <Sidebar
          sessions={sessions}
          activeId={activeId}
          onSwitch={switchSession}
          onCreate={() => createNew()}
          onDelete={deleteSession}
          onSettings={() => setShowSettings(true)}
          onImport={(meta) => {
            setSessions(prev => {
              const next = [meta, ...prev]
              saveIndex(next)
              return next
            })
            loadAndSetSession(meta.id)
          }}
          saving={saving}
        />

        {/* main panel */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          borderRight: roadmap ? '1px solid var(--border)' : 'none',
          background: 'var(--bg-main)',
        }}>
          {/* header */}
          <div style={{
            flexShrink: 0,
            padding: '0 24px',
            height: 52,
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{
                fontSize: 13,
                fontWeight: 500,
                color: roadmap ? 'var(--text-primary)' : 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {roadmap?.title || 'untitled game'}
              </span>
            </div>
            {started && (
              <div style={{ display: 'flex', gap: 2, border: '1px solid var(--border)', padding: 3, background: 'var(--bg-panel)', flexShrink: 0 }}>
                <button className={`tab${mode === 'chat' ? ' on' : ''}`} onClick={() => setMode('chat')}>plan</button>
                <button className={`tab${mode === 'log' ? ' on' : ''}`} onClick={() => setMode('log')}>dev log</button>
              </div>
            )}
          </div>

          {/* panel content */}
          {mode === 'chat' && (
            <ChatPanel
              msgs={chatMsgs}
              setMsgs={setChatMsgs}
              roadmap={roadmap}
              setRoadmap={setRoadmap}
              started={started}
              setStarted={setStarted}
              memory={memory}
              setMemory={setMemory}
              model={settings.model}
              onModelChange={handleModelChange}
              theme={settings.theme}
              onThemeChange={handleThemeChange}
              apiKey={settings.apiKey}
              openaiKey={settings.openaiKey}
              anthropicKey={settings.anthropicKey}
              googleKey={settings.googleKey}
              onError={setError}
              onSave={saveActive}
            />
          )}
          {mode === 'log' && (
            <LogPanel
              entries={logEntries}
              setEntries={setLogEntries}
              model={settings.model}
              onModelChange={handleModelChange}
              theme={settings.theme}
              onThemeChange={handleThemeChange}
              apiKey={settings.apiKey}
              openaiKey={settings.openaiKey}
              anthropicKey={settings.anthropicKey}
              googleKey={settings.googleKey}
              onError={setError}
              onSave={saveActive}
            />
          )}
        </div>

        {/* roadmap panel */}
        {roadmap && <RoadmapPanel roadmap={roadmap} />}
      </div>

      {/* settings drawer */}
      {showSettings && (
        <Settings
          settings={settings}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
