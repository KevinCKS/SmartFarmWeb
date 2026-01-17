'use client';

import { useState, useEffect } from 'react';
import { ActuatorControl, ActuatorType } from '@/types/actuator';

interface ActuatorHistoryTableProps {
  actuatorType?: ActuatorType;
  limit?: number;
}

export default function ActuatorHistoryTable({ 
  actuatorType, 
  limit = 50 
}: ActuatorHistoryTableProps) {
  const [data, setData] = useState<ActuatorControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = actuatorType 
        ? `/api/actuators?type=${actuatorType}&limit=${limit}`
        : `/api/actuators?limit=${limit}`;
      
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '액츄에이터 데이터를 가져오는데 실패했습니다.');
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
  }, [actuatorType, limit]);

  const getActuatorTypeLabel = (type: ActuatorType): string => {
    const labels: Record<ActuatorType, string> = {
      led: 'LED',
      pump: '펌프',
      fan1: '팬 1',
      fan2: '팬 2',
    };
    return labels[type];
  };

  const getActionLabel = (action: string, value: number | null): string => {
    if (action === 'on') return '켜기';
    if (action === 'off') return '끄기';
    if (action === 'set') {
      return value !== null ? `설정 (값: ${value})` : '설정';
    }
    return action;
  };

  const getActionBadgeColor = (action: string): string => {
    if (action === 'on') return 'bg-green-100 text-green-800';
    if (action === 'off') return 'bg-red-100 text-red-800';
    if (action === 'set') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
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
              {!actuatorType && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액츄에이터 종류
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                동작
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                값
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
                  colSpan={actuatorType ? 4 : 5} 
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
                  {!actuatorType && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getActuatorTypeLabel(row.actuator_type)}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(row.action)}`}>
                      {getActionLabel(row.action, row.value)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.value !== null ? row.value.toString() : '-'}
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
