# 데이터베이스 구현 검증 가이드

## 개요

이 문서는 DB 기반 구조가 올바르게 구현되었는지 검증하는 방법을 제공합니다.

## 검증 체크리스트

### 1단계: Supabase 프로젝트 설정 확인

#### ✅ Supabase 프로젝트 생성 확인
- [ ] Supabase 대시보드에 로그인 가능
- [ ] 프로젝트가 생성되어 있음
- [ ] Project URL 확인 가능

#### ✅ 환경 변수 설정 확인
- [ ] `web/.env.local` 파일이 존재함
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 값이 설정됨
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값이 설정됨
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 값이 설정됨

**검증 명령어**:
```powershell
# 환경 변수 파일 확인
Test-Path web\.env.local
Get-Content web\.env.local
```

### 2단계: 데이터베이스 스키마 검증

#### ✅ 테이블 생성 확인

Supabase 대시보드에서:
1. **Table Editor**로 이동
2. 다음 테이블들이 존재하는지 확인:
   - `sensor_data`
   - `actuator_control`
   - `system_settings`

**SQL 쿼리로 확인**:
```sql
-- 모든 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 특정 테이블 존재 확인
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'sensor_data'
);
```

#### ✅ 테이블 구조 확인

**sensor_data 테이블**:
```sql
-- 컬럼 정보 확인
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sensor_data'
ORDER BY ordinal_position;
```

**예상 결과**:
- id (bigint, NOT NULL, 기본값: nextval)
- sensor_type (character varying(50), NOT NULL)
- value (numeric(10,2), NOT NULL)
- unit (character varying(20), NOT NULL)
- created_at (timestamp with time zone, NOT NULL, 기본값: now())
- device_id (character varying(100), NOT NULL, 기본값: 'smartfarm_uno_r4')

**actuator_control 테이블**:
```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'actuator_control'
ORDER BY ordinal_position;
```

**system_settings 테이블**:
```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'system_settings'
ORDER BY ordinal_position;
```

### 3단계: 인덱스 검증

**인덱스 확인**:
```sql
-- 모든 인덱스 확인
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('sensor_data', 'actuator_control', 'system_settings')
ORDER BY tablename, indexname;
```

**예상 인덱스**:
- `idx_sensor_data_sensor_type`
- `idx_sensor_data_created_at`
- `idx_sensor_data_device_id`
- `idx_sensor_data_type_created`
- `idx_actuator_control_actuator_type`
- `idx_actuator_control_created_at`
- `idx_actuator_control_user_id`
- `idx_system_settings_key`
- `idx_system_settings_updated_at`

### 4단계: RLS 정책 검증

**RLS 활성화 확인**:
```sql
-- RLS 활성화 여부 확인
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('sensor_data', 'actuator_control', 'system_settings');
```

**RLS 정책 확인**:
```sql
-- RLS 정책 목록 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('sensor_data', 'actuator_control', 'system_settings')
ORDER BY tablename, policyname;
```

### 5단계: 초기 데이터 검증

**seed.sql 데이터 확인**:
```sql
-- 시스템 설정 데이터 확인
SELECT 
    setting_key,
    setting_value,
    updated_at
FROM system_settings
ORDER BY setting_key;
```

**예상 결과**:
- `sensor_thresholds`
- `actuator_defaults`
- `auto_control_rules`
- `data_collection_interval`

### 6단계: TypeScript 타입 검증

#### ✅ 타입 파일 존재 확인
- [ ] `web/src/types/database.ts` 파일 존재
- [ ] `web/src/types/sensor.ts` 파일 존재
- [ ] `web/src/types/actuator.ts` 파일 존재
- [ ] `web/src/types/mqtt.ts` 파일 존재

**검증 명령어**:
```powershell
# 타입 파일 확인
Test-Path web\src\types\database.ts
Test-Path web\src\types\sensor.ts
Test-Path web\src\types\actuator.ts
Test-Path web\src\types\mqtt.ts
```

#### ✅ TypeScript 컴파일 확인
```powershell
# web 폴더로 이동
cd web

# TypeScript 컴파일 확인 (package.json이 있는 경우)
# npm install (처음 한 번만)
# npx tsc --noEmit
```

### 7단계: Supabase 클라이언트 검증

#### ✅ 클라이언트 파일 확인
- [ ] `web/src/lib/supabase/client.ts` 존재
- [ ] `web/src/lib/supabase/server.ts` 존재
- [ ] `web/src/lib/supabase/types.ts` 존재

**검증 명령어**:
```powershell
Test-Path web\src\lib\supabase\client.ts
Test-Path web\src\lib\supabase\server.ts
Test-Path web\src\lib\supabase\types.ts
```

#### ✅ 클라이언트 연결 테스트

간단한 테스트 스크립트 생성:

