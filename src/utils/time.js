export function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function fmtDateLabel(ts) {
  const d = new Date(ts), t = new Date(), y = new Date()
  y.setDate(t.getDate() - 1)
  if (d.toDateString() === t.toDateString()) return 'today'
  if (d.toDateString() === y.toDateString()) return 'yesterday'
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}

export function fmtRelative(ts) {
  const diff = Date.now() - ts
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function fmtJournalDate(ts) {
  return new Date(ts).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

export function groupByDate(messages) {
  const out = []; let last = null
  messages.forEach(msg => {
    const lbl = fmtDateLabel(msg.ts)
    if (lbl !== last) { out.push({ type: 'sep', label: lbl }); last = lbl }
    out.push({ type: 'msg', msg })
  })
  return out
}
