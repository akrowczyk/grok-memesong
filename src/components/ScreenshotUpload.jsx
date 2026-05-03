import { useState, useRef, useCallback } from 'react';

export default function ScreenshotUpload({ onImageSelect, currentImage }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFile = useCallback((file) => {
        if (!file || !file.type.startsWith('image/')) return;

        const preview = URL.createObjectURL(file);
        onImageSelect({ file, preview });
    }, [onImageSelect]);

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
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {currentImage ? (
                <>
                    <img src={currentImage.preview} alt="Screenshot preview" />
                    <button
                        className="btn btn-secondary"
                        onClick={handleRemove}
                        style={{ marginTop: '0.5rem' }}
                    >
                        ✕ Remove
                    </button>
                </>
            ) : (
                <>
                    <div className="upload-icon">📸</div>
                    <p className="upload-text">
                        Drag & drop a screenshot here, or <span>click to browse</span>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        PNG, JPG, or WebP
                    </p>
                </>
            )}
        </div>
    );
}
