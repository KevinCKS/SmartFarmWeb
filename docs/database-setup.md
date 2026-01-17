# 데이터베이스 설정 가이드

## 개요

이 문서는 SmartFarm Web Service의 데이터베이스 설정 및 마이그레이션 가이드를 제공합니다.

## 데이터베이스 스키마

### 테이블 구조

#### 1. sensor_data
센서 데이터를 저장하는 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL | 기본 키 |
| sensor_type | VARCHAR(50) | 센서 종류 (temperature, humidity, ec, ph) |
| value | DECIMAL(10,2) | 측정값 |
| unit | VARCHAR(20) | 단위 (°C, %, mS/cm, pH) |
| created_at | TIMESTAMP | 생성 시간 |
| device_id | VARCHAR(100) | 디바이스 식별자 |

#### 2. actuator_control
액츄에이터 제어 이력을 저장하는 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL | 기본 키 |
| actuator_type | VARCHAR(50) | 액츄에이터 종류 (led, pump, fan1, fan2) |
| action | VARCHAR(50) | 제어 동작 (on, off, set) |
| value | INTEGER | 제어 값 (LED 밝기: 0-100) |
| created_at | TIMESTAMP | 생성 시간 |
| user_id | UUID | 사용자 ID (선택사항) |

#### 3. system_settings
시스템 설정을 저장하는 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL | 기본 키 |
| setting_key | VARCHAR(100) | 설정 키 (UNIQUE) |
| setting_value | JSONB | 설정 값 (JSON) |
| updated_at | TIMESTAMP | 업데이트 시간 |

## 마이그레이션 순서

1. `001_initial_schema.sql` - 초기 스키마 생성
2. `002_add_indexes.sql` - 인덱스 추가
3. `003_add_rls_policies.sql` - RLS 정책 추가
4. `seed.sql` - 초기 데이터 삽입

## TypeScript 타입 사용

```typescript
import { createClient } from '@/lib/supabase/client';
import type { SensorData, ActuatorControl } from '@/types';

const supabase = createClient();

// 센서 데이터 조회
const { data, error } = await supabase
  .from('sensor_data')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);

// 액츄에이터 제어 삽입
const { data, error } = await supabase
  .from('actuator_control')
  .insert({
    actuator_type: 'led',
    action: 'set',
    value: 80
  });
```

## Realtime 구독

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// 센서 데이터 실시간 구독
const channel = supabase
  .channel('sensor-data')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'sensor_data'
    },
    (payload) => {
      console.log('새 센서 데이터:', payload.new);
    }
  )
  .subscribe();
```

## 성능 최적화

### 인덱스

다음 인덱스가 자동으로 생성됩니다:
- `sensor_data`: sensor_type, created_at, device_id
- `actuator_control`: actuator_type, created_at
- `system_settings`: setting_key

### 데이터 보관 정책

- 센서 데이터: 30일 보관 (설정 가능)
- 액츄에이터 제어 이력: 무제한 보관
- 시스템 설정: 영구 보관

## 문제 해결

### 마이그레이션 오류

```bash
# 마이그레이션 상태 확인
supabase migration list

# 특정 마이그레이션 롤백
supabase migration repair --status reverted <migration_name>
```

### 타입 불일치

타입이 스키마와 일치하지 않으면:
1. Supabase CLI로 타입 재생성
2. `web/src/types/database.ts` 업데이트
