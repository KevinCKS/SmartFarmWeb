# Product Requirements Document (PRD)
## 스마트팜 웹서비스 프로젝트

---

## 1. 프로젝트 개요

### 1.1 프로젝트명
스마트팜 웹서비스 (SmartFarm Web Service)

### 1.2 프로젝트 목적
아두이노 기반 하드웨어와 웹 대시보드를 연동하여 실시간 모니터링 및 원격 제어 기능을 제공하는 스마트팜 시스템을 구축합니다.

### 1.3 프로젝트 범위
- 하드웨어: 아두이노 우노 R4 기반 센서 및 액츄에이터 제어
- 통신: MQTT 프로토콜을 통한 실시간 데이터 통신
- 백엔드: Next.js API Routes를 통한 서버 로직 처리
- 프론트엔드: Next.js 기반 웹 대시보드
- 데이터베이스: Supabase (PostgreSQL)를 통한 데이터 저장 및 관리

---

## 2. 시스템 아키텍처

### 2.1 전체 아키텍처

```
┌─────────────────────────────────────────┐
│ 하드웨어 레이어                          │
│ - Arduino Uno R4                        │
│ - C++ (Arduino)                         │
│ - PubSubClient (MQTT)                   │
│                                         │
│ 센서: 온도, 습도, EC, pH                │
│ 액츄에이터: LED, 펌프, 팬1, 팬2         │
└─────────────────────────────────────────┘
                    ↓ MQTT
┌─────────────────────────────────────────┐
│ MQTT 브로커                             │
│ - Mosquitto (로컬/운영)                 │
│                                         │
│ 토픽:                                   │
│ - smartfarm/sensors/*                   │
│ - smartfarm/actuators/*                 │
└─────────────────────────────────────────┘
                    ↓ MQTT
┌─────────────────────────────────────────┐
│ 백엔드 레이어                            │
│ - Node.js 18+ LTS                       │
│ - Next.js 14+ (API Routes)              │
│ - mqtt (MQTT 클라이언트)                │
│ - Supabase Client                       │
│                                         │
│ API Routes:                             │
│ - /api/sensors                          │
│ - /api/actuators                        │
│ - /api/mqtt                             │
└─────────────────────────────────────────┘
                    ↓ REST API / Supabase Realtime
┌─────────────────────────────────────────┐
│ 데이터베이스 레이어                       │
│ - Supabase (PostgreSQL)                 │
│                                         │
│ 테이블:                                 │
│ - sensor_data                           │
│ - actuator_control                      │
│ - system_settings                       │
│                                         │
│ 기능:                                   │
│ - 실시간 구독 (Realtime)                │
│ - 자동 API 생성                         │
└─────────────────────────────────────────┘
                    ↓ Supabase Realtime / REST API
┌─────────────────────────────────────────┐
│ 프론트엔드 레이어                        │
│ - Next.js 14+ (App Router)              │
│ - React 18+                             │
│ - TypeScript                             │
│ - Tailwind CSS                          │
│ - shadcn/ui                             │
│ - Recharts (차트)                       │
│                                         │
│ 페이지:                                 │
│ - /dashboard (대시보드)                 │
│ - /settings (설정)                      │
│                                         │
│ 컴포넌트:                               │
│ - SensorCard, SensorChart               │
│ - ActuatorControl                       │
│ - RealTimePanel                         │
└─────────────────────────────────────────┘
```

### 2.2 기술 스택

#### 하드웨어
- **보드**: Arduino Uno R4
- **언어**: C++ (Arduino)
- **라이브러리**: 
  - PubSubClient (MQTT)
  - DHT sensor library
  - ArduinoJson

#### 통신
- **프로토콜**: MQTT
- **브로커**: Mosquitto

#### 백엔드
- **런타임**: Node.js 18+ LTS
- **프레임워크**: Next.js 14+ (App Router)
- **MQTT 클라이언트**: mqtt (npm)
- **데이터베이스 클라이언트**: @supabase/supabase-js

#### 데이터베이스
- **플랫폼**: Supabase
- **DB**: PostgreSQL
- **기능**: Realtime, Auto API, Row Level Security

