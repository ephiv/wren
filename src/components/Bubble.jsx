import { renderInline } from '../utils/markdown.jsx'
import { fmtTime } from '../utils/time.js'

export default function Bubble({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 8,
      alignItems: 'flex-end',
    }}>
      {!isUser && (
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: 'white',
          flexShrink: 0,
          marginBottom: 18,
          fontFamily: 'var(--font-mono)',
        }}>w</div>
      )}

      <div style={{
        maxWidth: '76%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: 3,
      }}>
        <div style={{
          background: isUser ? 'var(--bubble-user)' : 'var(--bubble-wren)',
          borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          padding: '10px 14px',
        }}>
          <p style={{
            margin: 0,
            fontSize: 13.5,
            lineHeight: 1.65,
            color: isUser ? 'var(--bubble-user-text)' : 'var(--text-primary)',
          }}>
            {isUser ? msg.content : renderInline(msg.content)}
          </p>
        </div>
        <span style={{ fontSize: 10.5, color: 'var(--text-muted)', paddingInline: 4 }}>
          {fmtTime(msg.ts)}
        </span>
      </div>
    </div>
  )
}
