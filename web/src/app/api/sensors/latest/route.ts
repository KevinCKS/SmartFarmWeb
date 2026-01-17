import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SensorType } from '@/types/sensor';

/**
 * 최신 센서 데이터 조회 API
 * GET /api/sensors/latest?type=temperature&device_id=arduino-uno-r4
 */

// 동적 렌더링 강제 (searchParams 사용)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sensorType = searchParams.get('type') as SensorType | null;
    const deviceId = searchParams.get('device_id') || 'arduino-uno-r4';

    const supabase = await createClient();

    let query = supabase
      .from('sensor_data')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (sensorType) {
      query = query.eq('sensor_type', sensorType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API] 최신 센서 데이터 조회 오류:', error);
      return NextResponse.json(
        { error: '최신 센서 데이터 조회에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data && data.length > 0 ? data[0] : null,
    });
  } catch (error) {
    console.error('[API] 최신 센서 데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '최신 센서 데이터 조회에 실패했습니다.', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
