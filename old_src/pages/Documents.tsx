/**
 * Documents Page
 * Document management with OCR, classification, search, and e-signatures
 */

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Document } from '@/models';
import { DocumentCategory, DocumentWithMetadata, DocumentVersion, DocumentSignature, DocumentUploadData } from '@/types/documents';
import { DocumentCard } from '@/ui/components/DocumentCard';
import { DocumentUpload } from '@/ui/components/DocumentUpload';
import { DocumentViewer } from '@/ui/components/DocumentViewer';
import { SignatureFlow } from '@/ui/components/SignatureFlow';
import { SearchBar } from '@/ui/components/SearchBar';
import { searchDocuments, filterDocumentsByCategory, buildSearchableText } from '@/utils/documents';
import { createSignatureRequest, signDocument, declineSignature } from '@/utils/signatures';
import { OrientationHeader } from './OrientationHeader';
import { NowNext } from './NowNext';
import { DocumentShare } from '@/ui/components/DocumentShare';
import './Page.css';
import './Documents.css';

// Placeholder data - in production, this would come from a data store
const placeholderDocuments: Document[] = [];
const placeholderVersions: DocumentVersion[] = [];
const placeholderSignatures: DocumentSignature[] = [];
const placeholderAdults: Person[] = [];
const placeholderChildren: Person[] = [];

