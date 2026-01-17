'use client';

import { useState, useEffect } from 'react';
import { SensorData, SensorType } from '@/types/sensor';

interface SensorHistoryTableProps {
  sensorType?: SensorType;
  limit?: number;
  deviceId?: string;
}

export default function SensorHistoryTable({ 
  sensorType, 
  limit = 50, 
  deviceId = 'arduino-uno-r4' 
}: SensorHistoryTableProps) {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = sensorType 
        ? `/api/sensors/${sensorType}?device_id=${deviceId}&limit=${limit}`
        : `/api/sensors?device_id=${deviceId}&limit=${limit}`;
      
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '센서 데이터를 가져오는데 실패했습니다.');
      }

      setData(result.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10초마다 업데이트
    
    return () => clearInterval(interval);
  }, [sensorType, limit, deviceId]);

  const getSensorTypeLabel = (type: SensorType): string => {
    const labels: Record<SensorType, string> = {
      temperature: '온도',
      humidity: '습도',
      ec: 'EC',
      ph: 'pH',
    };
    return labels[type];
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        오류: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              {!sensorType && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  센서 종류
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                측정값
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                단위
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                디바이스 ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성 시간
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={sensorType ? 5 : 6} 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.id}
                  </td>
                  {!sensorType && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSensorTypeLabel(row.sensor_type)}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.value.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.device_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(row.created_at).toLocaleString('ko-KR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {data.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
          총 {data.length}개의 데이터 표시 중
        </div>
      )}
    </div>
  );
}
