/**
 * Financial Page
 * Bills and financial awareness (calm, read-only)
 */

import { useState, useMemo, useEffect } from 'react';
import { Bill, BillStatus } from '@/models';
import { Subscription, FinancialSummary } from '@/types/bills';
import { Email } from '@/types/communication';
import { Document } from '@/models';
import { BillCard } from '@/ui/components/BillCard';
import { SubscriptionCard } from '@/ui/components/SubscriptionCard';
import { FinancialSummaryComponent } from '@/ui/components/FinancialSummary';
import { SearchBar } from '@/ui/components/SearchBar';
import {
  detectBillFromEmail,
  detectBillFromDocument,
  detectSubscription,
  generateCalmFinancialSummary,
  formatCurrency,
} from '@/utils/bills';
import './Page.css';
import './Financial.css';

// Placeholder data - in production, this would come from a data store
const placeholderBills: Bill[] = [];
const placeholderSubscriptions: Subscription[] = [];
const placeholderEmails: Email[] = [];
const placeholderDocuments: Document[] = [];

export function Financial() {
  const [bills, setBills] = useState<Bill[]>(placeholderBills);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(placeholderSubscriptions);
  const [activeTab, setActiveTab] = useState<'overview' | 'bills' | 'subscriptions'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BillStatus | null>(null);

  // Auto-detect subscriptions from bills
  useEffect(() => {
    const detectedSubscriptions = detectSubscription(bills);
    setSubscriptions(detectedSubscriptions);
  }, [bills]);

  // Generate financial summary
  const financialSummary = useMemo<FinancialSummary>(() => {
    return generateCalmFinancialSummary(bills, subscriptions);
  }, [bills, subscriptions]);

  // Filter bills
  const filteredBills = useMemo(() => {
    let filtered = bills;

    if (statusFilter) {
      filtered = filtered.filter(bill => bill.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(bill => {
        const searchable = [
          bill.title,
          bill.payee,
          bill.category,
          bill.description || '',
        ].join(' ').toLowerCase();
        return searchable.includes(queryLower);
      });
    }

    return filtered.sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [bills, statusFilter, searchQuery]);

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions;

    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(sub => {
        const searchable = [
          sub.name,
          sub.payee,
          sub.category,
          sub.description || '',
        ].join(' ').toLowerCase();
        return searchable.includes(queryLower);
      });
    }

    return filtered.sort((a, b) => {
      return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
    });
  }, [subscriptions, searchQuery]);

  // Detect bills from emails (would be called when emails are synced)
  const detectBillsFromEmails = (emails: Email[]) => {
    const detectedBills: Bill[] = [];
    
    emails.forEach(email => {
      const detected = detectBillFromEmail(email);
      if (detected && detected.confidence > 0.7) {
        // Convert detected bill to Bill entity
        const bill: Bill = {
          id: `bill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          householdId: 'household-1', // Would come from context
          title: detected.title,
          description: `Detected from ${detected.source}`,
          amount: detected.amount,
          currency: detected.currency,
          dueDate: detected.dueDate || new Date().toISOString(),
          status: BillStatus.PENDING,
          payee: detected.payee || 'Unknown',
          category: detected.category || 'other',
          tags: ['auto-detected'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        detectedBills.push(bill);
      }
    });

    if (detectedBills.length > 0) {
      setBills([...bills, ...detectedBills]);
    }
  };

  // Detect bills from documents (would be called when documents are processed)
  const detectBillsFromDocuments = (documents: Document[]) => {
    const detectedBills: Bill[] = [];
    
    documents.forEach(doc => {
      const detected = detectBillFromDocument(doc);
      if (detected && detected.confidence > 0.7) {
        const bill: Bill = {
          id: `bill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          householdId: 'household-1',
          title: detected.title,
          description: `Detected from ${detected.source}`,
          amount: detected.amount,
          currency: detected.currency,
          dueDate: detected.dueDate || new Date().toISOString(),
          status: BillStatus.PENDING,
          payee: detected.payee || 'Unknown',
          category: detected.category || 'other',
          tags: ['auto-detected'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        detectedBills.push(bill);
      }
    });

    if (detectedBills.length > 0) {
      setBills([...bills, ...detectedBills]);
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Financial</h1>
        <p className="page__description">
          Overview of your bills and subscriptions
        </p>
      </div>

      <div className="financial__tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`financial__tab ${activeTab === 'overview' ? 'financial__tab--active' : ''}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          className={`financial__tab ${activeTab === 'bills' ? 'financial__tab--active' : ''}`}
        >
          Bills
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`financial__tab ${activeTab === 'subscriptions' ? 'financial__tab--active' : ''}`}
        >
          Subscriptions
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="financial__overview">
          <FinancialSummaryComponent summary={financialSummary} />
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="financial__bills">
          <div className="financial__toolbar">
            <div className="financial__search">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search bills..."
              />
            </div>
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value ? e.target.value as BillStatus : null)}
              className="financial__status-filter"
            >
              <option value="">All Status</option>
              <option value={BillStatus.PENDING}>Pending</option>
              <option value={BillStatus.PAID}>Paid</option>
              <option value={BillStatus.OVERDUE}>Overdue</option>
              <option value={BillStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

          <div className="financial__content">
            {filteredBills.length === 0 ? (
              <div className="financial__empty">
                <div className="financial__empty-icon">💳</div>
                <p className="financial__empty-text">
                  {searchQuery || statusFilter
                    ? 'No bills found'
                    : 'No bills tracked yet. Bills will be automatically detected from your emails and documents.'}
                </p>
              </div>
            ) : (
              <div className="financial__bill-list">
                {filteredBills.map((bill) => (
                  <BillCard key={bill.id} bill={bill} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="financial__subscriptions">
          <div className="financial__toolbar">
            <div className="financial__search">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search subscriptions..."
              />
            </div>
          </div>

          <div className="financial__content">
            {filteredSubscriptions.length === 0 ? (
              <div className="financial__empty">
                <div className="financial__empty-icon">🔄</div>
                <p className="financial__empty-text">
                  {searchQuery
                    ? 'No subscriptions found'
                    : 'No subscriptions detected yet. Subscriptions will be automatically identified from recurring bills.'}
                </p>
              </div>
            ) : (
              <div className="financial__subscription-list">
                {filteredSubscriptions.map((subscription) => (
                  <SubscriptionCard key={subscription.id} subscription={subscription} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
