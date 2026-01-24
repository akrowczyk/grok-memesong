import { presets } from '../data/presets';

export default function StylePresets({ selectedPreset, onSelect }) {
    return (
        <div className="preset-grid">
            {presets.map((preset) => (
                <div
                    key={preset.id}
                    className={`preset-card ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
                    onClick={() => onSelect(preset)}
                    title={preset.description}
                >
                    <div className="preset-emoji">{preset.emoji}</div>
                    <div className="preset-name">{preset.name}</div>
                </div>
            ))}
        </div>
    );
}
