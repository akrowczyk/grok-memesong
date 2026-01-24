// Suno AI formatting hints for song structure
export const sunoHints = `
## Suno Song Formatting Guide

### Structural hints (using brackets [])
Brackets provide structural commands. These are the most direct way to guide composition.
- [Intro] or [Instrumental]
- [Verse] or [Verse 1]
- [Chorus]
- [Bridge]
- [Outro]
- [Guitar Solo] or [Piano Solo]
- [Drum beat]
- [Stop] or [Silence]
- [Drop] - for EDM/electronic builds

### Vocal and delivery hints (using parentheses ())
CRITICAL: Parentheses hints must be placed ON THEIR OWN LINE before the lyrics they affect.
If you put (hint) at the END of a lyric line, Suno will SING it as lyrics!

CORRECT FORMAT:
(Whispered)
These are my secret words

WRONG FORMAT (will be sung as lyrics):
These are my secret words (whispered)

Available hints:
- (Shouted) or (Yelling)
- (Whispered) or (Softly)
- (Echoes) - creates a ghostly, repeating vocal effect
- (Ad-libs) - adds subtle, improvisational vocal touches
- (Harmonies) or (Duet) - adds layers of vocals
- (Oh-oh-ohs) or (Yeahs) - adds backing vocal effects
- (Laughing) - adds laughter
- (Talkbox) - vocoder/talkbox effect

### Lyrical formatting for emphasis
- ALL CAPS: Instructs AI to perform with more power, volume, or emotion
- Extra letters: Stretching words elongates the vocal (e.g., goo-o-o-odbye)
- Ellipses (...): Creates natural pauses in vocal delivery
- Hyphens: Creates sharp, percussive syllables for punchier delivery

### Song length guidance
- Each verse should be 4-8 lines
- Choruses can repeat but vary slightly
- Include [Intro] at the start (4-8 bars)
- Include [Outro] at the end
- For drops, use [Drop] or [Drop 1] markers
`.trim();

export default sunoHints;