#### 프론트엔드
- **프레임워크**: Next.js 14+ (App Router)
- **UI 라이브러리**: React 18+
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: shadcn/ui
- **차트**: Recharts
- **버전 관리**: Git

---

## 3. 기능 요구사항

### 3.1 센서 모니터링

#### 3.1.1 센서 종류
- **온도 센서** (DHT22)
  - 측정 범위: -40°C ~ 80°C
  - 정확도: ±0.5°C
  - 단위: °C
  
- **습도 센서** (DHT22)
  - 측정 범위: 0% ~ 100% RH
  - 정확도: ±2% RH
  - 단위: %
  
- **EC 센서** (전기전도도)
  - 측정 범위: 0 ~ 20 mS/cm
  - 단위: mS/cm
  
- **pH 센서**
  - 측정 범위: 0 ~ 14 pH
  - 단위: pH

#### 3.1.2 센서 데이터 수집
- **수집 주기**: 5초 간격
- **전송 방식**: MQTT Publish
- **데이터 형식**: JSON
- **토픽 구조**:
  - `smartfarm/sensors/temperature`
  - `smartfarm/sensors/humidity`
  - `smartfarm/sensors/ec`
  - `smartfarm/sensors/ph`
  - `smartfarm/sensors/all` (통합 데이터)

#### 3.1.3 센서 데이터 표시
- 실시간 센서 값 표시
- 시계열 차트 (최근 1시간, 24시간, 7일)
- 센서별 카드 뷰
- 임계값 경고 표시

### 3.2 액츄에이터 제어

#### 3.2.1 액츄에이터 종류
- **식물성장 LED**
  - 제어 방식: PWM
  - 밝기 조절: 0 ~ 100%
  - 핀: Digital 3 (PWM)
  
- **양액 펌프**
  - 제어 방식: 릴레이 (ON/OFF)
  - 핀: Digital 4
  
- **팬 1**
  - 제어 방식: 릴레이 (ON/OFF)
  - 핀: Digital 5
  
- **팬 2**
  - 제어 방식: 릴레이 (ON/OFF)
  - 핀: Digital 6

#### 3.2.2 제어 기능
- 웹 대시보드에서 원격 제어
- 개별 제어 및 일괄 제어
- 제어 이력 저장
- 실시간 상태 표시

#### 3.2.3 MQTT 토픽 구조
- `smartfarm/actuators/led`
- `smartfarm/actuators/pump`
- `smartfarm/actuators/fan1`
- `smartfarm/actuators/fan2`
- `smartfarm/actuators/all` (일괄 제어)

### 3.3 웹 대시보드

#### 3.3.1 대시보드 페이지 (`/dashboard`)
- 센서 데이터 실시간 표시
- 센서 데이터 시계열 차트
- 액츄에이터 제어 패널
- 시스템 상태 표시

#### 3.3.2 설정 페이지 (`/settings`)
- 센서 임계값 설정
- 자동 제어 규칙 설정
- 시스템 설정

#### 3.3.3 UI/UX 요구사항
- 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 다크 모드 지원 (선택사항)
- 직관적인 인터페이스
- 실시간 업데이트 (Supabase Realtime)

### 3.4 데이터 관리

#### 3.4.1 데이터베이스 스키마
- **sensor_data 테이블**
  - id (BIGSERIAL PRIMARY KEY)
  - sensor_type (VARCHAR)
  - value (DECIMAL)
  - unit (VARCHAR)
  - created_at (TIMESTAMP)
  - device_id (VARCHAR)

- **actuator_control 테이블**
  - id (BIGSERIAL PRIMARY KEY)
  - actuator_type (VARCHAR)
  - action (VARCHAR)
  - value (INTEGER)
  - created_at (TIMESTAMP)
  - user_id (UUID)

- **system_settings 테이블**
  - id (BIGSERIAL PRIMARY KEY)
  - setting_key (VARCHAR UNIQUE)
  - setting_value (JSONB)
  - updated_at (TIMESTAMP)

#### 3.4.2 데이터 저장
- 센서 데이터 자동 저장 (5초 간격)
- 제어 이력 저장
- 설정값 저장

#### 3.4.3 데이터 조회
- REST API를 통한 데이터 조회
- Supabase Realtime을 통한 실시간 구독
- 시계열 데이터 조회 (최근 N시간/일)

