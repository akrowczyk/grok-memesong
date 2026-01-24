import { useState, useRef } from 'react';

export default function ScreenshotUpload({ onImageSelect, currentImage }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            // Extract base64 without the data URI prefix
            const base64 = dataUrl.split(',')[1];
            onImageSelect({
                preview: dataUrl,
                base64: base64,
                name: file.name,
            });
        };
        reader.readAsDataURL(file);
    };

    const clearImage = (e) => {
        e.stopPropagation();
        onImageSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div
            className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${currentImage ? 'has-image' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
                        onClick={clearImage}
                        style={{ marginTop: '1rem' }}
                    >
                        ✕ Clear
                    </button>
                </>
            ) : (
                <>
                    <div className="upload-icon">📸</div>
                    <p className="upload-text">
                        <span>Drop a screenshot</span> or click to upload
                    </p>
                    <p className="upload-text" style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                        Works best with X/Twitter post screenshots
                    </p>
                </>
            )}
        </div>
    );
}
