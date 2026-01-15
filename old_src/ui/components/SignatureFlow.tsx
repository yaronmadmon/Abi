/**
 * Signature Flow Component
 * Handles signing documents and sending for signature
 */

import React, { useState, useRef } from 'react';
import { Document } from '@/models';
import { SignatureRequest, DocumentSignature, SignatureStatus } from '@/types/documents';
import { createSignatureRequest, signDocument, declineSignature } from '@/utils/signatures';
import './SignatureFlow.css';

interface SignatureFlowProps {
  document: Document;
  mode: 'sign' | 'send';
  existingSignature?: DocumentSignature;
  onSign: (signature: DocumentSignature, signatureData: string) => void;
  onSend: (request: SignatureRequest) => void;
  onDecline?: (signature: DocumentSignature, reason?: string) => void;
  onCancel: () => void;
  availableSigners?: Array<{ id: string; name: string; email?: string }>;
}

export function SignatureFlow({
  document,
  mode,
  existingSignature,
  onSign,
  onSend,
  onDecline,
  onCancel,
  availableSigners = [],
}: SignatureFlowProps) {
  const [signatureData, setSignatureData] = useState<string>('');
  const [selectedSignerId, setSelectedSignerId] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [message, setMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize canvas context
  React.useEffect(() => {
    if (mode === 'sign' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [mode]);

  // Signature drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Convert canvas to base64
    const dataUrl = canvas.toDataURL();
    setSignatureData(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData('');
  };

  const handleSign = () => {
    if (!signatureData) {
      alert('Please provide a signature');
      return;
    }

    if (existingSignature) {
      const signed = signDocument(existingSignature, signatureData);
      onSign(signed, signatureData);
    }
  };

  const handleSend = () => {
    if (!selectedSignerId && !signerName) {
      alert('Please select or enter a signer');
      return;
    }

    const request: SignatureRequest = {
      documentId: document.id,
      signerId: selectedSignerId || 'new-signer',
      signerName: signerName || availableSigners.find(s => s.id === selectedSignerId)?.name || '',
      signerEmail: signerEmail || availableSigners.find(s => s.id === selectedSignerId)?.email,
      message: message || undefined,
      expiresInDays: 30,
    };

    onSend(request);
  };

  const handleDecline = () => {
    if (existingSignature && onDecline) {
      onDecline(existingSignature, declineReason || undefined);
    }
  };

  if (mode === 'sign') {
    return (
      <div className="signature-flow">
        <div className="signature-flow__header">
          <h3 className="signature-flow__title">Sign Document</h3>
          <button onClick={onCancel} className="signature-flow__close">×</button>
        </div>

        <div className="signature-flow__body">
          <p className="signature-flow__document-name">{document.title}</p>

          <div className="signature-flow__signature-area">
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              className="signature-flow__canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <div className="signature-flow__canvas-hint">
              Sign above using your mouse or touchpad
            </div>
          </div>

          <div className="signature-flow__actions">
            <button
              onClick={clearSignature}
              className="signature-flow__button signature-flow__button--secondary"
            >
              Clear
            </button>
            <div className="signature-flow__actions-right">
              <button
                onClick={onCancel}
                className="signature-flow__button signature-flow__button--cancel"
              >
                Cancel
              </button>
              {onDecline && (
                <button
                  onClick={handleDecline}
                  className="signature-flow__button signature-flow__button--decline"
                >
                  Decline
                </button>
              )}
              <button
                onClick={handleSign}
                className="signature-flow__button signature-flow__button--primary"
                disabled={!signatureData}
              >
                Sign Document
              </button>
            </div>
          </div>

          {onDecline && (
            <div className="signature-flow__decline-section">
              <label htmlFor="decline-reason" className="signature-flow__label">
                Reason for declining (optional)
              </label>
              <textarea
                id="decline-reason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="signature-flow__textarea"
                placeholder="Enter reason..."
                rows={2}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Send for signature mode
  return (
    <div className="signature-flow">
      <div className="signature-flow__header">
        <h3 className="signature-flow__title">Send for Signature</h3>
        <button onClick={onCancel} className="signature-flow__close">×</button>
      </div>

      <div className="signature-flow__body">
        <p className="signature-flow__document-name">{document.title}</p>

        <div className="signature-flow__form">
          <div className="signature-flow__field">
            <label htmlFor="signer-select" className="signature-flow__label">
              Select Signer
            </label>
            {availableSigners.length > 0 ? (
              <select
                id="signer-select"
                value={selectedSignerId}
                onChange={(e) => {
                  setSelectedSignerId(e.target.value);
                  const signer = availableSigners.find(s => s.id === e.target.value);
                  if (signer) {
                    setSignerName(signer.name);
                    setSignerEmail(signer.email || '');
                  }
                }}
                className="signature-flow__select"
              >
                <option value="">Select a signer...</option>
                {availableSigners.map((signer) => (
                  <option key={signer.id} value={signer.id}>
                    {signer.name} {signer.email ? `(${signer.email})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="signature-flow__input"
                placeholder="Signer name"
                required
              />
            )}
          </div>

          {!selectedSignerId && (
            <div className="signature-flow__field">
              <label htmlFor="signer-name" className="signature-flow__label">
                Signer Name
              </label>
              <input
                id="signer-name"
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="signature-flow__input"
                placeholder="Enter signer name"
                required
              />
            </div>
          )}

          <div className="signature-flow__field">
            <label htmlFor="signer-email" className="signature-flow__label">
              Signer Email (optional)
            </label>
            <input
              id="signer-email"
              type="email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              className="signature-flow__input"
              placeholder="signer@example.com"
            />
          </div>

          <div className="signature-flow__field">
            <label htmlFor="signature-message" className="signature-flow__label">
              Message (optional)
            </label>
            <textarea
              id="signature-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="signature-flow__textarea"
              placeholder="Add a message for the signer..."
              rows={3}
            />
          </div>
        </div>

        <div className="signature-flow__actions">
          <button
            onClick={onCancel}
            className="signature-flow__button signature-flow__button--cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="signature-flow__button signature-flow__button--primary"
            disabled={!signerName}
          >
            Send for Signature
          </button>
        </div>
      </div>
    </div>
  );
}
