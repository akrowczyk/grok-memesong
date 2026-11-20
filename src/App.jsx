import { useState, useEffect, useRef } from 'react';
import ScreenshotUpload from './components/ScreenshotUpload';
import StylePresets from './components/StylePresets';
import SongOutput from './components/SongOutput';
import {
    MusicIcon,
    KeyIcon,
    ZapIcon,
    BrainIcon,
    MicIcon,
    SlidersIcon,
    ImageIcon,
    FileTextIcon,
    SparklesIcon,
    AlertIcon,
    XIcon,
} from './components/Icons';
import { generateSong } from './services/grokService';
import { extractTextFromImage, cleanExtractedText } from './services/ocrService';
import { presets } from './data/presets';

const LOADING_MESSAGES = [
    'Reading the screenshot...',
    'Analyzing the post...',
    'Writing fire bars...',
    'Composing the hook...',
    'Dialing in the tone...',
    'Structuring Suno metatags...',
    'Polishing the track...',
];

function App() {
    // Try env variable first, then localStorage, then empty
    const [apiKey, setApiKey] = useState(() => {
        return import.meta.env.VITE_XAI_API_KEY || localStorage.getItem('xai-api-key') || '';
    });
    const [grokModel, setGrokModel] = useState('grok-4-1-fast-non-reasoning');
    const [humorMode, setHumorMode] = useState('satirical'); // 'serious', 'satirical', or 'hilarious'
    const [instrumentalMode, setInstrumentalMode] = useState(false);
    const [image, setImage] = useState(null);
    const [contextText, setContextText] = useState('');
    const [selectedPreset, setSelectedPreset] = useState(presets[0]);
    const [songOutput, setSongOutput] = useState({ title: '', style: '', lyrics: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [ocrProgress, setOcrProgress] = useState(0);
    const [extractedText, setExtractedText] = useState('');
    const [error, setError] = useState('');

    const apiDialogRef = useRef(null);

    // Fallback light-dismiss for browsers without <dialog closedby="any"> (e.g. Safari)
    useEffect(() => {
        const dialog = apiDialogRef.current;
        if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

        const isOutside = (e) => {
            const r = dialog.getBoundingClientRect();
            return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        };

        let pressedOutside = false;
        const onPointerDown = (e) => {
            pressedOutside = isOutside(e);
        };
        const onPointerUp = (e) => {
            if (pressedOutside && isOutside(e)) {
                dialog.close();
            }
            pressedOutside = false;
        };

        dialog.addEventListener('pointerdown', onPointerDown);
        dialog.addEventListener('pointerup', onPointerUp);
        return () => {
            dialog.removeEventListener('pointerdown', onPointerDown);
            dialog.removeEventListener('pointerup', onPointerUp);
        };
    }, []);

    const openApiDialog = () => {
        apiDialogRef.current?.showModal();
    };

    // Save API key to localStorage
    const handleApiKeyChange = (e) => {
        const key = e.target.value;
        setApiKey(key);
        localStorage.setItem('xai-api-key', key);
    };

    // Cycle loading messages
    useEffect(() => {
        if (!isLoading) return;

        let index = 0;
        setLoadingMessage(LOADING_MESSAGES[0]);

        const interval = setInterval(() => {
            index = (index + 1) % LOADING_MESSAGES.length;
            setLoadingMessage(LOADING_MESSAGES[index]);
        }, 2000);

        return () => clearInterval(interval);
    }, [isLoading]);

    const handleGenerate = async () => {
        if (!apiKey) {
            setError('Please add your xAI API key to generate a song.');
            openApiDialog();
            return;
        }
        if (!image && !contextText.trim()) {
            setError('Please upload/paste a screenshot or enter some text.');
            return;
        }

        setError('');
        setIsLoading(true);
        setOcrProgress(0);
        setExtractedText('');
        setSongOutput({ title: '', style: '', lyrics: '' });

        try {
            let contentForSong = '';
            let additionalContext = contextText.trim();

            if (image) {
                setLoadingMessage('Reading text from screenshot...');
                const ocrResult = await extractTextFromImage(image.preview, (progress) => {
                    setOcrProgress(progress);
                });

                const cleanedText = cleanExtractedText(ocrResult.text);
                setExtractedText(cleanedText);

                if (!cleanedText || cleanedText.length < 10) {
                    if (!additionalContext) {
                        throw new Error('Could not extract enough text from the image. Try a clearer screenshot or add text below.');
                    }
                } else {
                    contentForSong = cleanedText;
                }
            }

            if (!contentForSong && additionalContext) {
                contentForSong = additionalContext;
                additionalContext = '';
            }

            setLoadingMessage(instrumentalMode ? 'Composing your instrumental score...' : 'Writing your track...');
            const result = await generateSong(apiKey, contentForSong, selectedPreset, additionalContext, grokModel, humorMode, instrumentalMode);
            setSongOutput(result);
        } catch (err) {
            setError(err.message || 'Failed to generate song');
            console.error('Generation error:', err);
        } finally {
            setIsLoading(false);
            setOcrProgress(0);
        }
    };

    const hasApiKey = Boolean(apiKey.trim());
    const canGenerate = hasApiKey && (image || contextText.trim()) && selectedPreset && !isLoading;

    return (
        <div className="app">
            <header className="app-header">
                <div className="brand-block">
                    <div className="brand-mark" aria-hidden="true">
                        <MusicIcon size={18} />
                    </div>
                    <div>
                        <div className="brand-title-row">
                            <h1>Grok MemeSong</h1>
                            <span className="brand-badge">xAI → Suno</span>
                        </div>
                        <p className="brand-subtitle">Turn posts &amp; screenshots into Suno-ready tracks</p>
                    </div>
                </div>

                <button
                    type="button"
                    className={`api-status-btn ${hasApiKey ? 'connected' : 'missing'}`}
                    onClick={openApiDialog}
                >
                    <span className="status-dot" aria-hidden="true" />
                    <KeyIcon size={14} />
                    <span>{hasApiKey ? 'API Key Ready' : 'Set API Key'}</span>
                </button>
            </header>

            <dialog
                ref={apiDialogRef}
                className="api-dialog"
                closedby="any"
                aria-labelledby="api-key-dialog-title"
            >
                <div className="api-dialog-header">
                    <div className="api-dialog-title-wrap">
                        <KeyIcon size={16} className="api-dialog-icon" />
                        <h2 id="api-key-dialog-title">xAI API Key</h2>
                    </div>
                    <form method="dialog">
                        <button type="submit" className="dialog-close-btn" aria-label="Close dialog">
                            <XIcon size={16} />
                        </button>
                    </form>
                </div>

                <p className="api-dialog-desc">
                    Stored locally in your browser (or loaded from <code>VITE_XAI_API_KEY</code>) and sent directly to xAI when generating tracks.
                </p>

                <form method="dialog" className="api-dialog-form">
                    <input
                        type="password"
                        className="api-key-input"
                        placeholder="xai-..."
                        value={apiKey}
                        onChange={handleApiKeyChange}
                        autoFocus
                        aria-label="xAI API key"
                    />
                    <div className="api-dialog-actions">
                        <button type="submit" className="btn btn-primary">
                            Done
                        </button>
                    </div>
                </form>
            </dialog>

            <section className="control-bar" aria-label="Generation settings">
                <div className="control-group">
                    <span className="control-label">Model</span>
                    <div className="segmented-control">
                        <button
                            type="button"
                            className={`segment-btn ${grokModel === 'grok-4-1-fast-non-reasoning' ? 'active' : ''}`}
                            onClick={() => setGrokModel('grok-4-1-fast-non-reasoning')}
                            title="Fast generation, great for memes"
                        >
                            <ZapIcon size={13} />
                            <span>Fast</span>
                        </button>
                        <button
                            type="button"
                            className={`segment-btn ${grokModel === 'grok-4-1-fast-reasoning' ? 'active' : ''}`}
                            onClick={() => setGrokModel('grok-4-1-fast-reasoning')}
                            title="Uses chain of thought for smarter lyrics"
                        >
                            <BrainIcon size={13} />
                            <span>Reasoning</span>
                        </button>
                    </div>
                </div>

                <div className="control-divider" aria-hidden="true" />

                <div className="control-group">
                    <span className="control-label">Tone</span>
                    <div className="segmented-control">
                        <button
                            type="button"
                            className={`segment-btn ${humorMode === 'serious' ? 'active' : ''}`}
                            onClick={() => setHumorMode('serious')}
                            title="Genuine, heartfelt songwriting — no humor or satire"
                        >
                            <span>Serious</span>
                        </button>
                        <button
                            type="button"
                            className={`segment-btn ${humorMode === 'satirical' ? 'active' : ''}`}
                            onClick={() => setHumorMode('satirical')}
                            title="Sarcastic, clever, and witty"
                        >
                            <span>Satirical</span>
                        </button>
                        <button
                            type="button"
                            className={`segment-btn ${humorMode === 'hilarious' ? 'active' : ''}`}
                            onClick={() => setHumorMode('hilarious')}
                            title="Over-the-top, absurd, and super funny"
                        >
                            <span>Hilarious</span>
                        </button>
                    </div>
                </div>

                <div className="control-divider" aria-hidden="true" />

                <div className="control-group">
                    <span className="control-label">Output</span>
                    <div className="segmented-control">
                        <button
                            type="button"
                            className={`segment-btn ${!instrumentalMode ? 'active' : ''}`}
                            onClick={() => setInstrumentalMode(false)}
                            title="Generate lyrics for a vocal track"
                        >
                            <MicIcon size={13} />
                            <span>Vocals</span>
                        </button>
                        <button
                            type="button"
                            className={`segment-btn ${instrumentalMode ? 'active' : ''}`}
                            onClick={() => setInstrumentalMode(true)}
                            title="Generate Suno metatags for an instrumental score"
                        >
                            <SlidersIcon size={13} />
                            <span>Instrumental</span>
                        </button>
                    </div>
                </div>
            </section>

            <main className="app-content">
                <div className="left-panel">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">
                                <ImageIcon size={14} />
                                <span>Source Content</span>
                            </div>
                            <span className="card-step">Step 1</span>
                        </div>

                        <ScreenshotUpload onImageSelect={setImage} currentImage={image} />

                        <div className="context-field">
                            <label className="field-label" htmlFor="context-input">
                                <FileTextIcon size={13} />
                                <span>{image ? 'Extra Direction (Optional)' : 'Or Paste / Type Text'}</span>
                            </label>
                            <textarea
                                id="context-input"
                                className="context-textarea"
                                placeholder={
                                    image
                                        ? 'Add extra context to steer the angle, jokes, or perspective...'
                                        : 'Paste a post, tweet, rant, or idea here instead of uploading a screenshot...'
                                }
                                value={contextText}
                                onChange={(e) => setContextText(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">
                                <MusicIcon size={14} />
                                <span>Style Preset</span>
                            </div>
                            <span className="card-step">{presets.length} styles</span>
                        </div>
                        <StylePresets selectedPreset={selectedPreset} onSelect={setSelectedPreset} />
                    </div>

                    <div className="generate-section">
                        {error && (
                            <div className="error-banner" role="alert">
                                <AlertIcon size={15} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="button"
                            className={`btn btn-primary generate-btn ${canGenerate ? 'ready' : ''}`}
                            onClick={handleGenerate}
                            disabled={!canGenerate}
                        >
                            <SparklesIcon size={16} />
                            <span>
                                {isLoading
                                    ? 'Generating...'
                                    : instrumentalMode
                                        ? 'Generate Instrumental'
                                        : 'Generate Song'}
                            </span>
                        </button>

                        {isLoading && ocrProgress > 0 && ocrProgress < 100 && (
                            <div className="ocr-progress">
                                <div className="ocr-progress-bar" style={{ width: `${ocrProgress}%` }} />
                                <span className="ocr-progress-text">Reading text: {ocrProgress}%</span>
                            </div>
                        )}
                    </div>

                    {extractedText && (
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">
                                    <FileTextIcon size={14} />
                                    <span>Extracted OCR Text</span>
                                </div>
                            </div>
                            <div className="extracted-text">{extractedText}</div>
                        </div>
                    )}
                </div>

                <div className="right-panel">
                    <div className="card output-card">
                        <div className="card-header">
                            <div className="card-title">
                                <SparklesIcon size={14} />
                                <span>Studio Output</span>
                            </div>
                            {selectedPreset && (
                                <span className="output-preset-pill">
                                    <span>{selectedPreset.emoji}</span>
                                    <span>{selectedPreset.name}</span>
                                </span>
                            )}
                        </div>
                        <SongOutput
                            title={songOutput.title}
                            style={songOutput.style}
                            lyrics={songOutput.lyrics}
                            isLoading={isLoading}
                            loadingMessage={loadingMessage}
                            instrumentalMode={instrumentalMode}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
