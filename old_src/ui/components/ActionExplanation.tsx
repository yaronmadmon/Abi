/**
 * Action Explanation Component
 * "Why did you do this?" explanations
 */

import { ActionExplanation } from '@/types/trust';
import './ActionExplanation.css';

interface ActionExplanationProps {
  explanation: ActionExplanation;
  onClose?: () => void;
}

export function ActionExplanationComponent({ explanation, onClose }: ActionExplanationProps) {
  return (
    <div className="action-explanation">
      <div className="action-explanation__header">
        <h3 className="action-explanation__title">Why did this happen?</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="action-explanation__close"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>

      <div className="action-explanation__body">
        <div className="action-explanation__main">
          <p className="action-explanation__text">{explanation.explanation}</p>
        </div>

        {explanation.reasoning.length > 0 && (
          <div className="action-explanation__reasoning">
            <h4 className="action-explanation__reasoning-title">Reasoning:</h4>
            <ul className="action-explanation__reasoning-list">
              {explanation.reasoning.map((reason, index) => (
                <li key={index} className="action-explanation__reasoning-item">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="action-explanation__meta">
          <div className="action-explanation__meta-item">
            <span className="action-explanation__meta-label">Action:</span>
            <span className="action-explanation__meta-value">{explanation.action}</span>
          </div>
          <div className="action-explanation__meta-item">
            <span className="action-explanation__meta-label">Entity Type:</span>
            <span className="action-explanation__meta-value">{explanation.entityType}</span>
          </div>
          <div className="action-explanation__meta-item">
            <span className="action-explanation__meta-label">Confidence:</span>
            <span className="action-explanation__meta-value">
              {Math.round(explanation.confidence * 100)}%
            </span>
          </div>
          <div className="action-explanation__meta-item">
            <span className="action-explanation__meta-label">Time:</span>
            <span className="action-explanation__meta-value">
              {new Date(explanation.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
