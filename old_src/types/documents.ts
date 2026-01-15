/**
 * Document Management Types
 */

import { Document } from '@/models';

export enum DocumentCategory {
  MEDICAL = 'medical',
  SCHOOL = 'school',
  HOUSE = 'house',
  FINANCIAL = 'financial',
  OTHER = 'other',
}

export enum SignatureStatus {
  UNSIGNED = 'unsigned',
  PENDING = 'pending', // Sent for signature
  SIGNED = 'signed',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileUrl: string;
  createdAt: string; // ISO 8601
  createdById: string;
  changeNote?: string;
  fileSize: number;
}

export interface DocumentSignature {
  id: string;
  documentId: string;
  signerId: string;
  signerName: string;
  signerEmail?: string;
  status: SignatureStatus;
  signedAt?: string; // ISO 8601
  signatureData?: string; // Base64 encoded signature image/data
  requestedAt: string; // ISO 8601
  requestedById: string;
  expiresAt?: string; // ISO 8601
  declinedReason?: string;
}

export interface DocumentWithMetadata extends Document {
  category: DocumentCategory;
  ocrText?: string; // Full text extracted via OCR
  versions: DocumentVersion[];
  signatures: DocumentSignature[];
  searchableText: string; // Combined text for search (title + description + OCR)
}

export interface DocumentUploadData {
  file: File;
  title?: string; // Auto-generated if not provided
  description?: string;
  category?: DocumentCategory; // Auto-classified if not provided
  tags?: string[];
}

export interface SignatureRequest {
  documentId: string;
  signerId: string;
  signerName: string;
  signerEmail?: string;
  message?: string;
  expiresInDays?: number; // Default 30
}
