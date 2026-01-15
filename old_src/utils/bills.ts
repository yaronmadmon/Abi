/**
 * Bill Utilities
 * Bill detection, tracking, and calm summaries
 */

import { Bill, BillStatus, Timestamp } from '@/models';
import { Email } from '@/types/communication';
import { Document, DocumentCategory } from '@/models';
import { DetectedBill, BillSummary, Subscription, SubscriptionSummary, FinancialSummary } from '@/types/bills';

/**
 * Detect bills from email content
 */
export function detectBillFromEmail(email: Email): DetectedBill | null {
  const text = `${email.subject} ${email.body}`.toLowerCase();
  
  // Bill indicators
  const billKeywords = [
    'invoice', 'bill', 'statement', 'payment due', 'amount due',
    'total due', 'balance', 'outstanding', 'pay now', 'past due'
  ];
  
  const hasBillKeywords = billKeywords.some(keyword => text.includes(keyword));
  
  if (!hasBillKeywords) {
    return null;
  }
  
  // Extract amount (look for currency patterns)
  const amountPattern = /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
  const amounts: number[] = [];
  let match;
  
  while ((match = amountPattern.exec(text)) !== null) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    if (amount > 0 && amount < 100000) { // Reasonable range
      amounts.push(amount);
    }
  }
  
  // Extract due date (various formats)
  const datePatterns = [
    /due\s+(?:date\s+)?:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /due\s+(?:on|by)?\s*([a-z]+\s+\d{1,2},?\s+\d{4})/i,
  ];
  
  let dueDate: Timestamp | undefined;
  for (const pattern of datePatterns) {
    const dateMatch = text.match(pattern);
    if (dateMatch) {
      try {
        dueDate = new Date(dateMatch[1]).toISOString();
        break;
      } catch {
        // Invalid date format
      }
    }
  }
  
  // Extract payee (usually in subject or from field)
  const payee = email.from.name || email.from.email.split('@')[0];
  
  // Confidence based on how many indicators we found
  let confidence = 0.5;
  if (amounts.length > 0) confidence += 0.2;
  if (dueDate) confidence += 0.2;
  if (text.includes('invoice') || text.includes('bill')) confidence += 0.1;
  
  return {
    source: 'email',
    sourceId: email.id,
    title: email.subject || 'Bill',
    amount: amounts.length > 0 ? Math.max(...amounts) : 0,
    currency: 'USD', // Would detect from context
    dueDate,
    payee,
    category: 'other',
    confidence: Math.min(confidence, 1.0),
    extractedData: {
      amounts,
      emailSubject: email.subject,
    },
  };
}

/**
 * Detect bills from document content (OCR text)
 */
export function detectBillFromDocument(document: Document): DetectedBill | null {
  if (document.category !== 'financial' || !document.ocrText) {
    return null;
  }
  
  const text = document.ocrText.toLowerCase();
  
  // Similar detection logic as email
  const billKeywords = [
    'invoice', 'bill', 'statement', 'payment due', 'amount due',
    'total due', 'balance', 'outstanding'
  ];
  
  const hasBillKeywords = billKeywords.some(keyword => text.includes(keyword));
  
  if (!hasBillKeywords) {
    return null;
  }
  
  // Extract amount
  const amountPattern = /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
  const amounts: number[] = [];
  let match;
  
  while ((match = amountPattern.exec(text)) !== null) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    if (amount > 0 && amount < 100000) {
      amounts.push(amount);
    }
  }
  
  // Extract due date
  const datePatterns = [
    /due\s+(?:date\s+)?:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /due\s+(?:on|by)?\s*([a-z]+\s+\d{1,2},?\s+\d{4})/i,
  ];
  
  let dueDate: Timestamp | undefined;
  for (const pattern of datePatterns) {
    const dateMatch = text.match(pattern);
    if (dateMatch) {
      try {
        dueDate = new Date(dateMatch[1]).toISOString();
        break;
      } catch {
        // Invalid date format
      }
    }
  }
  
  let confidence = 0.5;
  if (amounts.length > 0) confidence += 0.2;
  if (dueDate) confidence += 0.2;
  if (document.category === 'financial') confidence += 0.1;
  
  return {
    source: 'document',
    sourceId: document.id,
    title: document.title,
    amount: amounts.length > 0 ? Math.max(...amounts) : 0,
    currency: 'USD',
    dueDate,
    payee: document.fileName.split('_')[0] || 'Unknown',
    category: 'other',
    confidence: Math.min(confidence, 1.0),
    extractedData: {
      amounts,
      documentTitle: document.title,
    },
  };
}

/**
 * Detect subscription from recurring bill
 */
