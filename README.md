# SmartFarm Web Service - DB 기반 구조

스마트팜 웹 서비스의 데이터베이스 기반 구조를 구축하는 단계입니다.

## 프로젝트 구조

```
02_DB/
├── supabase/              # Supabase 설정 및 마이그레이션
│   ├── migrations/        # DB 마이그레이션 파일
│   ├── functions/         # Edge Functions (선택사항)
│   └── seed.sql           # 초기 데이터
├── web/                   # Next.js 웹 애플리케이션
│   ├── .env.local.example # 환경 변수 예제 파일
│   └── src/
│       ├── lib/supabase/  # Supabase 클라이언트 설정
│       └── types/         # TypeScript 타입 정의
└── docs/                  # 문서
```

## 개발 단계

### 1단계: DB 기반 구조 (현재 단계)
- [x] Supabase 프로젝트 생성
- [x] 스키마 마이그레이션
- [x] TypeScript 타입 생성
- [x] Supabase 클라이언트 설정

**검증 방법**:
```powershell
# 검증 스크립트 실행
.\verify-db-setup.ps1
```

자세한 검증 방법은 `docs/database-verification.md`를 참고하세요.

### 2단계: MQTT 데이터 흐름
- [x] MQTT 클라이언트 구현
- [x] MQTT → DB 저장 로직
- [x] API Routes 구현

**테스트 방법**:
```powershell
# 1. 환경 변수 파일 생성 (처음 한 번만)
.\setup-env.ps1

# 2. web\.env.local 파일을 열어서 실제 값으로 수정
#    - HiveMQ Cloud: docs/hivemq-cloud-setup.md 참고
#    - Supabase: docs/supabase-keys-guide.md 참고

# 3. Next.js 서버 실행 (별도 터미널)
cd web
npm run dev

# 4. 테스트 스크립트 실행
.\test-mqtt-api.ps1
```

자세한 테스트 방법은 `docs/mqtt-testing-guide.md`를 참고하세요.

### 3단계: 프론트엔드 UI
- Next.js 프로젝트 설정
- 컴포넌트 구현
- 페이지 구현

## 데이터베이스 스키마

### 테이블
- `sensor_data`: 센서 데이터 저장
- `actuator_control`: 액츄에이터 제어 이력
- `system_settings`: 시스템 설정

자세한 내용은 `docs/PRD.md`와 `docs/database-setup.md`를 참고하세요.

## 환경 변수 설정

Next.js 프로젝트의 `web/.env.local.example` 파일을 참고하여 `web/.env.local` 파일을 생성하세요.

**파일명 설명**:
- `web/.env.local.example`: 예제 파일 (Git에 커밋됨, 실제 값 없음)
- `web/.env.local`: 실제 환경 변수 파일 (Git에 커밋되지 않음, 실제 값 입력)

**참고**: `.env.local.example`은 예제 파일입니다. 실제 사용을 위해서는 `.env.local` 파일을 생성해야 합니다.

```powershell
# PowerShell에서 web/.env.local.example을 복사하여 web/.env.local 생성
Copy-Item web\.env.local.example web\.env.local
```

생성된 `web/.env.local` 파일에 Supabase 및 HiveMQ Cloud 프로젝트 정보를 입력하세요. 

### Supabase 키 값 확인 방법
1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 → **Settings** → **API** 메뉴로 이동
3. 다음 정보 확인:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 사용
   - **anon public** 키: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용
   - **service_role** 키: `SUPABASE_SERVICE_ROLE_KEY`에 사용 (Reveal 버튼 클릭 필요)

자세한 내용은 `docs/supabase-keys-guide.md`를 참고하세요.

### HiveMQ Cloud 설정 값 확인 방법
1. [HiveMQ Cloud 대시보드](https://console.hivemq.cloud/)에 로그인
2. 클러스터 생성 또는 기존 클러스터 선택
3. 다음 정보 확인:
   - **WebSocket URL**: `MQTT_BROKER_URL`에 사용 (예: `wss://your-cluster-id.hivemq.cloud:8884`)
   - **Username**: `MQTT_USERNAME`에 사용
   - **Password**: `MQTT_PASSWORD`에 사용 (클러스터 생성 시 제공)
   - **Client ID**: `MQTT_CLIENT_ID`에 사용 (선택사항, 미설정 시 자동 생성)

자세한 내용은 `docs/hivemq-cloud-setup.md`를 참고하세요.

**주의**: `.env.local` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨). 실제 환경 변수 값은 절대 공유하지 마세요.
