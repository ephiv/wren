export const MODELS = [
  // Free models
  {
    id: 'openrouter/free',
    name: 'Free Router',
    desc: 'Auto-selects best available free model',
    ctx: '200k',
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Gemma 4 26B',
    desc: 'Google · latest Gemma',
    ctx: '262k',
  },
  {
    id: 'nvidia/nemotron-3-nano-30b-a3b:free',
    name: 'Nemotron 3 Nano',
    desc: 'NVIDIA · compact, efficient',
    ctx: '128k',
  },
  {
    id: 'qwen/qwen3-next-80b-a3b-instruct:free',
    name: 'Qwen3 Next 80B',
    desc: 'Alibaba · latest Qwen',
    ctx: '262k',
  },
  {
    id: 'minimax/minimax-m2.5:free',
    name: 'MiniMax M2.5',
    desc: 'MiniMax · strong reasoning',
    ctx: '197k',
  },
  {
    id: 'nvidia/nemotron-3-super-120b-a12b:free',
    name: 'Nemotron 3 Super',
    desc: 'NVIDIA · 120B MoE, top performance',
    ctx: '262k',
  },
  // OpenAI (paid)
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    desc: 'OpenAI · flagship model',
    ctx: '128k',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    desc: 'OpenAI · fast, affordable',
    ctx: '128k',
  },
  {
    id: 'openai/o1',
    name: 'OpenAI o1',
    desc: 'OpenAI · reasoning model',
    ctx: '200k',
  },
  {
    id: 'openai/o3',
    name: 'OpenAI o3',
    desc: 'OpenAI · advanced reasoning',
    ctx: '200k',
  },
  // Anthropic (paid)
  {
    id: 'anthropic/claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    desc: 'Anthropic · latest Sonnet',
    ctx: '200k',
  },
  {
    id: 'anthropic/claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    desc: 'Anthropic · balanced',
    ctx: '200k',
  },
  {
    id: 'anthropic/claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    desc: 'Anthropic · most capable',
    ctx: '200k',
  },
  // Google (paid)
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    desc: 'Google · flagship',
    ctx: '1M',
  },
  {
    id: 'google/gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    desc: 'Google · fast',
    ctx: '1M',
  },
]

const FALLBACK_MODELS = [
  'openrouter/free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
]

export const PROVIDER_KEYS = {
  openrouter: 'apiKey',
  openai: 'openaiKey',
  anthropic: 'anthropicKey',
  google: 'googleKey',
}

export { FALLBACK_MODELS }
export const DEFAULT_MODEL = MODELS[0].id

export const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
