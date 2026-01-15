/**
 * Undo Button Component
 * Global undo/redo controls
 */

import { useUndo } from '@/context/UndoContext';
import './UndoButton.css';

interface UndoButtonProps {
  className?: string;
}

export function UndoButton({ className = '' }: UndoButtonProps) {
  const { undo, redo, canUndo, canRedo } = useUndo();

  return (
    <div className={`undo-button ${className}`}>
      <button
        onClick={undo}
        disabled={!canUndo}
        className="undo-button__button undo-button__button--undo"
        aria-label="Undo"
        title="Undo last action"
      >
        ↶ Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="undo-button__button undo-button__button--redo"
        aria-label="Redo"
        title="Redo last undone action"
      >
        ↷ Redo
      </button>
    </div>
  );
}
