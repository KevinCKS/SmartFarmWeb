-- SmartFarm Web Service - Add Indexes Migration
-- Created: 2024
-- Description: 성능 최적화를 위한 인덱스 추가

-- Sensor Data Indexes
-- 센서 데이터 조회 성능 최적화
CREATE INDEX IF NOT EXISTS idx_sensor_data_sensor_type ON sensor_data(sensor_type);
CREATE INDEX IF NOT EXISTS idx_sensor_data_created_at ON sensor_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_data_device_id ON sensor_data(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_type_created ON sensor_data(sensor_type, created_at DESC);

-- Actuator Control Indexes
-- 액츄에이터 제어 이력 조회 성능 최적화
CREATE INDEX IF NOT EXISTS idx_actuator_control_actuator_type ON actuator_control(actuator_type);
CREATE INDEX IF NOT EXISTS idx_actuator_control_created_at ON actuator_control(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_actuator_control_user_id ON actuator_control(user_id);

-- System Settings Indexes
-- 시스템 설정 조회 성능 최적화
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at ON system_settings(updated_at DESC);
