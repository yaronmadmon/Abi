/**
 * Trust Rules
 * Enforces trust and transparency principles
 * Core principle: User always has control and understanding
 */

/**
 * Trust Rules
 * Enforces trust principles
 */
export class TrustRules {
  /**
   * Check if action requires explanation
   */
  static requiresExplanation(params: {
    actionType: string;
    isAutomated: boolean;
    modifiesData: boolean;
    userInitiated: boolean;
  }): boolean {
    // Always explain automated actions
    if (params.isAutomated && !params.userInitiated) {
      return true;
    }

    // Explain data modifications
    if (params.modifiesData && !params.userInitiated) {
      return true;
    }

    // Explain high-impact actions
    const highImpactActions = [
      'delete',
      'archive',
      'send',
      'share',
      'publish',
      'modify_settings',
    ];
    
    if (highImpactActions.some(action => params.actionType.includes(action))) {
      return true;
    }

    return false;
  }

  /**
   * Check if action requires confirmation
   */
  static requiresConfirmation(params: {
    actionType: string;
    isDestructive: boolean;
    isIrreversible: boolean;
    affectsOthers: boolean;
  }): boolean {
    // Always confirm destructive actions
    if (params.isDestructive) {
      return true;
    }

    // Always confirm irreversible actions
    if (params.isIrreversible) {
      return true;
    }

    // Confirm actions affecting others
    if (params.affectsOthers) {
      return true;
    }

    // Confirm high-impact actions
    const highImpactActions = [
      'delete',
      'archive',
      'send_email',
      'share_document',
      'publish',
      'modify_privacy_settings',
    ];
    
    if (highImpactActions.some(action => params.actionType.includes(action))) {
      return true;
    }

    return false;
  }

  /**
   * Check if action should be logged
   */
  static shouldLog(params: {
    actionType: string;
    isUserInitiated: boolean;
    isAutomated: boolean;
    modifiesData: boolean;
  }): boolean {
    // Always log data modifications
    if (params.modifiesData) {
      return true;
    }

    // Always log automated actions
    if (params.isAutomated) {
      return true;
    }

    // Log significant user actions
    const significantActions = [
      'create',
      'update',
      'delete',
      'archive',
      'send',
      'share',
      'publish',
    ];
    
    if (significantActions.some(action => params.actionType.includes(action))) {
      return true;
    }

    return false;
  }

  /**
   * Check if undo should be available
   */
  static isUndoAvailable(params: {
    actionType: string;
    isReversible: boolean;
    timeSinceAction?: number; // Minutes
  }): boolean {
    // If explicitly reversible, undo is available
    if (params.isReversible) {
      return true;
    }

    // Most actions should have undo
    const irreversibleActions = [
      'permanent_delete',
      'irreversible_archive',
      'send_email', // Once sent, can't undo
    ];
    
    if (irreversibleActions.some(action => params.actionType.includes(action))) {
      return false;
    }

    // Default: undo available for most actions
    return true;
  }

  /**
   * Check if action requires audit log entry
   */
  static requiresAuditLog(params: {
    actionType: string;
    isUserInitiated: boolean;
    isAutomated: boolean;
    modifiesData: boolean;
    isSensitive: boolean;
  }): boolean {
    // Always log sensitive actions
    if (params.isSensitive) {
      return true;
    }

    // Always log data modifications
    if (params.modifiesData) {
      return true;
    }

    // Always log automated actions
    if (params.isAutomated) {
      return true;
    }

    // Log user actions that modify state
    if (params.isUserInitiated && params.modifiesData) {
      return true;
    }

    return false;
  }

  /**
   * Get explanation template for action
   */
  static getExplanationTemplate(actionType: string): string {
    const templates: Record<string, string> = {
      'create': 'Created {entity}',
      'update': 'Updated {entity}',
      'delete': 'Deleted {entity}',
      'archive': 'Archived {entity}',
      'send_email': 'Sent email to {recipient}',
      'share_document': 'Shared {document} with {recipient}',
      'modify_settings': 'Changed {setting} to {value}',
      'automated_action': 'Automatically {action} based on {trigger}',
    };

    // Find matching template
    const key = Object.keys(templates).find(k => actionType.includes(k));
    return key ? templates[key] : `Performed ${actionType}`;
  }
}
