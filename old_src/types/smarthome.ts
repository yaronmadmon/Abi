/**
 * Smart Home & Automation Types
 * Device integration and automation rules
 */

import { EntityId } from '@/models';
import { UserMood } from '@/types/mood';

export enum DeviceType {
  LIGHT = 'light',
  THERMOSTAT = 'thermostat',
  LOCK = 'lock',
  SENSOR = 'sensor',
  CAMERA = 'camera',
  OTHER = 'other',
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error',
}

export interface DeviceState {
  on?: boolean; // For lights, locks, etc.
  brightness?: number; // 0-100 for lights
  color?: string; // Hex color for lights
  temperature?: number; // Current temperature for thermostat
  targetTemperature?: number; // Set temperature for thermostat
  locked?: boolean; // For locks
  batteryLevel?: number; // 0-100
  [key: string]: unknown; // Allow additional state properties
}

export interface SmartDevice {
  id: string;
  householdId: EntityId;
  name: string;
  type: DeviceType;
  room?: string;
  manufacturer?: string;
  model?: string;
  status: DeviceStatus;
  state: DeviceState;
  capabilities: string[]; // e.g., ['brightness', 'color', 'dim']
  lastUpdatedAt: string; // ISO 8601
  createdAt: string; // ISO 8601
}

export enum AutomationTriggerType {
  TIME = 'time',
  PRESENCE = 'presence',
  DEVICE_STATE = 'device_state',
  MOOD = 'mood',
  MANUAL = 'manual',
}

export enum AutomationActionType {
  TURN_ON = 'turn_on',
  TURN_OFF = 'turn_off',
  SET_BRIGHTNESS = 'set_brightness',
  SET_COLOR = 'set_color',
  SET_TEMPERATURE = 'set_temperature',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  NOTIFY = 'notify',
}

export interface TimeTrigger {
  type: AutomationTriggerType.TIME;
  time: string; // HH:MM format (24-hour)
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday), undefined = every day
  once?: boolean; // If true, trigger only once
}

export interface PresenceTrigger {
  type: AutomationTriggerType.PRESENCE;
  personId: EntityId;
  action: 'arrive' | 'leave' | 'present' | 'absent';
  location?: string; // Room or area
}

export interface DeviceStateTrigger {
  type: AutomationTriggerType.DEVICE_STATE;
  deviceId: string;
  condition: {
    property: string; // e.g., 'on', 'temperature', 'brightness'
    operator: 'equals' | 'greater_than' | 'less_than' | 'not_equals';
    value: unknown;
  };
}

export interface MoodTrigger {
  type: AutomationTriggerType.MOOD;
  mood: UserMood;
  condition?: 'equals' | 'not_equals';
}

export type AutomationTrigger = TimeTrigger | PresenceTrigger | DeviceStateTrigger | MoodTrigger;

export interface DeviceAction {
  type: AutomationActionType;
  deviceId: string;
  parameters?: Record<string, unknown>; // e.g., { brightness: 50, color: '#FF0000' }
}

export interface NotificationAction {
  type: AutomationActionType.NOTIFY;
  message: string;
  priority?: 'low' | 'normal' | 'high';
}

export type AutomationAction = DeviceAction | NotificationAction;

export enum AutomationRuleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DISABLED = 'disabled',
}

export interface AutomationRule {
  id: string;
  householdId: EntityId;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  status: AutomationRuleStatus;
  enabled: boolean;
  manualOverride: boolean; // Can be manually overridden
  lastTriggeredAt?: string; // ISO 8601
  nextScheduledAt?: string; // ISO 8601 (for time-based triggers)
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface ManualOverride {
  id: string;
  ruleId: string;
  deviceId?: string;
  reason?: string;
  overriddenAt: string; // ISO 8601
  expiresAt?: string; // ISO 8601 - when override expires
  originalState?: DeviceState;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  triggeredAt: string; // ISO 8601
  triggerType: AutomationTriggerType;
  actionsExecuted: AutomationAction[];
  success: boolean;
  error?: string;
}
