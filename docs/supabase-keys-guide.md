# Supabase 키 값 확인 가이드

## 개요

Supabase 프로젝트를 사용하기 위해서는 다음 3가지 키 값이 필요합니다:
1. **Project URL** - 프로젝트 URL
2. **Anon Key** - 공개 API 키 (클라이언트에서 사용)
3. **Service Role Key** - 서비스 롤 키 (서버에서만 사용, RLS 우회)

## 단계별 가이드

### 1단계: Supabase 대시보드 접속

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트가 없다면 "New Project" 클릭하여 프로젝트 생성
3. 프로젝트 목록에서 사용할 프로젝트 선택

### 2단계: API 설정 페이지로 이동

1. 왼쪽 사이드바에서 **Settings** (⚙️ 아이콘) 클릭
2. **API** 메뉴 클릭

### 3단계: 키 값 확인

API 설정 페이지에서 다음 정보를 확인할 수 있습니다:

#### Project URL
- **위치**: 페이지 상단의 "Project URL" 섹션
- **형식**: `https://xxxxxxxxxxxxx.supabase.co`
- **용도**: `NEXT_PUBLIC_SUPABASE_URL` 환경 변수에 사용

#### API Keys 섹션

**anon public** (Anon Key)
- **위치**: "Project API keys" 섹션의 "anon public" 키
- **특징**: 
  - 공개 키 (브라우저에서 사용 가능)
  - Row Level Security (RLS) 정책을 따름
  - 클라이언트 사이드에서 안전하게 사용 가능
- **용도**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수에 사용
- **복사 방법**: 키 옆의 "Copy" 버튼 클릭 또는 키를 직접 복사

**service_role** (Service Role Key)
- **위치**: "Project API keys" 섹션의 "service_role" 키
- **특징**:
  - **비밀 키** (절대 공개하지 마세요!)
  - RLS 정책을 우회함
  - 서버 사이드에서만 사용해야 함
  - 브라우저에 노출되면 안 됨
- **용도**: `SUPABASE_SERVICE_ROLE_KEY` 환경 변수에 사용
- **복사 방법**: 키 옆의 "Copy" 버튼 클릭 또는 키를 직접 복사
- **⚠️ 주의**: 이 키는 "Reveal" 버튼을 클릭해야 표시됩니다

### 4단계: 환경 변수 파일에 입력

확인한 키 값을 `web/.env.local` 파일에 입력하세요:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1Mjg5NjAwLCJleHAiOjE5NjA4NjU2MDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NDUyODk2MDAsImV4cCI6MTk2MDg2NTYwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 시각적 가이드

```
Supabase Dashboard
├── Settings (⚙️)
│   └── API
│       ├── Project URL: https://xxx.supabase.co
│       └── Project API keys
│           ├── anon public: eyJhbGc... (Copy 버튼)
│           └── service_role: [Reveal] → eyJhbGc... (Copy 버튼)
```

## 키 값 예시

### Project URL
```
https://abcdefghijklmnop.supabase.co
```

### Anon Key (예시)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTI4OTYwMCwiZXhwIjoxOTYwODY1NjAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Service Role Key (예시)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1Mjg5NjAwLCJleHAiOjE5NjA4NjU2MDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 보안 주의사항

### ✅ 안전한 사용
- `NEXT_PUBLIC_SUPABASE_URL`: 공개 가능 (브라우저에서 사용)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 공개 가능 (RLS로 보호됨)
- `SUPABASE_SERVICE_ROLE_KEY`: **서버에서만 사용**, 절대 공개하지 마세요!

### ❌ 절대 하지 말아야 할 것
- Service Role Key를 클라이언트 코드에 포함
- Service Role Key를 Git에 커밋
- Service Role Key를 공개 저장소에 업로드
- Service Role Key를 환경 변수 파일을 공유

### 🔒 보안 체크리스트
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] Service Role Key가 브라우저 코드에 포함되지 않았는지 확인
- [ ] 환경 변수 파일을 다른 사람과 공유하지 않았는지 확인

## 문제 해결

### 키를 찾을 수 없을 때
1. Supabase 대시보드에 로그인되어 있는지 확인
2. 올바른 프로젝트를 선택했는지 확인
3. Settings > API 페이지로 이동했는지 확인

### Service Role Key가 보이지 않을 때
1. "Reveal" 버튼을 클릭해야 표시됩니다
2. 프로젝트 소유자 권한이 있는지 확인

### 키가 작동하지 않을 때
1. 키를 정확히 복사했는지 확인 (앞뒤 공백 없음)
2. 환경 변수 파일이 `web/` 폴더에 있는지 확인
3. Next.js 개발 서버를 재시작했는지 확인

## 추가 리소스

- [Supabase 공식 문서 - API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Supabase 공식 문서 - 환경 변수](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
