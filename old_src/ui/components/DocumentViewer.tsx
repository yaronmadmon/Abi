/**
 * Document Viewer Component
 * Displays document with version history and signature status
 */

import { Document } from '@/models';
import { DocumentCategory, DocumentVersion, DocumentSignature } from '@/types/documents';
import { formatFileSize, getCategoryDisplayName, getCategoryColor } from '@/utils/documents';
import { getSignatureStatusLabel, getSignatureStatusColor } from '@/utils/signatures';
import './DocumentViewer.css';

interface DocumentViewerProps {
  document: Document;
  category: DocumentCategory;
  versions?: DocumentVersion[];
  signatures?: DocumentSignature[];
  ocrText?: string;
  relatedPersonName?: string;
  relatedRoomName?: string;
  onClose: () => void;
  onDownload?: (document: Document) => void;
  onViewVersion?: (version: DocumentVersion) => void;
}

export function DocumentViewer({
  document,
  category,
  versions = [],
  signatures = [],
  ocrText,
  relatedPersonName,
  relatedRoomName,
  onClose,
  onDownload,
  onViewVersion,
}: DocumentViewerProps) {
  const docVersions = versions.filter(v => v.documentId === document.id);
  const docSignatures = signatures.filter(sig => sig.documentId === document.id);

  return (
    <div className="document-viewer">
      <div className="document-viewer__overlay" onClick={onClose} />
      <div className="document-viewer__content">
        <div className="document-viewer__header">
          <div className="document-viewer__header-left">
            <div
              className="document-viewer__category-badge"
              style={{ backgroundColor: getCategoryColor(category) }}
            >
              {getCategoryDisplayName(category)}
            </div>
            <h2 className="document-viewer__title">{document.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="document-viewer__close"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="document-viewer__body">
          <div className="document-viewer__main">
            <div className="document-viewer__preview">
              <div className="document-viewer__preview-placeholder">
                <div className="document-viewer__preview-icon">📄</div>
                <p className="document-viewer__preview-text">
                  {document.fileName}
                </p>
                <p className="document-viewer__preview-hint">
                  Document preview would appear here
                </p>
                {onDownload && (
                  <button
                    onClick={() => onDownload(document)}
                    className="document-viewer__download-button"
                  >
                    Download Document
                  </button>
                )}
              </div>
            </div>

            {ocrText && (
              <div className="document-viewer__ocr">
                <h3 className="document-viewer__section-title">Extracted Text</h3>
                <div className="document-viewer__ocr-text">
                  {ocrText}
                </div>
              </div>
            )}
          </div>

          <div className="document-viewer__sidebar">
            <div className="document-viewer__section">
              <h3 className="document-viewer__section-title">Details</h3>
              <div className="document-viewer__details">
                <div className="document-viewer__detail-item">
                  <span className="document-viewer__detail-label">Type:</span>
                  <span className="document-viewer__detail-value">{document.type.toUpperCase()}</span>
                </div>
                <div className="document-viewer__detail-item">
                  <span className="document-viewer__detail-label">Size:</span>
                  <span className="document-viewer__detail-value">{formatFileSize(document.fileSize)}</span>
                </div>
                <div className="document-viewer__detail-item">
                  <span className="document-viewer__detail-label">Uploaded:</span>
                  <span className="document-viewer__detail-value">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {document.description && (
                  <div className="document-viewer__detail-item">
                    <span className="document-viewer__detail-label">Description:</span>
                    <span className="document-viewer__detail-value">{document.description}</span>
                  </div>
                )}
                {relatedPersonName && (
                  <div className="document-viewer__detail-item">
                    <span className="document-viewer__detail-label">Related to:</span>
                    <span className="document-viewer__detail-value">{relatedPersonName}</span>
                  </div>
                )}
                {relatedRoomName && (
                  <div className="document-viewer__detail-item">
                    <span className="document-viewer__detail-label">Stored in:</span>
                    <span className="document-viewer__detail-value">{relatedRoomName}</span>
                  </div>
                )}
                {document.sharedWithIds && document.sharedWithIds.length > 0 && (
                  <div className="document-viewer__detail-item">
                    <span className="document-viewer__detail-label">Shared with:</span>
                    <span className="document-viewer__detail-value">
                      {document.sharedWithIds.length} {document.sharedWithIds.length === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {document.tags.length > 0 && (
              <div className="document-viewer__section">
                <h3 className="document-viewer__section-title">Tags</h3>
                <div className="document-viewer__tags">
                  {document.tags.map((tag) => (
                    <span key={tag} className="document-viewer__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {docVersions.length > 0 && (
              <div className="document-viewer__section">
                <h3 className="document-viewer__section-title">Version History</h3>
                <div className="document-viewer__versions">
                  {docVersions.map((version) => (
                    <div key={version.id} className="document-viewer__version-item">
                      <div className="document-viewer__version-header">
                        <span className="document-viewer__version-number">
                          Version {version.version}
                        </span>
                        <span className="document-viewer__version-date">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {version.changeNote && (
                        <p className="document-viewer__version-note">{version.changeNote}</p>
                      )}
                      {onViewVersion && (
                        <button
                          onClick={() => onViewVersion(version)}
                          className="document-viewer__version-button"
                        >
                          View
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {docSignatures.length > 0 && (
              <div className="document-viewer__section">
                <h3 className="document-viewer__section-title">Signatures</h3>
                <div className="document-viewer__signatures">
                  {docSignatures.map((sig) => (
                    <div key={sig.id} className="document-viewer__signature-item">
                      <div className="document-viewer__signature-header">
                        <span className="document-viewer__signature-name">{sig.signerName}</span>
                        <span
                          className="document-viewer__signature-status"
                          style={{ color: getSignatureStatusColor(sig.status) }}
                        >
                          {getSignatureStatusLabel(sig.status)}
                        </span>
                      </div>
                      {sig.signedAt && (
                        <div className="document-viewer__signature-date">
                          Signed: {new Date(sig.signedAt).toLocaleString()}
                        </div>
                      )}
                      {sig.expiresAt && sig.status === 'pending' && (
                        <div className="document-viewer__signature-expires">
                          Expires: {new Date(sig.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
