'use client';

import { useSensorData } from '@/hooks/useSensorData';
import SensorGauge from '@/components/SensorGauge';
import SensorChart from '@/components/SensorChart';
import SensorHistoryTable from '@/components/SensorHistoryTable';
import ActuatorControl from '@/components/ActuatorControl';
import SystemStatus from '@/components/SystemStatus';
import OperatingMode from '@/components/OperatingMode';
import AlertMessage from '@/components/AlertMessage';

// 기본 임계값 설정 (이미지 참고)
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

export default function DashboardPage() {
  const { temperature, humidity, ec, ph, loading, error } = useSensorData({ useRealtime: true });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="dashboard-title text-6xl mb-3">
              스마트팜 대시보드
            </h1>
            <div className="text-2xl text-gray-500 font-semibold">
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
        <div className="bg-blue-100 rounded-xl p-8 mb-36 border-2 border-blue-400 shadow-lg">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">센서 모니터링</h2>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

          {/* 센서 데이터 이력 테이블 - 각 센서별로 구분 */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">센서 데이터 이력</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 온도 테이블 */}
              <div>
                <h4 className="text-xl font-semibold text-blue-800 mb-3">🌡️ 온도 데이터</h4>
                <SensorHistoryTable sensorType="temperature" limit={20} />
              </div>
              
              {/* 습도 테이블 */}
              <div>
                <h4 className="text-xl font-semibold text-blue-800 mb-3">💧 습도 데이터</h4>
                <SensorHistoryTable sensorType="humidity" limit={20} />
              </div>
              
              {/* EC 테이블 */}
              <div>
                <h4 className="text-xl font-semibold text-blue-800 mb-3">⚡ EC 데이터</h4>
                <SensorHistoryTable sensorType="ec" limit={20} />
              </div>
              
              {/* pH 테이블 */}
              <div>
                <h4 className="text-xl font-semibold text-blue-800 mb-3">🧪 pH 데이터</h4>
                <SensorHistoryTable sensorType="ph" limit={20} />
              </div>
            </div>
          </div>
        </div>

        {/* 액츄에이터 섹션 */}
        <div className="bg-green-100 rounded-xl p-8 mb-80 border-2 border-green-400 shadow-lg">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-green-900 mb-2">액츄에이터 제어</h2>
            <div className="h-1 w-24 bg-green-600 rounded-full"></div>
          </div>

          {/* 운영모드 및 액츄에이터 제어 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <OperatingMode />
            <div className="lg:col-span-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                <ActuatorControl
                  type="led"
                  label="LED"
                  icon="💡"
                  color="#eab308"
                />
                <ActuatorControl
                  type="pump"
                  label="펌프"
                  icon="⚙️"
                  color="#3b82f6"
                />
                <ActuatorControl
                  type="fan1"
                  label="팬 1"
                  icon="🔄"
                  color="#a3e635"
                />
                <ActuatorControl
                  type="fan2"
                  label="팬 2"
                  icon="🔄"
                  color="#a3e635"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
