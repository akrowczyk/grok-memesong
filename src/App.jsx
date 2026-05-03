import { useState, useEffect } from 'react';
import ScreenshotUpload from './components/ScreenshotUpload';
import StylePresets from './components/StylePresets';
import SongOutput from './components/SongOutput';
import { generateSong } from './services/grokService';
import { extractTextFromImage, cleanExtractedText } from './services/ocrService';
import { presets } from './data/presets';

const LOADING_MESSAGES = [
    '🔍 Reading the screenshot...',
    '🎵 Analyzing the post...',
    '🎤 Writing fire bars...',
    '🎹 Composing the hook...',
    '🔥 Adding maximum pettiness...',
    '✨ Making it viral-worthy...',
    '🎭 Perfecting the sass...',
];

function App() {
    // Try env variable first, then localStorage, then empty
    const [apiKey, setApiKey] = useState(() => {
        return import.meta.env.VITE_XAI_API_KEY || localStorage.getItem('xai-api-key') || '';
    });
    const [grokModel, setGrokModel] = useState('grok-4-1-fast-non-reasoning');
    const [humorMode, setHumorMode] = useState('satirical'); // 'satirical' or 'hilarious'
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
            setError('Please enter your xAI API key');
            return;
        }
        if (!image && !contextText.trim()) {
            setError('Please upload a screenshot or enter some text');
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

            // If we have an image, extract text from it
            if (image) {
                setLoadingMessage('🔍 Reading text from screenshot...');
                const ocrResult = await extractTextFromImage(image.preview, (progress) => {
                    setOcrProgress(progress);
                });

                const cleanedText = cleanExtractedText(ocrResult.text);
                setExtractedText(cleanedText);

                if (!cleanedText || cleanedText.length < 10) {
                    // If OCR failed but we have context text, use that instead
                    if (!additionalContext) {
                        throw new Error('Could not extract enough text from the image. Try a clearer screenshot or add text below.');
                    }
                } else {
                    contentForSong = cleanedText;
                }
            }

            // If no image content, use context text as main content
            if (!contentForSong && additionalContext) {
                contentForSong = additionalContext;
                additionalContext = ''; // Don't duplicate it
            }

            // Generate song using Grok text model
            setLoadingMessage(instrumentalMode ? '🎼 Composing your score...' : '🎵 Writing your banger...');
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

    const canGenerate = apiKey && (image || contextText.trim()) && selectedPreset && !isLoading;

    return (
        <div className="app">
            <header className="app-header">
                <h1>🎵 Grok MemeSong</h1>
                <p>Turn X posts into satirical bangers with Grok AI → Suno.ai</p>
            </header>

            <div className="api-key-section">
                <input
                    type="password"
                    className="api-key-input"
                    placeholder="Enter your xAI API key..."
                    value={apiKey}
                    onChange={handleApiKeyChange}
                />
            </div>

            <div className="model-toggle-section">
                <div className="toggle-label">Grok Model:</div>
                <div className="toggle-switch-container">
                    <button
                        className={`toggle-option ${grokModel === 'grok-4-1-fast-non-reasoning' ? 'active' : ''}`}
                        onClick={() => setGrokModel('grok-4-1-fast-non-reasoning')}
                        title="Fast generation, great for memes"
                    >
                        ⚡ Fast
                    </button>
                    <button
                        className={`toggle-option ${grokModel === 'grok-4-1-fast-reasoning' ? 'active' : ''}`}
                        onClick={() => setGrokModel('grok-4-1-fast-reasoning')}
                        title="Uses chain of thought for smarter lyrics"
                    >
                        🧠 Reasoning
                    </button>
                </div>
            </div>

            <div className="model-toggle-section">
                <div className="toggle-label">Song Mode:</div>
                <div className="toggle-switch-container">
                    <button
                        className={`toggle-option ${humorMode === 'serious' ? 'active' : ''}`}
                        onClick={() => setHumorMode('serious')}
                        title="Genuine, heartfelt songwriting — no humor or satire"
                    >
                        🎵 Serious
                    </button>
                    <button
                        className={`toggle-option ${humorMode === 'satirical' ? 'active' : ''}`}
                        onClick={() => setHumorMode('satirical')}
                        title="Sarcastic, clever, and witty (current style)"
                    >
                        😏 Satirical
                    </button>
                    <button
                        className={`toggle-option ${humorMode === 'hilarious' ? 'active' : ''}`}
                        onClick={() => setHumorMode('hilarious')}
                        title="Over-the-top, absurd, and super funny"
                    >
                        🤣 Super Hilarious
                    </button>
                </div>
            </div>

            <div className="model-toggle-section">
                <div className="toggle-label">Output Mode:</div>
                <div className="toggle-switch-container">
                    <button
                        className={`toggle-option ${!instrumentalMode ? 'active' : ''}`}
                        onClick={() => setInstrumentalMode(false)}
                        title="Generate lyrics for a vocal track"
                    >
                        🎤 Vocals
                    </button>
                    <button
                        className={`toggle-option ${instrumentalMode ? 'active' : ''}`}
                        onClick={() => setInstrumentalMode(true)}
                        title="Generate Suno metatags for an instrumental score"
                    >
                        🎼 Instrumental
                    </button>
                </div>
            </div>

            <div className="app-content">
                <div className="left-panel">
                    <div className="card">
                        <div className="card-title">📸 Screenshot</div>
                        <ScreenshotUpload onImageSelect={setImage} currentImage={image} />
                    </div>

                    <div className="card" style={{ marginTop: '1.5rem' }}>
                        <div className="card-title">✍️ Context / Alternative Text</div>
                        <textarea
                            className="context-textarea"
                            placeholder={image ? "Add extra context to steer the lyrics (optional)..." : "Or paste/type the post content here instead of uploading..."}
                            value={contextText}
                            onChange={(e) => setContextText(e.target.value)}
                            rows={4}
                        />
                        <p className="context-hint">
                            {image
                                ? "💡 This text will augment the screenshot to add context or steer the song direction"
                                : "💡 Use this as an alternative to uploading a screenshot"
                            }
                        </p>
                    </div>

                    <div className="card" style={{ marginTop: '1.5rem' }}>
                        <div className="card-title">🎨 Style Preset</div>
                        <StylePresets selectedPreset={selectedPreset} onSelect={setSelectedPreset} />
                    </div>

                    <div className="generate-section" style={{ marginTop: '1.5rem' }}>
                        {error && (
                            <p style={{ color: 'var(--accent-tertiary)', fontSize: '0.875rem' }}>⚠️ {error}</p>
                        )}
                        <button
                            className="btn btn-primary generate-btn"
                            onClick={handleGenerate}
                            disabled={!canGenerate}
                        >
                            {isLoading ? '⏳ Generating...' : instrumentalMode ? '🎼 Generate Instrumental' : '🎵 Generate Song'}
                        </button>
                        {isLoading && ocrProgress > 0 && ocrProgress < 100 && (
                            <div className="ocr-progress">
                                <div className="ocr-progress-bar" style={{ width: `${ocrProgress}%` }}></div>
                                <span className="ocr-progress-text">Reading text: {ocrProgress}%</span>
                            </div>
                        )}
                    </div>

                    {extractedText && (
                        <div className="card" style={{ marginTop: '1.5rem' }}>
                            <div className="card-title">📝 Extracted Text</div>
                            <div className="extracted-text">{extractedText}</div>
                        </div>
                    )}
                </div>

                <div className="right-panel">
                    <div className="card" style={{ height: '100%' }}>
                        <div className="card-title">🎤 Output</div>
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
            </div>
        </div>
    );
}

export default App;
