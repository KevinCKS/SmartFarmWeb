'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData, AllSensorData } from '@/types/sensor';
import { createClient } from '@/lib/supabase/client';

interface UseSensorDataOptions {
  deviceId?: string;
  useRealtime?: boolean; // Supabase Realtime 사용 여부
}

interface SensorDataState {
  temperature: SensorData | null;
  humidity: SensorData | null;
  ec: SensorData | null;
  ph: SensorData | null;
  allData: AllSensorData | null;
  loading: boolean;
  error: string | null;
}

export function useSensorData(options: UseSensorDataOptions = {}) {
  const { deviceId = 'arduino-uno-r4', useRealtime = true } = options;
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  const [state, setState] = useState<SensorDataState>({
    temperature: null,
    humidity: null,
    ec: null,
    ph: null,
    allData: null,
    loading: true,
    error: null,
  });

  const fetchSensorData = useCallback(async () => {
    try {
      const response = await fetch(`/api/sensors/all?device_id=${deviceId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '센서 데이터를 가져오는데 실패했습니다.');
      }

      const data = result.data;
      
      setState((prev) => ({
        temperature: data.temperature,
        humidity: data.humidity,
        ec: data.ec,
        ph: data.ph,
        allData: {
          temperature: data.temperature?.value || 0,
          humidity: data.humidity?.value || 0,
          ec: data.ec?.value || 0,
          ph: data.ph?.value || 0,
          timestamp: Date.now(),
        },
        loading: false,
        error: null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
      }));
    }
  }, [deviceId]);

  useEffect(() => {
    // 초기 로드
    fetchSensorData();

    // 주기적으로 데이터 갱신 (5초마다)
    // Realtime 구독이 실패할 경우를 대비하여 폴링 방식도 함께 사용
    const intervalId = setInterval(() => {
      fetchSensorData();
    }, 5000);

    if (useRealtime) {
      // Supabase Realtime 구독 (PRD 요구사항)
      const channel = supabase
        .channel('sensor-data-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'sensor_data',
            filter: `device_id=eq.${deviceId}`,
          },
          (payload) => {
            const newData = payload.new as SensorData;
            console.log('[Realtime] 새 센서 데이터 수신:', newData);
            setState((prev) => {
              const updated = { ...prev };
              
              if (newData.sensor_type === 'temperature') {
                updated.temperature = newData;
              } else if (newData.sensor_type === 'humidity') {
                updated.humidity = newData;
              } else if (newData.sensor_type === 'ec') {
                updated.ec = newData;
              } else if (newData.sensor_type === 'ph') {
                updated.ph = newData;
              }

              // allData 업데이트
              updated.allData = {
                temperature: updated.temperature?.value || 0,
                humidity: updated.humidity?.value || 0,
                ec: updated.ec?.value || 0,
                ph: updated.ph?.value || 0,
                timestamp: Date.now(),
              };

              return updated;
            });
          }
        )
        .subscribe();

      channelRef.current = channel;

      return () => {
        clearInterval(intervalId);
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
      };
    } else {
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [fetchSensorData, deviceId, useRealtime, supabase]);

  return {
    ...state,
    refetch: fetchSensorData,
  };
}
