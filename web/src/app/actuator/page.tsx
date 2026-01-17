'use client';

import ActuatorControl from '@/components/ActuatorControl';
import OperatingMode from '@/components/OperatingMode';

export default function ActuatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            ⚙️ 액츄에이터 제어
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

        {/* 액츄에이터 섹션 */}
        <div className="bg-green-100 rounded-xl p-8 border-2 border-green-400 shadow-lg">
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
