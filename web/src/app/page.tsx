import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-cover bg-center bg-fixed relative" 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070')",
          }}>
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* 컨텐츠 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-12 border border-white/20">
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <span className="text-6xl">🌾</span>
                SmartFarm Web Service
              </h1>
              <p className="text-xl text-gray-600">실시간 스마트팜 모니터링 시스템</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Link 
                href="/sensor"
                className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">🌡️</div>
                <h2 className="text-xl font-semibold text-blue-900 mb-2">Sensor</h2>
                <p className="text-blue-700 text-sm">실시간 센서 데이터 모니터링</p>
              </Link>
              
              <Link 
                href="/db"
                className="p-6 bg-green-50 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">📊</div>
                <h2 className="text-xl font-semibold text-green-900 mb-2">DB</h2>
                <p className="text-green-700 text-sm">데이터베이스 조회 및 분석</p>
              </Link>
              
              <Link 
                href="/actuator"
                className="p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">⚙️</div>
                <h2 className="text-xl font-semibold text-yellow-900 mb-2">Actuator</h2>
                <p className="text-yellow-700 text-sm">액츄에이터 제어</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
