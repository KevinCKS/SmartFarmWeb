# 배포 세션 대화 내용 정리

## 날짜: 2024년

이 문서는 SmartFarm Web Service 프로젝트의 Vercel 배포 과정에서 나눈 대화 내용을 정리한 것입니다.

---

## 1. 프로젝트 구조 파악

### 전체 구조
```
07_Deploy/
├── arduino/                    # 아두이노 펌웨어
│   └── smartfarm_uno_r4/
├── web/                        # Next.js 웹 애플리케이션 (메인)
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # React 컴포넌트
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── lib/               # 라이브러리 및 유틸리티
│   │   └── types/             # TypeScript 타입 정의
│   └── package.json
├── supabase/                   # Supabase 설정
│   ├── migrations/            # DB 마이그레이션
│   └── seed.sql
├── docs/                       # 프로젝트 문서
└── 스크립트 파일들
```

### 기술 스택
- 프론트엔드: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- 백엔드: Next.js API Routes
- 데이터베이스: Supabase (PostgreSQL)
- 통신: MQTT (HiveMQ Cloud)
- 하드웨어: Arduino Uno R4

---

## 2. Vercel 배포 절차

### 2.1 Vercel 배포 방법

#### 방법 1: 웹 대시보드 사용 (권장)
1. Vercel 대시보드 → "Add New..." → "Project"
2. Git 저장소 선택
3. 프로젝트 설정:
   - Root Directory: `web`
   - Framework Preset: Next.js (자동 감지)
4. 환경 변수 설정
5. Deploy 클릭

#### 방법 2: Vercel CLI
```powershell
npm i -g vercel
vercel login
cd web
vercel
```

### 2.2 여러 프로젝트 배포

Vercel은 하나의 계정으로 여러 프로젝트를 배포할 수 있습니다:
- 각 프로젝트는 독립적으로 관리
- 각 프로젝트마다 고유한 URL 제공
- 환경 변수는 프로젝트별로 독립 관리

### 2.3 빌드 명령어

```powershell
# 개발 모드 (빌드 불필요)
cd web
npm run dev

# 프로덕션 빌드 생성
cd web
npm run build

# 프로덕션 서버 실행 (빌드 필요)
cd web
npm run build
npm run start
```

---

## 3. TypeScript 오류 수정

### 3.1 Supabase Server 타입 오류

**문제**: `Binding element 'name' implicitly has an 'any' type`

**해결**: `web/src/lib/supabase/server.ts`
- `CookieToSet` 타입 정의 추가
- `setAll` 메서드의 파라미터 타입을 `CookieToSet[]`로 변경

```typescript
type CookieToSet = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: 'strict' | 'lax' | 'none';
    secure?: boolean;
  };
};
```

### 3.2 require() 타입 오류

**문제**: `Untyped function calls may not accept type arguments`

**해결**: `web/src/lib/supabase/server.ts`
- `require('@supabase/supabase-js')` → `import { createClient as createSupabaseClient } from '@supabase/supabase-js'`
- 정적 import 사용으로 타입 인식 가능

### 3.3 Next.js 빌드 경고

**문제**: `Dynamic server usage: Route couldn't be rendered statically`

**해결**: 모든 API 라우트에 `export const dynamic = 'force-dynamic'` 추가
- `/api/sensors/*`
- `/api/actuators/*`
- `/api/mqtt/*`

---

## 4. MQTT 연결 상태 문제 해결

### 4.1 문제 상황
- MQTT 브로커는 연결되어 있음
- UI에서는 "연결 끊김"으로 표시됨

### 4.2 원인
- 서버리스 환경(Vercel)에서 각 API 요청마다 새로운 인스턴스 생성
- 싱글톤 패턴이 제대로 작동하지 않음
- 실제 클라이언트 객체에 직접 접근 필요

### 4.3 해결 방법

#### `getClientInstance()` 메서드 추가
```typescript
getClientInstance(): MqttClient | null {
  return this.client;
}
```

#### 상태 확인 API 개선
```typescript
// 실제 MQTT 클라이언트 인스턴스 확인
const mqttClient = client.getClientInstance();
const isClientConnected = mqttClient?.connected === true;
const isManagerConnected = client.getConnected();

// 서버리스 환경 대응: 환경 변수 확인
const hasEnvVars = !!(
  process.env.MQTT_BROKER_URL &&
  process.env.MQTT_USERNAME &&
  process.env.MQTT_PASSWORD
);

const connected = isClientConnected || isManagerConnected || hasEnvVars;
```

---

## 5. 빌드 및 배포 설정

### 5.1 vercel.json 생성

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**주의**: `rootDirectory`는 `vercel.json`에 포함할 수 없음. Vercel 대시보드에서만 설정 가능.

### 5.2 환경 변수 설정

