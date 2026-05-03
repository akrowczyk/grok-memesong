/**
 * MemeSong MCP Server
 * 
 * Exposes 150 song style presets, Suno formatting rules, and song generation
 * capabilities as MCP tools, resources, and prompts for Claude Desktop.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Preset } from './types.js';
import { getCategoryForPreset, getCategories, PRESET_CATEGORIES } from './types.js';
import { sunoHints } from './data/sunoHints.js';

// Load presets from JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const presetsPath = join(__dirname, 'data', 'presets.json');
const presets: Preset[] = JSON.parse(readFileSync(presetsPath, 'utf-8'));

// Load UI HTML for MCP Apps — inject preset data so the iframe is self-contained
let uiHtml: string;
try {
    const uiPath = join(__dirname, 'ui', 'index.html');
    const rawHtml = readFileSync(uiPath, 'utf-8');
    // Inject presets as a global so the UI can render them without fetching
    const presetInjection = `<script>window.__MEMESONG_PRESETS__ = ${JSON.stringify(presets)};</script>`;
    uiHtml = rawHtml.replace('</head>', `${presetInjection}\n</head>`);
} catch {
    uiHtml = '<html><body><p>UI not available</p></body></html>';
}

// ─────────────────────────────────────────────
// Server Setup
// ─────────────────────────────────────────────

export const server = new McpServer({
    name: 'memesong',
    version: '1.0.0',
});

// ─────────────────────────────────────────────
// RESOURCES
// ─────────────────────────────────────────────

/**
 * Full preset catalog — Claude can read this to understand all available styles
 */
server.resource(
    'preset-catalog',
    'memesong://presets',
    {
        description: 'Complete catalog of all 150 MemeSong style presets with names, emojis, style prompts, and tones',
        mimeType: 'application/json',
    },
    async (uri) => {
        const summary = presets.map((p) => ({
            id: p.id,
            name: p.name,
            emoji: p.emoji,
            category: getCategoryForPreset(p.id),
        }));
        return {
            contents: [{
                uri: uri.href,
                mimeType: 'application/json',
                text: JSON.stringify(summary, null, 2),
            }],
        };
    }
);

/**
 * Suno formatting guide — Claude reads this to know how to format output
 */
server.resource(
    'suno-guide',
    'memesong://suno-formatting-guide',
    {
        description: 'Suno.ai song formatting guide with structural hints, vocal directions, and best practices',
        mimeType: 'text/plain',
    },
    async (uri) => ({
        contents: [{
            uri: uri.href,
            mimeType: 'text/plain',
            text: sunoHints,
        }],
    })
);

// ─────────────────────────────────────────────
// TOOLS
// ─────────────────────────────────────────────

/**
 * list_presets — Browse available style presets with optional filtering
 */
server.tool(
    'list_presets',
    'Browse all available MemeSong style presets. Returns names, emojis, and categories. Use the category filter to narrow results.',
    {
        category: z.string().optional().describe(
            `Filter by category. Available: ${getCategories().join(', ')}`
        ),
        search: z.string().optional().describe(
            'Search presets by name (case-insensitive partial match)'
        ),
    },
    async ({ category, search }) => {
        let filtered = presets;

        // Filter by category
        if (category) {
            const categoryIds = PRESET_CATEGORIES[category];
            if (categoryIds) {
                filtered = filtered.filter((p) => categoryIds.includes(p.id));
            }
        }

        // Filter by search
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(q) ||
                p.stylePrompt.toLowerCase().includes(q) ||
                p.tone.toLowerCase().includes(q)
            );
        }

        const listing = filtered.map((p) =>
            `${p.emoji} **${p.name}** (id: \`${p.id}\`) — ${getCategoryForPreset(p.id)}`
        ).join('\n');

        return {
            content: [{
                type: 'text' as const,
                text: `## 🎵 MemeSong Style Presets (${filtered.length} of ${presets.length})\n\n${listing}\n\n---\n_Use \`get_preset\` with any preset ID to see full details, or \`generate_song\` to create a song._`,
            }],
        };
    }
);

/**
 * get_preset — Get full details for a specific preset
 */
server.tool(
    'get_preset',
    'Get full details for a specific MemeSong style preset, including the Suno style prompt and tone description.',
    {
        preset: z.string().describe('Preset ID or name (case-insensitive partial match)'),
    },
    async ({ preset }) => {
        const q = preset.toLowerCase();
        const found = presets.find((p) =>
            p.id === q ||
            p.name.toLowerCase() === q ||
            p.name.toLowerCase().includes(q)
        );

        if (!found) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `❌ Preset "${preset}" not found. Use \`list_presets\` to browse available styles.`,
                }],
                isError: true,
            };
        }

        return {
            content: [{
                type: 'text' as const,
                text: [
                    `## ${found.emoji} ${found.name}`,
                    `**Category:** ${getCategoryForPreset(found.id)}`,
                    `**ID:** \`${found.id}\``,
                    '',
                    `**Suno Style Prompt:**`,
                    found.stylePrompt,
                    '',
                    `**Tone:**`,
                    found.tone,
                ].join('\n'),
            }],
        };
    }
);

