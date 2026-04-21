const IDX_KEY = 'wren-index'
const SETTINGS_KEY = 'wren-settings'
const skey = id => `wren-sess-${id}`

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function exportSession(id) {
  const data = loadSession(id)
  if (!data) return null
  return JSON.stringify(data, null, 2)
}

export function importSession(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    if (!data || typeof data !== 'object') throw new Error('invalid format')
    const newId = makeId()
    const imported = { ...data, id: newId }
    persistSession(newId, imported)
    return { id: newId, title: imported.roadmap?.title || 'imported game', updatedAt: Date.now(), started: imported.started || false }
  } catch (e) {
    console.warn('wren: failed to import session', e)
    return null
  }
}

export function loadIndex() {
  try { return JSON.parse(localStorage.getItem(IDX_KEY) || '[]') } catch { return [] }
}
export function saveIndex(idx) {
  try { localStorage.setItem(IDX_KEY, JSON.stringify(idx)) } catch (e) {
    console.warn('wren: failed to save index', e)
  }
}

export function loadSession(id) {
  try { return JSON.parse(localStorage.getItem(skey(id)) || 'null') } catch { return null }
}

export function persistSession(id, data) {
  try {
    const slim = {
      ...data,
      logEntries: (data.logEntries || []).map(e => ({
        ...e,
        files: (e.files || []).map(f => {
          if (f.kind === 'image') {
            const { data: _raw, ...rest } = f
            return rest
          }
          if (f.kind === 'pdf') {
            return f
          }
          return f
        }),
      })),
    }
    localStorage.setItem(skey(id), JSON.stringify(slim))
  } catch (e) {
    console.warn('wren: failed to save session (storage may be full)', e)
  }
}

export function deleteSession(id) {
  try { localStorage.removeItem(skey(id)) } catch {}
}

export function emptySession(id) {
  return {
    id,
    chatMsgs: [],
    roadmap: null,
    logEntries: [],
    started: false,
    memory: null,
    createdAt: Date.now(),
  }
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null') || {
      apiKey: '',
      openaiKey: '',
      anthropicKey: '',
      googleKey: '',
      theme: 'ember',
      model: 'openrouter/free',
    }
  } catch { return { apiKey: '', openaiKey: '', anthropicKey: '', googleKey: '', theme: 'ember', model: 'openrouter/free' } }
}

export function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) } catch {}
}
