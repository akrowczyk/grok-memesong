# 🎵 MemeSong MCP Server

Turn any content into **Suno-ready songs** directly from Claude Desktop. 150 style presets, 3 humor modes, vocals & instrumental — no API keys needed.

## What It Does

MemeSong is an MCP server that gives Claude the tools and context to generate perfectly formatted songs for [Suno.ai](https://suno.ai). Just describe what you want a song about, pick a style, and Claude writes it with proper Suno formatting.

### Features

- **150 Style Presets** — From Trap Soul to Gregorian Chant, Outlaw Country to Dubstep Assault
- **3 Song Modes** — Serious (genuine), Satirical (witty roast), Hilarious (unhinged comedy)
- **2 Output Types** — Vocal lyrics or instrumental metatags
- **Suno-Ready** — All output formatted with proper `[structure tags]` and `(vocal hints)`
- **Interactive UI** — Visual preset browser, mode toggles, and copy-ready output panel
- **Zero Config** — No API keys needed — Claude is the generation engine

## Installation

### 1. Build the Server

```bash
git clone https://github.com/yourusername/memesong-mcp.git
cd memesong-mcp
npm install
npm run build
```

### 2. Add to Claude Desktop

Open your Claude Desktop config file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add the server:

```json
{
  "mcpServers": {
    "memesong": {
      "command": "node",
      "args": ["/absolute/path/to/memesong-mcp/dist/index.js"]
    }
  }
}
```

### 3. Restart Claude Desktop

The MemeSong tools will appear in Claude's tool list.

## Usage

### Quick Start

Just talk to Claude naturally:

> "Make a satirical trap soul song about people who reply-all to company emails"

> "Write a serious 70s soft rock ballad inspired by this text: [paste content]"

> "Generate a hilarious sea shanty about my coworker who microwaves fish in the office"

### Using Prompts

Claude Desktop's prompt picker will show two MemeSong prompts:

- **Create Song** — Quick song creation with style and mode options
- **Browse Styles** — Explore all 150 presets by category

### Using Tools Directly

You can also ask Claude to use the tools explicitly:

- `list_presets` — Browse presets with category/search filters
- `get_preset` — Get full details for a specific style
- `generate_song` — Generate a complete song with all formatting

## Style Categories

| Category | Count | Examples |
|----------|-------|---------|
| 🎤 Hip-Hop | 16 | Trap Soul, Slim Shady, UK Drill, Hamilton Rap Musical |
| 🎸 Rock | 14 | Punk Rock, Emo, Grunge, Progressive Epic, Shoegaze |
| ✨ Pop | 8 | Gen-Z Hyperpop, Y2K Pop, TikTok Bait |
| 🎛️ Electronic | 11 | Synthwave, Dubstep, Deep House, Witch House |
| 💜 R&B | 3 | Neo-Soul Confessional, Trap Soul, Petty R&B |
| 🎷 Jazz/Blues | 8 | Smooth Jazz, Bossa Nova, Motown Soul, Jazz Fusion |
| 🤠 Country | 7 | Outlaw Country, Bluegrass, Country Trap |
| 💃 Latin | 7 | Salsa, Flamenco, Tango, Reggaeton, Tropicália |
| 🌍 World | 26 | K-Pop, Bollywood, Afrobeat, Nordic Folk, Turkish Psych |
| 🎻 Classical | 7 | Opera Aria, Gregorian Chant, Broadway, Gospel |
| 🎪 Novelty | 33+ | WWE Entrance, True Crime, Nature Documentary, ASMR |

## Song Modes

| Mode | Description |
|------|-------------|
| 🎵 **Serious** | Genuine, heartfelt songwriting — no humor, no satire |
| 😏 **Satirical** | Clever, witty, sarcastic — playful roasting |
| 🤣 **Hilarious** | Over-the-top absurd comedy — maximum chaos |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run directly
node dist/index.js
```

## How It Works

Unlike the [MemeSong web app](https://github.com/yourusername/memesongs) (which uses Grok for generation), this MCP server uses **Claude itself** as the song generation engine. The server provides:

1. **Style presets** — 150 detailed music style descriptions with Suno-optimized prompts
2. **Suno formatting guide** — Rules for `[structure tags]`, `(vocal hints)`, and output formatting
3. **Mode-specific personas** — System prompt variations for serious/satirical/hilarious modes
4. **Structured output format** — Title, style prompt, and lyrics/tags separated for easy Suno input

Claude reads the context from the tools and generates the song using its own capabilities. No external API calls needed.

## License

MIT