/**
 * generate_song — The main tool. Builds a complete songwriting context
 * that Claude uses to generate a Suno-ready song.
 * 
 * This tool doesn't call an external API — it returns structured instructions
 * that Claude follows to write the song itself.
 */
server.tool(
    'generate_song',
    'Generate a Suno-ready song from any content. Returns songwriting instructions with style preset details and Suno formatting rules. After calling this tool, write the song following the returned instructions exactly.',
    {
        content: z.string().describe('The text, topic, or content to write a song about'),
        preset: z.string().describe('Style preset ID or name'),
        mode: z.enum(['serious', 'satirical', 'hilarious']).default('satirical').describe(
            'Song mode: "serious" = genuine heartfelt song, "satirical" = clever witty roast, "hilarious" = over-the-top absurd comedy'
        ),
        output: z.enum(['vocals', 'instrumental']).default('vocals').describe(
            'Output type: "vocals" = lyrics with structure, "instrumental" = Suno metatags for instrumental composition'
        ),
        context: z.string().optional().describe('Optional additional context to steer the song direction'),
    },
    async ({ content, preset, mode, output, context }) => {
        // Look up preset
        const q = preset.toLowerCase();
        const found = presets.find((p) =>
            p.id === q ||
            p.name.toLowerCase() === q ||
            p.name.toLowerCase().includes(q)
        );

        if (!found) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `❌ Preset "${preset}" not found. Use \`list_presets\` to browse available styles.`,
                }],
                isError: true,
            };
        }

        // Build mode-specific persona
        const modePrompts: Record<string, string> = {
            satirical: `You are a satirical songwriting genius who creates viral, funny songs. You specialize in playfully roasting and mocking the subject with clever wordplay and catchy hooks.`,
            hilarious: `You are an UNHINGED comedy songwriting wizard who creates OUTRAGEOUSLY HILARIOUS songs that make people cry-laugh. Your songs are ABSURDLY FUNNY, completely over-the-top. Think "Weird Al meets a meme-obsessed comedian on Red Bull." Every line should be a punchline. Go ABSOLUTELY WILD!`,
            serious: `You are a world-class professional songwriter who writes emotionally compelling, genuine songs. You craft lyrics with poetic depth, authentic feeling, and memorable melodies — no satire, no irony, no comedy. Think of the best singer-songwriters: heartfelt storytelling, vivid imagery, universal themes. Your songs should feel like they belong on a real album.`,
        };

        const contextSection = context
            ? `\n\n--- ADDITIONAL CONTEXT/DIRECTION ---\n${context}\n--- END CONTEXT ---\n\nUse this additional context to guide the tone, focus, or direction.`
            : '';

        // Build the complete generation instructions
        if (output === 'instrumental') {
            const instructions = [
                `# 🎼 INSTRUMENTAL GENERATION INSTRUCTIONS`,
                '',
                `## Your Role`,
                `You are an expert music producer creating a detailed instrumental composition roadmap for Suno.ai.`,
                '',
                `## Suno Formatting Guide`,
                sunoHints,
                '',
                `## Style Preset: ${found.emoji} ${found.name}`,
                `**Base Style:** ${found.stylePrompt}`,
                `**Mood/Energy:** ${found.tone}`,
                '',
                `## Content to Inspire the Composition`,
                `--- CONTENT ---`,
                content,
                `--- END CONTENT ---`,
                contextSection,
                '',
                `## Output Format`,
                `Return your response in EXACTLY this format:`,
                '```',
                `---TITLE---`,
                `[A catchy, evocative instrumental title]`,
                `---STYLE---`,
                `[Style prompt for Suno — MUST include "instrumental" and "no vocals"]`,
                `---TAGS---`,
                `[Complete Suno metatag composition using [brackets] for structure]`,
                '```',
                '',
                `## Requirements`,
                `1. Capture the emotional essence of the content`,
                `2. Use instruments matching "${found.name}" style`,
                `3. Include structural tags: [Intro], [Build], [Drop], [Breakdown], [Climax], [Outro]`,
                `4. Make it a dynamic JOURNEY, not a flat loop`,
                `5. Aim for 2-3 minutes of structured composition`,
                `6. NO VOCALS, NO LYRICS — instrumental only`,
                '',
                `GO! Make it a cinematic masterpiece.`,
            ].join('\n');

            return { content: [{ type: 'text' as const, text: instructions }] };
        }

        // Vocals mode
        const songPromptType = mode === 'serious'
            ? 'genuine, heartfelt'
            : mode === 'hilarious'
                ? 'outrageously hilarious'
                : 'satirical and witty';

        const contentLabel = mode === 'serious' ? 'CONTENT' : 'POST CONTENT';

        const instructions = [
            `# 🎵 SONG GENERATION INSTRUCTIONS`,
            '',
            `## Your Role`,
            modePrompts[mode],
            '',
            `## Suno Formatting Guide`,
            sunoHints,
            '',
            `## Style Preset: ${found.emoji} ${found.name}`,
            `**Base Style:** ${found.stylePrompt}`,
            `**Tone:** ${found.tone}`,
            '',
            `## Content to Write About`,
            `--- ${contentLabel} ---`,
            content,
            `--- END ${contentLabel} ---`,
            contextSection,
            '',
            `## Output Format`,
            `Return your response in EXACTLY this format:`,
            '```',
            `---TITLE---`,
            `[A catchy, ${mode === 'serious' ? 'evocative' : 'meme-worthy'} song title — short and punchy]`,
            `---STYLE---`,
            `[Style prompt for Suno — one paragraph: BPM, instruments, vocals, energy]`,
            `---LYRICS---`,
            `[Complete song lyrics with Suno formatting hints in [brackets] and vocal directions on separate lines in (parentheses)]`,
            '```',
            '',
            `## Critical Rules`,
            `1. Create a ${songPromptType} song that captures the ${mode === 'serious' ? 'emotional core' : 'essence/absurdity'} of the content`,
            `2. Has a ${mode === 'serious' ? 'memorable, singable' : 'catchy, quotable'} chorus`,
            `3. ${mode === 'serious' ? 'Uses vivid imagery, metaphor, and authentic storytelling' : 'Uses clever wordplay and references to the content'}`,
            `4. Matches the "${found.name}" energy perfectly`,
            `5. Formatted for Suno.ai with proper [Intro], [Verse], [Chorus], [Bridge], [Outro]`,
            `6. Maximum 2-3 minutes of lyrics`,
            `7. ALL lyrics MUST be in ENGLISH (even if the style is foreign — the music sounds foreign, the words are English)`,
            `8. NEVER put (vocal hints) at the END of a lyric line — always on their OWN LINE before the lyrics`,
            `9. Spell out dates and acronyms for proper pronunciation (e.g., "AI" → "A-I", dates → "January tenth")`,
            '',
            mode === 'serious'
                ? `GO! Write a song that moves people.`
                : `GO! Make it ${mode === 'hilarious' ? 'absolutely unhinged and hilarious' : 'funny and viral-worthy'}.`,
        ].join('\n');

        return {
            content: [{ type: 'text' as const, text: instructions }],
        };
    }
);

