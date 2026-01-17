# Supabase 마이그레이션 실행 가이드

## 현재 상태

검증 스크립트 결과:
- ✅ 모든 마이그레이션 파일 존재
- ✅ 환경 변수 설정 완료
- ⚠️ Supabase 대시보드에 테이블이 아직 생성되지 않음

## 마이그레이션 실행 방법

### 방법 1: Supabase 대시보드 SQL Editor 사용 (권장)

#### 1단계: SQL Editor 열기
1. Supabase 대시보드에서 왼쪽 사이드바의 **SQL Editor** 클릭
2. "New query" 버튼 클릭

#### 2단계: 마이그레이션 파일 실행

**순서대로 실행해야 합니다:**

**1. 초기 스키마 생성**
- `supabase/migrations/001_initial_schema.sql` 파일 내용을 복사
- SQL Editor에 붙여넣기
- "Run" 버튼 클릭 (또는 `Ctrl + Enter`)
- 성공 메시지 확인: "Success. No rows returned"

**2. 인덱스 추가**
- `supabase/migrations/002_add_indexes.sql` 파일 내용을 복사
- SQL Editor에 붙여넣기
- "Run" 버튼 클릭
- 성공 메시지 확인

**3. RLS 정책 추가**
- `supabase/migrations/003_add_rls_policies.sql` 파일 내용을 복사
- SQL Editor에 붙여넣기
- "Run" 버튼 클릭
- 성공 메시지 확인

**4. 초기 데이터 삽입**
- `supabase/seed.sql` 파일 내용을 복사
- SQL Editor에 붙여넣기
- "Run" 버튼 클릭
- 성공 메시지 확인

#### 3단계: 테이블 생성 확인

1. 왼쪽 사이드바에서 **Table Editor** 클릭
2. 다음 테이블들이 보이는지 확인:
   - `sensor_data`
   - `actuator_control`
   - `system_settings`

### 방법 2: Supabase CLI 사용

```powershell
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref your-project-id

# 마이그레이션 푸시
supabase db push
```

## 마이그레이션 실행 후 확인

### Table Editor에서 확인
1. **Table Editor**로 이동
2. 테이블 목록 확인:
   - `sensor_data` - 센서 데이터 테이블
   - `actuator_control` - 액츄에이터 제어 이력 테이블
   - `system_settings` - 시스템 설정 테이블

### SQL 쿼리로 확인

SQL Editor에서 다음 쿼리 실행:

```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- sensor_data 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sensor_data'
ORDER BY ordinal_position;

-- 초기 데이터 확인
SELECT * FROM system_settings;
```

## 예상 결과

### Table Editor에서 보이는 것:
- `sensor_data` 테이블 (6개 컬럼)
- `actuator_control` 테이블 (6개 컬럼)
- `system_settings` 테이블 (4개 컬럼, 4개 행)

### system_settings 테이블 데이터:
- `sensor_thresholds`
- `actuator_defaults`
- `auto_control_rules`
- `data_collection_interval`

## 문제 해결

### 오류: "relation already exists"
- 테이블이 이미 존재하는 경우
- 해결: `DROP TABLE` 문으로 기존 테이블 삭제 후 재실행

### 오류: "permission denied"
- 권한 문제
- 해결: 프로젝트 소유자인지 확인

### 테이블이 보이지 않음
- 페이지 새로고침 (F5)
- Table Editor에서 "Refresh" 버튼 클릭

## 다음 단계

마이그레이션 완료 후:
1. ✅ 테이블 생성 확인
2. ✅ 초기 데이터 확인
3. ✅ TypeScript 타입 재생성 (선택사항)
4. → **2단계: MQTT 데이터 흐름** 구현으로 진행