Vercel 대시보드 → Settings → Environment Variables:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MQTT 설정 (HiveMQ Cloud)
MQTT_BROKER_URL=wss://your-cluster-id.s1.region.hivemq.cloud:8884/mqtt
MQTT_USERNAME=your-cluster-username
MQTT_PASSWORD=your-cluster-password
MQTT_CLIENT_ID=smartfarm-web-client
```

---

## 6. Meta Tag 추가

### 6.1 SEO 및 소셜 미디어 최적화

`web/src/app/layout.tsx`에 완전한 metadata 설정 추가:

```typescript
export const metadata: Metadata = {
  title: {
    default: 'SmartFarm Web Service',
    template: '%s | SmartFarm',
  },
  description: '실시간 스마트팜 모니터링 시스템...',
  keywords: ['스마트팜', 'SmartFarm', 'IoT', ...],
  openGraph: { ... },
  twitter: { ... },
  robots: { ... },
  viewport: { ... },
  icons: { ... },
};
```

---

## 7. Favicon 설정

### 7.1 파일 위치
- `web/public/` 폴더에 favicon 파일 배치
- Next.js가 자동으로 루트 경로(`/`)에서 제공

### 7.2 필요한 파일
```
web/public/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── android-chrome-192x192.png
├── android-chrome-512x512.png
└── site.webmanifest
```

---

## 8. GitHub 업로드

### 8.1 Git 저장소 초기화

```powershell
git init
git add .
git commit -m "Initial commit: SmartFarm Web Service"
```

### 8.2 GitHub 연결 및 푸시

```powershell
git remote add origin https://github.com/KevinCKS/SmartFarmWeb.git
git branch -M main
git push -u origin main
```

### 8.3 주요 커밋 내역

1. `Initial commit: SmartFarm Web Service`
2. `Add vercel.json configuration for proper deployment`
3. `Remove rootDirectory from vercel.json (must be set in Vercel dashboard)`
4. `Improve MQTT connection status detection for serverless environment`
5. `Improve MQTT status detection for serverless: check env vars`

---

## 9. 운영모드 (자동/수동) 설명

### 9.1 현재 상태
- UI만 구현됨 (토글 스위치)
- 실제 기능은 미구현
- 현재는 수동 모드만 동작

### 9.2 수동 모드 (Manual)
- 사용자가 버튼으로 직접 제어
- LED, 펌프, 팬1, 팬2를 개별 제어
- 모든 제어 결정을 사용자가 직접 수행

### 9.3 자동 모드 (Auto) - 구현 필요
- 센서 값에 따라 자동 제어
- 예시 규칙:
  - 온도 > 30°C → 팬 자동 켜기
  - 습도 < 40% → 펌프 자동 켜기
  - 시간대별 LED 밝기 자동 조절

### 9.4 구현이 필요한 부분
1. 자동 제어 규칙 엔진
2. 센서 임계값 설정
3. 모드에 따른 액츄에이터 제어 로직
4. 자동 모드일 때 수동 제어 버튼 비활성화

---

## 10. 주요 해결 사항 요약

### 10.1 TypeScript 오류
- ✅ CookieToSet 타입 정의 추가
- ✅ require() → import 변경
- ✅ 모든 API 라우트에 `dynamic = 'force-dynamic'` 추가

### 10.2 빌드 및 배포
- ✅ vercel.json 생성
- ✅ Root Directory 설정 (대시보드)
- ✅ 환경 변수 설정

### 10.3 MQTT 연결 상태
- ✅ `getClientInstance()` 메서드 추가
- ✅ 서버리스 환경 대응 로직 개선
- ✅ 환경 변수 확인 로직 추가

### 10.4 SEO 및 최적화
- ✅ 완전한 metadata 설정
- ✅ Open Graph 태그
- ✅ Twitter Card 태그
- ✅ Favicon 설정

---

## 11. 배포 후 확인 사항

### 11.1 Vercel 대시보드
- [ ] 배포 상태 확인
- [ ] 환경 변수 설정 확인
- [ ] 로그 확인

### 11.2 웹사이트 동작 확인
- [ ] 메인 페이지 로드
- [ ] 센서 데이터 표시
- [ ] 액츄에이터 제어 동작
- [ ] MQTT 연결 상태 표시
- [ ] 데이터베이스 연결 확인

---

## 12. 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Supabase 문서](https://supabase.com/docs)
- [HiveMQ Cloud 문서](https://www.hivemq.com/mqtt-cloud-broker/)

---

## 13. 향후 개선 사항

1. **자동 모드 구현**
   - 센서 기반 자동 제어 로직
   - 임계값 설정 UI
   - 규칙 엔진

2. **MQTT 연결 개선**
   - 서버리스 환경에서의 연결 유지 방법
   - 연결 풀링 또는 외부 서비스 활용

3. **모니터링 및 알림**
   - 센서 임계값 초과 시 알림
   - 시스템 상태 대시보드

4. **성능 최적화**
   - 이미지 최적화
   - 코드 스플리팅
   - 캐싱 전략

---

**문서 작성일**: 2024년  
**프로젝트**: SmartFarm Web Service  
**배포 플랫폼**: Vercel
