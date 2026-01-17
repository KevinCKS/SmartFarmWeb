-- SmartFarm Web Service - Initial Schema Migration
-- Created: 2024
-- Description: 초기 데이터베이스 스키마 생성

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sensor Data Table
-- 센서 데이터를 저장하는 테이블
CREATE TABLE IF NOT EXISTS sensor_data (
    id BIGSERIAL PRIMARY KEY,
    sensor_type VARCHAR(50) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    device_id VARCHAR(100) DEFAULT 'smartfarm_uno_r4' NOT NULL
);

-- Actuator Control Table
-- 액츄에이터 제어 이력을 저장하는 테이블
CREATE TABLE IF NOT EXISTS actuator_control (
    id BIGSERIAL PRIMARY KEY,
    actuator_type VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    value INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    user_id UUID
);

-- System Settings Table
-- 시스템 설정을 저장하는 테이블
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add comments for documentation
COMMENT ON TABLE sensor_data IS '센서 데이터 저장 테이블 (온도, 습도, EC, pH)';
COMMENT ON TABLE actuator_control IS '액츄에이터 제어 이력 테이블 (LED, 펌프, 팬1, 팬2)';
COMMENT ON TABLE system_settings IS '시스템 설정 저장 테이블 (임계값, 자동 제어 규칙 등)';

COMMENT ON COLUMN sensor_data.sensor_type IS '센서 종류: temperature, humidity, ec, ph';
COMMENT ON COLUMN sensor_data.value IS '센서 측정값';
COMMENT ON COLUMN sensor_data.unit IS '측정 단위: °C, %, mS/cm, pH';
COMMENT ON COLUMN sensor_data.device_id IS '디바이스 식별자';

COMMENT ON COLUMN actuator_control.actuator_type IS '액츄에이터 종류: led, pump, fan1, fan2';
COMMENT ON COLUMN actuator_control.action IS '제어 동작: on, off, set';
COMMENT ON COLUMN actuator_control.value IS '제어 값 (LED 밝기: 0-100, 기타: 0 또는 1)';
