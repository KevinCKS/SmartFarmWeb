-- SmartFarm Web Service - Seed Data
-- Created: 2024
-- Description: 초기 시스템 설정 데이터

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
    ('sensor_thresholds', '{
        "temperature": {"min": 18, "max": 30, "unit": "°C"},
        "humidity": {"min": 40, "max": 80, "unit": "%"},
        "ec": {"min": 1.0, "max": 3.0, "unit": "mS/cm"},
        "ph": {"min": 5.5, "max": 7.0, "unit": "pH"}
    }'::jsonb),
    ('actuator_defaults', '{
        "led": {"brightness": 70, "enabled": false},
        "pump": {"enabled": false},
        "fan1": {"enabled": false},
        "fan2": {"enabled": false}
    }'::jsonb),
    ('auto_control_rules', '{
        "enabled": false,
        "rules": []
    }'::jsonb),
    ('data_collection_interval', '{
        "sensor_interval_seconds": 5,
        "data_retention_days": 30
    }'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;
