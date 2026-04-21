import { OPENROUTER_BASE, FALLBACK_MODELS, PROVIDER_KEYS } from '../constants/models'
import { MEMORY_COMPRESS_SYSTEM } from '../constants/prompts'

const MAX_RETRIES = 2

function getProvider(modelId) {
  if (modelId.startsWith('openai/')) return 'openai'
  if (modelId.startsWith('anthropic/')) return 'anthropic'
  if (modelId.startsWith('google/')) return 'google'
  return 'openrouter'
}

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  let lastRes = null
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, options)
    lastRes = res
    if (res.ok) return res
    if (attempt === retries) break
    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
  }
  const err = await lastRes.clone().json().catch(() => ({})) || {}
  throw new Error(err?.error?.message || `api error ${lastRes.status}`)
}

export async function callModel({ apiKey, openaiKey, anthropicKey, googleKey, model, system, messages, fallbackModels = FALLBACK_MODELS }) {
  if (!apiKey && !openaiKey && !anthropicKey && !googleKey) {
    throw new Error('no api key — add your OpenRouter key in settings (⚙)')
  }

  const keyMap = { openrouter: apiKey, openai: openaiKey, anthropic: anthropicKey, google: googleKey }

  const modelsToTry = [model, ...fallbackModels.filter(m => m !== model)]
  let lastError = null

  for (const m of modelsToTry) {
    try {
      const provider = getProvider(m)
      const effectiveKey = keyMap[provider] || apiKey

      if (!effectiveKey) {
        lastError = `no ${provider} key — add it in settings`
        continue
      }

      const res = await fetchWithRetry(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveKey}`,
          'HTTP-Referer': 'https://wren.local',
          'X-Title': 'wren game advisor',
        },
        body: JSON.stringify({
          model: m,
          max_tokens: 1200,
          messages: [
            { role: 'system', content: system },
            ...messages,
          ],
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (data?.error) {
        lastError = data.error.message
        continue
      }

      return data.choices?.[0]?.message?.content || ''
    } catch (e) {
      lastError = e.message
    }
  }

  throw new Error(lastError || 'all models failed')
}

export async function compressMemory({ apiKey, model, messages, existingSummary }) {
  const historyText = messages
    .map(m => `${m.role === 'user' ? 'user' : 'wren'}: ${
      Array.isArray(m.content)
        ? m.content.filter(c => c.type === 'text').map(c => c.text).join(' ')
        : m.content
    }`)
    .join('\n')

  const prompt = existingSummary
    ? `previous summary:\n${existingSummary}\n\nnew conversation to add:\n${historyText}`
    : historyText

  const summary = await callModel({
    apiKey, openaiKey, anthropicKey, googleKey,
    model,
    system: MEMORY_COMPRESS_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  return summary.trim()
}

const COMPRESS_AFTER = 18
const KEEP_RECENT = 8

export async function callWithMemory({ apiKey, openaiKey, anthropicKey, googleKey, model, system, allMessages, memory, onMemoryUpdate }) {
  let messagesToSend = allMessages
  let currentMemory = memory

  if (allMessages.length > COMPRESS_AFTER) {
    const cutoff = allMessages.length - KEEP_RECENT
    const toCompress = allMessages.slice(currentMemory?.compressedThrough ?? 0, cutoff)

    if (toCompress.length >= 6) {
      const newSummary = await compressMemory({
        apiKey, openaiKey, anthropicKey, googleKey,
        model,
        messages: toCompress,
        existingSummary: currentMemory?.summary || null,
      })
      currentMemory = { summary: newSummary, compressedThrough: cutoff }
      onMemoryUpdate?.(currentMemory)
    }

    messagesToSend = allMessages.slice(currentMemory?.compressedThrough ?? 0)
  }

  const enrichedSystem = currentMemory?.summary
    ? `${system}\n\n[memory from earlier in this conversation]\n${currentMemory.summary}`
    : system

  return callModel({ apiKey, model, system: enrichedSystem, messages: messagesToSend })
}