export function detectSubscription(bills: Bill[]): Subscription[] {
  const subscriptions: Subscription[] = [];
  const payeeGroups = new Map<string, Bill[]>();
  
  // Group bills by payee
  bills.forEach(bill => {
    if (bill.status !== BillStatus.CANCELLED) {
      const existing = payeeGroups.get(bill.payee) || [];
      existing.push(bill);
      payeeGroups.set(bill.payee, existing);
    }
  });
  
  // Look for recurring patterns
  payeeGroups.forEach((payeeBills, payee) => {
    if (payeeBills.length < 2) return; // Need at least 2 bills to detect pattern
    
    // Sort by date
    const sortedBills = [...payeeBills].sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    // Calculate average amount
    const totalAmount = sortedBills.reduce((sum, bill) => sum + bill.amount, 0);
    const avgAmount = totalAmount / sortedBills.length;
    
    // Calculate average interval between bills (in days)
    const intervals: number[] = [];
    for (let i = 1; i < sortedBills.length; i++) {
      const daysDiff = Math.floor(
        (new Date(sortedBills[i].dueDate).getTime() - new Date(sortedBills[i - 1].dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      intervals.push(daysDiff);
    }
    
    const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
    
    // Determine frequency
    let frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly';
    if (avgInterval <= 10) {
      frequency = 'weekly';
    } else if (avgInterval <= 35) {
      frequency = 'monthly';
    } else if (avgInterval <= 100) {
      frequency = 'quarterly';
    } else {
      frequency = 'yearly';
    }
    
    // Get billing date (day of month)
    const lastBill = sortedBills[sortedBills.length - 1];
    const billingDate = new Date(lastBill.dueDate).getDate();
    
    // Calculate next billing date
    const nextBillingDate = new Date(lastBill.dueDate);
    if (frequency === 'monthly') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (frequency === 'weekly') {
      nextBillingDate.setDate(nextBillingDate.getDate() + 7);
    } else if (frequency === 'quarterly') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }
    
    subscriptions.push({
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      householdId: lastBill.householdId,
      name: payee,
      amount: avgAmount,
      currency: lastBill.currency,
      frequency,
      billingDate,
      nextBillingDate: nextBillingDate.toISOString(),
      lastBilledDate: lastBill.dueDate,
      category: lastBill.category,
      payee,
      status: 'active',
      autoDetected: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });
  
  return subscriptions;
}

/**
 * Get bill summary for a period (calm, no pressure)
 */
export function getBillSummary(bills: Bill[], period: 'this_month' | 'next_month' | 'this_year'): BillSummary {
  const now = new Date();
  let filteredBills: Bill[] = [];
  
  if (period === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    filteredBills = bills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return dueDate >= startOfMonth && dueDate <= endOfMonth;
    });
  } else if (period === 'next_month') {
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    filteredBills = bills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return dueDate >= startOfNextMonth && dueDate <= endOfNextMonth;
    });
  } else {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    filteredBills = bills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return dueDate >= startOfYear && dueDate <= endOfYear;
    });
  }
  
  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = filteredBills
    .filter(bill => bill.status === BillStatus.PAID)
    .reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = filteredBills
    .filter(bill => bill.status === BillStatus.PENDING)
    .reduce((sum, bill) => sum + bill.amount, 0);
  const overdueAmount = filteredBills
    .filter(bill => bill.status === BillStatus.OVERDUE)
    .reduce((sum, bill) => sum + bill.amount, 0);
  
  return {
    period,
    totalBills: filteredBills.length,
    totalAmount,
    paidAmount,
    pendingAmount,
    overdueAmount,
    currency: filteredBills.length > 0 ? filteredBills[0].currency : 'USD',
    bills: filteredBills,
  };
}

/**
 * Get subscription summary (calm presentation)
 */
export function getSubscriptionSummary(subscriptions: Subscription[]): SubscriptionSummary {
  const activeSubs = subscriptions.filter(sub => sub.status === 'active');
  
  // Calculate monthly total (normalize all to monthly)
  const monthlyTotal = activeSubs.reduce((sum, sub) => {
    let monthlyAmount = sub.amount;
    if (sub.frequency === 'weekly') {
      monthlyAmount = sub.amount * 4.33; // Average weeks per month
    } else if (sub.frequency === 'quarterly') {
      monthlyAmount = sub.amount / 3;
    } else if (sub.frequency === 'yearly') {
      monthlyAmount = sub.amount / 12;
    }
    return sum + monthlyAmount;
  }, 0);
  
  // Group by category
  const byCategory: Record<string, { count: number; total: number }> = {};
  activeSubs.forEach(sub => {
    if (!byCategory[sub.category]) {
      byCategory[sub.category] = { count: 0, total: 0 };
    }
    let monthlyAmount = sub.amount;
    if (sub.frequency === 'weekly') {
      monthlyAmount = sub.amount * 4.33;
    } else if (sub.frequency === 'quarterly') {
      monthlyAmount = sub.amount / 3;
    } else if (sub.frequency === 'yearly') {
      monthlyAmount = sub.amount / 12;
    }
    byCategory[sub.category].count += 1;
    byCategory[sub.category].total += monthlyAmount;
  });
  
  return {
    totalSubscriptions: activeSubs.length,
    monthlyTotal,
    currency: activeSubs.length > 0 ? activeSubs[0].currency : 'USD',
    subscriptions: activeSubs,
    byCategory,
  };
}

