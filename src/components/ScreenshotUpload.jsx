import { useState, useRef, useCallback, useEffect } from 'react';
import { UploadIcon, XIcon } from './Icons';

export default function ScreenshotUpload({ onImageSelect, currentImage }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFile = useCallback((file) => {
        if (!file || !file.type.startsWith('image/')) return;

        if (currentImage?.preview) {
            URL.revokeObjectURL(currentImage.preview);
        }
        const preview = URL.createObjectURL(file);
        onImageSelect({ file, preview });
    }, [onImageSelect, currentImage]);

    // Support pasting screenshots directly from clipboard (Cmd/Ctrl + V)
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        e.preventDefault();
                        handleFile(file);
                        break;
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [handleFile]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        if (currentImage?.preview) {
            URL.revokeObjectURL(currentImage.preview);
        }
        onImageSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div
            className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${currentImage ? 'has-image' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={currentImage ? 'Replace uploaded screenshot' : 'Upload or drop a screenshot'}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {currentImage ? (
                <div className="upload-preview-wrapper">
                    <img src={currentImage.preview} alt="Screenshot preview" />
                    <button
                        type="button"
                        className="upload-remove-btn"
                        onClick={handleRemove}
                        aria-label="Remove screenshot"
                        title="Remove screenshot"
                    >
                        <XIcon size={14} />
                        <span>Remove</span>
                    </button>
                </div>
            ) : (
                <>
                    <div className="upload-icon-badge">
                        <UploadIcon size={20} />
                    </div>
                    <p className="upload-text">
                        Drop a screenshot or <span>browse files</span>
                    </p>
                    <div className="upload-meta">
                        <span>PNG, JPG, WebP</span>
                        <span className="upload-dot">•</span>
                        <span className="kbd-hint">
                            <kbd>⌘V</kbd> / <kbd>Ctrl+V</kbd> to paste
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
