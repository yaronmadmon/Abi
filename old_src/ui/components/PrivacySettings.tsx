/**
 * Privacy Settings Component
 * Manage privacy controls and data settings
 */

import { PrivacySetting, PrivacyLevel, AuditLogEntityType } from '@/types/trust';
import { formatPrivacyLevel, getPrivacyLevelDescription, getDefaultPrivacySetting } from '@/utils/privacy';
import './PrivacySettings.css';

interface PrivacySettingsProps {
  settings: PrivacySetting[];
  onUpdate?: (setting: PrivacySetting) => void;
}

export function PrivacySettings({ settings, onUpdate }: PrivacySettingsProps) {
  const handleUpdate = (setting: PrivacySetting, updates: Partial<PrivacySetting>) => {
    if (onUpdate) {
      onUpdate({
        ...setting,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="privacy-settings">
      <div className="privacy-settings__header">
        <h3 className="privacy-settings__title">Privacy Settings</h3>
        <p className="privacy-settings__description">
          Control who can see and access your data. These settings apply to all items of each type.
        </p>
      </div>

      <div className="privacy-settings__list">
        {Object.values(AuditLogEntityType).map((entityType) => {
          const setting = settings.find(s => s.entityType === entityType);
          const defaultPrivacy = getDefaultPrivacySetting(entityType);
          const currentPrivacy = setting?.defaultPrivacy || defaultPrivacy;

          return (
            <div key={entityType} className="privacy-setting-item">
              <div className="privacy-setting-item__header">
                <h4 className="privacy-setting-item__name">
                  {entityType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h4>
                <div className="privacy-setting-item__privacy">
                  <select
                    value={currentPrivacy}
                    onChange={(e) => {
                      if (setting) {
                        handleUpdate(setting, { defaultPrivacy: e.target.value as PrivacyLevel });
                      }
                    }}
                    className="privacy-setting-item__select"
                  >
                    {Object.values(PrivacyLevel).map((level) => (
                      <option key={level} value={level}>
                        {formatPrivacyLevel(level)}
                      </option>
                    ))}
                  </select>
                  <p className="privacy-setting-item__description">
                    {getPrivacyLevelDescription(currentPrivacy)}
                  </p>
                </div>
              </div>

              <div className="privacy-setting-item__controls">
                <label className="privacy-setting-item__control">
                  <input
                    type="checkbox"
                    checked={setting?.allowSharing ?? true}
                    onChange={(e) => {
                      if (setting) {
                        handleUpdate(setting, { allowSharing: e.target.checked });
                      }
                    }}
                    className="privacy-setting-item__checkbox"
                  />
                  <span className="privacy-setting-item__control-label">Allow sharing</span>
                </label>

                <label className="privacy-setting-item__control">
                  <input
                    type="checkbox"
                    checked={setting?.allowExport ?? true}
                    onChange={(e) => {
                      if (setting) {
                        handleUpdate(setting, { allowExport: e.target.checked });
                      }
                    }}
                    className="privacy-setting-item__checkbox"
                  />
                  <span className="privacy-setting-item__control-label">Allow export</span>
                </label>

                <label className="privacy-setting-item__control">
                  <input
                    type="checkbox"
                    checked={setting?.allowAIAccess ?? true}
                    onChange={(e) => {
                      if (setting) {
                        handleUpdate(setting, { allowAIAccess: e.target.checked });
                      }
                    }}
                    className="privacy-setting-item__checkbox"
                  />
                  <span className="privacy-setting-item__control-label">Allow AI access</span>
                </label>

                <label className="privacy-setting-item__control">
                  <input
                    type="checkbox"
                    checked={setting?.requireExplicitConsent ?? false}
                    onChange={(e) => {
                      if (setting) {
                        handleUpdate(setting, { requireExplicitConsent: e.target.checked });
                      }
                    }}
                    className="privacy-setting-item__checkbox"
                  />
                  <span className="privacy-setting-item__control-label">Require explicit consent</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
