/**
 * Input Area Component
 * Handles brain dump mode and free-form input
 */

import { useState, useRef, useEffect } from 'react';
import { useEmotionalContext } from '@/context/EmotionalContext';
import './InputArea.css';

export enum InputMode {
  FREE_FORM = 'free-form',
  BRAIN_DUMP = 'brain-dump',
}

interface InputAreaProps {
  mode: InputMode;
  onInput: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function InputArea({ mode, onInput, placeholder, disabled }: InputAreaProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateMoodFromInput } = useEmotionalContext();

  useEffect(() => {
    // Auto-focus on mount
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      // Update mood from input before processing
      updateMoodFromInput(text.trim());
      
      onInput(text.trim());
      setText('');
      // Refocus after submit
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const isBrainDump = mode === InputMode.BRAIN_DUMP;
  const defaultPlaceholder = isBrainDump
    ? 'Dump your thoughts... (press Cmd+Enter or Ctrl+Enter to parse)'
    : 'Type something... (press Cmd+Enter or Ctrl+Enter)';

  return (
    <form onSubmit={handleSubmit} className="input-area">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || defaultPlaceholder}
        disabled={disabled}
        className={`input-area__textarea ${isBrainDump ? 'input-area__textarea--brain-dump' : ''}`}
        rows={isBrainDump ? 4 : 2}
      />
      {text.trim() && (
        <button
          type="submit"
          disabled={disabled}
          className="input-area__submit"
          aria-label="Submit input"
        >
          Parse
        </button>
      )}
    </form>
  );
}
