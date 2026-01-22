'use client'

/**
 * useApprovalQueue Hook
 * React hook for managing approval queue state
 */

import { useState, useCallback } from 'react'
import type { ActionCommand, ActionProposal, ExecutionResult } from '@/ai/schemas/commandSchema'
import { approvalQueue } from '@/ai/execution/approvalQueue'
import { commandExecutor } from '@/ai/execution/commandExecutor'

export function useApprovalQueue() {
  const [pendingProposal, setPendingProposal] = useState<ActionProposal | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  
  /**
   * Enqueue a proposal for user approval
   */
  const enqueueProposal = useCallback((proposal: ActionProposal) => {
    // Add command to approval queue
    approvalQueue.enqueue(proposal.command)
    
    // Show proposal to user
    setPendingProposal(proposal)
  }, [])
  
  /**
   * User approves the proposal
   */
  const approve = useCallback(async (commandId: string): Promise<ExecutionResult> => {
    setIsExecuting(true)
    
    try {
      // Generate approval token
      const approvalToken = approvalQueue.approve(commandId)
      
      // Get command from pending proposal
      const command = pendingProposal?.command
      if (!command) {
        throw new Error('No pending command')
      }
      
      // Execute with approval token
      const result = await commandExecutor.executeCommand(command, approvalToken)
      
      // Clear pending proposal
      setPendingProposal(null)
      
      return result
    } catch (error) {
      console.error('Approval execution failed:', error)
      return {
        commandId,
        success: false,
        message: 'Failed to execute command',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      setIsExecuting(false)
    }
  }, [pendingProposal])
  
  /**
   * User rejects the proposal
   */
  const reject = useCallback((commandId: string) => {
    // Remove from queue
    approvalQueue.reject(commandId)
    
    // Clear pending proposal
    setPendingProposal(null)
  }, [])
  
  /**
   * Clear pending proposal
   */
  const clear = useCallback(() => {
    setPendingProposal(null)
  }, [])
  
  return {
    pendingProposal,
    isExecuting,
    enqueueProposal,
    approve,
    reject,
    clear,
  }
}
