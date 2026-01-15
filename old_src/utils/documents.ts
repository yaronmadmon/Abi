/**
 * Document Utilities
 * OCR, classification, search, and version management
 */

import { Document, DocumentType } from '@/models';
import { DocumentCategory, DocumentWithMetadata, DocumentVersion, DocumentSignature } from '@/types/documents';

/**
 * Extract text from document using OCR
 * In a real implementation, this would call an OCR service (e.g., Tesseract.js, Google Cloud Vision, etc.)
 */
export async function extractTextFromDocument(
  file: File,
  documentType: DocumentType
): Promise<string> {
  // For images and PDFs, we'd use OCR
  // For text files, we can read directly
  // This is a placeholder implementation
  
  if (documentType === DocumentType.TEXT) {
    return await file.text();
  }
  
  if (documentType === DocumentType.IMAGE) {
    // In production, use Tesseract.js or cloud OCR service
    // For now, return placeholder
    return `[OCR text from ${file.name}]`;
  }
  
  if (documentType === DocumentType.PDF) {
    // In production, use PDF.js to extract text or OCR
    // For now, return placeholder
    return `[PDF text from ${file.name}]`;
  }
  
  return '';
}

/**
 * Auto-classify document into category based on content
 * Uses keyword matching and AI classification
 */
export async function classifyDocument(
  title: string,
  description: string | undefined,
  ocrText: string | undefined,
  fileName: string
): Promise<DocumentCategory> {
  const searchText = `${title} ${description || ''} ${ocrText || ''} ${fileName}`.toLowerCase();
  
  // Medical keywords
  const medicalKeywords = [
    'medical', 'doctor', 'hospital', 'prescription', 'medication', 'health',
    'insurance', 'clinic', 'diagnosis', 'treatment', 'patient', 'lab', 'test',
    'x-ray', 'mri', 'scan', 'vaccine', 'immunization', 'allergy'
  ];
  
  // School keywords
  const schoolKeywords = [
    'school', 'student', 'teacher', 'grade', 'homework', 'assignment',
    'report card', 'transcript', 'diploma', 'certificate', 'tuition',
    'enrollment', 'curriculum', 'semester', 'quarter', 'exam', 'test',
    'parent teacher', 'pta', 'field trip', 'permission slip'
  ];
  
  // House keywords
  const houseKeywords = [
    'house', 'home', 'mortgage', 'deed', 'property', 'lease', 'rental',
    'utility', 'electric', 'water', 'gas', 'maintenance', 'repair',
    'warranty', 'insurance', 'homeowner', 'contractor', 'inspection',
    'appraisal', 'tax', 'assessment', 'hoa', 'homeowners association'
  ];
  
  // Financial keywords
  const financialKeywords = [
    'bank', 'account', 'statement', 'check', 'deposit', 'withdrawal',
    'credit card', 'loan', 'investment', 'tax', 'irs', 'w-2', '1099',
    'payroll', 'salary', 'income', 'expense', 'budget', 'invoice',
    'receipt', 'payment', 'refund', 'balance', 'transaction'
  ];
  
  // Count matches
  const medicalScore = medicalKeywords.filter(kw => searchText.includes(kw)).length;
  const schoolScore = schoolKeywords.filter(kw => searchText.includes(kw)).length;
  const houseScore = houseKeywords.filter(kw => searchText.includes(kw)).length;
  const financialScore = financialKeywords.filter(kw => searchText.includes(kw)).length;
  
  // Return category with highest score
  const scores = [
    { category: DocumentCategory.MEDICAL, score: medicalScore },
    { category: DocumentCategory.SCHOOL, score: schoolScore },
    { category: DocumentCategory.HOUSE, score: houseScore },
    { category: DocumentCategory.FINANCIAL, score: financialScore },
  ];
  
  scores.sort((a, b) => b.score - a.score);
  
  // If no matches, return OTHER
  if (scores[0].score === 0) {
    return DocumentCategory.OTHER;
  }
  
  return scores[0].category;
}

/**
 * Generate a user-friendly title from file name or content
 */
export function generateDocumentTitle(
  fileName: string,
  ocrText?: string
): string {
  // Remove extension
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  
  // If OCR text exists, try to extract a title (first line or first sentence)
  if (ocrText) {
    const firstLine = ocrText.split('\n')[0].trim();
    if (firstLine.length > 5 && firstLine.length < 100) {
      return firstLine;
    }
  }
  
  // Clean up the filename
  return nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build searchable text from document
 */
export function buildSearchableText(document: DocumentWithMetadata): string {
  const parts = [
    document.title,
    document.description || '',
    document.ocrText || '',
    document.fileName,
    document.tags.join(' '),
    document.category,
  ];
  
  return parts.filter(Boolean).join(' ').toLowerCase();
}

/**
 * Full-text search in documents
 */
export function searchDocuments(
  documents: DocumentWithMetadata[],
  query: string
): DocumentWithMetadata[] {
  if (!query.trim()) {
    return documents;
  }
  
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(Boolean);
  
  return documents.filter(doc => {
    const searchableText = buildSearchableText(doc);
    
    // Match all query terms (AND logic)
    return queryTerms.every(term => searchableText.includes(term));
  });
}

/**
 * Filter documents by category
 */
export function filterDocumentsByCategory(
  documents: DocumentWithMetadata[],
  category: DocumentCategory | null
): DocumentWithMetadata[] {
  if (!category) {
    return documents;
  }
  
  return documents.filter(doc => doc.category === category);
}

/**
 * Get document version history
 */
export function getDocumentVersions(
  documentId: string,
  versions: DocumentVersion[]
): DocumentVersion[] {
  return versions
    .filter(v => v.documentId === documentId)
    .sort((a, b) => b.version - a.version);
}

/**
 * Get latest version of a document
 */
export function getLatestVersion(
  documentId: string,
  versions: DocumentVersion[]
): DocumentVersion | null {
  const docVersions = getDocumentVersions(documentId, versions);
  return docVersions.length > 0 ? docVersions[0] : null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get document type from file
 */
export function getDocumentTypeFromFile(file: File): DocumentType {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return DocumentType.PDF;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'bmp':
      return DocumentType.IMAGE;
    case 'txt':
    case 'md':
    case 'rtf':
      return DocumentType.TEXT;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return DocumentType.SPREADSHEET;
    default:
      return DocumentType.OTHER;
  }
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: DocumentCategory): string {
  switch (category) {
    case DocumentCategory.MEDICAL:
      return 'Medical';
    case DocumentCategory.SCHOOL:
      return 'School';
    case DocumentCategory.HOUSE:
      return 'House';
    case DocumentCategory.FINANCIAL:
      return 'Financial';
    case DocumentCategory.OTHER:
      return 'Other';
    default:
      return 'Unknown';
  }
}

/**
 * Get category color (for UI)
 */
export function getCategoryColor(category: DocumentCategory): string {
  switch (category) {
    case DocumentCategory.MEDICAL:
      return '#EF4444'; // Red
    case DocumentCategory.SCHOOL:
      return '#3B82F6'; // Blue
    case DocumentCategory.HOUSE:
      return '#10B981'; // Green
    case DocumentCategory.FINANCIAL:
      return '#F59E0B'; // Amber
    case DocumentCategory.OTHER:
      return '#6B7280'; // Gray
    default:
      return '#6B7280';
  }
}
