/**
 * Undo System Utilities
 * Track actions and enable undo/redo
 */

import {
  UndoableAction,
  UndoHistory,
  AuditLogAction,
  AuditLogEntityType,
} from '@/types/trust';

const MAX_HISTORY_SIZE = 100;

/**
 * Create undo history
 */
export function createUndoHistory(): UndoHistory {
  return {
    past: [],
    future: [],
    maxHistorySize: MAX_HISTORY_SIZE,
  };
}

/**
 * Add action to undo history
 */
export function addToUndoHistory(
  history: UndoHistory,
  action: UndoableAction
): UndoHistory {
  const newPast = [action, ...history.past].slice(0, history.maxHistorySize);
  
  return {
    ...history,
    past: newPast,
    future: [], // Clear future when new action is added
  };
}

/**
 * Undo last action
 */
export async function undoLastAction(
  history: UndoHistory
): Promise<{ history: UndoHistory; undoneAction: UndoableAction | null }> {
  if (history.past.length === 0) {
    return { history, undoneAction: null };
  }
  
  const [lastAction, ...remainingPast] = history.past;
  
  // Execute undo action
  await lastAction.undoAction();
  
  // Move to future for redo
  const newFuture = [lastAction, ...history.future];
  
  return {
    history: {
      ...history,
      past: remainingPast,
      future: newFuture.slice(0, history.maxHistorySize),
    },
    undoneAction: lastAction,
  };
}

/**
 * Redo last undone action
 */
export async function redoLastAction(
  history: UndoHistory
): Promise<{ history: UndoHistory; redoneAction: UndoableAction | null }> {
  if (history.future.length === 0) {
    return { history, redoneAction: null };
  }
  
  const [lastUndone, ...remainingFuture] = history.future;
  
  // Execute redo action
  await lastUndone.redoAction();
  
  // Move back to past
  const newPast = [lastUndone, ...history.past];
  
  return {
    history: {
      ...history,
      past: newPast.slice(0, history.maxHistorySize),
      future: remainingFuture,
    },
    redoneAction: lastUndone,
  };
}

/**
 * Create undoable action
 */
export function createUndoableAction(
  type: AuditLogAction,
  entityType: AuditLogEntityType,
  entityId: string,
  description: string,
  undoAction: () => Promise<void>,
  redoAction: () => Promise<void>
): UndoableAction {
  return {
    id: `undo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    entityType,
    entityId,
    undoAction,
    redoAction,
    description,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if undo is available
 */
export function canUndo(history: UndoHistory): boolean {
  return history.past.length > 0;
}

/**
 * Check if redo is available
 */
export function canRedo(history: UndoHistory): boolean {
  return history.future.length > 0;
}

/**
 * Clear undo history
 */
export function clearUndoHistory(history: UndoHistory): UndoHistory {
  return {
    ...history,
    past: [],
    future: [],
  };
}

/**
 * Get undo history summary
 */
export function getUndoHistorySummary(history: UndoHistory): {
  canUndo: boolean;
  canRedo: boolean;
  nextUndo?: string;
  nextRedo?: string;
  totalActions: number;
} {
  return {
    canUndo: canUndo(history),
    canRedo: canRedo(history),
    nextUndo: history.past[0]?.description,
    nextRedo: history.future[0]?.description,
    totalActions: history.past.length + history.future.length,
  };
}
