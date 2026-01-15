/**
 * Trust Page
 * Privacy controls, audit logs, explanations, undo, and lifetime readiness
 */

import { useState, useMemo } from 'react';
import { AuditLogEntry, AuditLogAction, AuditLogEntityType, ActionExplanation, PrivacySetting } from '@/types/trust';
import { AuditLogViewer } from '@/ui/components/AuditLogViewer';
import { ActionExplanationComponent } from '@/ui/components/ActionExplanation';
import { PrivacySettings } from '@/ui/components/PrivacySettings';
import { UndoButton } from '@/ui/components/UndoButton';
import { useUndo } from '@/context/UndoContext';
import { searchAuditLogs } from '@/utils/audit';
import { generateActionExplanation } from '@/utils/audit';
import './Page.css';
import './Trust.css';

// Placeholder data - in production, this would come from a data store
const placeholderAuditLogs: AuditLogEntry[] = [];
const placeholderPrivacySettings: PrivacySetting[] = [];

export function Trust() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(placeholderAuditLogs);
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>(placeholderPrivacySettings);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    action?: AuditLogAction;
    entityType?: AuditLogEntityType;
    startDate?: string;
    endDate?: string;
  }>({});
  const [viewingExplanation, setViewingExplanation] = useState<ActionExplanation | null>(null);
  const [activeTab, setActiveTab] = useState<'privacy' | 'audit' | 'data'>('privacy');
  const { undo, redo, canUndo, canRedo } = useUndo();

  // Filter audit logs
  const filteredLogs = useMemo(() => {
    return searchAuditLogs(auditLogs, searchQuery, filters);
  }, [auditLogs, searchQuery, filters]);

  // Handle view explanation
  const handleViewExplanation = async (log: AuditLogEntry) => {
    // Generate explanation for the action
    const explanation = await generateActionExplanation(log.action, log.entityType, {
      entityId: log.entityId,
      userIntent: log.description,
      trigger: log.metadata?.trigger as string,
    });
    setViewingExplanation(explanation);
  };

  // Handle privacy setting update
  const handlePrivacyUpdate = (setting: PrivacySetting) => {
    setPrivacySettings(prev =>
      prev.map(s => (s.id === setting.id ? setting : s))
    );
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Trust & Privacy</h1>
        <p className="page__description">
          Control your data, view audit logs, and manage privacy settings. This app is designed to be safe to keep forever.
        </p>
      </div>

      {/* Global undo/redo controls */}
      <div className="trust__undo-bar">
        <UndoButton />
      </div>

      <div className="trust__tabs">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`trust__tab ${activeTab === 'privacy' ? 'trust__tab--active' : ''}`}
        >
          Privacy
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`trust__tab ${activeTab === 'audit' ? 'trust__tab--active' : ''}`}
        >
          Audit Log
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`trust__tab ${activeTab === 'data' ? 'trust__tab--active' : ''}`}
        >
          Data Export
        </button>
      </div>

      {activeTab === 'privacy' && (
        <div className="trust__privacy">
          <PrivacySettings
            settings={privacySettings}
            onUpdate={handlePrivacyUpdate}
          />
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="trust__audit">
          <AuditLogViewer
            logs={filteredLogs}
            onViewExplanation={handleViewExplanation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>
      )}

      {activeTab === 'data' && (
        <div className="trust__data">
          <div className="trust__data-section">
            <h3 className="trust__data-title">Export Your Data</h3>
            <p className="trust__data-description">
              Download all your data in JSON, CSV, or PDF format. Exports are available for 7 days.
            </p>
            <button className="trust__data-button">Export All Data</button>
          </div>

          <div className="trust__data-section">
            <h3 className="trust__data-title">Data Retention</h3>
            <p className="trust__data-description">
              Your data is stored securely and will be retained according to your privacy settings. You can delete specific items or entire categories at any time.
            </p>
          </div>
        </div>
      )}

      {viewingExplanation && (
        <div className="trust__explanation-modal">
          <div className="trust__explanation-overlay" onClick={() => setViewingExplanation(null)} />
          <div className="trust__explanation-content">
            <ActionExplanationComponent
              explanation={viewingExplanation}
              onClose={() => setViewingExplanation(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
