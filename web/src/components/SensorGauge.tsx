'use client';

import { useMemo } from 'react';
import { SensorData, SensorType } from '@/types/sensor';

interface SensorGaugeProps {
  type: SensorType;
  data: SensorData | null;
  loading?: boolean;
  label: string;
  unit: string;
  min: number;
  max: number;
  color?: string; // 게이지 색상
  thresholds?: {
    normal: { min: number; max: number };
    warning: { min: number; max: number };
    danger: { min: number; max: number };
  };
}

type StatusType = 'normal' | 'warning' | 'danger';

function getStatus(value: number, thresholds?: SensorGaugeProps['thresholds']): StatusType {
  if (!thresholds) return 'normal';
  
  if (value >= thresholds.danger.min && value <= thresholds.danger.max) {
    return 'danger';
  }
  if (value >= thresholds.warning.min && value <= thresholds.warning.max) {
    return 'warning';
  }
  return 'normal';
}

function getStatusColor(status: StatusType): string {
  switch (status) {
    case 'normal':
      return '#22c55e'; // green
    case 'warning':
      return '#eab308'; // yellow
    case 'danger':
      return '#ef4444'; // red
  }
}

function getStatusEmoji(status: StatusType): string {
  switch (status) {
    case 'normal':
      return '😊';
    case 'warning':
      return '😐';
    case 'danger':
      return '😟';
  }
}

function getStatusText(status: StatusType): string {
  switch (status) {
    case 'normal':
      return '정상';
    case 'warning':
      return '주의';
    case 'danger':
      return '위험';
  }
}

export default function SensorGauge({
  type,
  data,
  loading,
  label,
  unit,
  min,
  max,
  color,
  thresholds,
}: SensorGaugeProps) {
  const value = data?.value ?? 0;
  
  // value가 변경될 때마다 게이지 경로를 재계산하도록 useMemo 사용
  const gaugeProps = useMemo(() => {
    const status = getStatus(value, thresholds);
    // 색상이 지정되면 사용하고, 없으면 상태에 따른 색상 사용
    const gaugeColor = color || getStatusColor(status);
    const percentage = ((value - min) / (max - min)) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    // 반원형 게이지 SVG 경로 계산 (180도 반원, 왼쪽에서 오른쪽으로)
    // SVG 좌표계: 0도 = 오른쪽(3시), 90도 = 아래(6시), 180도 = 왼쪽(9시), 270도 = 위(12시)
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    
    // 왼쪽(180도)에서 오른쪽(0도)으로 채워지도록 각도 계산
    // 0% = 180도 (왼쪽), 100% = 0도 (오른쪽)
    const startAngleDeg = 180;
    const endAngleDeg = 0;
    const currentAngleDeg = startAngleDeg - (startAngleDeg - endAngleDeg) * (clampedPercentage / 100);
    const currentAngleRad = (currentAngleDeg * Math.PI) / 180;

    // 현재 각도에서의 끝점 좌표 계산
    const endX = centerX + radius * Math.cos(currentAngleRad);
    const endY = centerY - radius * Math.sin(currentAngleRad);

    // 시작점 좌표 (왼쪽 끝, 180도)
    const startX = centerX - radius;
    const startY = centerY;

    // 180도에서 0도로 가는 경로 (시계 방향, 아래쪽 반원)
    // 각도 차이 계산 (180도에서 currentAngleDeg까지의 차이)
    // 180도에서 0도로 가는 경로는 항상 작은 호(small arc)이므로 largeArcFlag = 0
    // 하지만 180도에서 0도로 직접 가면 180도 차이이므로, 이를 고려해야 함
    const angleDiff = startAngleDeg - currentAngleDeg; // 180도에서 currentAngleDeg까지의 각도 차이
    // 180도에서 0도로 가는 경로는 항상 180도 이하이므로 largeArcFlag = 0
    // 단, 180도에서 360도(0도)로 가는 경로는 180도이므로 largeArcFlag = 0 (작은 호)
    const largeArcFlag = 0; // 항상 작은 호 사용 (EC, pH와 동일)

    return {
      status,
      gaugeColor,
      clampedPercentage,
      startX,
      startY,
      endX,
      endY,
      radius,
      centerX,
      centerY,
      largeArcFlag,
    };
  }, [value, min, max, color, thresholds]);

  const { status, gaugeColor, clampedPercentage, startX, startY, endX, endY, radius, centerX, centerY, largeArcFlag } = gaugeProps;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">{label}</h3>
        
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="relative">
            <svg width="200" height="120" className="mx-auto" viewBox="0 0 200 120">
              {/* 배경 반원 (왼쪽에서 오른쪽으로) */}
              <path
                d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
                strokeLinecap="round"
              />
              {/* 값에 따른 반원 (왼쪽에서 오른쪽으로 채워짐) */}
              {clampedPercentage > 0 && (
                <path
                  key={`gauge-${value}-${clampedPercentage}`}
                  d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
                  fill="none"
                  stroke={gaugeColor}
                  strokeWidth="20"
                  strokeLinecap="round"
                />
              )}
            </svg>
            
            {/* 값 표시 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
              <div className="text-3xl font-bold" style={{ color: gaugeColor }}>
                {value.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">{unit}</div>
              <div className="text-xs text-gray-400 mt-1">
                {min} ~ {max}
              </div>
            </div>
          </div>
        )}

        {/* 상태 표시 */}
        {!loading && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-2xl">{getStatusEmoji(status)}</span>
            <span className="text-sm font-medium" style={{ color: gaugeColor }}>
              {getStatusText(status)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
