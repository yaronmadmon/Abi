/**
 * Communication Page
 * Email, contacts, and follow-up tracking
 */

import { useState, useMemo } from 'react';
import { Email, EmailThread, EmailComposeData, EmailStatus } from '@/types/communication';
import { Contact } from '@/types/communication';
import { FollowUp, FollowUpStatus } from '@/types/communication';
import { EmailCard } from '@/ui/components/EmailCard';
import { EmailComposer } from '@/ui/components/EmailComposer';
import { EmailThreadViewer } from '@/ui/components/EmailThreadViewer';
import { ContactCard } from '@/ui/components/ContactCard';
import { FollowUpTracker } from '@/ui/components/FollowUpTracker';
import { SearchBar } from '@/ui/components/SearchBar';
import {
  groupEmailsIntoThreads,
  searchEmails,
  filterEmailsByStatus,
  markEmailAsRead,
  toggleEmailStar,
} from '@/utils/emails';
import { searchContacts, getContactSuggestions } from '@/utils/contacts';
import {
  createFollowUpFromEmail,
  sendGentleReminder,
  resolveFollowUp,
  getFollowUpsNeedingReminders,
} from '@/utils/followups';
import './Page.css';
import './Communication.css';

// Placeholder data - in production, this would come from a data store
const placeholderEmails: Email[] = [];
const placeholderContacts: Contact[] = [];
const placeholderFollowUps: FollowUp[] = [];

