/**
 * Automation Engine Utilities
 * Execute automation rules with human-first principles
 */

import {
  AutomationRule,
  AutomationTrigger,
  AutomationTriggerType,
  AutomationAction,
  AutomationExecution,
  ManualOverride,
  SmartDevice,
} from '@/types/smarthome';
import { UserMood } from '@/types/mood';
import { controlDevice, validateDeviceAction } from './devices';

/**
 * Check if a time trigger should fire
 */
export function shouldTimeTriggerFire(trigger: AutomationTrigger): boolean {
  if (trigger.type !== AutomationTriggerType.TIME) {
    return false;
  }
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentDay = now.getDay();
  
  // Check if time matches
  if (trigger.time !== currentTime) {
    return false;
  }
  
  // Check if day of week matches
  if (trigger.daysOfWeek && !trigger.daysOfWeek.includes(currentDay)) {
    return false;
  }
  
  return true;
}

/**
 * Check if a presence trigger should fire
 */
export function shouldPresenceTriggerFire(
  trigger: AutomationTrigger,
  presence: { personId: string; location?: string; present: boolean }
): boolean {
  if (trigger.type !== AutomationTriggerType.PRESENCE) {
    return false;
  }
  
  if (trigger.personId !== presence.personId) {
    return false;
  }
  
  if (trigger.location && trigger.location !== presence.location) {
    return false;
  }
  
  switch (trigger.action) {
    case 'arrive':
      return presence.present === true;
    case 'leave':
      return presence.present === false;
    case 'present':
      return presence.present === true;
    case 'absent':
      return presence.present === false;
    default:
      return false;
  }
}

/**
 * Check if a device state trigger should fire
 */
export function shouldDeviceStateTriggerFire(
  trigger: AutomationTrigger,
  device: SmartDevice
): boolean {
  if (trigger.type !== AutomationTriggerType.DEVICE_STATE) {
    return false;
  }
  
  if (trigger.deviceId !== device.id) {
    return false;
  }
  
  const propertyValue = device.state[trigger.condition.property];
  const { operator, value } = trigger.condition;
  
  switch (operator) {
    case 'equals':
      return propertyValue === value;
    case 'not_equals':
      return propertyValue !== value;
    case 'greater_than':
      return typeof propertyValue === 'number' && typeof value === 'number' && propertyValue > value;
    case 'less_than':
      return typeof propertyValue === 'number' && typeof value === 'number' && propertyValue < value;
    default:
      return false;
  }
}

/**
 * Check if a mood trigger should fire
 */
export function shouldMoodTriggerFire(
  trigger: AutomationTrigger,
  currentMood: UserMood | null
): boolean {
  if (trigger.type !== AutomationTriggerType.MOOD) {
    return false;
  }
  
  if (!currentMood) {
    return false;
  }
  
  const condition = trigger.condition || 'equals';
  
  if (condition === 'equals') {
    return currentMood === trigger.mood;
  } else {
    return currentMood !== trigger.mood;
  }
}

/**
 * Check if automation rule should execute (respects manual overrides)
 */
export function shouldRuleExecute(
  rule: AutomationRule,
  context: {
    currentTime: Date;
    presence?: { personId: string; location?: string; present: boolean };
    deviceStates?: SmartDevice[];
    currentMood?: UserMood | null;
    manualOverrides?: ManualOverride[];
  }
): boolean {
  // Check if rule is enabled
  if (!rule.enabled || rule.status !== 'active') {
    return false;
  }
  
  // Check if rule is manually overridden
  if (context.manualOverrides) {
    const override = context.manualOverrides.find(o => o.ruleId === rule.id);
    if (override) {
      // Check if override has expired
      if (override.expiresAt) {
        const now = new Date();
        const expiresAt = new Date(override.expiresAt);
        if (now < expiresAt) {
          return false; // Override still active
        }
      } else {
        return false; // Permanent override
      }
    }
  }
  
  // Check trigger condition
  switch (rule.trigger.type) {
    case AutomationTriggerType.TIME:
      return shouldTimeTriggerFire(rule.trigger);
    
    case AutomationTriggerType.PRESENCE:
      if (!context.presence) return false;
      return shouldPresenceTriggerFire(rule.trigger, context.presence);
    
    case AutomationTriggerType.DEVICE_STATE:
      if (!context.deviceStates) return false;
      const device = context.deviceStates.find(d => d.id === rule.trigger.deviceId);
      if (!device) return false;
      return shouldDeviceStateTriggerFire(rule.trigger, device);
    
    case AutomationTriggerType.MOOD:
      return shouldMoodTriggerFire(rule.trigger, context.currentMood || null);
    
    default:
      return false;
  }
}

