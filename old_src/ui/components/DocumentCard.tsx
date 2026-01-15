/**
 * Document Card Component
 * Displays a document with category, OCR status, and signature info
 */

import { Document } from '@/models';
import { DocumentCategory, DocumentSignature, SignatureStatus } from '@/types/documents';
import { formatFileSize, getCategoryDisplayName, getCategoryColor } from '@/utils/documents';
import { getDocumentSignatures, getSignatureStatusLabel, getSignatureStatusColor, isDocumentFullySigned } from '@/utils/signatures';
import './DocumentCard.css';

interface DocumentCardProps {
  document: Document;
  category: DocumentCategory;
  signatures?: DocumentSignature[];
  onView?: (document: Document) => void;
  onSign?: (document: Document) => void;
  onSendForSignature?: (document: Document) => void;
  onShare?: (documentId: string, personIds: string[]) => void;
}

export function DocumentCard({
  document,
  category,
  signatures = [],
  onView,
  onSign,
  onSendForSignature,
  onShare,
}: DocumentCardProps) {
  const docSignatures = getDocumentSignatures(document.id, signatures);
  const isSigned = isDocumentFullySigned(document.id, signatures);
  const hasPendingSignatures = docSignatures.some(sig => sig.status === SignatureStatus.PENDING);
  const hasOcrText = !!document.ocrText;

  const handleView = () => {
    if (onView) {
      onView(document);
    }
  };

  const handleSign = () => {
    if (onSign) {
      onSign(document);
    }
  };

  const handleSendForSignature = () => {
    if (onSendForSignature) {
      onSendForSignature(document);
    }
  };

  return (
    <div className={`document-card ${isSigned ? 'document-card--signed' : ''}`}>
      <div className="document-card__header">
        <div
          className="document-card__category-badge"
          style={{ backgroundColor: getCategoryColor(category) }}
        >
          {getCategoryDisplayName(category)}
        </div>
        <h3 className="document-card__title">{document.title}</h3>
      </div>

      {document.description && (
        <p className="document-card__description">{document.description}</p>
      )}

      <div className="document-card__meta">
        <div className="document-card__meta-item">
          <span className="document-card__meta-label">Type:</span>
          <span className="document-card__meta-value">{document.type.toUpperCase()}</span>
        </div>
        <div className="document-card__meta-item">
          <span className="document-card__meta-label">Size:</span>
          <span className="document-card__meta-value">{formatFileSize(document.fileSize)}</span>
        </div>
        {hasOcrText && (
          <div className="document-card__meta-item">
            <span className="document-card__ocr-badge">OCR</span>
          </div>
        )}
      </div>

      {docSignatures.length > 0 && (
        <div className="document-card__signatures">
          <div className="document-card__signatures-header">
            <span className="document-card__signatures-label">Signatures:</span>
            <span
              className="document-card__signatures-status"
              style={{ color: getSignatureStatusColor(docSignatures[0].status) }}
            >
              {getSignatureStatusLabel(docSignatures[0].status)}
            </span>
          </div>
          {docSignatures.map((sig) => (
            <div key={sig.id} className="document-card__signature-item">
              <span className="document-card__signature-name">{sig.signerName}</span>
              <span
                className="document-card__signature-status"
                style={{ color: getSignatureStatusColor(sig.status) }}
              >
                {getSignatureStatusLabel(sig.status)}
              </span>
            </div>
          ))}
        </div>
      )}

      {document.tags.length > 0 && (
        <div className="document-card__tags">
          {document.tags.map((tag) => (
            <span key={tag} className="document-card__tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {document.sharedWithIds && document.sharedWithIds.length > 0 && (
        <div className="document-card__shared">
          <span className="document-card__shared-label">Shared with:</span>
          <span className="document-card__shared-count">
            {document.sharedWithIds.length} {document.sharedWithIds.length === 1 ? 'person' : 'people'}
          </span>
        </div>
      )}

      <div className="document-card__footer">
        <button
          onClick={handleView}
          className="document-card__button document-card__button--primary"
        >
          View
        </button>
        {!isSigned && (
          <>
            {hasPendingSignatures ? (
              <button
                onClick={handleSign}
                className="document-card__button document-card__button--secondary"
              >
                Sign
              </button>
            ) : (
              <button
                onClick={handleSendForSignature}
                className="document-card__button document-card__button--secondary"
              >
                Send for Signature
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
