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
    const isConnected = client.getConnected();

    // 디버깅을 위한 상세 정보 (개발 환경에서만)
    const debugInfo = process.env.NODE_ENV === 'development' ? {
      hasClient: !!client,
      clientConnected: (client as any).client?.connected,
      internalConnected: (client as any).isConnected,
    } : undefined;

    return NextResponse.json({
      connected: isConnected,
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