/**
 * Generate calm financial summary (no alerts, no guilt)
 */
export function generateCalmFinancialSummary(
  bills: Bill[],
  subscriptions: Subscription[]
): FinancialSummary {
  const currentMonth = getBillSummary(bills, 'this_month');
  const subSummary = getSubscriptionSummary(subscriptions);
  
  // Upcoming bills (next 7 days)
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingBills = bills
    .filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return dueDate >= now && dueDate <= nextWeek && bill.status === BillStatus.PENDING;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  // Recently paid (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentlyPaid = bills
    .filter(bill => {
      if (bill.status !== BillStatus.PAID || !bill.paidDate) return false;
      const paidDate = new Date(bill.paidDate);
      return paidDate >= thirtyDaysAgo;
    })
    .sort((a, b) => {
      const dateA = a.paidDate ? new Date(a.paidDate).getTime() : 0;
      const dateB = b.paidDate ? new Date(b.paidDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);
  
  // Generate calm message (no pressure, no guilt)
  const calmMessage = generateCalmMessage(currentMonth, subSummary, upcomingBills);
  
  return {
    currentMonth,
    subscriptions: subSummary,
    upcomingBills,
    recentlyPaid,
    calmMessage,
  };
}

/**
 * Generate calm message (no alerts, no guilt language)
 */
function generateCalmMessage(
  currentMonth: BillSummary,
  subscriptions: SubscriptionSummary,
  upcomingBills: Bill[]
): string {
  const messages: string[] = [];
  
  // Current month overview (factual, not judgmental)
  if (currentMonth.totalBills > 0) {
    const paidPercentage = currentMonth.totalAmount > 0 
      ? Math.round((currentMonth.paidAmount / currentMonth.totalAmount) * 100)
      : 0;
    
    if (paidPercentage === 100) {
      messages.push(`All ${currentMonth.totalBills} bill${currentMonth.totalBills !== 1 ? 's' : ''} for this month ${currentMonth.totalBills === 1 ? 'has' : 'have'} been taken care of.`);
    } else if (paidPercentage >= 50) {
      messages.push(`You're about ${paidPercentage}% through this month's bills.`);
    } else {
      messages.push(`You have ${currentMonth.totalBills} bill${currentMonth.totalBills !== 1 ? 's' : ''} this month, with ${currentMonth.pendingAmount.toFixed(2)} ${currentMonth.currency} remaining.`);
    }
  }
  
  // Subscription overview (informative)
  if (subscriptions.totalSubscriptions > 0) {
    messages.push(`Your recurring subscriptions total about ${subscriptions.monthlyTotal.toFixed(2)} ${subscriptions.currency} per month.`);
  }
  
  // Upcoming bills (gentle reminder, not urgent)
  if (upcomingBills.length > 0) {
    if (upcomingBills.length === 1) {
      messages.push(`One bill is coming up in the next week.`);
    } else {
      messages.push(`${upcomingBills.length} bills are coming up in the next week.`);
    }
  }
  
  // If no bills or all paid, positive message
  if (currentMonth.totalBills === 0 && subscriptions.totalSubscriptions === 0) {
    messages.push(`Your financial overview looks clear at the moment.`);
  }
  
  return messages.length > 0 ? messages.join(' ') : 'Your financial information is being tracked.';
}

/**
 * Check if bill is overdue
 */
export function isBillOverdue(bill: Bill): boolean {
  if (bill.status === BillStatus.PAID || bill.status === BillStatus.CANCELLED) {
    return false;
  }
  
  const dueDate = new Date(bill.dueDate);
  const now = new Date();
  return dueDate < now;
}

/**
 * Check if bill is due soon (within 7 days)
 */
export function isBillDueSoon(bill: Bill): boolean {
  if (bill.status === BillStatus.PAID || bill.status === BillStatus.CANCELLED) {
    return false;
  }
  
  const dueDate = new Date(bill.dueDate);
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return dueDate >= now && dueDate <= nextWeek;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date for display (calm, non-urgent)
 */
export function formatBillDate(dateString: Timestamp): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (itemDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (itemDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
