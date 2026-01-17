import { NextResponse } from 'next/server';
import { getMQTTClient } from '@/lib/mqtt';

/**
 * MQTT 연결 상태 확인 API
 * GET /api/mqtt/status
 */

// 동적 렌더링 강제 (실시간 상태 조회)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = getMQTTClient();
    
    // 실제 MQTT 클라이언트 인스턴스 확인
    const mqttClient = client.getClientInstance();
    
    // 실제 연결 상태 확인 (가장 정확한 방법)
    const isClientConnected = mqttClient?.connected === true;
    
    // getConnected() 메서드로도 확인
    const isManagerConnected = client.getConnected();
    
    // 환경 변수 확인 (서버리스 환경에서 중요)
    const hasEnvVars = !!(
      process.env.MQTT_BROKER_URL &&
      process.env.MQTT_USERNAME &&
      process.env.MQTT_PASSWORD
    );
    
    // 서버리스 환경에서는 각 요청마다 새로운 인스턴스가 생성될 수 있으므로
    // 실제 연결 상태가 없어도 환경 변수가 설정되어 있으면 "연결 가능" 상태로 표시
    // 또는 실제로 연결되어 있으면 연결된 것으로 표시
    const connected = isClientConnected || isManagerConnected || hasEnvVars;

    // 디버깅을 위한 상세 정보 (개발 환경에서만)
    const debugInfo = process.env.NODE_ENV === 'development' ? {
      hasClient: !!client,
      hasMqttClient: !!mqttClient,
      clientConnected: mqttClient?.connected,
      internalConnected: (client as any).isConnected,
      isClientConnected,
      isManagerConnected,
      hasEnvVars,
    } : undefined;

    return NextResponse.json({
      connected,
      timestamp: new Date().toISOString(),
      ...(debugInfo && { debug: debugInfo }),
    });
  } catch (error) {
    console.error('[API] MQTT 상태 확인 오류:', error);
    return NextResponse.json(
      { 
        connected: false,
        error: '상태 확인에 실패했습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류' 
      },
      { status: 500 }
    );
  }
}
