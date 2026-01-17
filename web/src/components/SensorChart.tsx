'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SensorData, SensorType, SensorUnit } from '@/types/sensor';
import { useSensorHistory } from '@/hooks/useSensorHistory';

interface SensorChartProps {
  sensorType: SensorType;
  unit: SensorUnit;
  label: string;
  color?: string;
  limit?: number;
}

type TimeRange = '1h' | '24h' | '7d';

const timeRangeConfig: Record<TimeRange, { hours: number; label: string }> = {
  '1h': { hours: 1, label: '1시간' },
  '24h': { hours: 24, label: '24시간' },
  '7d': { hours: 168, label: '7일' },
};

export default function SensorChart({ sensorType, unit, label, color = '#8884d8', limit = 50 }: SensorChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  
  // 시간 범위에 따른 데이터 필터링
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - timeRangeConfig[timeRange].hours);
  
  const { data, loading, error } = useSensorHistory({ 
    sensorType, 
    limit: timeRange === '1h' ? 60 : timeRange === '24h' ? 144 : 168,
  });

  // 더미 데이터 생성 함수
  const generateDummyData = () => {
    const dummyData: Array<{ time: string; value: number; timestamp: number }> = [];
    const now = new Date();
    const hours = timeRangeConfig[timeRange].hours;
    const dataPoints = timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : 168;
    const interval = hours * 60 * 60 * 1000 / dataPoints; // 밀리초 간격

    // 센서 타입별 기본값과 변동 범위
    const baseValues: Record<SensorType, { base: number; range: number }> = {
      temperature: { base: 22, range: 5 },
      humidity: { base: 60, range: 20 },
      ec: { base: 1.5, range: 0.5 },
      ph: { base: 6.5, range: 1.0 },
    };

    const config = baseValues[sensorType];
    
    for (let i = 0; i < dataPoints; i++) {
      const timestamp = now.getTime() - (dataPoints - i) * interval;
      const date = new Date(timestamp);
      // 사인파 패턴으로 변동 추가
      const variation = Math.sin((i / dataPoints) * Math.PI * 2) * config.range;
      const value = config.base + variation + (Math.random() - 0.5) * config.range * 0.3;
      
      dummyData.push({
        time: date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false, // 24시간제
        }),
        value: Math.max(0, value), // 음수 방지
        timestamp,
      });
    }
    
    return dummyData;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-red-500 text-center py-8">오류: {error}</div>
      </div>
    );
  }

  // 데이터가 배열인지 확인하고 필터링
  const safeData = Array.isArray(data) ? data : [];
  
  // 시간 범위에 맞는 데이터 필터링
  const filteredData = safeData.filter((item) => {
    try {
      const itemDate = new Date(item.created_at);
      return itemDate >= startDate;
    } catch {
      return false;
    }
  });

  // 차트 데이터 포맷팅 (데이터가 없으면 더미 데이터 사용)
  const chartData = filteredData.length > 0
    ? filteredData.map((item) => ({
        time: new Date(item.created_at).toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false, // 24시간제
        }),
        value: Number(item.value) || 0,
        timestamp: new Date(item.created_at).getTime(),
      }))
    : generateDummyData();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
        <div className="flex gap-2">
          {(['1h', '24h', '7d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {timeRangeConfig[range].label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            label={{ value: unit, angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(2)} ${unit}`, label] : ['', '']}
            labelFormatter={(label) => `시간: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name={label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
