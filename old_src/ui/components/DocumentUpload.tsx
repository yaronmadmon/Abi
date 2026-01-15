/**
 * Document Upload Component
 * Handles file upload with OCR and auto-classification
 */

import { useState, useRef, useEffect } from 'react';
import { DocumentType } from '@/models';
import { DocumentCategory, DocumentUploadData } from '@/types/documents';
import { getDocumentTypeFromFile, extractTextFromDocument, classifyDocument, generateDocumentTitle } from '@/utils/documents';
import './DocumentUpload.css';

interface DocumentUploadProps {
  onUpload: (data: DocumentUploadData) => Promise<void>;
  onCancel?: () => void;
  maxFileSize?: number; // in bytes, default 10MB
}

export function DocumentUpload({
  onUpload,
  onCancel,
  maxFileSize = 10 * 1024 * 1024, // 10MB
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory | ''>('');
  const [tags, setTags] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    
    // Check file size
    if (selectedFile.size > maxFileSize) {
      setError(`File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`);
      return;
    }

    setFile(selectedFile);
    
    // Auto-generate title if not provided
    if (!title) {
      const generatedTitle = generateDocumentTitle(selectedFile.name);
      setTitle(generatedTitle);
    }

    // Process OCR and classification
    setIsProcessing(true);
    try {
      const documentType = getDocumentTypeFromFile(selectedFile);
      const extractedText = await extractTextFromDocument(selectedFile, documentType);
      setOcrText(extractedText);

      // Auto-classify if category not set
      if (!category) {
        const classifiedCategory = await classifyDocument(
          title || selectedFile.name,
          description || undefined,
          extractedText || undefined,
          selectedFile.name
        );
        setCategory(classifiedCategory);
      }
    } catch (err) {
      console.error('Error processing document:', err);
      setError('Failed to process document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      streamRef.current = stream;
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions or use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        handleFileSelect(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const uploadData: DocumentUploadData = {
        file,
        title: title.trim() || generateDocumentTitle(file.name),
        description: description.trim() || undefined,
        category: category || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      await onUpload(uploadData);
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setCategory('');
      setTags('');
      setOcrText(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      stopCamera();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="document-upload">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        className="document-upload__file-input"
        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.doc,.docx"
        disabled={isProcessing}
        style={{ display: 'none' }}
      />
      <div
        className="document-upload__dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ display: showCamera ? 'block' : 'none', width: '100%', maxHeight: '300px', borderRadius: '8px' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {!file && !showCamera ? (
          <div className="document-upload__dropzone-content">
            <div className="document-upload__mode-selector">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="document-upload__mode-button document-upload__mode-button--active"
              >
                📁 Upload File
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  startCamera();
                }}
                className="document-upload__mode-button"
              >
                📷 Camera
              </button>
            </div>
            <div className="document-upload__dropzone-icon">📄</div>
            <p className="document-upload__dropzone-text">
              Choose how you'd like to add your document
            </p>
            <p className="document-upload__dropzone-hint">
              Drag and drop, click to browse, or use camera
            </p>
          </div>
        ) : showCamera ? (
          <div className="document-upload__camera-view">
            <div className="document-upload__camera-controls">
              <button
                type="button"
                onClick={capturePhoto}
                className="document-upload__capture-button"
              >
                📸 Capture
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="document-upload__cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="document-upload__file-info">
            <div className="document-upload__file-name">{file.name}</div>
            <div className="document-upload__file-size">
              {(file.size / 1024).toFixed(2)} KB
            </div>
            {isProcessing && (
              <div className="document-upload__processing">
                Processing document...
              </div>
            )}
            {ocrText && (
              <div className="document-upload__ocr-status">
                ✓ Text extracted via OCR
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="document-upload__error">{error}</div>
      )}

      {file && (
        <div className="document-upload__form">
          <div className="document-upload__field">
            <label htmlFor="doc-title" className="document-upload__label">
              Title
            </label>
            <input
              id="doc-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="document-upload__input"
              placeholder="Document title"
              required
            />
          </div>

          <div className="document-upload__field">
            <label htmlFor="doc-description" className="document-upload__label">
              Description (optional)
            </label>
            <textarea
              id="doc-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="document-upload__textarea"
              placeholder="Add a description..."
              rows={3}
            />
          </div>

          <div className="document-upload__field">
            <label htmlFor="doc-category" className="document-upload__label">
              Category
            </label>
            <select
              id="doc-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="document-upload__select"
            >
              <option value="">Auto-classify</option>
              <option value={DocumentCategory.MEDICAL}>Medical</option>
              <option value={DocumentCategory.SCHOOL}>School</option>
              <option value={DocumentCategory.HOUSE}>House</option>
              <option value={DocumentCategory.FINANCIAL}>Financial</option>
              <option value={DocumentCategory.OTHER}>Other</option>
            </select>
          </div>

          <div className="document-upload__field">
            <label htmlFor="doc-tags" className="document-upload__label">
              Tags (optional, comma-separated)
            </label>
            <input
              id="doc-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="document-upload__input"
              placeholder="important, tax, 2024"
            />
          </div>
        </div>
      )}

      <div className="document-upload__actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="document-upload__button document-upload__button--cancel"
            disabled={isProcessing}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="document-upload__button document-upload__button--submit"
          disabled={!file || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Upload Document'}
        </button>
      </div>
    </form>
  );
}
