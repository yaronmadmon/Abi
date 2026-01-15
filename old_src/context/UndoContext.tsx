/**
 * Undo Context Provider
 * Global undo/redo system
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  UndoableAction,
  UndoHistory,
} from '@/types/trust';
import {
  createUndoHistory,
  addToUndoHistory,
  undoLastAction,
  redoLastAction,
  canUndo,
  canRedo,
} from '@/utils/undo';

interface UndoContextValue {
  history: UndoHistory;
  addAction: (action: UndoableAction) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
}

const UndoContext = createContext<UndoContextValue | undefined>(undefined);

export function UndoProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<UndoHistory>(createUndoHistory());

  const addAction = useCallback((action: UndoableAction) => {
    setHistory(prev => addToUndoHistory(prev, action));
  }, []);

  const undo = useCallback(async () => {
    const result = await undoLastAction(history);
    setHistory(result.history);
  }, [history]);

  const redo = useCallback(async () => {
    const result = await redoLastAction(history);
    setHistory(result.history);
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory(createUndoHistory());
  }, []);

  const value: UndoContextValue = {
    history,
    addAction,
    undo,
    redo,
    canUndo: canUndo(history),
    canRedo: canRedo(history),
    clearHistory,
  };

  return (
    <UndoContext.Provider value={value}>
      {children}
    </UndoContext.Provider>
  );
}

export function useUndo() {
  const context = useContext(UndoContext);
  if (context === undefined) {
    throw new Error('useUndo must be used within UndoProvider');
  }
  return context;
}
