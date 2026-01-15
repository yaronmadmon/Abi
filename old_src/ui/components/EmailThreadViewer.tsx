/**
 * Email Thread Viewer Component
 * Displays an email thread with summary
 */

import { EmailThread, EmailSummary } from '@/types/communication';
import { EmailCard } from './EmailCard';
import { summarizeEmailThread } from '@/utils/emails';
import { useState, useEffect } from 'react';
import './EmailThreadViewer.css';

interface EmailThreadViewerProps {
  thread: EmailThread;
  onClose: () => void;
  onEmailOpen?: (email: any) => void;
  onEmailStar?: (email: any) => void;
  onEmailMarkRead?: (email: any) => void;
}

export function EmailThreadViewer({
  thread,
  onClose,
  onEmailOpen,
  onEmailStar,
  onEmailMarkRead,
}: EmailThreadViewerProps) {
  const [summary, setSummary] = useState<EmailSummary | null>(thread.summary ? {
    threadId: thread.id,
    summary: thread.summary,
    keyPoints: [],
    participants: [],
    createdAt: new Date().toISOString(),
  } : null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    if (!summary && thread.emails.length > 1) {
      generateSummary();
    }
  }, [thread]);

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const threadSummary = await summarizeEmailThread(thread);
      setSummary(threadSummary);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const sortedEmails = [...thread.emails].sort((a, b) => {
    const dateA = a.receivedAt || a.sentAt || a.createdAt;
    const dateB = b.receivedAt || b.sentAt || b.createdAt;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  return (
    <div className="email-thread-viewer">
      <div className="email-thread-viewer__overlay" onClick={onClose} />
      <div className="email-thread-viewer__content">
        <div className="email-thread-viewer__header">
          <div className="email-thread-viewer__header-left">
            <h2 className="email-thread-viewer__subject">{thread.subject}</h2>
            <div className="email-thread-viewer__meta">
              <span className="email-thread-viewer__email-count">
                {thread.emails.length} email{thread.emails.length !== 1 ? 's' : ''}
              </span>
              {thread.unreadCount > 0 && (
                <span className="email-thread-viewer__unread">
                  {thread.unreadCount} unread
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="email-thread-viewer__close"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {summary && (
          <div className="email-thread-viewer__summary">
            <div className="email-thread-viewer__summary-header">
              <h3 className="email-thread-viewer__summary-title">Thread Summary</h3>
              <button
                onClick={generateSummary}
                className="email-thread-viewer__regenerate"
                disabled={isGeneratingSummary}
              >
                {isGeneratingSummary ? 'Generating...' : 'Regenerate'}
              </button>
            </div>
            <p className="email-thread-viewer__summary-text">{summary.summary}</p>
            {summary.keyPoints && summary.keyPoints.length > 0 && (
              <div className="email-thread-viewer__key-points">
                <h4 className="email-thread-viewer__key-points-title">Key Points:</h4>
                <ul className="email-thread-viewer__key-points-list">
                  {summary.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary.actionItems && summary.actionItems.length > 0 && (
              <div className="email-thread-viewer__action-items">
                <h4 className="email-thread-viewer__action-items-title">Action Items:</h4>
                <ul className="email-thread-viewer__action-items-list">
                  {summary.actionItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!summary && thread.emails.length > 1 && (
          <div className="email-thread-viewer__summary-placeholder">
            <button
              onClick={generateSummary}
              className="email-thread-viewer__generate-summary"
              disabled={isGeneratingSummary}
            >
              {isGeneratingSummary ? 'Generating summary...' : '✨ Generate Thread Summary'}
            </button>
          </div>
        )}

        <div className="email-thread-viewer__emails">
          <h3 className="email-thread-viewer__emails-title">Emails in Thread</h3>
          {sortedEmails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              onOpen={onEmailOpen}
              onStar={onEmailStar}
              onMarkRead={onEmailMarkRead}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
