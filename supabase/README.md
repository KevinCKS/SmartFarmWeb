# Supabase 설정 가이드

## 프로젝트 생성

### 1. Supabase 프로젝트 생성

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `smartfarm-web`
   - Database Password: 안전한 비밀번호 설정
   - Region: 가장 가까운 리전 선택

### 2. 프로젝트 설정 확인

프로젝트 생성 후 다음 정보를 확인하세요:
- Project URL: `https://your-project-id.supabase.co`
- Anon Key: `Settings > API > anon public`
- Service Role Key: `Settings > API > service_role` (비밀번호 보호 필요)

## 마이그레이션 실행

### 로컬 개발 환경 (Supabase CLI)

```bash
# Supabase CLI 설치
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 초기화 (이미 초기화된 경우 생략)
supabase init

# 로컬 Supabase 시작
supabase start

# 마이그레이션 실행
supabase db reset
```

### 원격 프로젝트에 마이그레이션 적용

```bash
# 프로젝트 링크
supabase link --project-ref your-project-id

# 마이그레이션 푸시
supabase db push
```

또는 Supabase 대시보드에서:
1. `SQL Editor`로 이동
2. 각 마이그레이션 파일의 내용을 복사하여 실행
3. 순서대로 실행:
   - `001_initial_schema.sql`
   - `002_add_indexes.sql`
   - `003_add_rls_policies.sql`
4. `seed.sql` 실행 (초기 데이터 삽입)

## TypeScript 타입 생성

### Supabase CLI 사용

```bash
# 타입 생성
supabase gen types typescript --linked > web/src/types/database.ts
```

### 수동 생성

1. Supabase 대시보드 > `Settings > API`
2. `Generate TypeScript types` 클릭
3. 생성된 타입을 `web/src/types/database.ts`에 복사

## 환경 변수 설정

1. `web/.env.local.example`를 복사하여 `web/.env.local` 생성
2. Supabase 프로젝트 정보 입력:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Realtime 설정

Supabase 대시보드에서:
1. `Database > Replication`으로 이동
2. 다음 테이블에 대해 Realtime 활성화:
   - `sensor_data`
   - `actuator_control`

## 보안 설정

### Row Level Security (RLS)

RLS 정책은 `003_add_rls_policies.sql`에 정의되어 있습니다.

현재 설정:
- 센서 데이터: 모든 사용자 조회 가능
- 액츄에이터 제어: 모든 사용자 조회/삽입 가능 (임시)
- 시스템 설정: 모든 사용자 조회 가능

**주의**: 프로덕션 환경에서는 인증 시스템 구현 후 RLS 정책을 수정해야 합니다.

## 테스트

마이그레이션 후 다음 쿼리로 테스트:

```sql
-- 테이블 확인
SELECT * FROM sensor_data LIMIT 1;
SELECT * FROM actuator_control LIMIT 1;
SELECT * FROM system_settings;

-- 인덱스 확인
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('sensor_data', 'actuator_control', 'system_settings');
```
