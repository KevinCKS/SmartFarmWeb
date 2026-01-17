'use client';

import SensorHistoryTable from '@/components/SensorHistoryTable';

export default function DBPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            📊 데이터베이스 조회
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

        {/* 센서 데이터 이력 테이블 - 각 센서별로 구분 */}
        <div className="bg-white rounded-xl p-8 border-2 border-gray-200 shadow-lg">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">센서 데이터 이력</h2>
            <div className="h-1 w-24 bg-green-600 rounded-full"></div>
          </div>
          
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
    </div>
  );
}
