/**
 * Action Planner
 * Plans actions based on intents (no execution)
 */

import { Intent, PlannedAction, ActionStep, ActionStatus, IntentAction } from '../types';

export class ActionPlanner {
  /**
   * Create an action plan from an intent
   * This is a placeholder - no actual execution happens
   */
  async planAction(intent: Intent): Promise<PlannedAction> {
    const steps = this.createSteps(intent);
    const requiresConfirmation = this.requiresConfirmation(intent);
    const priority = this.calculatePriority(intent);
    const estimatedDuration = this.estimateDuration(steps);

    return {
      id: this.generateId(),
      intent,
      status: ActionStatus.PLANNED,
      steps,
      estimatedDuration,
      priority,
      requiresConfirmation,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Create action steps from intent
   * Placeholder implementation
   */
  private createSteps(intent: Intent): ActionStep[] {
    // Placeholder: create basic steps based on action type
    const steps: ActionStep[] = [];

    switch (intent.action) {
      case IntentAction.CREATE_TASK:
        steps.push({
          id: this.generateStepId(),
          type: 'validate',
          description: 'Validate task parameters',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'create',
          description: 'Create task entity',
          parameters: {},
          dependencies: ['validate'],
        });
        break;

      case IntentAction.CREATE_EVENT:
        steps.push({
          id: this.generateStepId(),
          type: 'validate',
          description: 'Validate event parameters',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'create',
          description: 'Create event entity',
          parameters: {},
          dependencies: ['validate'],
        });
        break;

      case IntentAction.UPLOAD_DOCUMENT:
        steps.push({
          id: this.generateStepId(),
          type: 'validate',
          description: 'Validate document file',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'ocr',
          description: 'Extract text via OCR',
          parameters: {},
          dependencies: ['validate'],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'classify',
          description: 'Auto-classify document category',
          parameters: {},
          dependencies: ['ocr'],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'store',
          description: 'Store document securely',
          parameters: {},
          dependencies: ['classify'],
        });
        break;

      case IntentAction.SIGN_DOCUMENT:
        steps.push({
          id: this.generateStepId(),
          type: 'validate',
          description: 'Validate document and signer',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'sign',
          description: 'Apply signature to document',
          parameters: {},
          dependencies: ['validate'],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'update',
          description: 'Update document signature status',
          parameters: {},
          dependencies: ['sign'],
        });
        break;

      case IntentAction.SEND_FOR_SIGNATURE:
        steps.push({
          id: this.generateStepId(),
          type: 'validate',
          description: 'Validate document and recipient',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'create_request',
          description: 'Create signature request',
          parameters: {},
          dependencies: ['validate'],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'notify',
          description: 'Send notification to signer',
          parameters: {},
          dependencies: ['create_request'],
        });
        break;

      case IntentAction.SEARCH_DOCUMENTS:
      case IntentAction.LIST_DOCUMENTS:
        steps.push({
          id: this.generateStepId(),
          type: 'search',
          description: 'Search or list documents',
          parameters: {},
          dependencies: [],
        });
        break;

      case IntentAction.DRAFT_EMAIL:
        steps.push({
          id: this.generateStepId(),
          type: 'generate',
          description: 'Generate AI email draft',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'review',
          description: 'Review and approve draft',
          parameters: {},
          dependencies: ['generate'],
        });
        break;

      case IntentAction.SEND_EMAIL:
        steps.push({
          id: this.generateStepId(),
          type: 'validate',
          description: 'Validate email recipients and content',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'confirm',
          description: 'Confirm sending (no auto-send)',
          parameters: {},
          dependencies: ['validate'],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'send',
          description: 'Send email after approval',
          parameters: {},
          dependencies: ['confirm'],
        });
        break;

      case IntentAction.READ_EMAIL:
      case IntentAction.LIST_EMAILS:
      case IntentAction.SEARCH_EMAILS:
        steps.push({
          id: this.generateStepId(),
          type: 'fetch',
          description: 'Fetch emails from inbox',
          parameters: {},
          dependencies: [],
        });
        break;

      case IntentAction.SUMMARIZE_THREAD:
        steps.push({
          id: this.generateStepId(),
          type: 'fetch',
          description: 'Fetch email thread',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'summarize',
          description: 'Generate thread summary',
          parameters: {},
          dependencies: ['fetch'],
        });
        break;

      case IntentAction.SUGGEST_CONTACTS:
        steps.push({
          id: this.generateStepId(),
          type: 'analyze',
          description: 'Analyze context for contact suggestions',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'suggest',
          description: 'Generate smart contact suggestions',
          parameters: {},
          dependencies: ['analyze'],
        });
        break;

      case IntentAction.CREATE_FOLLOWUP:
        steps.push({
          id: this.generateStepId(),
          type: 'create',
          description: 'Create follow-up reminder',
          parameters: {},
          dependencies: [],
        });
        break;

      case IntentAction.SEND_REMINDER:
        steps.push({
          id: this.generateStepId(),
          type: 'check',
          description: 'Check if reminder is needed',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'send',
          description: 'Send gentle reminder',
          parameters: {},
          dependencies: ['check'],
        });
        break;

      case IntentAction.CREATE_BILL:
        steps.push({
          id: this.generateStepId(),
          type: 'detect',
          description: 'Detect bill from email or document',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'extract',
          description: 'Extract bill details (amount, due date, payee)',
          parameters: {},
          dependencies: ['detect'],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'create',
          description: 'Create bill entity',
          parameters: {},
          dependencies: ['extract'],
        });
        break;

      case IntentAction.LIST_BILLS:
        steps.push({
          id: this.generateStepId(),
          type: 'fetch',
          description: 'Fetch bills',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'summarize',
          description: 'Generate calm financial summary',
          parameters: {},
          dependencies: ['fetch'],
        });
        break;

      case IntentAction.PAY_BILL:
        steps.push({
          id: this.generateStepId(),
          type: 'validate',
          description: 'Validate bill and payment method',
          parameters: {},
          dependencies: [],
        });
        steps.push({
          id: this.generateStepId(),
          type: 'update',
          description: 'Update bill status to paid',
          parameters: {},
          dependencies: ['validate'],
        });
        break;

      default:
        steps.push({
          id: this.generateStepId(),
          type: 'unknown',
          description: 'Unknown action type',
          parameters: {},
          dependencies: [],
        });
    }

    return steps;
  }

  /**
   * Determine if action requires confirmation
   */
  private requiresConfirmation(intent: Intent): boolean {
    // Placeholder: destructive actions require confirmation
    const destructiveActions = [
      IntentAction.DELETE_TASK,
      IntentAction.DELETE_EVENT,
      IntentAction.DELETE_NOTE,
    ];
    // Signature actions also require confirmation
    const signatureActions = [
      IntentAction.SIGN_DOCUMENT,
      IntentAction.SEND_FOR_SIGNATURE,
    ];
    // Email sending requires confirmation (no auto-send)
    const emailActions = [
      IntentAction.SEND_EMAIL,
    ];
    return destructiveActions.includes(intent.action) || 
           signatureActions.includes(intent.action) ||
           emailActions.includes(intent.action);
  }

  /**
   * Calculate action priority
   */
  private calculatePriority(intent: Intent): number {
    // Placeholder: return medium priority
    return 50;
  }

  /**
   * Estimate duration of action steps
   */
  private estimateDuration(steps: ActionStep[]): number {
    // Placeholder: estimate based on number of steps
    return steps.length * 2; // 2 seconds per step
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique step ID
   */
  private generateStepId(): string {
    return `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