/**
 * Execute automation rule actions
 */
export async function executeAutomationRule(
  rule: AutomationRule,
  devices: SmartDevice[]
): Promise<AutomationExecution> {
  const actionsExecuted: AutomationAction[] = [];
  let success = true;
  let error: string | undefined;
  
  try {
    for (const action of rule.actions) {
      if (action.type === AutomationActionType.NOTIFY) {
        // Handle notification action (would show notification)
        actionsExecuted.push(action);
      } else {
        // Handle device action
        const device = devices.find(d => d.id === action.deviceId);
        if (!device) {
          error = `Device ${action.deviceId} not found`;
          success = false;
          continue;
        }
        
        // Validate action before executing
        if (!validateDeviceAction(device, action)) {
          error = `Action not supported by device ${device.name}`;
          success = false;
          continue;
        }
        
        // Execute action
        await controlDevice(device, action);
        actionsExecuted.push(action);
      }
    }
  } catch (err) {
    success = false;
    error = err instanceof Error ? err.message : 'Unknown error';
  }
  
  return {
    id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ruleId: rule.id,
    triggeredAt: new Date().toISOString(),
    triggerType: rule.trigger.type,
    actionsExecuted,
    success,
    error,
  };
}

/**
 * Calculate next scheduled time for time-based rule
 */
export function calculateNextScheduledTime(trigger: AutomationTrigger): string | undefined {
  if (trigger.type !== AutomationTriggerType.TIME) {
    return undefined;
  }
  
  const now = new Date();
  const [hours, minutes] = trigger.time.split(':').map(Number);
  const scheduledTime = new Date(now);
  scheduledTime.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (scheduledTime < now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  // If days of week are specified, find next matching day
  if (trigger.daysOfWeek && trigger.daysOfWeek.length > 0) {
    while (!trigger.daysOfWeek.includes(scheduledTime.getDay())) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
  }
  
  return scheduledTime.toISOString();
}

/**
 * Get trigger description (human-readable)
 */
export function getTriggerDescription(trigger: AutomationTrigger): string {
  switch (trigger.type) {
    case AutomationTriggerType.TIME:
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (trigger.daysOfWeek && trigger.daysOfWeek.length > 0) {
        const days = trigger.daysOfWeek.map(d => dayNames[d]).join(', ');
        return `At ${trigger.time} on ${days}`;
      }
      return `At ${trigger.time} every day`;
    
    case AutomationTriggerType.PRESENCE:
      const actionMap: Record<string, string> = {
        arrive: 'arrives',
        leave: 'leaves',
        present: 'is present',
        absent: 'is absent',
      };
      const actionText = actionMap[trigger.action] || trigger.action;
      const locationText = trigger.location ? ` at ${trigger.location}` : '';
      return `When person ${actionText}${locationText}`;
    
    case AutomationTriggerType.DEVICE_STATE:
      return `When ${trigger.condition.property} ${trigger.condition.operator} ${trigger.condition.value}`;
    
    case AutomationTriggerType.MOOD:
      return `When mood is ${trigger.mood}`;
    
    case AutomationTriggerType.MANUAL:
      return 'Manual trigger';
    
    default:
      return 'Unknown trigger';
  }
}

/**
 * Get action description (human-readable)
 */
export function getActionDescription(action: AutomationAction): string {
  switch (action.type) {
    case AutomationActionType.TURN_ON:
      return `Turn on device`;
    case AutomationActionType.TURN_OFF:
      return `Turn off device`;
    case AutomationActionType.SET_BRIGHTNESS:
      return `Set brightness to ${action.parameters?.brightness}%`;
    case AutomationActionType.SET_COLOR:
      return `Set color to ${action.parameters?.color}`;
    case AutomationActionType.SET_TEMPERATURE:
      return `Set temperature to ${action.parameters?.temperature}°`;
    case AutomationActionType.LOCK:
      return `Lock device`;
    case AutomationActionType.UNLOCK:
      return `Unlock device`;
    case AutomationActionType.NOTIFY:
      return `Notify: ${action.message}`;
    default:
      return 'Unknown action';
  }
}