---

## 4. 비기능 요구사항

### 4.1 성능
- 센서 데이터 수집 주기: 5초
- MQTT 메시지 지연: < 1초
- 웹 페이지 로딩 시간: < 2초
- 실시간 업데이트 지연: < 500ms

### 4.2 안정성
- MQTT 연결 자동 재연결
- WiFi 연결 자동 재연결
- 센서 오류 처리
- 데이터베이스 연결 오류 처리

### 4.3 보안
- MQTT 인증 (선택사항)
- Supabase Row Level Security (RLS)
- 환경 변수를 통한 민감 정보 관리

### 4.4 확장성
- 다중 디바이스 지원 가능한 구조
- 새로운 센서/액츄에이터 추가 용이
- 모듈화된 코드 구조

---

## 5. 프로젝트 구조

```
SmartFarmWeb_01/
├── 01_Initial/
│   ├── README.md
│   ├── .gitignore
│   │
│   ├── arduino/                          # 아두이노 펌웨어
│   │   ├── smartfarm_uno_r4/
│   │   │   ├── smartfarm_uno_r4.ino
│   │   │   ├── sensors.h
│   │   │   ├── sensors.cpp
│   │   │   ├── actuators.h
│   │   │   ├── actuators.cpp
│   │   │   ├── mqtt_client.h
│   │   │   └── mqtt_client.cpp
│   │   └── README.md
│   │
│   ├── web/                              # Next.js 웹 애플리케이션
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   ├── .env.local.example
│   │   │
│   │   ├── src/
│   │   │   ├── app/                      # Next.js App Router
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── globals.css
│   │   │   │   ├── api/                  # API Routes
│   │   │   │   ├── dashboard/
│   │   │   │   └── settings/
│   │   │   ├── components/               # React 컴포넌트
│   │   │   ├── lib/                      # 유틸리티 및 설정
│   │   │   ├── types/                    # TypeScript 타입
│   │   │   └── styles/
│   │   └── components.json               # shadcn/ui 설정
│   │
│   ├── mqtt/                              # MQTT 설정
│   │   ├── mosquitto.conf
│   │   └── topics.md
│   │
│   ├── supabase/                          # Supabase 설정
│   │   ├── migrations/
│   │   └── seed.sql
│   │
│   └── docs/                              # 문서
│       ├── PRD.md                        # 이 문서
│       ├── architecture.md
│       ├── setup.md
│       ├── api.md
│       └── hardware.md
```

---

## 6. 개발 단계

### Phase 1: 기초 설정 및 아키텍처 설계 ✅
- [x] 프로젝트 구조 설계
- [x] 기술 스택 정의
- [x] 아키텍처 다이어그램 작성
- [x] PRD 작성

### Phase 2: 하드웨어 및 통신 구현
- [ ] 아두이노 펌웨어 개발
- [ ] 센서 데이터 읽기 구현
- [ ] MQTT 클라이언트 구현
- [ ] 액츄에이터 제어 로직 구현
- [ ] MQTT 브로커 설정

### Phase 3: 백엔드 개발
- [ ] Next.js 프로젝트 초기화
- [ ] Supabase 프로젝트 생성 및 설정
- [ ] 데이터베이스 스키마 마이그레이션
- [ ] MQTT 클라이언트 연동
- [ ] API Routes 구현
- [ ] Supabase Realtime 연동

### Phase 4: 프론트엔드 개발
- [ ] Next.js 프로젝트 설정
- [ ] shadcn/ui 설정
- [ ] 대시보드 페이지 구현
- [ ] 센서 데이터 표시 컴포넌트
- [ ] 차트 컴포넌트 구현
- [ ] 액츄에이터 제어 UI 구현
- [ ] 실시간 업데이트 구현

### Phase 5: 고급 기능 및 최적화
- [ ] 자동 제어 로직 구현
- [ ] 알림 시스템 구현
- [ ] 성능 최적화
- [ ] 테스트 작성
- [ ] 배포 및 모니터링

---

## 7. 하드웨어 연결 사양

### 7.1 센서 연결
- **DHT22 (온도/습도)**: Digital Pin 2
- **EC 센서**: Analog Pin A0
- **pH 센서**: Analog Pin A1

