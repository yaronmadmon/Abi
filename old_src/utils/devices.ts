/**
 * Device Control Utilities
 * Control smart devices with manual override support
 */

import { SmartDevice, DeviceType, DeviceState, DeviceAction, AutomationActionType } from '@/types/smarthome';

/**
 * Control a device
 */
export async function controlDevice(
  device: SmartDevice,
  action: DeviceAction
): Promise<SmartDevice> {
  // Placeholder implementation
  // In production, this would call the actual device API
  
  const newState: DeviceState = { ...device.state };
  
  switch (action.type) {
    case AutomationActionType.TURN_ON:
      newState.on = true;
      if (action.parameters?.brightness) {
        newState.brightness = action.parameters.brightness as number;
      }
      break;
    
    case AutomationActionType.TURN_OFF:
      newState.on = false;
      break;
    
    case AutomationActionType.SET_BRIGHTNESS:
      if (action.parameters?.brightness !== undefined) {
        newState.brightness = action.parameters.brightness as number;
        if (newState.brightness > 0) {
          newState.on = true;
        }
      }
      break;
    
    case AutomationActionType.SET_COLOR:
      if (action.parameters?.color) {
        newState.color = action.parameters.color as string;
        newState.on = true;
      }
      break;
    
    case AutomationActionType.SET_TEMPERATURE:
      if (action.parameters?.temperature !== undefined) {
        newState.targetTemperature = action.parameters.temperature as number;
      }
      break;
    
    case AutomationActionType.LOCK:
      newState.locked = true;
      break;
    
    case AutomationActionType.UNLOCK:
      newState.locked = false;
      break;
  }
  
  return {
    ...device,
    state: newState,
    lastUpdatedAt: new Date().toISOString(),
  };
}

/**
 * Get device display name
 */
export function getDeviceDisplayName(device: SmartDevice): string {
  if (device.room) {
    return `${device.name} (${device.room})`;
  }
  return device.name;
}

/**
 * Get device status color
 */
export function getDeviceStatusColor(status: string): string {
  switch (status) {
    case 'online':
      return '#10B981'; // Green
    case 'offline':
      return '#6B7280'; // Gray
    case 'error':
      return '#E11D48'; // Red
    default:
      return '#6B7280';
  }
}

/**
 * Get device type icon
 */
export function getDeviceTypeIcon(type: DeviceType): string {
  switch (type) {
    case DeviceType.LIGHT:
      return '💡';
    case DeviceType.THERMOSTAT:
      return '🌡️';
    case DeviceType.LOCK:
      return '🔒';
    case DeviceType.SENSOR:
      return '📡';
    case DeviceType.CAMERA:
      return '📷';
    default:
      return '🏠';
  }
}

/**
 * Format device state for display
 */
export function formatDeviceState(device: SmartDevice): string {
  const parts: string[] = [];
  
  if (device.type === DeviceType.LIGHT) {
    if (device.state.on) {
      parts.push('On');
      if (device.state.brightness !== undefined) {
        parts.push(`${device.state.brightness}%`);
      }
    } else {
      parts.push('Off');
    }
  } else if (device.type === DeviceType.THERMOSTAT) {
    if (device.state.temperature !== undefined) {
      parts.push(`${device.state.temperature}°`);
    }
    if (device.state.targetTemperature !== undefined) {
      parts.push(`Set to ${device.state.targetTemperature}°`);
    }
  } else if (device.type === DeviceType.LOCK) {
    parts.push(device.state.locked ? 'Locked' : 'Unlocked');
  }
  
  return parts.join(' · ') || 'Unknown';
}

/**
 * Check if device supports capability
 */
export function deviceSupports(device: SmartDevice, capability: string): boolean {
  return device.capabilities.includes(capability);
}

/**
 * Validate device action
 */
export function validateDeviceAction(device: SmartDevice, action: DeviceAction): boolean {
  // Check if device is online
  if (device.status !== 'online') {
    return false;
  }
  
  // Check if device supports the required capabilities
  switch (action.type) {
    case AutomationActionType.SET_BRIGHTNESS:
      return deviceSupports(device, 'brightness') || deviceSupports(device, 'dim');
    
    case AutomationActionType.SET_COLOR:
      return deviceSupports(device, 'color');
    
    case AutomationActionType.SET_TEMPERATURE:
      return device.type === DeviceType.THERMOSTAT;
    
    case AutomationActionType.LOCK:
    case AutomationActionType.UNLOCK:
      return device.type === DeviceType.LOCK;
    
    default:
      return true;
  }
}
