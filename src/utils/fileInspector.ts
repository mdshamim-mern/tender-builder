import { PDFDocument } from 'pdf-lib';
import { UploadedFile } from '../types';

/**
 * Calculates SHA-256 hash from ArrayBuffer using browser native Web Crypto API
 */
export async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Inspects a File object, verifies PDF format, extracts page count, computes hash
 */
export async function inspectFile(file: File): Promise<UploadedFile> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    throw new Error(`REJECTED_NON_PDF: "${file.name}" is not a PDF file. Only PDF files are accepted.`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const hash = await computeSha256(arrayBuffer);
  const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let pageCount = 0;
  let isCorrupt = false;
  let errorMessage: string | undefined;

  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    pageCount = pdfDoc.getPageCount();
    if (pageCount === 0) {
      isCorrupt = true;
      errorMessage = 'PDF has 0 pages or empty structure.';
    }
  } catch (err: any) {
    isCorrupt = true;
    errorMessage = `Damaged or password-protected PDF: ${err?.message || 'Failed to parse'}`;
  }

  return {
    id,
    file,
    name: file.name,
    size: file.size,
    pageCount,
    hash,
    isDuplicate: false,
    isCorrupt,
    errorMessage,
    buffer: arrayBuffer,
  };
}

/**
 * Format bytes into human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
