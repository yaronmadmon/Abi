/**
 * Audit Log Viewer Component
 * Display audit logs with search and filtering
 */

import { AuditLogEntry, AuditLogAction, AuditLogEntityType } from '@/types/trust';
import { formatAuditLogEntry, getAuditLogSummary } from '@/utils/audit';
import { formatPrivacyLevel } from '@/utils/privacy';
import './AuditLogViewer.css';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
  onViewExplanation?: (log: AuditLogEntry) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filters?: {
    action?: AuditLogAction;
    entityType?: AuditLogEntityType;
    startDate?: string;
    endDate?: string;
  };
  onFilterChange?: (filters: {
    action?: AuditLogAction;
    entityType?: AuditLogEntityType;
    startDate?: string;
    endDate?: string;
  }) => void;
}

export function AuditLogViewer({
  logs,
  onViewExplanation,
  searchQuery = '',
  onSearchChange,
  filters = {},
  onFilterChange,
}: AuditLogViewerProps) {
  const summary = getAuditLogSummary(logs, 30);

  const handleViewExplanation = (log: AuditLogEntry) => {
    if (onViewExplanation) {
      onViewExplanation(log);
    }
  };

  return (
    <div className="audit-log-viewer">
      <div className="audit-log-viewer__header">
        <h3 className="audit-log-viewer__title">Audit Log</h3>
        <div className="audit-log-viewer__summary">
          <span className="audit-log-viewer__summary-item">
            {summary.totalActions} actions in last 30 days
          </span>
        </div>
      </div>

      {onSearchChange && (
        <div className="audit-log-viewer__search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search audit log..."
            className="audit-log-viewer__search-input"
          />
        </div>
      )}

      {onFilterChange && (
        <div className="audit-log-viewer__filters">
          <select
            value={filters.action || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                action: e.target.value ? (e.target.value as AuditLogAction) : undefined,
              })
            }
            className="audit-log-viewer__filter"
          >
            <option value="">All Actions</option>
            {Object.values(AuditLogAction).map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>

          <select
            value={filters.entityType || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                entityType: e.target.value ? (e.target.value as AuditLogEntityType) : undefined,
              })
            }
            className="audit-log-viewer__filter"
          >
            <option value="">All Types</option>
            {Object.values(AuditLogEntityType).map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                startDate: e.target.value || undefined,
              })
            }
            className="audit-log-viewer__filter"
            placeholder="Start date"
          />

          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                endDate: e.target.value || undefined,
              })
            }
            className="audit-log-viewer__filter"
            placeholder="End date"
          />
        </div>
      )}

      <div className="audit-log-viewer__logs">
        {logs.length === 0 ? (
          <div className="audit-log-viewer__empty">No audit log entries found</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="audit-log-entry">
              <div className="audit-log-entry__header">
                <div className="audit-log-entry__info">
                  <span className="audit-log-entry__action">{log.action}</span>
                  <span className="audit-log-entry__entity">{log.entityType}</span>
                  <span className="audit-log-entry__time">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                {log.explanation && onViewExplanation && (
                  <button
                    onClick={() => handleViewExplanation(log)}
                    className="audit-log-entry__explain-button"
                  >
                    Why?
                  </button>
                )}
              </div>
              <div className="audit-log-entry__description">{log.description}</div>
              {log.explanation && (
                <div className="audit-log-entry__explanation">{log.explanation}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
