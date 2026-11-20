import { useState } from 'react';
import { CopyIcon, CheckIcon, ExternalLinkIcon, MusicIcon } from './Icons';

function renderFormattedLyrics(text) {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        // Standalone metatag line, e.g. [Verse 1] or [Chorus - Explosive]
        if (/^\[[^\]]+\]$/.test(trimmed)) {
            return (
                <div key={lineIdx} className="suno-section-line">
                    <span className="suno-tag">{trimmed}</span>
                </div>
            );
        }

        // Inline metatags within a line
        if (/\[[^\]]+\]/.test(line)) {
            const parts = line.split(/(\[[^\]]+\])/g);
            return (
                <div key={lineIdx} className="lyric-line">
                    {parts.map((part, partIdx) =>
                        /^\[[^\]]+\]$/.test(part) ? (
                            <span key={partIdx} className="suno-tag suno-tag-inline">{part}</span>
                        ) : (
                            <span key={partIdx}>{part}</span>
                        )
                    )}
                </div>
            );
        }

        if (trimmed === '') {
            return <div key={lineIdx} className="lyric-spacer" />;
        }

        return (
            <div key={lineIdx} className="lyric-line">
                {line}
            </div>
        );
    });
}

export default function SongOutput({ title, style, lyrics, isLoading, loadingMessage, instrumentalMode }) {
    const [copiedKey, setCopiedKey] = useState(null);

    const copyToClipboard = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => {
                setCopiedKey((prev) => (prev === key ? null : prev));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCopyAll = () => {
        const sections = [];
        if (title) sections.push(`Title:\n${title}`);
        if (style) sections.push(`Style:\n${style}`);
        if (lyrics) sections.push(`${instrumentalMode ? 'Composition Tags' : 'Lyrics'}:\n${lyrics}`);
        copyToClipboard(sections.join('\n\n'), 'all');
    };

    if (isLoading) {
        return (
            <div className="loading">
                <div className="equalizer" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                </div>
                <p className="loading-text">{loadingMessage}</p>
            </div>
        );
    }

    if (!style && !lyrics) {
        return (
            <div className="empty-state">
                <div className="empty-state-badge">
                    <MusicIcon size={24} />
                </div>
                <h3>Ready to compose</h3>
                <p>
                    Drop or paste a screenshot, pick a style preset, and hit Generate to create Suno-ready{' '}
                    {instrumentalMode ? 'instrumental composition tags' : 'lyrics and style prompts'}.
                </p>
            </div>
        );
    }

    return (
        <div className="output-section">
            {title && (
                <div className="output-block title-block">
                    <div className="output-header">
                        <span className="output-label">Track Title</span>
                        <button
                            type="button"
                            className={`btn-copy ${copiedKey === 'title' ? 'copied' : ''}`}
                            onClick={() => copyToClipboard(title, 'title')}
                        >
                            {copiedKey === 'title' ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                            <span>{copiedKey === 'title' ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>
                    <div className="title-content">{title}</div>
                </div>
            )}

            <div className="output-block">
                <div className="output-header">
                    <span className="output-label">Style Prompt</span>
                    <button
                        type="button"
                        className={`btn-copy ${copiedKey === 'style' ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(style, 'style')}
                    >
                        {copiedKey === 'style' ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                        <span>{copiedKey === 'style' ? 'Copied' : 'Copy'}</span>
                    </button>
                </div>
                <div className="output-content style-prompt-content">{style}</div>
            </div>

            <div className="output-block">
                <div className="output-header">
                    <span className="output-label">{instrumentalMode ? 'Composition Tags' : 'Lyrics'}</span>
                    <button
                        type="button"
                        className={`btn-copy ${copiedKey === 'lyrics' ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(lyrics, 'lyrics')}
                    >
                        {copiedKey === 'lyrics' ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                        <span>{copiedKey === 'lyrics' ? 'Copied' : 'Copy'}</span>
                    </button>
                </div>
                <div className="output-content lyrics-formatted">
                    {renderFormattedLyrics(lyrics)}
                </div>
            </div>

            <div className="output-footer">
                <button
                    type="button"
                    className={`btn btn-secondary output-footer-btn ${copiedKey === 'all' ? 'copied' : ''}`}
                    onClick={handleCopyAll}
                >
                    {copiedKey === 'all' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    <span>{copiedKey === 'all' ? 'Copied Everything' : 'Copy All'}</span>
                </button>
                <a
                    href="https://suno.com/create"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary output-footer-btn"
                >
                    <span>Open Suno</span>
                    <ExternalLinkIcon size={14} />
                </a>
            </div>
        </div>
    );
}