**`web/test-supabase-connection.ts`** (임시 테스트 파일):
```typescript
import { createClient } from './src/lib/supabase/client';

async function testConnection() {
  try {
    const supabase = createClient();
    
    // 테이블 목록 조회 테스트
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ 연결 실패:', error.message);
      return false;
    }
    
    console.log('✅ Supabase 연결 성공!');
    console.log('✅ 데이터 조회 성공:', data);
    return true;
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    return false;
  }
}

testConnection();
```

## 종합 검증 스크립트

### PowerShell 검증 스크립트

**`verify-db-setup.ps1`**:
```powershell
Write-Host "=== DB 구현 검증 시작 ===" -ForegroundColor Cyan

# 1. 파일 존재 확인
Write-Host "`n[1] 파일 존재 확인" -ForegroundColor Yellow
$files = @(
    "supabase\migrations\001_initial_schema.sql",
    "supabase\migrations\002_add_indexes.sql",
    "supabase\migrations\003_add_rls_policies.sql",
    "supabase\seed.sql",
    "web\src\lib\supabase\client.ts",
    "web\src\lib\supabase\server.ts",
    "web\src\types\database.ts",
    "web\src\types\sensor.ts",
    "web\src\types\actuator.ts",
    "web\src\types\mqtt.ts"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (없음)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# 2. 환경 변수 파일 확인
Write-Host "`n[2] 환경 변수 파일 확인" -ForegroundColor Yellow
if (Test-Path "web\.env.local.example") {
    Write-Host "  ✅ web\.env.local.example 존재" -ForegroundColor Green
} else {
    Write-Host "  ❌ web\.env.local.example 없음" -ForegroundColor Red
}

if (Test-Path "web\.env.local") {
    Write-Host "  ✅ web\.env.local 존재" -ForegroundColor Green
    $envContent = Get-Content "web\.env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "  ✅ NEXT_PUBLIC_SUPABASE_URL 설정됨" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  NEXT_PUBLIC_SUPABASE_URL 미설정" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  web\.env.local 없음 (생성 필요)" -ForegroundColor Yellow
}

# 3. 마이그레이션 파일 내용 확인
Write-Host "`n[3] 마이그레이션 파일 내용 확인" -ForegroundColor Yellow
$migration1 = Get-Content "supabase\migrations\001_initial_schema.sql" -Raw
if ($migration1 -match "CREATE TABLE.*sensor_data") {
    Write-Host "  ✅ sensor_data 테이블 정의 존재" -ForegroundColor Green
} else {
    Write-Host "  ❌ sensor_data 테이블 정의 없음" -ForegroundColor Red
}

if ($migration1 -match "CREATE TABLE.*actuator_control") {
    Write-Host "  ✅ actuator_control 테이블 정의 존재" -ForegroundColor Green
} else {
    Write-Host "  ❌ actuator_control 테이블 정의 없음" -ForegroundColor Red
}

if ($migration1 -match "CREATE TABLE.*system_settings") {
    Write-Host "  ✅ system_settings 테이블 정의 존재" -ForegroundColor Green
} else {
    Write-Host "  ❌ system_settings 테이블 정의 없음" -ForegroundColor Red
}

Write-Host "`n=== 검증 완료 ===" -ForegroundColor Cyan
```

## Supabase 대시보드에서 수동 검증

### 1. Table Editor 확인
1. Supabase 대시보드 → **Table Editor**
2. 다음 테이블 확인:
   - `sensor_data`
   - `actuator_control`
   - `system_settings`

### 2. SQL Editor로 쿼리 실행
1. Supabase 대시보드 → **SQL Editor**
2. 위의 SQL 쿼리들을 실행하여 결과 확인

### 3. API 확인
1. Supabase 대시보드 → **Settings** → **API**
2. REST API 엔드포인트 확인:
   - `https://your-project.supabase.co/rest/v1/sensor_data`
   - `https://your-project.supabase.co/rest/v1/actuator_control`
   - `https://your-project.supabase.co/rest/v1/system_settings`

## 문제 해결

### 테이블이 없는 경우
- 마이그레이션 파일을 Supabase 대시보드의 SQL Editor에서 실행
- 또는 Supabase CLI 사용: `supabase db push`

### 환경 변수 오류
- `web/.env.local` 파일이 올바른 위치에 있는지 확인
- 환경 변수 값이 정확한지 확인
- Next.js 개발 서버 재시작

### 타입 오류
- `web/src/types/database.ts` 파일이 최신인지 확인
- Supabase CLI로 타입 재생성: `supabase gen types typescript --linked > web/src/types/database.ts`

## 다음 단계

검증이 완료되면:
1. ✅ 모든 테이블이 생성됨
2. ✅ 인덱스가 생성됨
3. ✅ RLS 정책이 적용됨
4. ✅ 초기 데이터가 삽입됨
5. ✅ TypeScript 타입이 정의됨
6. ✅ Supabase 클라이언트가 설정됨

→ **2단계: MQTT 데이터 흐름** 구현으로 진행 가능
