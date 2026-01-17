import { NextResponse } from 'next/server';
import { initMQTTClient, getMQTTClient } from '@/lib/mqtt';

/**
 * MQTT 클라이언트 연결 초기화 API
 * POST /api/mqtt/connect
 */

// 동적 렌더링 강제 (POST 요청 + 실시간 연결)
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 환경 변수 확인
    const brokerUrl = process.env.MQTT_BROKER_URL;
    const username = process.env.MQTT_USERNAME;
    const password = process.env.MQTT_PASSWORD;

    if (!brokerUrl || !username || !password) {
      const missing = [];
      if (!brokerUrl) missing.push('MQTT_BROKER_URL');
      if (!username) missing.push('MQTT_USERNAME');
      if (!password) missing.push('MQTT_PASSWORD');

      return NextResponse.json(
        {
          error: 'MQTT 환경 변수가 설정되지 않았습니다.',
          details: `누락된 환경 변수: ${missing.join(', ')}`,
          missing: missing,
          connected: false,
        },
        { status: 400 }
      );
    }

    const client = getMQTTClient();
    
    if (client.getConnected()) {
      return NextResponse.json({
        success: true,
        message: '이미 연결되어 있습니다.',
        connected: true,
      });
    }

    await initMQTTClient();

    return NextResponse.json({
      success: true,
      message: 'MQTT 클라이언트가 연결되었습니다.',
      connected: true,
    });
  } catch (error) {
    console.error('[API] MQTT 연결 오류:', error);
    return NextResponse.json(
      { 
        error: 'MQTT 연결에 실패했습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        connected: false,
      },
      { status: 500 }
    );
  }
}
