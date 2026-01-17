import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 모든 센서의 최신 데이터 조회 API
 * GET /api/sensors/all?device_id=arduino-uno-r4
 */

// 동적 렌더링 강제 (searchParams 사용)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deviceId = searchParams.get('device_id') || 'arduino-uno-r4';

    const supabase = await createClient();

    const sensorTypes: Array<'temperature' | 'humidity' | 'ec' | 'ph'> = [
      'temperature',
      'humidity',
      'ec',
      'ph',
    ];

    const results: Record<string, unknown> = {};

    for (const sensorType of sensorTypes) {
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .eq('device_id', deviceId)
        .eq('sensor_type', sensorType)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        results[sensorType] = data;
      } else {
        results[sensorType] = null;
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] 모든 센서 데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '센서 데이터 조회에 실패했습니다.', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