export function Documents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>(placeholderDocuments);
  const [versions, setVersions] = useState<DocumentVersion[]>(placeholderVersions);
  const [signatures, setSignatures] = useState<DocumentSignature[]>(placeholderSignatures);
  const [adults] = useState<Person[]>(placeholderAdults);
  const [children] = useState<Person[]>(placeholderChildren);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sharingDocumentId, setSharingDocumentId] = useState<string | null>(null);
  
  const familyMembers = useMemo(() => [...adults, ...children], [adults, children]);

  // Update search query from URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [signingDocument, setSigningDocument] = useState<Document | null>(null);
  const [signatureMode, setSignatureMode] = useState<'sign' | 'send'>('sign');
  const [currentSignature, setCurrentSignature] = useState<DocumentSignature | null>(null);

  // Convert documents to DocumentWithMetadata
  const documentsWithMetadata = useMemo<DocumentWithMetadata[]>(() => {
    return documents.map(doc => ({
      ...doc,
      category: (doc.category as DocumentCategory) || DocumentCategory.OTHER,
      versions: versions.filter(v => v.documentId === doc.id),
      signatures: signatures.filter(s => s.documentId === doc.id),
      searchableText: buildSearchableText({
        ...doc,
        category: (doc.category as DocumentCategory) || DocumentCategory.OTHER,
        versions: [],
        signatures: [],
        searchableText: '',
      }),
    }));
  }, [documents, versions, signatures]);

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    let filtered = documentsWithMetadata;

    // Filter by category
    if (selectedCategory) {
      filtered = filterDocumentsByCategory(filtered, selectedCategory);
    }

    // Search
    if (searchQuery.trim()) {
      filtered = searchDocuments(filtered, searchQuery);
    }

    return filtered;
  }, [documentsWithMetadata, selectedCategory, searchQuery]);

  // Handle document upload
  const handleUpload = async (uploadData: DocumentUploadData) => {
    // In production, this would upload to storage and create document record
    const newDocument: Document = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      householdId: 'household-1', // Would come from context
      title: uploadData.title || uploadData.file.name,
      description: uploadData.description,
      type: uploadData.file.type.includes('pdf') ? 'pdf' as any : 
            uploadData.file.type.includes('image') ? 'image' as any : 'other' as any,
      fileUrl: URL.createObjectURL(uploadData.file), // In production, would be actual storage URL
      fileName: uploadData.file.name,
      fileSize: uploadData.file.size,
      uploadedById: 'user-1', // Would come from context
      tags: uploadData.tags || [],
      category: uploadData.category || DocumentCategory.OTHER,
      ocrText: '', // Would be populated from OCR processing
      currentVersion: 1,
      isSigned: false,
      encrypted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocuments([...documents, newDocument]);
    setShowUpload(false);
  };

  // Handle document view
  const handleViewDocument = (document: Document) => {
    setViewingDocument(document);
  };

  // Handle document sign
  const handleSignDocument = (document: Document) => {
    const docSignature = signatures.find(s => s.documentId === document.id && s.status === 'pending');
    setCurrentSignature(docSignature || null);
    setSigningDocument(document);
    setSignatureMode('sign');
  };

  // Handle send for signature
  const handleSendForSignature = (document: Document) => {
    setSigningDocument(document);
    setSignatureMode('send');
  };

  // Handle signature submission
  const handleSign = (signature: DocumentSignature, signatureData: string) => {
    const signed = signDocument(signature, signatureData);
    setSignatures(signatures.map(s => s.id === signature.id ? signed : s));
    setSigningDocument(null);
    setCurrentSignature(null);
  };

  // Handle send signature request
  const handleSendSignature = (request: SignatureRequest) => {
    const newSignature = createSignatureRequest(request, 'user-1'); // Would come from context
    setSignatures([...signatures, newSignature]);
    setSigningDocument(null);
  };

  // Handle decline signature
  const handleDeclineSignature = (signature: DocumentSignature, reason?: string) => {
    const declined = declineSignature(signature, reason);
    setSignatures(signatures.map(s => s.id === signature.id ? declined : s));
    setSigningDocument(null);
    setCurrentSignature(null);
  };

  // Get document category
  const getDocumentCategory = (document: Document): DocumentCategory => {
    return (document.category as DocumentCategory) || DocumentCategory.OTHER;
  };

  return (
    <div className="page">
      <OrientationHeader 
        title="Documents" 
        description="Store, organize, and manage your documents with OCR and e-signatures" 
      />

      <NowNext 
        now="Store and organize your important documents"
        next="Upload documents to get started"
      />

      <div className="documents__toolbar">
        <div className="documents__search">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search documents..."
          />
        </div>
        <div className="documents__filters">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? e.target.value as DocumentCategory : null)}
            className="documents__category-filter"
          >
            <option value="">All Categories</option>
            <option value={DocumentCategory.MEDICAL}>Medical</option>
            <option value={DocumentCategory.SCHOOL}>School</option>
            <option value={DocumentCategory.HOUSE}>House</option>
            <option value={DocumentCategory.FINANCIAL}>Financial</option>
            <option value={DocumentCategory.OTHER}>Other</option>
          </select>
          <button
            onClick={() => setShowUpload(true)}
            className="documents__upload-button"
          >
            + Upload Document
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="documents__upload-modal">
          <div className="documents__upload-content">
            <DocumentUpload
              onUpload={handleUpload}
              onCancel={() => setShowUpload(false)}
            />
          </div>
        </div>
      )}

      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          category={getDocumentCategory(viewingDocument)}
          versions={versions}
          signatures={signatures}
          ocrText={viewingDocument.ocrText}
          relatedPersonName={viewingDocument.linkedToPersonId ? undefined : undefined} // Would fetch person name from data store in production
          relatedRoomName={viewingDocument.linkedToRoomId ? undefined : undefined} // Would fetch room name from data store in production
          onClose={() => setViewingDocument(null)}
          onDownload={(doc) => {
            // In production, would download from storage
            window.open(doc.fileUrl, '_blank');
          }}
        />
      )}

      {signingDocument && (
        <SignatureFlow
          document={signingDocument}
          mode={signatureMode}
          existingSignature={currentSignature || undefined}
          onSign={handleSign}
          onSend={handleSendSignature}
          onDecline={handleDeclineSignature}
          onCancel={() => {
            setSigningDocument(null);
            setCurrentSignature(null);
          }}
          availableSigners={[]} // Would come from context
        />
      )}

      <div className="documents__content">
        {filteredDocuments.length === 0 ? (
          <div className="documents__empty">
            <div className="documents__empty-icon">📄</div>
            <p className="documents__empty-text">
              {searchQuery || selectedCategory
                ? 'No documents found matching your criteria'
                : 'No documents yet. Upload your first document to get started.'}
            </p>
            {!searchQuery && !selectedCategory && (
              <button
                onClick={() => setShowUpload(true)}
                className="documents__empty-button"
              >
                Upload Document
              </button>
            )}
          </div>
        ) : (
          <div className="documents__grid">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                category={doc.category}
                signatures={signatures}
                onView={handleViewDocument}
                onSign={handleSignDocument}
                onSendForSignature={handleSendForSignature}
                onShare={(docId) => setSharingDocumentId(docId)}
              />
            ))}
          </div>
        )}
      </div>

      {sharingDocumentId && (
        <div className="documents__share-overlay" onClick={() => setSharingDocumentId(null)}>
          <div className="documents__share-content" onClick={(e) => e.stopPropagation()}>
            <DocumentShare
              documentId={sharingDocumentId}
              sharedWithIds={documents.find(d => d.id === sharingDocumentId)?.sharedWithIds || []}
              familyMembers={familyMembers}
              onShare={handleShare}
            />
          </div>
        </div>
      )}

    </div>
  );
}