### 7.2 액츄에이터 연결
- **LED**: Digital Pin 3 (PWM)
- **펌프**: Digital Pin 4 (릴레이 모듈)
- **팬 1**: Digital Pin 5 (릴레이 모듈)
- **팬 2**: Digital Pin 6 (릴레이 모듈)

### 7.3 통신
- **WiFi**: Arduino Uno R4 WiFi 내장
- **MQTT**: WiFi를 통한 MQTT 통신

---

## 8. MQTT 토픽 구조

### 8.1 센서 데이터 (Publish)
```
smartfarm/sensors/temperature
smartfarm/sensors/humidity
smartfarm/sensors/ec
smartfarm/sensors/ph
smartfarm/sensors/all
```

### 8.2 액츄에이터 제어 (Subscribe)
```
smartfarm/actuators/led
smartfarm/actuators/pump
smartfarm/actuators/fan1
smartfarm/actuators/fan2
smartfarm/actuators/all
```

### 8.3 상태 (Publish)
```
smartfarm/status
```

---

## 9. API 명세

### 9.1 센서 데이터 API
- `GET /api/sensors` - 센서 데이터 조회
- `GET /api/sensors/latest` - 최신 센서 데이터
- `GET /api/sensors/:type` - 특정 센서 데이터

### 9.2 액츄에이터 제어 API
- `POST /api/actuators` - 액츄에이터 제어
- `GET /api/actuators/status` - 액츄에이터 상태 조회

### 9.3 설정 API
- `GET /api/settings` - 설정 조회
- `POST /api/settings` - 설정 업데이트

---

## 10. 데이터 형식

### 10.1 센서 데이터 (JSON)
```json
{
  "sensor": "temperature",
  "value": 25.5,
  "unit": "°C",
  "timestamp": 12345678
}
```

### 10.2 통합 센서 데이터 (JSON)
```json
{
  "temperature": 25.5,
  "humidity": 60.0,
  "ec": 2.5,
  "ph": 6.5,
  "timestamp": 12345678
}
```

### 10.3 액츄에이터 제어 (JSON)
```json
{
  "state": true,
  "brightness": 80
}
```

---

## 11. 환경 변수

### 11.1 아두이노 (mqtt_client.h)
```cpp
#define WIFI_SSID "your_wifi_ssid"
#define WIFI_PASSWORD "your_wifi_password"
#define MQTT_BROKER "your_mqtt_broker_ip"
#define MQTT_PORT 1883
```

### 11.2 Next.js (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_CLIENT_ID=smartfarm-nextjs
```

---

## 12. 제약사항 및 가정

### 12.1 제약사항
- 아두이노 우노 R4는 WiFi 연결이 필요합니다
- MQTT 브로커는 네트워크에서 접근 가능해야 합니다
- Supabase 계정 및 프로젝트가 필요합니다

### 12.2 가정
- 사용자는 기본적인 아두이노 및 웹 개발 지식을 보유하고 있습니다
- 네트워크 환경이 안정적입니다
- 센서 및 액츄에이터 하드웨어가 정상 작동합니다

---

## 13. 향후 확장 계획

### 13.1 기능 확장
- 다중 디바이스 지원
- 사용자 인증 및 권한 관리
- 알림 시스템 (이메일, 푸시)
- 자동 제어 규칙 엔진
- 데이터 분석 및 리포트

### 13.2 기술 확장
- 모바일 앱 (React Native)
- 머신러닝 기반 예측
- 클라우드 배포 (Vercel, AWS)

---

## 14. 참고 문서

- [Arduino Uno R4 WiFi 공식 문서](https://docs.arduino.cc/)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [MQTT 프로토콜 사양](https://mqtt.org/)
- [shadcn/ui 문서](https://ui.shadcn.com/)

---

## 15. 승인 및 검토

### 15.1 문서 정보
- **작성일**: 2024년
- **버전**: 1.0
- **작성자**: 개발팀

### 15.2 검토자
- [ ] 프로젝트 매니저
- [ ] 기술 리더
- [ ] 하드웨어 엔지니어
- [ ] 프론트엔드 개발자
- [ ] 백엔드 개발자

---

**문서 끝**

