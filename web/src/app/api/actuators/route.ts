import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMQTTClient } from '@/lib/mqtt';
import { ActuatorType, ActuatorAction } from '@/types/actuator';
import { MQTTActuatorTopic } from '@/types/mqtt';

/**
 * 액츄에이터 제어 이력 조회 API
 * GET /api/actuators?type=led&limit=100
 */

// 동적 렌더링 강제 (searchParams 사용)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const actuatorType = searchParams.get('type') as ActuatorType | null;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const supabase = await createClient();

    let query = supabase
      .from('actuator_control')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actuatorType) {
      query = query.eq('actuator_type', actuatorType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API] 액츄에이터 제어 이력 조회 오류:', error);
      return NextResponse.json(
        { error: '액츄에이터 제어 이력 조회에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('[API] 액츄에이터 제어 이력 조회 오류:', error);
    return NextResponse.json(
      { error: '액츄에이터 제어 이력 조회에 실패했습니다.', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}

/**
 * 액츄에이터 제어 명령 발행 API
 * POST /api/actuators
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actuator_type, action, value } = body;

    if (!actuator_type || !action) {
      return NextResponse.json(
        { error: 'actuator_type과 action이 필요합니다.' },
        { status: 400 }
      );
    }

    const validActuatorTypes: ActuatorType[] = ['led', 'pump', 'fan1', 'fan2'];
    const validActions: ActuatorAction[] = ['on', 'off', 'set'];

    if (!validActuatorTypes.includes(actuator_type)) {
      return NextResponse.json(
        { error: '유효하지 않은 액츄에이터 타입입니다.' },
        { status: 400 }
      );
    }

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: '유효하지 않은 액션입니다.' },
        { status: 400 }
      );
    }

    if (action === 'set' && value === undefined) {
      return NextResponse.json(
        { error: 'set 액션의 경우 value가 필요합니다.' },
        { status: 400 }
      );
    }

    // MQTT 메시지 구성
    const topic: MQTTActuatorTopic = `smartfarm/actuators/${actuator_type}` as MQTTActuatorTopic;
    let message: { state?: boolean; brightness?: number; value?: number } = {};

    if (action === 'on') {
      message = { state: true };
    } else if (action === 'off') {
      message = { state: false };
    } else if (action === 'set') {
      if (actuator_type === 'led') {
        message = { brightness: value };
      } else {
        message = { value };
      }
    }

    // MQTT 클라이언트 연결 확인 및 메시지 발행
    const client = getMQTTClient();
    if (!client.getConnected()) {
      await client.connect();
    }

    client.publish(topic, message, { qos: 1 });

    // DB에 제어 이력 저장
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;

    const { createServiceClient } = await import('@/lib/supabase/server');
    const serviceClient = createServiceClient();

    const { error: dbError } = await serviceClient
      .from('actuator_control')
      .insert({
        actuator_type,
        action,
        value: action === 'set' ? value : null,
        user_id: userId,
      });

    if (dbError) {
      console.error('[API] 액츄에이터 제어 이력 저장 오류:', dbError);
      // MQTT 발행은 성공했지만 DB 저장 실패는 경고만
    }

    return NextResponse.json({
      success: true,
      message: '액츄에이터 제어 명령이 발행되었습니다.',
      actuator_type,
      action,
      value: action === 'set' ? value : undefined,
    });
  } catch (error) {
    console.error('[API] 액츄에이터 제어 오류:', error);
    return NextResponse.json(
      { error: '액츄에이터 제어에 실패했습니다.', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
