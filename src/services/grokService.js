import { sunoHints } from '../data/sunoHints';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

/**
 * Generate a meme song from extracted text using Grok text model
 * @param {string} apiKey - xAI API key
 * @param {string} extractedText - Text extracted from screenshot via OCR or user input
 * @param {object} preset - Selected style preset
 * @param {string} additionalContext - Optional additional context to steer lyrics
 * @param {string} model - Grok model to use (default: grok-4-1-fast-non-reasoning)
 * @param {string} humorMode - 'satirical' or 'hilarious' - changes the tone of the prompt
 * @param {boolean} instrumentalMode - if true, generate Suno metatags for instrumental instead of lyrics
 * @returns {Promise<{title: string, style: string, lyrics: string}>}
 */
export async function generateSong(apiKey, extractedText, preset, additionalContext = '', model = 'grok-4-1-fast-non-reasoning', humorMode = 'satirical', instrumentalMode = false) {
    // Choose system prompt based on humor mode
    const satiricalPrompt = `You are a satirical songwriting genius who creates viral, funny songs about trending topics and social media posts. You specialize in creating songs that playfully roast and mock the subject with clever wordplay and catchy hooks.`;

    const hilariousPrompt = `You are an UNHINGED comedy songwriting wizard who creates OUTRAGEOUSLY HILARIOUS songs that make people cry-laugh. Your songs are ABSURDLY FUNNY, completely over-the-top, and use the most ridiculous wordplay imaginable. Think "Weird Al meets a meme-obsessed comedian on Red Bull." Every line should be a punchline. Go ABSOLUTELY WILD with the humor - no holding back! Maximum chaos, maximum laughs!`;

    const seriousPrompt = `You are a world-class professional songwriter who writes emotionally compelling, genuine songs. You craft lyrics with poetic depth, authentic feeling, and memorable melodies — no satire, no irony, no comedy. Think of the best singer-songwriters: heartfelt storytelling, vivid imagery, universal themes that connect with listeners. Your songs should feel like they belong on a real album — moving, powerful, and beautifully written.`;

    const basePrompt = humorMode === 'hilarious' ? hilariousPrompt : humorMode === 'serious' ? seriousPrompt : satiricalPrompt;

    // Instrumental mode: generate Suno metatags instead of lyrics
    const instrumentalSystemPrompt = `You are an expert music producer and composer who creates detailed instrumental composition roadmaps for Suno.ai. You specialize in translating themes and moods into rich, structured instrumental arrangements using Suno's metatag system.

${sunoHints}

CRITICAL FORMATTING RULES:
1. Return your response in EXACTLY this format:
---TITLE---
[A catchy, evocative instrumental title - short and punchy]
---STYLE---
[The style prompt for Suno - one paragraph describing BPM, instruments, mood, and energy. MUST include "instrumental" and "no vocals"]
---TAGS---
[The complete Suno metatag composition roadmap]

2. The TITLE should be evocative and capture the mood (e.g., "Midnight Chase", "Desert Storm Rising", "Neon Requiem")
3. The STYLE section MUST include "instrumental, no vocals" and describe BPM, key instruments, mood, and energy
4. The TAGS section should be a structured composition using Suno metatags in [brackets]
5. Use structural tags like [Intro], [Build], [Drop], [Breakdown], [Guitar Solo], [Piano Solo], [Climax], [Outro]
6. Between tags, add brief mood/dynamic descriptions to guide the AI (e.g., "tension building", "explosive energy", "melancholy fade")
7. Include tempo and dynamic changes throughout - make it a JOURNEY, not just a loop
8. Aim for 2-3 minutes of structured composition

EXAMPLE OUTPUT for TAGS section:
[Intro]
Soft piano, atmospheric pads, building tension
[Build]
Drums enter, bass rising, synth arpeggios intensifying
[Drop]
Full energy, all instruments, driving rhythm
[Breakdown]
Stripped back, haunting melody, echo effects
[Guitar Solo]
Emotional, soaring, reverb-drenched
[Climax]
All instruments return, maximum intensity, layered harmonies
[Outro]
Gradual fade, piano returns alone, final chord ring out

Make the composition dynamic, expressive, and cinematic.`;

    const vocalSystemPrompt = `${basePrompt}

${sunoHints}

CRITICAL FORMATTING RULES:
1. Return your response in EXACTLY this format:
---TITLE---
[A catchy, meme-worthy song title - short and punchy]
---STYLE---
[The style prompt for Suno - one paragraph describing BPM, instruments, vocals, and energy]
---LYRICS---
[The complete song lyrics with all Suno formatting hints]

2. The TITLE should be catchy, quotable, and capture the essence of the roast (e.g., "Sonic Boom Bitch", "Ratio King", etc.)
3. The STYLE section should be a single paragraph like: "Sarcastic cyberpunk deep-house 126 BPM, glitchy female vocals..."
4. The LYRICS section should follow Suno formatting with [brackets] for structure and (parentheses) for vocal directions
5. Include [Intro], [Verse], [Chorus], [Bridge], and [Outro] sections
6. Make it catchy, meme-worthy, and shareable
7. Maximum 2-3 minutes of lyrics (not too long)

CRITICAL - PARENTHESES PLACEMENT:
- NEVER put (vocal hints) at the END of a lyric line - Suno will sing them as lyrics!
- ALWAYS put vocal hints like (Whispered), (Shouted), (Echoes) on their OWN LINE before the lyrics they affect
- Example of CORRECT: 
  (Whispered)
  These secrets burn inside
- Example of WRONG (will be sung):
  These secrets burn inside (whispered)

LANGUAGE RULE (VERY IMPORTANT - DO NOT IGNORE):
- ALL lyrics MUST be written in ENGLISH. This is NON-NEGOTIABLE.
- Even when the musical STYLE is French, Italian, Spanish, Russian, German, etc. - the LYRICS must still be in ENGLISH
- The style/instrumentation can sound French, but the WORDS must be English
- You may use 1-2 brief foreign exclamations per song MAX (like "Oh la la!" or "¡Ay!") but every actual lyric line must be English
- DO NOT write verses, choruses, or bridges in any foreign language
- If you catch yourself writing in French/Spanish/Italian/etc., STOP and rewrite in English

DATE/NUMBER RULE:
- If there are any dates in the content, SPELL THEM OUT fully in lyrics so they sound natural when sung
- Example: "Dec 10, 2025" → "December tenth, twenty twenty-five"
- Example: "1/15/24" → "January fifteenth, twenty twenty-four"
- This ensures proper pronunciation when the song is generated

PRONUNCIATION RULE (CRITICAL FOR SUNO):
- Replace terms that Suno often mispronounces with phonetic spellings in the lyrics
- Common replacements:
  • "xAI" → "X-A-I" or "X A I"
  • "SpaceX" → "Space-X"
  • "X" (the platform) → "the platform X" or "X dot com"
  • "AI" (standalone) → "A-I" (spell it out)
  • "CEO" → "C-E-O"
  • "API" → "A-P-I"
  • "UI/UX" → "U-I" / "U-X"
  • "ML" → "M-L"
  • Any other acronyms: spell them out with hyphens or spaces
- For other tech/brand names that might be tricky, use common sense phonetic spelling
- Don't overdo it - only apply this to terms that would genuinely be unclear when sung`;

    const systemPrompt = instrumentalMode ? instrumentalSystemPrompt : vocalSystemPrompt;

    // Build context section if additional context provided
    const contextSection = additionalContext
        ? `\n\n--- ADDITIONAL CONTEXT/DIRECTION ---\n${additionalContext}\n--- END CONTEXT ---\n\nUse this additional context to guide the tone, focus, or direction of the lyrics.`
        : '';

    const instrumentalUserPrompt = `Here is text/content that should inspire the MOOD and THEME of an instrumental composition:

--- CONTENT ---
${extractedText}
--- END CONTENT ---${contextSection}

STYLE DIRECTION: ${preset.name}
Base style: ${preset.stylePrompt}
Mood/Energy: ${preset.tone}

Create an INSTRUMENTAL composition roadmap that:
1. Captures the emotional essence and energy of the content
2. Translates the mood into musical dynamics (tension, release, climax)
3. Uses instruments and sounds that match the "${preset.name}" style perfectly
4. Has a compelling musical arc - not just a flat loop
5. Is formatted with Suno metatags for an instrumental track (NO VOCALS, NO LYRICS)

GO! Make it a cinematic masterpiece.`;

    const seriousVocalUserPrompt = `Here is text/content that should inspire a genuine, heartfelt song:

--- CONTENT ---
${extractedText}
--- END CONTENT ---${contextSection}

STYLE DIRECTION: ${preset.name}
Base style: ${preset.stylePrompt}
Mood: ${preset.tone}

Create a genuine song that:
1. Captures the real emotional core and meaning of the content
2. Has a memorable, singable chorus with universal appeal
3. Uses vivid imagery, metaphor, and authentic storytelling
4. Matches the "${preset.name}" musical style perfectly
5. Is formatted for Suno.ai with proper structure hints
6. Feels like a real song — no satire, no irony, no jokes

GO! Make it a song that moves people.`;

    const funnyVocalUserPrompt = `Here is text extracted from a social media post/screenshot. Create a satirical song about it:

--- POST CONTENT ---
${extractedText}
--- END POST ---${contextSection}

STYLE DIRECTION: ${preset.name}
Base style: ${preset.stylePrompt}
Tone: ${preset.tone}

Create a song that:
1. Captures the essence/absurdity of what's being said
2. Has a catchy, quotable chorus
3. Uses clever wordplay and references to the content
4. Matches the "${preset.name}" energy perfectly
5. Is formatted for Suno.ai with proper structure hints

GO! Make it funny and viral-worthy.`;

    const vocalUserPrompt = humorMode === 'serious' ? seriousVocalUserPrompt : funnyVocalUserPrompt;

    const userPrompt = instrumentalMode ? instrumentalUserPrompt : vocalUserPrompt;

    const response = await fetch(GROK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
            temperature: 0.9,
            max_tokens: 2000,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        let errorMessage = `API request failed: ${response.status}`;
        try {
            const parsed = JSON.parse(errorBody);
            errorMessage = parsed.error?.message || parsed.message || JSON.stringify(parsed, null, 2);
        } catch {
            if (errorBody) errorMessage += ` — ${errorBody.slice(0, 300)}`;
        }
        console.error('Grok API error:', response.status, errorBody);
        throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Parse the response
    return instrumentalMode ? parseInstrumentalResponse(content) : parseGrokResponse(content);
}

/**
 * Parse Grok's response into title, style and lyrics
 */
function parseGrokResponse(content) {
    const titleMatch = content.match(/---TITLE---\s*([\s\S]*?)(?=---STYLE---|$)/i);
    const styleMatch = content.match(/---STYLE---\s*([\s\S]*?)(?=---LYRICS---|$)/i);
    const lyricsMatch = content.match(/---LYRICS---\s*([\s\S]*?)$/i);

    const title = titleMatch?.[1]?.trim() || 'Untitled Banger';
    const style = styleMatch?.[1]?.trim() || 'Unable to parse style';
    const lyrics = lyricsMatch?.[1]?.trim() || content;

    return { title, style, lyrics };
}

/**
 * Parse Grok's instrumental response into title, style and tags
 */
function parseInstrumentalResponse(content) {
    const titleMatch = content.match(/---TITLE---\s*([\s\S]*?)(?=---STYLE---|$)/i);
    const styleMatch = content.match(/---STYLE---\s*([\s\S]*?)(?=---TAGS---|$)/i);
    const tagsMatch = content.match(/---TAGS---\s*([\s\S]*?)$/i);

    const title = titleMatch?.[1]?.trim() || 'Untitled Instrumental';
    const style = styleMatch?.[1]?.trim() || 'Unable to parse style';
    const lyrics = tagsMatch?.[1]?.trim() || content; // reuse 'lyrics' key for compatibility

    return { title, style, lyrics };
}

export default { generateSong };
