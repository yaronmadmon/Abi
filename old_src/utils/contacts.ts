/**
 * Contact Utilities
 * Smart suggestions, relationship memory, and contact management
 */

import { Contact, ContactSuggestion, RelationshipType } from '@/types/communication';
import { Email, EmailThread } from '@/types/communication';
import { EntityId } from '@/models';

/**
 * Get smart contact suggestions based on context
 */
export function getContactSuggestions(
  contacts: Contact[],
  context: {
    query?: string;
    recentEmails?: Email[];
    currentTask?: string;
    currentEvent?: string;
  }
): ContactSuggestion[] {
  const suggestions: ContactSuggestion[] = [];
  
  // Filter by query if provided
  let filteredContacts = contacts;
  if (context.query) {
    const queryLower = context.query.toLowerCase();
    filteredContacts = contacts.filter(contact => {
      const searchable = [
        contact.firstName,
        contact.lastName || '',
        contact.email || '',
        contact.company || '',
        contact.jobTitle || '',
        ...contact.tags,
      ].join(' ').toLowerCase();
      
      return searchable.includes(queryLower);
    });
  }
  
  // Prioritize by recent contact
  if (context.recentEmails && context.recentEmails.length > 0) {
    const recentEmails = context.recentEmails.slice(0, 10);
    const contactFrequency = new Map<EntityId, number>();
    
    recentEmails.forEach(email => {
      const emailAddresses = [
        email.from.email,
        ...email.to.map(addr => addr.email),
      ];
      
      contacts.forEach(contact => {
        if (contact.email && emailAddresses.includes(contact.email)) {
          contactFrequency.set(contact.id, (contactFrequency.get(contact.id) || 0) + 1);
        }
      });
    });
    
    filteredContacts.forEach(contact => {
      const frequency = contactFrequency.get(contact.id) || 0;
      if (frequency > 0) {
        suggestions.push({
          contact,
          reason: `Recently contacted (${frequency} time${frequency !== 1 ? 's' : ''})`,
          confidence: Math.min(0.9, 0.5 + frequency * 0.1),
          context: 'Recent email activity',
        });
      }
    });
  }
  
  // Prioritize by relationship
  filteredContacts.forEach(contact => {
    if (!suggestions.find(s => s.contact.id === contact.id)) {
      let reason = 'Contact';
      let confidence = 0.5;
      
      if (contact.relationship === RelationshipType.FAMILY) {
        reason = 'Family member';
        confidence = 0.8;
      } else if (contact.relationship === RelationshipType.FRIEND) {
        reason = 'Friend';
        confidence = 0.7;
      } else if (contact.contactFrequency === 'daily' || contact.contactFrequency === 'weekly') {
        reason = 'Frequently contacted';
        confidence = 0.75;
      }
      
      suggestions.push({
        contact,
        reason,
        confidence,
      });
    }
  });
  
  // Sort by confidence
  suggestions.sort((a, b) => b.confidence - a.confidence);
  
  return suggestions.slice(0, 10); // Return top 10
}

/**
 * Update relationship memory from email interactions
 */
export function updateRelationshipFromEmail(
  contact: Contact,
  email: Email
): Contact {
  // Update last contacted date
  const lastContacted = email.receivedAt || email.sentAt || email.createdAt;
  
  let relationshipNotes = contact.relationshipNotes || '';
  
  // Extract context from email
  const subjectContext = email.subject;
  const bodyContext = email.body.substring(0, 200); // First 200 chars
  
  if (subjectContext || bodyContext) {
    const contextNote = `[${new Date(lastContacted).toLocaleDateString()}] ${subjectContext}: ${bodyContext.substring(0, 100)}...`;
    relationshipNotes = relationshipNotes 
      ? `${relationshipNotes}\n${contextNote}`
      : contextNote;
    
    // Keep only last 5 notes
    const notes = relationshipNotes.split('\n').slice(-5);
    relationshipNotes = notes.join('\n');
  }
  
  return {
    ...contact,
    lastContactedAt: lastContacted,
    relationshipNotes,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Infer relationship type from email patterns
 */
export function inferRelationshipType(
  contact: Contact,
  emails: Email[]
): RelationshipType | undefined {
  if (contact.relationship) {
    return contact.relationship;
  }
  
  const contactEmails = emails.filter(email => {
    return email.from.email === contact.email || 
           email.to.some(addr => addr.email === contact.email);
  });
  
  if (contactEmails.length === 0) {
    return undefined;
  }
  
  // Analyze email content for relationship clues
  const allText = contactEmails
    .map(e => `${e.subject} ${e.body}`)
    .join(' ')
    .toLowerCase();
  
  if (allText.includes('mom') || allText.includes('dad') || allText.includes('family')) {
    return RelationshipType.FAMILY;
  }
  
  if (allText.includes('meeting') || allText.includes('project') || allText.includes('work')) {
    return RelationshipType.COLLEAGUE;
  }
  
  if (allText.includes('bill') || allText.includes('invoice') || allText.includes('service')) {
    return RelationshipType.SERVICE_PROVIDER;
  }
  
  return RelationshipType.OTHER;
}

/**
 * Get contact display name
 */
export function getContactDisplayName(contact: Contact): string {
  if (contact.firstName && contact.lastName) {
    return `${contact.firstName} ${contact.lastName}`;
  }
  return contact.firstName || contact.email || 'Unknown';
}

/**
 * Get relationship display name
 */
export function getRelationshipDisplayName(relationship?: RelationshipType): string {
  if (!relationship) {
    return 'No relationship';
  }
  
  switch (relationship) {
    case RelationshipType.FAMILY:
      return 'Family';
    case RelationshipType.FRIEND:
      return 'Friend';
    case RelationshipType.COLLEAGUE:
      return 'Colleague';
    case RelationshipType.PROFESSIONAL:
      return 'Professional';
    case RelationshipType.SERVICE_PROVIDER:
      return 'Service Provider';
    case RelationshipType.OTHER:
      return 'Other';
    default:
      return 'Unknown';
  }
}

/**
 * Calculate contact frequency from last contacted date
 */
export function calculateContactFrequency(lastContacted?: string): 'daily' | 'weekly' | 'monthly' | 'yearly' | 'rare' | undefined {
  if (!lastContacted) {
    return undefined;
  }
  
  const lastDate = new Date(lastContacted);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSince <= 1) {
    return 'daily';
  } else if (daysSince <= 7) {
    return 'weekly';
  } else if (daysSince <= 30) {
    return 'monthly';
  } else if (daysSince <= 365) {
    return 'yearly';
  } else {
    return 'rare';
  }
}

/**
 * Search contacts
 */
export function searchContacts(contacts: Contact[], query: string): Contact[] {
  if (!query.trim()) {
    return contacts;
  }
  
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(Boolean);
  
  return contacts.filter(contact => {
    const searchable = [
      contact.firstName,
      contact.lastName || '',
      contact.email || '',
      contact.company || '',
      contact.jobTitle || '',
      contact.notes || '',
      ...contact.tags,
    ].join(' ').toLowerCase();
    
    return queryTerms.every(term => searchable.includes(term));
  });
}
