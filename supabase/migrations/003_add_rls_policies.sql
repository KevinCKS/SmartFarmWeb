-- SmartFarm Web Service - Row Level Security Policies
-- Created: 2024
-- Description: 데이터 보안을 위한 RLS 정책 추가

-- Enable Row Level Security
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE actuator_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Sensor Data Policies
-- 센서 데이터는 모든 사용자가 읽을 수 있음 (공개 데이터)
CREATE POLICY "센서 데이터는 모든 사용자가 조회 가능"
  ON sensor_data
  FOR SELECT
  USING (true);

-- 센서 데이터는 서비스 롤만 삽입 가능 (MQTT 서비스에서만)
-- 실제 구현 시 서비스 롤 키를 사용하는 클라이언트에서만 삽입 가능
-- TODO: 인증 시스템 구현 후 서비스 롤만 삽입 가능하도록 정책 추가 필요

-- Actuator Control Policies
-- 액츄에이터 제어 이력은 모든 사용자가 조회 가능
CREATE POLICY "액츄에이터 제어 이력은 모든 사용자가 조회 가능"
  ON actuator_control
  FOR SELECT
  USING (true);

-- 액츄에이터 제어는 인증된 사용자만 가능
-- TODO: 인증 시스템 구현 후 수정 필요
CREATE POLICY "액츄에이터 제어는 모든 사용자가 가능 (임시)"
  ON actuator_control
  FOR INSERT
  WITH CHECK (true);

-- System Settings Policies
-- 시스템 설정은 모든 사용자가 조회 가능
CREATE POLICY "시스템 설정은 모든 사용자가 조회 가능"
  ON system_settings
  FOR SELECT
  USING (true);

-- 시스템 설정은 서비스 롤만 수정 가능
-- TODO: 관리자 권한 시스템 구현 후 수정 필요
