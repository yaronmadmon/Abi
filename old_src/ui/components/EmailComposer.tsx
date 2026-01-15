/**
 * Email Composer Component
 * Compose emails with AI draft support (requires approval)
 */

import { useState, useRef, useEffect } from 'react';
import { EmailComposeData, EmailPriority, EmailAddress } from '@/types/communication';
import { generateEmailDraft, parseEmailAddresses, isValidEmail } from '@/utils/emails';
import './EmailComposer.css';

interface EmailComposerProps {
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  onSend: (data: EmailComposeData) => Promise<void>;
  onSaveDraft?: (data: EmailComposeData) => Promise<void>;
  onCancel: () => void;
  showAiDraft?: boolean;
  voiceInput?: string;
}

export function EmailComposer({
  initialTo = '',
  initialSubject = '',
  initialBody = '',
  onSend,
  onSaveDraft,
  onCancel,
  showAiDraft = true,
  voiceInput,
}: EmailComposerProps) {
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [priority, setPriority] = useState<EmailPriority>(EmailPriority.NORMAL);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generate AI draft from voice input
  const handleGenerateDraft = async () => {
    if (!voiceInput && !body.trim()) {
      return;
    }

    setIsGeneratingDraft(true);
    try {
      const draft = await generateEmailDraft(
        voiceInput || body,
        to || undefined
      );
      
      setSubject(draft.subject);
      setBody(draft.body);
      setIsAiGenerated(true);
      setRequiresApproval(true);
      
      // Focus on body for editing
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error('Error generating draft:', error);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // Auto-generate draft if voice input is provided
  useEffect(() => {
    if (voiceInput && showAiDraft && !body.trim()) {
      handleGenerateDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceInput]);

  const handleSend = async () => {
    // Validate recipients
    const toAddresses = parseEmailAddresses(to);
    if (toAddresses.length === 0 || !toAddresses.every(addr => isValidEmail(addr.email))) {
      alert('Please enter valid email addresses in the To field');
      return;
    }

    const composeData: EmailComposeData = {
      to: toAddresses,
      cc: cc ? parseEmailAddresses(cc) : undefined,
      bcc: bcc ? parseEmailAddresses(bcc) : undefined,
      subject: subject.trim(),
      body: body.trim(),
      priority: priority !== EmailPriority.NORMAL ? priority : undefined,
    };

    // If AI-generated, require approval
    if (requiresApproval && isAiGenerated) {
      if (!confirm('This email was AI-generated. Review and approve before sending?')) {
        return;
      }
    }

    await onSend(composeData);
  };

  const handleSaveDraft = async () => {
    const composeData: EmailComposeData = {
      to: to ? parseEmailAddresses(to) : [],
      cc: cc ? parseEmailAddresses(cc) : undefined,
      bcc: bcc ? parseEmailAddresses(bcc) : undefined,
      subject: subject.trim(),
      body: body.trim(),
      priority: priority !== EmailPriority.NORMAL ? priority : undefined,
    };

    if (onSaveDraft) {
      await onSaveDraft(composeData);
    }
  };

  return (
    <div className="email-composer">
      <div className="email-composer__header">
        <h3 className="email-composer__title">Compose Email</h3>
        {isAiGenerated && requiresApproval && (
          <div className="email-composer__ai-badge">
            AI Draft - Review Required
          </div>
        )}
      </div>

      <div className="email-composer__body">
        <div className="email-composer__field">
          <label htmlFor="email-to" className="email-composer__label">
            To <span className="email-composer__required">*</span>
          </label>
          <input
            id="email-to"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="email-composer__input"
            placeholder="recipient@example.com"
            required
          />
        </div>

        <div className="email-composer__field">
          <button
            type="button"
            onClick={() => setShowCcBcc(!showCcBcc)}
            className="email-composer__toggle-cc"
          >
            {showCcBcc ? 'Hide' : 'Show'} Cc / Bcc
          </button>
        </div>

        {showCcBcc && (
          <>
            <div className="email-composer__field">
              <label htmlFor="email-cc" className="email-composer__label">Cc</label>
              <input
                id="email-cc"
                type="text"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="email-composer__input"
                placeholder="cc@example.com"
              />
            </div>

            <div className="email-composer__field">
              <label htmlFor="email-bcc" className="email-composer__label">Bcc</label>
              <input
                id="email-bcc"
                type="text"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                className="email-composer__input"
                placeholder="bcc@example.com"
              />
            </div>
          </>
        )}

        <div className="email-composer__field">
          <label htmlFor="email-subject" className="email-composer__label">Subject</label>
          <input
            id="email-subject"
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setIsAiGenerated(false);
              setRequiresApproval(false);
            }}
            className="email-composer__input"
            placeholder="Email subject"
          />
        </div>

        <div className="email-composer__field">
          <div className="email-composer__field-header">
            <label htmlFor="email-body" className="email-composer__label">Message</label>
            {showAiDraft && (
              <button
                type="button"
                onClick={handleGenerateDraft}
                className="email-composer__ai-button"
                disabled={isGeneratingDraft || (!voiceInput && !body.trim())}
              >
                {isGeneratingDraft ? 'Generating...' : '✨ AI Draft'}
              </button>
            )}
          </div>
          <textarea
            id="email-body"
            ref={textareaRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setIsAiGenerated(false);
              setRequiresApproval(false);
            }}
            className="email-composer__textarea"
            placeholder="Type your message here..."
            rows={12}
            required
          />
        </div>

        <div className="email-composer__field">
          <label htmlFor="email-priority" className="email-composer__label">Priority</label>
          <select
            id="email-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as EmailPriority)}
            className="email-composer__select"
          >
            <option value={EmailPriority.LOW}>Low</option>
            <option value={EmailPriority.NORMAL}>Normal</option>
            <option value={EmailPriority.HIGH}>High</option>
          </select>
        </div>
      </div>

      <div className="email-composer__footer">
        <div className="email-composer__footer-left">
          {onSaveDraft && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="email-composer__button email-composer__button--secondary"
            >
              Save Draft
            </button>
          )}
        </div>
        <div className="email-composer__footer-right">
          <button
            type="button"
            onClick={onCancel}
            className="email-composer__button email-composer__button--cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="email-composer__button email-composer__button--primary"
            disabled={!to.trim() || !body.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
