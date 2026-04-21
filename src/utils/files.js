export async function readFileForAPI(file) {
  return new Promise(resolve => {
    if (file.type.startsWith('image/')) {
      const r = new FileReader()
      r.onload = () => {
        const dataUrl = r.result
        const base64 = dataUrl.split(',')[1]
        resolve({ kind: 'image', mediaType: file.type, data: base64, preview: dataUrl, name: file.name, size: file.size, hash: base64.slice(0, 64) })
      }
      r.readAsDataURL(file)
    } else if (file.type === 'application/pdf') {
      const r = new FileReader()
      r.onload = () => {
        const data = r.result.split(',')[1]
        resolve({ kind: 'pdf', data, preview: null, name: file.name, size: file.size, hash: data.slice(0, 64) })
      }
      r.readAsDataURL(file)
    } else if (file.type.startsWith('text/') || /\.(md|txt|json|csv|js|ts|jsx|tsx|py|rs|go|html|css)$/i.test(file.name)) {
      const r = new FileReader()
      r.onload = () => {
        const content = r.result
        const hash = content.slice(0, 64)
        resolve({ kind: 'text', content, name: file.name, size: file.size, hash })
      }
      r.readAsText(file)
    } else if (file.type.startsWith('audio/')) {
      const r = new FileReader()
      r.onload = () => {
        const data = r.result.split(',')[1]
        resolve({ kind: 'audio', name: file.name, size: file.size, preview: r.result, hash: data.slice(0, 64) })
      }
      r.readAsDataURL(file)
    } else if (file.type.startsWith('video/')) {
      const r = new FileReader()
      r.onload = () => {
        const data = r.result.split(',')[1]
        resolve({ kind: 'video', name: file.name, size: file.size, preview: r.result, hash: data.slice(0, 64) })
      }
      r.readAsDataURL(file)
    } else {
      resolve({ kind: 'unknown', name: file.name, size: file.size })
    }
  })
}

export function buildAPIContent(text, files) {
  const seen = new Set()
  const content = []

  for (const f of files) {
    const hashKey = f.hash || f.name
    if (seen.has(hashKey)) continue
    seen.add(hashKey)
    if (f.kind === 'image' && f.data) {
      content.push({ type: 'image_url', image_url: { url: `data:${f.mediaType};base64,${f.data}` } })
    } else if (f.kind === 'pdf' && f.data) {
      content.push({ type: 'text', text: `[pdf attached: ${f.name} — describe it as best you can based on context, or acknowledge it's a design/game document]` })
    } else if (f.kind === 'text') {
      const preview = f.content?.slice(0, 4000)
      const truncated = f.content?.length > 4000 ? '\n[... truncated]' : ''
      content.push({ type: 'text', text: `[text file: ${f.name}]\n${preview}${truncated}` })
    } else if (f.kind === 'audio') {
      content.push({ type: 'text', text: `[audio file archived: "${f.name}" — you can't listen but acknowledge it was logged as part of their devlog]` })
    } else if (f.kind === 'video') {
      content.push({ type: 'text', text: `[video file archived: "${f.name}" — you can't watch but acknowledge it was logged]` })
    } else {
      content.push({ type: 'text', text: `[file archived: ${f.name}]` })
    }
  }

  if (text.trim()) content.push({ type: 'text', text: text.trim() })
  if (content.length === 0) content.push({ type: 'text', text: '(files attached to devlog, no written note)' })

  // OpenRouter uses content array for multimodal; flatten to string for text-only models
  // we return the content array and let the caller decide
  return content
}

export function fileIcon(kind) {
  const icons = { image: '🖼', pdf: '📄', text: '📝', audio: '🎵', video: '🎬' }
  return icons[kind] || '📎'
}

export function fmtSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes}b`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}kb`
  return `${(bytes / 1024 / 1024).toFixed(1)}mb`
}
