/**
 * Smart Prompt Component
 * Displays contextual questions and prompts based on mood
 */

import { SmartQuestion, QuestionType } from '@/types/mood';
import './SmartPrompt.css';

interface SmartPromptProps {
  question: SmartQuestion;
  onDismiss: (questionId: string) => void;
  onAction?: (questionId: string, action?: string) => void;
}

export function SmartPrompt({ question, onDismiss, onAction }: SmartPromptProps) {
  const handleDismiss = () => {
    onDismiss(question.id);
  };

  const handleAction = (action?: string) => {
    if (onAction) {
      onAction(question.id, action);
    }
    onDismiss(question.id);
  };

  const getPromptIcon = () => {
    switch (question.type) {
      case QuestionType.CHEER_UP:
        return '💭';
      case QuestionType.CLARIFYING:
        return '❓';
      case QuestionType.REFLECTION:
        return '💡';
      case QuestionType.FOLLOW_UP:
        return '💬';
      default:
        return '💭';
    }
  };

  const getPromptStyle = () => {
    switch (question.type) {
      case QuestionType.CHEER_UP:
        return 'smart-prompt--cheer';
      case QuestionType.CLARIFYING:
        return 'smart-prompt--clarifying';
      case QuestionType.REFLECTION:
        return 'smart-prompt--reflection';
      case QuestionType.FOLLOW_UP:
        return 'smart-prompt--followup';
      default:
        return '';
    }
  };

  return (
    <div className={`smart-prompt ${getPromptStyle()}`}>
      <div className="smart-prompt__content">
        <div className="smart-prompt__icon">{getPromptIcon()}</div>
        <div className="smart-prompt__text">
          <p className="smart-prompt__question">{question.question}</p>
          {question.suggestedActions && question.suggestedActions.length > 0 && (
            <div className="smart-prompt__actions">
              {question.suggestedActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(action)}
                  className="smart-prompt__action-button"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="smart-prompt__dismiss"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