export function Communication() {
  const [emails, setEmails] = useState<Email[]>(placeholderEmails);
  const [contacts, setContacts] = useState<Contact[]>(placeholderContacts);
  const [followUps, setFollowUps] = useState<FollowUp[]>(placeholderFollowUps);
  
  const [activeTab, setActiveTab] = useState<'emails' | 'contacts' | 'followups'>('emails');
  const [emailSearchQuery, setEmailSearchQuery] = useState('');
  const [emailStatusFilter, setEmailStatusFilter] = useState<EmailStatus | null>(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [viewingThread, setViewingThread] = useState<EmailThread | null>(null);
  const [viewingEmail, setViewingEmail] = useState<Email | null>(null);

  // Group emails into threads
  const emailThreads = useMemo(() => {
    return groupEmailsIntoThreads(emails);
  }, [emails]);

  // Filter and search emails
  const filteredEmails = useMemo(() => {
    let filtered = emails;
    
    if (emailStatusFilter) {
      filtered = filterEmailsByStatus(filtered, emailStatusFilter);
    }
    
    if (emailSearchQuery.trim()) {
      filtered = searchEmails(filtered, emailSearchQuery);
    }
    
    return filtered;
  }, [emails, emailStatusFilter, emailSearchQuery]);

  // Filter and search contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts;
    
    if (contactSearchQuery.trim()) {
      filtered = searchContacts(filtered, contactSearchQuery);
    }
    
    return filtered;
  }, [contacts, contactSearchQuery]);

  // Get contact suggestions
  const contactSuggestions = useMemo(() => {
    return getContactSuggestions(contacts, {
      query: contactSearchQuery,
      recentEmails: emails.slice(0, 10),
    });
  }, [contacts, contactSearchQuery, emails]);

  // Handle email send
  const handleEmailSend = async (data: EmailComposeData) => {
    // In production, this would send the email via email service
    console.log('Sending email:', data);
    setShowEmailComposer(false);
  };

  // Handle email star
  const handleEmailStar = (email: Email) => {
    const updated = toggleEmailStar(email);
    setEmails(emails.map(e => e.id === email.id ? updated : e));
  };

  // Handle email mark as read
  const handleEmailMarkRead = (email: Email) => {
    const updated = markEmailAsRead(email);
    setEmails(emails.map(e => e.id === email.id ? updated : e));
  };

  // Handle open email thread
  const handleOpenThread = (email: Email) => {
    const thread = emailThreads.find(t => t.id === email.threadId);
    if (thread) {
      setViewingThread(thread);
    } else {
      setViewingEmail(email);
    }
  };

  // Handle create follow-up from email
  const handleCreateFollowUp = (email: Email) => {
    const followUp = createFollowUpFromEmail(
      email,
      email.to.map(addr => addr.name || addr.email).join(', ')
    );
    setFollowUps([...followUps, followUp]);
  };

  // Handle send reminder
  const handleSendReminder = (followUp: FollowUp) => {
    const updated = sendGentleReminder(followUp);
    setFollowUps(followUps.map(f => f.id === followUp.id ? updated : f));
  };

  // Handle resolve follow-up
  const handleResolveFollowUp = (followUp: FollowUp) => {
    const updated = resolveFollowUp(followUp);
    setFollowUps(followUps.map(f => f.id === followUp.id ? updated : f));
  };

  // Handle contact email
  const handleContactEmail = (contact: Contact) => {
    if (contact.email) {
      setShowEmailComposer(true);
      // Would pre-fill email composer with contact email
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Communication</h1>
        <p className="page__description">
          Manage emails, contacts, and follow-ups
        </p>
      </div>

      <div className="communication__tabs">
        <button
          onClick={() => setActiveTab('emails')}
          className={`communication__tab ${activeTab === 'emails' ? 'communication__tab--active' : ''}`}
        >
          Emails
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`communication__tab ${activeTab === 'contacts' ? 'communication__tab--active' : ''}`}
        >
          Contacts
        </button>
        <button
          onClick={() => setActiveTab('followups')}
          className={`communication__tab ${activeTab === 'followups' ? 'communication__tab--active' : ''}`}
        >
          Follow-ups
        </button>
      </div>

      {activeTab === 'emails' && (
        <div className="communication__emails">
          <div className="communication__toolbar">
            <div className="communication__search">
              <SearchBar
                value={emailSearchQuery}
                onChange={setEmailSearchQuery}
                placeholder="Search emails..."
              />
            </div>
            <div className="communication__filters">
              <select
                value={emailStatusFilter || ''}
                onChange={(e) => setEmailStatusFilter(e.target.value ? e.target.value as EmailStatus : null)}
                className="communication__status-filter"
              >
                <option value="">All Status</option>
                <option value={EmailStatus.RECEIVED}>Received</option>
                <option value={EmailStatus.SENT}>Sent</option>
                <option value={EmailStatus.DRAFT}>Drafts</option>
                <option value={EmailStatus.ARCHIVED}>Archived</option>
              </select>
              <button
                onClick={() => setShowEmailComposer(true)}
                className="communication__compose-button"
              >
                + Compose
              </button>
            </div>
          </div>

          <div className="communication__content">
            {filteredEmails.length === 0 ? (
              <div className="communication__empty">
                <div className="communication__empty-icon">✉</div>
                <p className="communication__empty-text">
                  {emailSearchQuery || emailStatusFilter
                    ? 'No emails found'
                    : 'No emails yet'}
                </p>
              </div>
            ) : (
              <div className="communication__email-list">
                {filteredEmails.map((email) => (
                  <EmailCard
                    key={email.id}
                    email={email}
                    onOpen={handleOpenThread}
                    onStar={handleEmailStar}
                    onMarkRead={handleEmailMarkRead}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="communication__contacts">
          <div className="communication__toolbar">
            <div className="communication__search">
              <SearchBar
                value={contactSearchQuery}
                onChange={setContactSearchQuery}
                placeholder="Search contacts..."
              />
            </div>
          </div>

          <div className="communication__content">
            {filteredContacts.length === 0 ? (
              <div className="communication__empty">
                <div className="communication__empty-icon">👤</div>
                <p className="communication__empty-text">No contacts found</p>
              </div>
            ) : (
              <div className="communication__contact-list">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEmail={handleContactEmail}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'followups' && (
        <div className="communication__followups">
          <FollowUpTracker
            followUps={followUps}
            onResolve={handleResolveFollowUp}
            onSendReminder={handleSendReminder}
          />
        </div>
      )}

      {showEmailComposer && (
        <div className="communication__composer-modal">
          <div className="communication__composer-content">
            <EmailComposer
              onSend={handleEmailSend}
              onCancel={() => setShowEmailComposer(false)}
              showAiDraft={true}
            />
          </div>
        </div>
      )}

      {viewingThread && (
        <EmailThreadViewer
          thread={viewingThread}
          onClose={() => setViewingThread(null)}
          onEmailOpen={handleOpenThread}
          onEmailStar={handleEmailStar}
          onEmailMarkRead={handleEmailMarkRead}
        />
      )}
    </div>
  );
}
