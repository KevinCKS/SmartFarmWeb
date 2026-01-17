'use client';

import { useSensorData } from '@/hooks/useSensorData';
import SensorGauge from '@/components/SensorGauge';
import SensorChart from '@/components/SensorChart';
import SystemStatus from '@/components/SystemStatus';
import AlertMessage from '@/components/AlertMessage';

// 기본 임계값 설정
const defaultThresholds = {
  temperature: {
    normal: { min: 0, max: 30 },
    warning: { min: 25, max: 30 },
    danger: { min: 30, max: 35 },
  },
  humidity: {
    normal: { min: 40, max: 80 },
    warning: { min: 30, max: 40 },
    danger: { min: 0, max: 30 },
  },
  ec: {
    normal: { min: 1.0, max: 3.0 },
    warning: { min: 0.5, max: 1.0 },
    danger: { min: 0, max: 0.5 },
  },
  ph: {
    normal: { min: 5.5, max: 7.0 },
    warning: { min: 5.0, max: 5.5 },
    danger: { min: 0, max: 5.0 },
  },
};

export default function SensorPage() {
  const { temperature, humidity, ec, ph, loading, error } = useSensorData({ useRealtime: true });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">
              🌡️ 센서 모니터링
            </h1>
            <div className="text-xl text-gray-500 font-semibold">
              {new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })} {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
          </div>
          {/* 시스템 상태 - 상단 오른쪽 */}
          <div className="flex-shrink-0">
            <SystemStatus />
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            오류: {error}
          </div>
        )}

        {/* 경고 메시지 */}
        <AlertMessage
          sensors={{ temperature, humidity, ec, ph }}
          thresholds={{
            temperature: defaultThresholds.temperature.normal,
            humidity: defaultThresholds.humidity.normal,
            ec: defaultThresholds.ec.normal,
            ph: defaultThresholds.ph.normal,
          }}
        />

        {/* 센서 섹션 */}
        <div className="bg-blue-100 rounded-xl p-8 border-2 border-blue-400 shadow-lg">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">실시간 센서 데이터</h2>
            <div className="h-1 w-24 bg-blue-600 rounded-full"></div>
          </div>

          {/* 센서 게이지 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SensorGauge
              key={`temperature-${temperature?.id || temperature?.value || 'none'}`}
              type="temperature"
              data={temperature}
              loading={loading}
              label="온도"
              unit="°C"
              min={0}
              max={30}
              color="#ef4444"
              thresholds={defaultThresholds.temperature}
            />
            <SensorGauge
              key={`humidity-${humidity?.id || humidity?.value || 'none'}`}
              type="humidity"
              data={humidity}
              loading={loading}
              label="습도"
              unit="%"
              min={0}
              max={100}
              color="#3b82f6"
              thresholds={defaultThresholds.humidity}
            />
            <SensorGauge
              key={`ec-${ec?.id || ec?.value || 'none'}`}
              type="ec"
              data={ec}
              loading={loading}
              label="EC"
              unit="mS/cm"
              min={0}
              max={5}
              color="#eab308"
              thresholds={defaultThresholds.ec}
            />
            <SensorGauge
              key={`ph-${ph?.id || ph?.value || 'none'}`}
              type="ph"
              data={ph}
              loading={loading}
              label="pH"
              unit="pH"
              min={0}
              max={14}
              color="#a3e635"
              thresholds={defaultThresholds.ph}
            />
          </div>

          {/* 센서 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SensorChart
              sensorType="temperature"
              unit="°C"
              label="온도 추이"
              color="#ef4444"
              limit={50}
            />
            <SensorChart
              sensorType="humidity"
              unit="%"
              label="습도 추이"
              color="#3b82f6"
              limit={50}
            />
            <SensorChart
              sensorType="ec"
              unit="mS/cm"
              label="EC 추이"
              color="#eab308"
              limit={50}
            />
            <SensorChart
              sensorType="ph"
              unit="pH"
              label="pH 추이"
              color="#a3e635"
              limit={50}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
