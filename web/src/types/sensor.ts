/**
 * 센서 타입 정의
 */

export type SensorType = 'temperature' | 'humidity' | 'ec' | 'ph';

export type SensorUnit = '°C' | '%' | 'mS/cm' | 'pH';

export interface SensorData {
  id: number;
  sensor_type: SensorType;
  value: number;
  unit: SensorUnit;
  created_at: string;
  device_id: string;
}

export interface SensorDataInsert {
  sensor_type: SensorType;
  value: number;
  unit: SensorUnit;
  device_id?: string;
}

export interface SensorThreshold {
  min: number;
  max: number;
  unit: SensorUnit;
}

export interface SensorThresholds {
  temperature: SensorThreshold;
  humidity: SensorThreshold;
  ec: SensorThreshold;
  ph: SensorThreshold;
}

export interface AllSensorData {
  temperature: number;
  humidity: number;
  ec: number;
  ph: number;
  timestamp: number;
}