// ─────────────────────────────────────────────
// PROMPTS
// ─────────────────────────────────────────────

/**
 * create-song — Pre-built prompt template for quick song creation
 */
server.prompt(
    'create-song',
    'Create a Suno-ready song from any content using MemeSong style presets',
    {
        content: z.string().describe('Text, topic, or content to write a song about'),
        style: z.string().optional().describe('Style preset name (e.g., "Trap Soul", "80s Synthwave"). Leave empty to let Claude suggest one.'),
        mode: z.enum(['serious', 'satirical', 'hilarious']).optional().describe('Song mode — defaults to satirical'),
    },
    ({ content, style, mode }) => {
        const modeStr = mode || 'satirical';
        const styleStr = style
            ? `Use the "${style}" style preset.`
            : `Suggest the best style preset for this content from the available MemeSong presets.`;

        return {
            messages: [{
                role: 'user' as const,
                content: {
                    type: 'text' as const,
                    text: [
                        `I want to create a ${modeStr} song using MemeSong.`,
                        '',
                        `**Content:**`,
                        content,
                        '',
                        `**Style:** ${styleStr}`,
                        `**Mode:** ${modeStr}`,
                        `**Output:** vocals`,
                        '',
                        `Please use the \`generate_song\` tool to get the full songwriting context, then write the complete song following those instructions exactly. Format the final output clearly with the title, Suno style prompt, and lyrics separated.`,
                    ].join('\n'),
                },
            }],
        };
    }
);

/**
 * browse-styles — Quick prompt to explore available presets
 */
server.prompt(
    'browse-styles',
    'Browse all available MemeSong style presets by category',
    {
        category: z.string().optional().describe('Optional category filter (e.g., "hip-hop", "electronic", "world")'),
    },
    ({ category }) => ({
        messages: [{
            role: 'user' as const,
            content: {
                type: 'text' as const,
                text: category
                    ? `Show me all MemeSong style presets in the "${category}" category. Use the \`list_presets\` tool with category filter "${category}".`
                    : `Show me all available MemeSong style presets organized by category. Use the \`list_presets\` tool to get the full list, then organize them visually by category with emojis.`,
            },
        }],
    })
);

// ─────────────────────────────────────────────
// MCP APPS UI RESOURCE
// ─────────────────────────────────────────────

/**
 * Interactive UI panel — rendered inside Claude Desktop via MCP Apps Extension
 */
server.resource(
    'memesong-ui',
    'ui://memesong/studio',
    {
        description: 'MemeSong interactive studio — browse presets, configure modes, and view formatted song output',
        mimeType: 'text/html;profile=mcp-app',
    },
    async (uri) => ({
        contents: [{
            uri: uri.href,
            mimeType: 'text/html',
            text: uiHtml,
        }],
    })
);
