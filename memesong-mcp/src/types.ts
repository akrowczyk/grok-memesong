/**
 * TypeScript types for the MemeSong MCP server
 */

export interface Preset {
    id: string;
    name: string;
    emoji: string;
    stylePrompt: string;
    tone: string;
}

export type HumorMode = 'serious' | 'satirical' | 'hilarious';
export type OutputMode = 'vocals' | 'instrumental';

export interface GenerateSongInput {
    content: string;
    preset: string;
    mode: HumorMode;
    output: OutputMode;
    context?: string;
}

export interface SongOutput {
    title: string;
    style: string;
    lyrics: string;
}

/** Category mapping for preset filtering */
export const PRESET_CATEGORIES: Record<string, string[]> = {
    'hip-hop': [
        '90s-boom-bap', 'hype-trap', 'gangster-rap', 'dirty-south-crunk',
        'mafioso-rap', 'houston-screw', 'chicago-drill-og', 'detroit-street-rap',
        'slim-shady', 'nf-intensity', 'bay-area-hyphy', 'uk-drill', 'phonk-drift',
        'old-head-lecture', 'ye-gospel-rap', 'hamilton-rap-musical',
    ],
    'rock': [
        'dad-rock-lecture', 'punk-rock-riot', 'emo-anthem', 'grunge-flannel',
        'surf-rock', 'viking-metal', 'death-metal-takedown', 'industrial-grind',
        'power-ballad', 'progressive-epic', 'pop-punk-revival', 'anthemic-arena-rock',
        'shoegaze-dream', 'crunk-rock',
    ],
    'pop': [
        'genz-hyperpop', 'valley-girl-pop', '90s-boy-band', 'euro-pop-anthem',
        'tiktok-bait', 'npc-streaming', 'y2k-pop', 'lofi-bedroom-pop',
    ],
    'electronic': [
        'sarcastic-cyberpunk', '80s-synthwave', 'edm-festival-drop', 'vaporwave-mall',
        'drum-and-bass-rave', 'christian-edm', 'dubstep-assault', 'deep-house-groove',
        'electro-swing', 'witch-house', 'chillwave',
    ],
    'r-and-b': [
        'petty-rnb', 'neo-soul-confessional', 'trap-soul',
    ],
    'jazz-blues-soul': [
        'smooth-jazz-roast', 'bossa-nova', 'motown-soul', 'blues-confession',
        'rat-pack-lounge', 'doo-wop-corner', 'lofi-study-beats', 'jazz-fusion',
    ],
    'country-folk': [
        'country-roast', 'bluegrass-banjo-duel', 'cajun-zydeco', 'country-trap',
        'hawaiian-slack-key', 'outlaw-country', '70s-soft-rock',
    ],
    'latin': [
        'mariachi-tragedy', 'flamenco-fury', 'tango-argentino', 'reggaeton-perreo',
        'cumbia-roast', 'salsa-fuego', 'tropicalia',
    ],
    'world': [
        'irish-pub-lament', 'russian-tragedy', 'swiss-yodel-chaos', 'french-chanson',
        'greek-taverna', 'german-beer-hall', 'balkan-brass', 'bollywood-drama',
        'kpop-scandal', 'jpop-kawaii', 'chinese-opera', 'persian-classical',
        'andean-panpipe', 'fado-saudade', 'klezmer-kvetch', 'afrobeat-sermon',
        'amapiano', 'dancehall-bashment', 'middle-eastern-hurdy-gurdy',
        'didgeridoo-outback', 'throat-singing-doom', 'turkish-psychedelic',
        'west-african-highlife', 'reggae-dub', 'nordic-folk',
    ],
    'classical-sacred': [
        'classical-piano-nocturne', 'gregorian-chant', 'church-hymn',
        'broadway-drama', 'barbershop-quartet', 'gospel-revival', 'opera-aria',
    ],
    'novelty-concept': [
        'clown-college', 'wwe-entrance', 'video-game-boss', 'sports-commentary',
        'infomercial-jingle', 'weather-channel', 'nature-documentary',
        'true-crime-podcast', 'courtroom-drama', 'noir-detective', 'elevator-muzak',
        'drill-sergeant', 'haunted-music-box', 'spaghetti-western', 'funeral-march',
        'movie-trailer-epic', 'soap-opera-theme', 'kids-show-theme',
        'breaking-news', 'linkedin-guru', 'asmr-whisper-roast', 'spoken-word-poetry',
        'christmas-carol', '80s-workout-video', 'lullaby-roast', 'toxic-positivity',
        'chefs-kiss', 'succession-dynasty', 'weird-al-parody', 'sea-shanty-ratio',
        'accordion-tragedy', 'dark-cabaret', 'anime-villain-monologue',
    ],
    'reggae-caribbean': [
        'reggae-chill', 'reggae-dub', 'dancehall-bashment',
    ],
    'funk-disco': [
        'disco-inferno', 'pure-funk',
    ],
    'trip-hop-downtempo': [
        'trip-hop-noir', 'new-wave-synth',
    ],
};

/**
 * Get the category for a preset ID
 */
export function getCategoryForPreset(presetId: string): string {
    for (const [category, ids] of Object.entries(PRESET_CATEGORIES)) {
        if (ids.includes(presetId)) {
            return category;
        }
    }
    return 'uncategorized';
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
    return Object.keys(PRESET_CATEGORIES);
}
