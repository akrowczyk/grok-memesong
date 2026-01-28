import { sunoHints } from '../data/sunoHints';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

/**
 * Generate a meme song from extracted text using Grok text model
 * @param {string} apiKey - xAI API key
 * @param {string} extractedText - Text extracted from screenshot via OCR or user input
 * @param {object} preset - Selected style preset
 * @param {string} additionalContext - Optional additional context to steer lyrics
 * @param {string} model - Grok model to use (default: grok-4-1-fast-non-reasoning)
 * @returns {Promise<{title: string, style: string, lyrics: string}>}
 */
export async function generateSong(apiKey, extractedText, preset, additionalContext = '', model = 'grok-4-1-fast-non-reasoning') {
    const systemPrompt = `You are a satirical songwriting genius who creates viral, funny songs about trending topics and social media posts. You specialize in creating songs that playfully roast and mock the subject with clever wordplay and catchy hooks.

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
- This ensures proper pronunciation when the song is generated`;

    // Build context section if additional context provided
    const contextSection = additionalContext
        ? `\n\n--- ADDITIONAL CONTEXT/DIRECTION ---\n${additionalContext}\n--- END CONTEXT ---\n\nUse this additional context to guide the tone, focus, or direction of the lyrics.`
        : '';

    const userPrompt = `Here is text extracted from a social media post/screenshot. Create a satirical song about it:

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
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Parse the response
    return parseGrokResponse(content);
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

export default { generateSong };
