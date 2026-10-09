/**
 * Client-safe file & media storage handler for IdeaCheck AI.
 * Handles client-side validation, compression, Base64 conversion,
 * and metadata storage for prototype screenshots and demo uploads.
 */

export interface UploadedFileResult {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  caption: string;
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format (${file.type || 'unknown'}). Please upload a JPG, PNG, WebP, or SVG image.`
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeInMb}MB). Maximum allowed image size is 5MB.`
    };
  }

  return { valid: true };
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image as Data URL'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
}
