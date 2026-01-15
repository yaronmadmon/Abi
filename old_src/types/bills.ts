/**
 * Bills & Financial Types
 * Bill detection, subscriptions, and financial awareness
 */

import { Bill, BillStatus, EntityId } from '@/models';
import { Timestamp } from '@/models';

export enum SubscriptionFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export interface Subscription {
  id: string;
  householdId: EntityId;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  frequency: SubscriptionFrequency;
  billingDate: number; // Day of month (1-31) or day of week/month for other frequencies
  category: string;
  payee: string;
  nextBillingDate: Timestamp;
  lastBilledDate?: Timestamp;
  status: 'active' | 'paused' | 'cancelled';
  autoDetected: boolean; // Whether subscription was auto-detected
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DetectedBill {
  source: 'email' | 'document';
  sourceId: string; // Email ID or Document ID
  title: string;
  amount: number;
  currency: string;
  dueDate?: Timestamp;
  payee?: string;
  category?: string;
  confidence: number; // 0-1
  extractedData?: Record<string, unknown>;
}

export interface BillSummary {
  period: 'this_month' | 'next_month' | 'this_year';
  totalBills: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  currency: string;
  bills: Bill[];
}

export interface SubscriptionSummary {
  totalSubscriptions: number;
  monthlyTotal: number;
  currency: string;
  subscriptions: Subscription[];
  byCategory: Record<string, { count: number; total: number }>;
}

export interface FinancialSummary {
  currentMonth: BillSummary;
  subscriptions: SubscriptionSummary;
  upcomingBills: Bill[];
  recentlyPaid: Bill[];
  calmMessage: string; // Calm, non-guilt language
}
