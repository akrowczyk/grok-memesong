import { useState, useMemo } from 'react';
import { presets } from '../data/presets';
import { SearchIcon, ShuffleIcon, XIcon } from './Icons';

const CATEGORIES = [
    { id: 'all', label: 'All' },
    {
        id: 'viral',
        label: 'Viral / TikTok',
        pattern: /\b(tiktok|jersey[- ]club|brazilian[- ]phonk|uk[- ]garage|nightcore|storytime|pluggnb|slap[- ]house|indie[- ]funk|phonk|hyperpop|npc|earworm|viral)\b/i,
    },
    {
        id: 'hip-hop',
        label: 'Hip-Hop',
        pattern: /\b(rap|trap|drill|boom[- ]bap|crunk|hyphy|phonk|shady|nf-|old[- ]head|screw|kendall|mafioso|ye-gospel|hamilton)\b/i,
    },
    {
        id: 'rock',
        label: 'Rock & Metal',
        pattern: /\b(rock|metal|punk|emo|grunge|ska|shoegaze|industrial|psychedelic|ballad|arena|progressive)\b/i,
    },
    {
        id: 'electronic',
        label: 'Electronic',
        pattern: /\b(cyberpunk|hyperpop|synth|edm|house|dubstep|drum[- ]and[- ]bass|vaporwave|chillwave|witch[- ]house|lo-?fi|trip-?hop|electro|new[- ]wave)\b/i,
    },
    {
        id: 'pop-soul',
        label: 'Pop & Soul',
        pattern: /\b(pop|r&b|rnb|soul|funk|motown|disco|boy[- ]band|doo[- ]wop|gospel|jazz|blues|swing|lounge|rat[- ]pack|cabaret|k-?pop|j-?pop)\b/i,
    },
    {
        id: 'world',
        label: 'World & Folk',
        pattern: /\b(country|bluegrass|cajun|mariachi|cumbia|tango|salsa|bossa|reggae|reggaeton|dancehall|afrobeat|amapiano|highlife|irish|russian|swiss|french|greek|german|balkan|flamenco|klezmer|chinese|andean|hawaiian|bollywood|persian|turkish|fado|nordic|tropicalia|didgeridoo|hurdy|shanty|accordion|throat|medieval|bard|folk|indie folk)\b/i,
    },
    {
        id: 'cinematic',
        label: 'Cinematic & Comedy',
        pattern: /\b(broadway|succession|news|clown|linkedin|toxic|chef|weird[- ]al|lullaby|video[- ]game|wwe|true[- ]crime|courtroom|sports|npc|tiktok|anime|elevator|infomercial|weather|nature|spaghetti|barbershop|funeral|workout|noir|kids|drill[- ]sergeant|haunted|movie[- ]trailer|spoken[- ]word|christmas|soap[- ]opera|opera|classical|fantasy|church|gregorian|asmr|sad[- ]millennial)\b/i,
    },
];

function matchesCategory(preset, categoryId) {
    if (categoryId === 'all') return true;
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    if (!cat?.pattern) return true;
    const haystack = `${preset.id} ${preset.name} ${preset.stylePrompt}`;
    return cat.pattern.test(haystack);
}

export default function StylePresets({ selectedPreset, onSelect }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredPresets = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return presets.filter((preset) => {
            if (!matchesCategory(preset, activeCategory)) return false;
            if (!q) return true;
            return (
                preset.name.toLowerCase().includes(q) ||
                preset.stylePrompt.toLowerCase().includes(q) ||
                preset.tone.toLowerCase().includes(q)
            );
        });
    }, [searchQuery, activeCategory]);

    const handleRandom = () => {
        const pool = filteredPresets.length > 0 ? filteredPresets : presets;
        const candidates = pool.length > 1 ? pool.filter((p) => p.id !== selectedPreset?.id) : pool;
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        if (pick) onSelect(pick);
    };

    return (
        <div className="preset-browser">
            {selectedPreset && (
                <div className="selected-preset-banner">
                    <span className="selected-preset-emoji" aria-hidden="true">{selectedPreset.emoji}</span>
                    <div className="selected-preset-info">
                        <div className="selected-preset-name">{selectedPreset.name}</div>
                        <div className="selected-preset-tone">{selectedPreset.tone}</div>
                    </div>
                </div>
            )}

            <div className="preset-controls">
                <div className="preset-search-wrap">
                    <SearchIcon size={14} className="preset-search-icon" />
                    <input
                        type="search"
                        className="preset-search-input"
                        placeholder={`Search ${presets.length} styles...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search style presets"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="preset-search-clear"
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                        >
                            <XIcon size={13} />
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    className="btn btn-secondary preset-random-btn"
                    onClick={handleRandom}
                    title="Pick a random style"
                >
                    <ShuffleIcon size={14} />
                    <span>Surprise Me</span>
                </button>
            </div>

            <div className="preset-categories" role="tablist" aria-label="Style categories">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        role="tab"
                        aria-selected={activeCategory === cat.id}
                        className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="preset-grid-scroll">
                {filteredPresets.length > 0 ? (
                    <div className="preset-grid">
                        {filteredPresets.map((preset) => {
                            const isSelected = selectedPreset?.id === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    className={`preset-card ${isSelected ? 'selected' : ''}`}
                                    onClick={() => onSelect(preset)}
                                    aria-pressed={isSelected}
                                    title={preset.tone}
                                >
                                    <span className="preset-emoji" aria-hidden="true">{preset.emoji}</span>
                                    <span className="preset-name">{preset.name}</span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="preset-empty">
                        <p>No styles match "{searchQuery}"</p>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setSearchQuery('');
                                setActiveCategory('all');
                            }}
                        >
                            Reset filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
