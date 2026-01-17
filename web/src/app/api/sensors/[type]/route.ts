import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SensorType } from '@/types/sensor';

/**
 * 특정 센서 데이터 조회 API (PRD 명세에 따른 동적 라우트)
 * GET /api/sensors/:type
 */

// 동적 렌더링 강제 (동적 라우트 + searchParams 사용)
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const deviceId = searchParams.get('device_id') || 'arduino-uno-r4';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const validSensorTypes: SensorType[] = ['temperature', 'humidity', 'ec', 'ph'];
    
    if (!validSensorTypes.includes(type as SensorType)) {
      return NextResponse.json(
        { error: '유효하지 않은 센서 타입입니다.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let query = supabase
      .from('sensor_data')
      .select('*')
      .eq('device_id', deviceId)
      .eq('sensor_type', type)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API] 센서 데이터 조회 오류:', error);
      return NextResponse.json(
        { error: '센서 데이터 조회에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('[API] 센서 데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '센서 데이터 조회에 실패했습니다.', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
