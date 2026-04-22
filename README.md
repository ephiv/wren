# wren

your personal game dev advisor. plan your game, log your progress, get a roadmap built around *your* specific game — not a generic template.

## setup

```bash
# 1. install dependencies
npm install

# 2. start dev server
npm run dev

# 3. open http://localhost:5173
```

## get an api key

wren supports multiple providers. You need at least one:

### Free (OpenRouter)
1. go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. create a free account
3. generate an API key
4. paste it into settings (⚙ icon)

### Paid providers (optional)
- OpenAI: [platform.openai.com](https://platform.openai.com) - for GPT-4o, o1, o3
- Anthropic: [console.anthropic.com](https://console.anthropic.com) - for Claude models
- Google: [aistudio.google.com](https://aistudio.google.com) - for Gemini models

Add your paid keys in settings to enable those models.

## features

**plan mode**
- chat with wren about your game idea
- wren asks short clarifying questions and builds a roadmap specific to your game
- roadmap updates live as you share more details
- quick-prompt chips to jumpstart conversation

**dev log mode**
- log your daily progress like a journal
- attach screenshots, concept art, PDFs, audio files, code files — anything
- wren reads everything and gives brief, honest feedback
- all files are preserved in localStorage for your full build archive

**memory system**
- after ~18 messages, wren compresses older conversation into a memory summary
- memory is injected as context into future calls — wren never loses track of your game
- memory badge appears in the toolbar when active
- compression uses the same model you have selected

**multi-session**
- manage multiple games from the sidebar
- each game has its own roadmap, chat history, dev logs, and memory
- everything persists in localStorage — survives page refresh

**model selection**
- switch between free and paid models from the message bar or settings
- free models: OpenRouter Router, Gemma 4, Nemotron Nano, Qwen3 Next, MiniMax M2.5, Nemotron Super
- paid models: OpenAI (GPT-4o, o1, o3), Anthropic (Claude Sonnet 4, Claude 3.5, Claude 3 Opus), Google (Gemini 2.5 Pro, Gemini 2.0 Flash)

**theme presets** (8 total)
- `ember` — warm off-white, burnt orange (default)
- `midnight` — near-black, electric cyan
- `chalk` — pure white, graphite minimal
- `forest` — earthy cream, dark green sidebar
- `dusk` — deep violet, twilight purple
- `steel` — industrial dark, amber accent
- `rose` — warm ivory, dusty pink
- `hacker` — terminal green on pure black

switch theme from the message bar or settings panel. theme and model selection persist across sessions.

## project structure

```
wren-app/
├── src/
│   ├── App.jsx                  # root — session management, layout
│   ├── main.jsx
│   ├── styles/
│   │   └── globals.css          # all CSS + 8 theme token sets
│   ├── constants/
│   │   ├── prompts.js           # system prompts for chat, log, memory
│   │   ├── models.js            # OpenRouter model list
│   │   └── themes.js            # theme metadata
│   ├── utils/
│   │   ├── storage.js           # localStorage layer (sessions + settings)
│   │   ├── api.js               # OpenRouter caller + memory compression
│   │   ├── files.js             # file reading + API content builder
│   │   ├── markdown.jsx         # inline markdown renderer (bold, italic, code)
│   │   └── time.js              # time formatting helpers
│   └── components/
│       ├── Sidebar.jsx          # session list + new game button
│       ├── ChatPanel.jsx        # plan mode
│       ├── LogPanel.jsx         # dev log mode
│       ├── RoadmapPanel.jsx     # live roadmap sidebar
│       ├── Bubble.jsx           # chat message bubble
│       ├── LogCard.jsx          # devlog entry card with file display
│       ├── PhaseCard.jsx        # collapsible roadmap phase
│       ├── Toolbar.jsx          # model + theme pickers + memory badge
│       ├── Settings.jsx         # settings drawer
│       └── icons.jsx            # all SVG icons
```

## storage notes

- all data lives in `localStorage` — no server, no account, no cloud
- session data key: `wren-sess-{id}`
- session index key: `wren-index`
- settings key: `wren-settings`
- images are stored as base64 dataURLs (raw API payload is de-duplicated, preview is kept)
- very large image archives could approach localStorage limits (~5-10mb depending on browser); consider clearing old sessions if you hit issues
- audio files are stored as base64 dataURLs and are fully playable from the devlog

## build for production

```bash
npm run build
# output in dist/
```
