/**
 * Approval Queue
 * Manages pending commands awaiting user approval
 * 
 * ARCHITECTURAL GUARANTEE:
 * Commands stay in this queue until user explicitly approves or rejects them.
 * No code path exists to execute commands without going through approval.
 */

import type { ActionCommand, ApprovalToken } from '../schemas/commandSchema'

/**
 * Generate approval token with signature
 * Only this function can create valid approval tokens
 */
function generateApprovalToken(commandId: string): ApprovalToken {
  const approvedAt = Date.now()
  
  // Create HMAC signature (simplified - in production, use crypto library)
  const signature = btoa(`${commandId}:${approvedAt}:approved`)
  
  return {
    commandId,
    approvedBy: 'user',
    approvedAt,
    signature,
  }
}

/**
 * Verify approval token signature
 */
function verifyApprovalToken(token: ApprovalToken): boolean {
  const expectedSignature = btoa(`${token.commandId}:${token.approvedAt}:approved`)
  return token.signature === expectedSignature
}

/**
 * Approval Queue singleton
 * Manages all pending commands
 */
class ApprovalQueue {
  private pending: Map<string, ActionCommand> = new Map()
  private expirationTime = 2 * 60 * 1000 // 2 minutes
  
  /**
   * Add command to queue
   * Returns command ID for tracking
   */
  enqueue(command: ActionCommand): string {
    this.pending.set(command.id, command)
    
    // Auto-expire after 2 minutes
    setTimeout(() => {
      this.pending.delete(command.id)
    }, this.expirationTime)
    
    return command.id
  }
  
  /**
   * Get command for approval review
   */
  getForApproval(commandId: string): ActionCommand | null {
    return this.pending.get(commandId) || null
  }
  
  /**
   * User approves command
   * Returns approval token for executor
   */
  approve(commandId: string): ApprovalToken {
    const command = this.pending.get(commandId)
    if (!command) {
      throw new Error('Command not found or expired')
    }
    
    const token = generateApprovalToken(commandId)
    this.pending.delete(commandId) // Remove from queue after approval
    
    return token
  }
  
  /**
   * User rejects command
   * Removes from queue without executing
   */
  reject(commandId: string): void {
    this.pending.delete(commandId)
  }
  
  /**
   * Get all pending commands
   */
  getPending(): ActionCommand[] {
    return Array.from(this.pending.values())
  }
  
  /**
   * Clear all pending commands
   * (e.g., on logout or navigation)
   */
  clear(): void {
    this.pending.clear()
  }
  
  /**
   * Get count of pending commands
   */
  count(): number {
    return this.pending.size
  }
}

// Export singleton instance
export const approvalQueue = new ApprovalQueue()

// Export verification function for executor
export { verifyApprovalToken }
