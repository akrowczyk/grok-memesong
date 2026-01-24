import Tesseract from 'tesseract.js';

/**
 * Extract text from an image using Tesseract.js (client-side OCR)
 * @param {string} imageDataUrl - Data URL of the image (e.g., data:image/png;base64,...)
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<{text: string, confidence: number}>}
 */
export async function extractTextFromImage(imageDataUrl, onProgress = null) {
    try {
        const result = await Tesseract.recognize(imageDataUrl, 'eng', {
            logger: (m) => {
                if (onProgress && m.status === 'recognizing text') {
                    onProgress(Math.round(m.progress * 100));
                }
            },
        });

        return {
            text: result.data.text.trim(),
            confidence: result.data.confidence,
        };
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Failed to extract text from image');
    }
}

/**
 * Clean up extracted text for better song generation
 * Removes common social media UI elements and noise
 */
export function cleanExtractedText(text) {
    // Remove common Twitter/X UI elements
    const cleanedLines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => {
            // Skip empty lines
            if (!line) return false;
            // Skip common UI elements
            if (/^(Reply|Repost|Like|Share|Bookmark|Views?)$/i.test(line)) return false;
            if (/^\d+(\.\d+)?[KMB]?$/i.test(line)) return false; // Numbers like "17K", "2M"
            if (/^@\w+\s*·\s*\d+[hmd]$/i.test(line)) return false; // "@user · 3h"
            return true;
        });

    return cleanedLines.join('\n');
}

export default { extractTextFromImage, cleanExtractedText };
