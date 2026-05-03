import Tesseract from 'tesseract.js';

/**
 * Extract text from an image using Tesseract.js OCR
 * @param {string} imageUrl - URL or data URL of the image
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{text: string}>}
 */
export async function extractTextFromImage(imageUrl, onProgress = () => {}) {
    const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (info) => {
            if (info.status === 'recognizing text' && info.progress != null) {
                onProgress(Math.round(info.progress * 100));
            }
        },
    });

    return { text: result.data.text };
}

/**
 * Clean up OCR-extracted text by removing artifacts and normalizing whitespace
 * @param {string} text - Raw OCR text
 * @returns {string} Cleaned text
 */
export function cleanExtractedText(text) {
    if (!text) return '';

    return text
        // Remove common OCR artifacts
        .replace(/[|}{~`]/g, '')
        // Normalize whitespace
        .replace(/[ \t]+/g, ' ')
        // Remove lines that are just whitespace or single characters
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 1)
        .join('\n')
        .trim();
}

export default { extractTextFromImage, cleanExtractedText };
