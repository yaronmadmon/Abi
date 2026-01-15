/**
 * Smart Home Page
 * Device control and automation management
 */

import { useState, useEffect, useMemo } from 'react';
import { SmartDevice, AutomationRule, AutomationRuleStatus, DeviceAction, ManualOverride } from '@/types/smarthome';
import { DeviceCard } from '@/ui/components/DeviceCard';
import { AutomationRuleCard } from '@/ui/components/AutomationRuleCard';
import { useEmotionalContext } from '@/context/EmotionalContext';
import {
  controlDevice,
  getDeviceTypeIcon,
} from '@/utils/devices';
import {
  shouldRuleExecute,
  executeAutomationRule,
  calculateNextScheduledTime,
} from '@/utils/automation';
import './Page.css';
import './SmartHome.css';

// Placeholder data - in production, this would come from a data store
const placeholderDevices: SmartDevice[] = [];
const placeholderRules: AutomationRule[] = [];

export function SmartHome() {
  const [devices, setDevices] = useState<SmartDevice[]>(placeholderDevices);
  const [rules, setRules] = useState<AutomationRule[]>(placeholderRules);
  const [manualOverrides, setManualOverrides] = useState<ManualOverride[]>([]);
  const [activeTab, setActiveTab] = useState<'devices' | 'automations'>('devices');
  const { currentMood } = useEmotionalContext();

  // Update scheduled times for time-based rules
  useEffect(() => {
    const updatedRules = rules.map(rule => {
      if (rule.trigger.type === 'time' && rule.enabled) {
        const nextScheduled = calculateNextScheduledTime(rule.trigger);
        return { ...rule, nextScheduledAt: nextScheduled };
      }
      return rule;
    });
    setRules(updatedRules);
  }, []);

  // Check and execute automation rules periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndExecuteRules();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [devices, rules, manualOverrides, currentMood]);

  const checkAndExecuteRules = async () => {
    const activeRules = rules.filter(rule => rule.enabled && rule.status === AutomationRuleStatus.ACTIVE);
    
    for (const rule of activeRules) {
      const shouldExecute = shouldRuleExecute(rule, {
        currentTime: new Date(),
        deviceStates: devices,
        currentMood: currentMood?.mood || null,
        manualOverrides,
      });

      if (shouldExecute) {
        try {
          const execution = await executeAutomationRule(rule, devices);
          
          if (execution.success) {
            // Update devices based on executed actions
            const updatedDevices = [...devices];
            for (const action of execution.actionsExecuted) {
              if (action.type !== 'notify') {
                const deviceIndex = updatedDevices.findIndex(d => d.id === action.deviceId);
                if (deviceIndex >= 0) {
                  const device = updatedDevices[deviceIndex];
                  const updatedDevice = await controlDevice(device, action);
                  updatedDevices[deviceIndex] = updatedDevice;
                }
              }
            }
            setDevices(updatedDevices);

            // Update rule with last triggered time
            setRules(prevRules =>
              prevRules.map(r =>
                r.id === rule.id
                  ? { ...r, lastTriggeredAt: execution.triggeredAt }
                  : r
              )
            );
          }
        } catch (error) {
          console.error('Error executing automation rule:', error);
        }
      }
    }
  };

  // Handle device control (manual override always available)
  const handleDeviceControl = async (device: SmartDevice, action: DeviceAction) => {
    try {
      const updatedDevice = await controlDevice(device, action);
      setDevices(devices.map(d => (d.id === device.id ? updatedDevice : d)));

      // Create manual override for affected automation rules
      const affectedRules = rules.filter(rule =>
        rule.actions.some(a => a.deviceId === device.id) && rule.enabled
      );

      affectedRules.forEach(rule => {
        if (rule.manualOverride) {
          const override: ManualOverride = {
            id: `override-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            deviceId: device.id,
            reason: 'Manual control',
            overriddenAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
            originalState: device.state,
          };
          setManualOverrides(prev => [...prev, override]);
        }
      });
    } catch (error) {
      console.error('Error controlling device:', error);
    }
  };

  // Toggle automation rule
  const handleToggleRule = (rule: AutomationRule) => {
    setRules(
      rules.map(r =>
        r.id === rule.id
          ? {
              ...r,
              enabled: !r.enabled,
              status: !r.enabled ? AutomationRuleStatus.ACTIVE : AutomationRuleStatus.PAUSED,
            }
          : r
      )
    );
  };

  // Group devices by type
  const devicesByType = useMemo(() => {
    const groups: Record<string, SmartDevice[]> = {};
    devices.forEach(device => {
      if (!groups[device.type]) {
        groups[device.type] = [];
      }
      groups[device.type].push(device);
    });
    return groups;
  }, [devices]);

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Smart Home</h1>
        <p className="page__description">
          Control your devices and manage automation rules. Manual control always available.
        </p>
      </div>

      <div className="smarthome__tabs">
        <button
          onClick={() => setActiveTab('devices')}
          className={`smarthome__tab ${activeTab === 'devices' ? 'smarthome__tab--active' : ''}`}
        >
          Devices
        </button>
        <button
          onClick={() => setActiveTab('automations')}
          className={`smarthome__tab ${activeTab === 'automations' ? 'smarthome__tab--active' : ''}`}
        >
          Automations
        </button>
      </div>

      {activeTab === 'devices' && (
        <div className="smarthome__devices">
          {Object.keys(devicesByType).length === 0 ? (
            <div className="smarthome__empty">
              <div className="smarthome__empty-icon">🏠</div>
              <p className="smarthome__empty-text">
                No devices connected. Connect your smart home devices to get started.
              </p>
            </div>
          ) : (
            Object.entries(devicesByType).map(([type, typeDevices]) => (
              <div key={type} className="smarthome__device-group">
                <h2 className="smarthome__group-title">
                  {getDeviceTypeIcon(type as any)} {type.charAt(0).toUpperCase() + type.slice(1)}s
                </h2>
                <div className="smarthome__device-list">
                  {typeDevices.map((device) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      onControl={handleDeviceControl}
                      showControls={true}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'automations' && (
        <div className="smarthome__automations">
          <div className="smarthome__automations-header">
            <p className="smarthome__automations-description">
              Automation rules run automatically based on triggers. You can always manually control devices or override automations.
            </p>
          </div>

          {rules.length === 0 ? (
            <div className="smarthome__empty">
              <div className="smarthome__empty-icon">⚙️</div>
              <p className="smarthome__empty-text">
                No automation rules yet. Create rules to automate your smart home.
              </p>
            </div>
          ) : (
            <div className="smarthome__rules-list">
              {rules.map((rule) => (
                <AutomationRuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={handleToggleRule}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
