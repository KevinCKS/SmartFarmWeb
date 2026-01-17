'use client';

import { SensorData } from '@/types/sensor';

interface AlertMessageProps {
  sensors: {
    temperature?: SensorData | null;
    humidity?: SensorData | null;
    ec?: SensorData | null;
    ph?: SensorData | null;
  };
  thresholds?: {
    temperature?: { min: number; max: number };
    humidity?: { min: number; max: number };
    ec?: { min: number; max: number };
    ph?: { min: number; max: number };
  };
}

function checkThreshold(value: number | undefined, threshold: { min: number; max: number } | undefined): boolean {
  if (!value || !threshold) return false;
  return value < threshold.min || value > threshold.max;
}

export default function AlertMessage({ sensors, thresholds }: AlertMessageProps) {
  const alerts: string[] = [];

  if (checkThreshold(sensors.temperature?.value, thresholds?.temperature)) {
    alerts.push('온도');
  }
  if (checkThreshold(sensors.humidity?.value, thresholds?.humidity)) {
    alerts.push('습도');
  }
  if (checkThreshold(sensors.ec?.value, thresholds?.ec)) {
    alerts.push('EC');
  }
  if (checkThreshold(sensors.ph?.value, thresholds?.ph)) {
    alerts.push('pH');
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="text-3xl">⚠️</div>
        <div>
          <div className="font-bold text-orange-900 text-lg">
            {alerts.join(' 및 ')} 기준 초과!!
          </div>
          <div className="text-sm text-orange-700 mt-1">
            즉시 확인이 필요합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
