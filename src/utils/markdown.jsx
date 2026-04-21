import React from 'react'

export function renderInline(text) {
  if (!text) return null
  const parts = []
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0, m, key = 0

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[2] != null) parts.push(<strong key={key++} style={{ fontWeight: 600 }}>{m[2]}</strong>)
    else if (m[3] != null) parts.push(<em key={key++}>{m[3]}</em>)
    else if (m[4] != null) parts.push(
      <code key={key++} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88em', background: 'rgba(128,128,128,0.12)', padding: '1px 5px', borderRadius: 3 }}>{m[4]}</code>
    )
    last = m.index + m[0].length
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts
}
