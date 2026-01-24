import { useState } from 'react';

export default function SongOutput({ title, style, lyrics, isLoading, loadingMessage }) {
    const [titleCopied, setTitleCopied] = useState(false);
    const [styleCopied, setStyleCopied] = useState(false);
    const [lyricsCopied, setLyricsCopied] = useState(false);

    const copyToClipboard = async (text, setCopied) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p className="loading-text">{loadingMessage}</p>
            </div>
        );
    }

    if (!style && !lyrics) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🎵</div>
                <p>Upload a screenshot and select a style to generate your meme song</p>
            </div>
        );
    }

    return (
        <div className="output-section">
            {title && (
                <div className="output-block title-block">
                    <div className="output-header">
                        <span className="output-label">🎵 Title</span>
                        <button
                            className="btn btn-icon"
                            onClick={() => copyToClipboard(title, setTitleCopied)}
                            title="Copy to clipboard"
                        >
                            {titleCopied ? '✓' : '📋'}
                        </button>
                    </div>
                    <div className="output-content title-content">{title}</div>
                </div>
            )}

            <div className="output-block">
                <div className="output-header">
                    <span className="output-label">Style Prompt</span>
                    <button
                        className="btn btn-icon"
                        onClick={() => copyToClipboard(style, setStyleCopied)}
                        title="Copy to clipboard"
                    >
                        {styleCopied ? '✓' : '📋'}
                    </button>
                </div>
                <div className="output-content">{style}</div>
            </div>

            <div className="output-block">
                <div className="output-header">
                    <span className="output-label">Lyrics</span>
                    <button
                        className="btn btn-icon"
                        onClick={() => copyToClipboard(lyrics, setLyricsCopied)}
                        title="Copy to clipboard"
                    >
                        {lyricsCopied ? '✓' : '📋'}
                    </button>
                </div>
                <div className="output-content">{lyrics}</div>
            </div>
        </div>
    );
}
