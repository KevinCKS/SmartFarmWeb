'use client';

import { SensorData, SensorType, SensorUnit } from '@/types/sensor';

interface SensorCardProps {
  type: SensorType;
  data: SensorData | null;
  loading?: boolean;
  unit: SensorUnit;
  label: string;
  icon?: string;
  color?: string;
}

const sensorConfig: Record<SensorType, { label: string; icon: string; color: string }> = {
  temperature: { label: '온도', icon: '🌡️', color: 'bg-red-500' },
  humidity: { label: '습도', icon: '💧', color: 'bg-blue-500' },
  ec: { label: 'EC', icon: '⚡', color: 'bg-yellow-500' },
  ph: { label: 'pH', icon: '🧪', color: 'bg-green-500' },
};

export default function SensorCard({ type, data, loading, unit, label, icon, color }: SensorCardProps) {
  const config = sensorConfig[type];
  const displayLabel = label || config.label;
  const displayIcon = icon || config.icon;
  const displayColor = color || config.color;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{displayIcon}</span>
          <h3 className="text-lg font-semibold text-gray-700">{displayLabel}</h3>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : data ? (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{data.value.toFixed(1)}</span>
            <span className="text-xl text-gray-500">{unit}</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {new Date(data.created_at).toLocaleString('ko-KR')}
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-center py-4">데이터 없음</div>
      )}
      
      <div className={`mt-4 h-2 rounded-full ${displayColor} opacity-20`}></div>
    </div>
  );
}
