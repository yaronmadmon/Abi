/**
 * Device Card Component
 * Display and control smart devices with manual override
 */

import { SmartDevice, DeviceType, AutomationActionType } from '@/types/smarthome';
import { getDeviceDisplayName, getDeviceStatusColor, getDeviceTypeIcon, formatDeviceState } from '@/utils/devices';
import { DeviceAction } from '@/types/smarthome';
import './DeviceCard.css';

interface DeviceCardProps {
  device: SmartDevice;
  onControl?: (device: SmartDevice, action: DeviceAction) => void;
  showControls?: boolean;
}

export function DeviceCard({ device, onControl, showControls = true }: DeviceCardProps) {
  const handleToggle = () => {
    if (!onControl) return;
    
    if (device.type === DeviceType.LIGHT || device.type === DeviceType.LOCK) {
      const action: DeviceAction = {
        type: device.state.on || device.state.locked
          ? (device.type === DeviceType.LOCK ? AutomationActionType.UNLOCK : AutomationActionType.TURN_OFF)
          : (device.type === DeviceType.LOCK ? AutomationActionType.LOCK : AutomationActionType.TURN_ON),
        deviceId: device.id,
      };
      onControl(device, action);
    }
  };

  const handleBrightnessChange = (brightness: number) => {
    if (!onControl) return;
    
    const action: DeviceAction = {
      type: AutomationActionType.SET_BRIGHTNESS,
      deviceId: device.id,
      parameters: { brightness },
    };
    onControl(device, action);
  };

  const isOn = device.state.on !== false && (device.type === DeviceType.LOCK ? device.state.locked : true);

  return (
    <div className={`device-card ${device.status === 'offline' ? 'device-card--offline' : ''}`}>
      <div className="device-card__header">
        <div className="device-card__icon">{getDeviceTypeIcon(device.type)}</div>
        <div className="device-card__info">
          <h3 className="device-card__name">{getDeviceDisplayName(device)}</h3>
          <div className="device-card__state">{formatDeviceState(device)}</div>
        </div>
        <div
          className="device-card__status"
          style={{ color: getDeviceStatusColor(device.status) }}
          title={device.status}
        >
          ●
        </div>
      </div>

      {showControls && device.status === 'online' && (
        <div className="device-card__controls">
          {(device.type === DeviceType.LIGHT || device.type === DeviceType.LOCK) && (
            <button
              onClick={handleToggle}
              className={`device-card__toggle ${isOn ? 'device-card__toggle--on' : ''}`}
            >
              {isOn ? 'Turn Off' : 'Turn On'}
            </button>
          )}

          {device.type === DeviceType.LIGHT && device.capabilities.includes('brightness') && (
            <div className="device-card__brightness">
              <label htmlFor={`brightness-${device.id}`} className="device-card__brightness-label">
                Brightness: {device.state.brightness || 0}%
              </label>
              <input
                id={`brightness-${device.id}`}
                type="range"
                min="0"
                max="100"
                value={device.state.brightness || 0}
                onChange={(e) => handleBrightnessChange(Number(e.target.value))}
                className="device-card__brightness-slider"
              />
            </div>
          )}

          {device.type === DeviceType.THERMOSTAT && (
            <div className="device-card__temperature">
              <div className="device-card__temperature-display">
                {device.state.temperature || '--'}° / {device.state.targetTemperature || '--'}°
              </div>
              <div className="device-card__temperature-controls">
                <button
                  onClick={() => {
                    if (!onControl) return;
                    const current = device.state.targetTemperature || 70;
                    onControl(device, {
                      type: AutomationActionType.SET_TEMPERATURE,
                      deviceId: device.id,
                      parameters: { temperature: current - 1 },
                    });
                  }}
                  className="device-card__temp-button"
                >
                  −
                </button>
                <button
                  onClick={() => {
                    if (!onControl) return;
                    const current = device.state.targetTemperature || 70;
                    onControl(device, {
                      type: AutomationActionType.SET_TEMPERATURE,
                      deviceId: device.id,
                      parameters: { temperature: current + 1 },
                    });
                  }}
                  className="device-card__temp-button"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {device.status === 'offline' && (
        <div className="device-card__offline-message">
          Device is offline. Manual control unavailable.
        </div>
      )}
    </div>
  );
}
