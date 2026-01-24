# 🎵 Grok MemeSong

Turn X/Twitter posts into satirical songs using Grok AI → Suno.ai

![Screenshot](screenshot.png)

## What is this?

Upload a screenshot of any social media post, pick a style preset (Sarcastic Cyberpunk, Mariachi Tragedy, Valley Girl Pop, etc.), and Grok AI will generate lyrics and a Suno.ai-compatible style prompt for a satirical song about it.

## Features

- 📸 **Screenshot OCR** - Extracts text from images using Tesseract.js (runs locally, no API needed)
- 🤖 **Grok AI Lyrics** - Uses xAI's Grok to generate satirical, meme-worthy songs
- 🎨 **18 Style Presets** - From "Petty R&B" to "Mariachi Tragedy" to "Weird Al Parody"
- 📋 **One-Click Copy** - Copy title, style, and lyrics directly to use in Suno.ai
- 🔒 **API Key Privacy** - Your key is stored locally in your browser, never on any server

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/akrowczyk/grok-memesong.git
cd grok-memesong
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your API key

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` and add your xAI API key:

```
VITE_XAI_API_KEY=your-xai-api-key-here
```

> 💡 Get your API key at [console.x.ai](https://console.x.ai/)

**Alternative:** You can also just paste your API key directly in the app's input field. It will be saved in your browser's localStorage.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start creating bangers! 🔥

## Usage

1. **Upload a screenshot** - Drag & drop or click to upload a screenshot of a post
2. **Pick a style** - Choose from presets like "Sarcastic Cyberpunk", "Broadway Drama", "Lullaby Roast", etc.
3. **Generate** - Click the generate button and wait for the magic
4. **Copy to Suno** - Copy the style prompt and lyrics, paste into [Suno.ai](https://suno.ai)

## Style Presets

| Preset | Vibe |
|--------|------|
| 🤖 Sarcastic Cyberpunk | Glitchy deep house, petty rich-people energy |
| 🤠 Country Roast | Twangy storytelling mockery |
| 🔥 Hype Trap | 808s and ratio energy |
| 😔 Sad Millennial | Lo-fi existential dread |
| 🎭 Broadway Drama | Over-the-top theatrical villain arc |
| ✨ Gen-Z Hyperpop | Chaotic maximalist unhinged |
| 🎸 Dad Rock Lecture | Disappointed father energy |
| 🏴‍☠️ Sea Shanty Ratio | Pirate crew roasting together |
| 💼 LinkedIn Guru | Hustle culture cringe |
| 💅 Petty R&B | 90s slow jam passive-aggressive |
| 🤡 Clown College | Circus chaos "you posted that?" |
| 🧘 Toxic Positivity | Condescending wellness vibes |
| 🍝 Chef's Kiss | Dramatic Italian opera |
| 📺 Breaking News | Urgent broadcast delivery |
| 🪗 Weird Al Parody | Polka-pop clever wordplay |
| 🍼 Lullaby Roast | Sweet nursery rhyme, savage lyrics |
| 🎺 Mariachi Tragedy | Telenovela betrayal drama |
| 💅 Valley Girl Pop | Bubbly sarcastic pop princess |

## Tech Stack

- **React 18** + **Vite** - Fast dev experience
- **Tesseract.js** - Client-side OCR (no server needed)
- **xAI Grok API** - For generating lyrics
- **Vanilla CSS** - Custom styling, no framework

## API Costs

- **OCR**: Free (runs entirely in your browser)
- **Grok API**: ~$0.001-0.01 per song generation (very cheap)

## Contributing

PRs welcome! Some ideas:
- Add more style presets
- Improve OCR accuracy for different screenshot types
- Add support for other AI providers
- Dark/light theme toggle

## License

MIT License - do whatever you want with it! 🚀

---

Built for the vibes by [Andrew Krowczyk](https://x.com/akrowczyk)
