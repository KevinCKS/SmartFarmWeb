/**
 * MQTT 타입 정의
 */

export type MQTTSensorTopic =
  | 'smartfarm/sensors/temperature'
  | 'smartfarm/sensors/humidity'
  | 'smartfarm/sensors/ec'
  | 'smartfarm/sensors/ph'
  | 'smartfarm/sensors/all';

export type MQTTActuatorTopic =
  | 'smartfarm/actuators/led'
  | 'smartfarm/actuators/pump'
  | 'smartfarm/actuators/fan1'
  | 'smartfarm/actuators/fan2'
  | 'smartfarm/actuators/all';

export type MQTTTopic = MQTTSensorTopic | MQTTActuatorTopic | 'smartfarm/status';

export interface MQTTSensorMessage {
  sensor: 'temperature' | 'humidity' | 'ec' | 'ph';
  value: number;
  unit: string;
  timestamp: number;
}

export interface MQTTAllSensorMessage {
  temperature: number;
  humidity: number;
  ec: number;
  ph: number;
  timestamp: number;
}

export interface MQTTActuatorMessage {
  state?: boolean;
  brightness?: number;
  value?: number;
}

export interface MQTTStatusMessage {
  status: 'online' | 'offline';
  device_id: string;
  timestamp: number;
}
