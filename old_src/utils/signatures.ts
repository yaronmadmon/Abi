/**
 * E-Signature Utilities
 * Sign, send for signature, and track status
 */

import { DocumentSignature, SignatureRequest, SignatureStatus } from '@/types/documents';
import { EntityId } from '@/models';

/**
 * Create a signature request
 */
export function createSignatureRequest(
  request: SignatureRequest,
  requestedById: EntityId
): DocumentSignature {
  const expiresAt = request.expiresInDays
    ? new Date(Date.now() + request.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  return {
    id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    documentId: request.documentId,
    signerId: request.signerId,
    signerName: request.signerName,
    signerEmail: request.signerEmail,
    status: SignatureStatus.PENDING,
    requestedAt: new Date().toISOString(),
    requestedById,
    expiresAt,
  };
}

/**
 * Sign a document
 */
export function signDocument(
  signature: DocumentSignature,
  signatureData: string // Base64 encoded signature image/data
): DocumentSignature {
  // Check if signature has expired
  if (signature.expiresAt && new Date(signature.expiresAt) < new Date()) {
    return {
      ...signature,
      status: SignatureStatus.EXPIRED,
    };
  }
  
  return {
    ...signature,
    status: SignatureStatus.SIGNED,
    signedAt: new Date().toISOString(),
    signatureData,
  };
}

/**
 * Decline a signature request
 */
export function declineSignature(
  signature: DocumentSignature,
  reason?: string
): DocumentSignature {
  return {
    ...signature,
    status: SignatureStatus.DECLINED,
    declinedReason: reason,
  };
}

/**
 * Check if signature request has expired
 */
export function isSignatureExpired(signature: DocumentSignature): boolean {
  if (!signature.expiresAt) {
    return false;
  }
  
  return new Date(signature.expiresAt) < new Date();
}

/**
 * Get signature status display name
 */
export function getSignatureStatusLabel(status: SignatureStatus): string {
  switch (status) {
    case SignatureStatus.UNSIGNED:
      return 'Unsigned';
    case SignatureStatus.PENDING:
      return 'Pending Signature';
    case SignatureStatus.SIGNED:
      return 'Signed';
    case SignatureStatus.DECLINED:
      return 'Declined';
    case SignatureStatus.EXPIRED:
      return 'Expired';
    default:
      return 'Unknown';
  }
}

/**
 * Get signature status color
 */
export function getSignatureStatusColor(status: SignatureStatus): string {
  switch (status) {
    case SignatureStatus.UNSIGNED:
      return '#6B7280'; // Gray
    case SignatureStatus.PENDING:
      return '#F59E0B'; // Amber
    case SignatureStatus.SIGNED:
      return '#10B981'; // Green
    case SignatureStatus.DECLINED:
      return '#EF4444'; // Red
    case SignatureStatus.EXPIRED:
      return '#DC2626'; // Dark red
    default:
      return '#6B7280';
  }
}

/**
 * Get all signatures for a document
 */
export function getDocumentSignatures(
  documentId: string,
  signatures: DocumentSignature[]
): DocumentSignature[] {
  return signatures.filter(sig => sig.documentId === documentId);
}

/**
 * Check if document is fully signed (all required signatures completed)
 */
export function isDocumentFullySigned(
  documentId: string,
  signatures: DocumentSignature[]
): boolean {
  const docSignatures = getDocumentSignatures(documentId, signatures);
  
  if (docSignatures.length === 0) {
    return false;
  }
  
  // All signatures must be signed (not pending, declined, or expired)
  return docSignatures.every(sig => sig.status === SignatureStatus.SIGNED);
}

/**
 * Get pending signatures for a document
 */
export function getPendingSignatures(
  documentId: string,
  signatures: DocumentSignature[]
): DocumentSignature[] {
  return getDocumentSignatures(documentId, signatures)
    .filter(sig => sig.status === SignatureStatus.PENDING);
}
