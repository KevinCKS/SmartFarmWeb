'use client';

import { useState, useEffect, useCallback } from 'react';
import { SensorData, SensorType } from '@/types/sensor';

interface UseSensorHistoryOptions {
  sensorType: SensorType;
  limit?: number;
  deviceId?: string;
  interval?: number; // 실시간 업데이트 간격 (ms)
}

export function useSensorHistory(options: UseSensorHistoryOptions) {
  const { sensorType, limit = 50, deviceId = 'arduino-uno-r4', interval = 5000 } = options;
  
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/sensors/${sensorType}?device_id=${deviceId}&limit=${limit}`
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '센서 이력 데이터를 가져오는데 실패했습니다.');
      }

      // 시간순으로 정렬 (오래된 것부터)
      const sortedData = (result.data || []).reverse();
      setData(sortedData);
      setLoading(false);
      setError(null);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  }, [sensorType, deviceId, limit]);

  useEffect(() => {
    // 초기 로드
    fetchHistory();

    // 주기적 업데이트
    const intervalId = setInterval(fetchHistory, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchHistory, interval]);

  return {
    data,
    loading,
    error,
    refetch: fetchHistory,
  };
}
