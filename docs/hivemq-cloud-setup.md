# HiveMQ Cloud 설정 가이드

HiveMQ Cloud를 사용하여 MQTT 브로커를 설정하는 방법입니다.

## 1. HiveMQ Cloud 계정 생성

1. [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/)에 접속
2. 무료 계정 생성 또는 로그인

## 2. 클러스터 생성

1. HiveMQ Cloud 대시보드에 로그인
2. **"Create Cluster"** 또는 **"New Cluster"** 클릭
3. 클러스터 이름 입력 (예: `smartfarm-cluster`)
4. 리전 선택 (가장 가까운 리전 선택)
5. 클러스터 생성 완료 대기 (약 2-3분)

## 3. 환경 변수 값 확인

### 3.1 MQTT_BROKER_URL

1. HiveMQ Cloud 대시보드에서 생성한 클러스터 선택
2. **"Overview"** 또는 **"Connection Details"** 탭으로 이동
3. **TLS WebSocket URL** 필드 확인
   - 형식: `your-cluster-id.s1.region.hivemq.cloud:8884/mqtt`
   - 예시: `b0ac673e3e77419584a63901db184810.s1.eu.hivemq.cloud:8884/mqtt`

**중요**: Next.js 웹 애플리케이션에서는 **TLS WebSocket URL**을 사용해야 합니다.

**환경 변수 설정:**
```env
# TLS WebSocket URL 앞에 wss:// 프로토콜을 붙여서 사용
MQTT_BROKER_URL=wss://b0ac673e3e77419584a63901db184810.s1.eu.hivemq.cloud:8884/mqtt
```

**참고**: 
- **TLS MQTT URL** (`:8883`)은 일반 MQTT 클라이언트용입니다
- **TLS WebSocket URL** (`:8884/mqtt`)은 웹 브라우저나 Node.js 웹 애플리케이션용입니다
- Next.js 애플리케이션에서는 **TLS WebSocket URL**을 사용하세요

### 3.2 MQTT_USERNAME

1. 클러스터의 **"Access Management"** 또는 **"Credentials"** 섹션으로 이동
2. **Username** 확인
   - 일반적으로 클러스터 ID와 동일하거나 자동 생성된 사용자 이름
   - 예시: `smartfarm-cluster` 또는 `abc123def456`

**환경 변수 설정:**
```env
MQTT_USERNAME=your-cluster-username
```

### 3.3 MQTT_PASSWORD

1. 클러스터 생성 시 자동 생성된 비밀번호 확인
2. 또는 **"Access Management"** → **"Credentials"** → **"Show Password"** 클릭
3. 비밀번호 복사 (한 번만 표시될 수 있으므로 안전하게 보관)

**환경 변수 설정:**
```env
MQTT_PASSWORD=your-cluster-password
```

### 3.4 MQTT_CLIENT_ID

클라이언트 ID는 애플리케이션에서 자동 생성하거나 수동으로 지정할 수 있습니다.

**옵션 1: 자동 생성 (기본값)**
- 환경 변수를 설정하지 않으면 자동으로 `smartfarm-web-{timestamp}` 형식으로 생성됩니다.

**옵션 2: 수동 지정**
```env
MQTT_CLIENT_ID=smartfarm-web-client
```

**참고:**
- 각 클라이언트는 고유한 Client ID를 가져야 합니다
- 동일한 Client ID로 여러 클라이언트가 연결하면 이전 연결이 끊어집니다
- 프로덕션 환경에서는 고유한 Client ID를 사용하는 것이 좋습니다

## 4. 환경 변수 파일 설정

`web/.env.local` 파일에 다음 내용을 추가하세요:

```env
# HiveMQ Cloud 설정
# TLS WebSocket URL 사용 (대시보드의 "TLS WebSocket URL" 필드 값에 wss:// 프로토콜 추가)
MQTT_BROKER_URL=wss://b0ac673e3e77419584a63901db184810.s1.eu.hivemq.cloud:8884/mqtt
MQTT_USERNAME=your-cluster-username
MQTT_PASSWORD=your-cluster-password
MQTT_CLIENT_ID=smartfarm-web-client

# Supabase 설정 (기존)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 5. 연결 테스트

### 5.1 API를 통한 연결 테스트

```bash
# MQTT 클라이언트 연결
curl -X POST http://localhost:3000/api/mqtt/connect

# 연결 상태 확인
curl http://localhost:3000/api/mqtt/status
```

### 5.2 MQTT 클라이언트 도구를 사용한 테스트

**MQTTX** 또는 **MQTT.fx** 같은 도구를 사용하여 연결을 테스트할 수 있습니다:

1. **MQTTX** 다운로드: https://mqttx.app/
2. 새 연결 생성
3. 연결 정보 입력:
   - **Host**: `b0ac673e3e77419584a63901db184810.s1.eu.hivemq.cloud` (URL 필드 값)
   - **Port**: `8884` (WebSocket Port)
   - **Protocol**: `WebSocket` 또는 `MQTT over WebSocket`
   - **Path**: `/mqtt` (WebSocket 경로)
   - **Username**: 클러스터 사용자 이름
   - **Password**: 클러스터 비밀번호
   - **Client ID**: 고유한 ID (예: `test-client-001`)

## 6. 보안 주의사항

1. **비밀번호 보관**
   - `.env.local` 파일은 절대 Git에 커밋하지 마세요
   - `.gitignore`에 `.env.local`이 포함되어 있는지 확인하세요

2. **접근 제어**
   - HiveMQ Cloud에서 필요시 IP 화이트리스트 설정 가능
   - 프로덕션 환경에서는 추가 보안 설정 고려

3. **비밀번호 변경**
   - 비밀번호를 변경하면 `.env.local` 파일도 업데이트해야 합니다
   - 애플리케이션 재시작 필요

## 7. 문제 해결

### 연결 실패 시 확인 사항

1. **URL 형식 확인**
   - WebSocket의 경우 `wss://` 프로토콜 사용
   - **TLS WebSocket URL** 사용 (포트 8884, 경로 `/mqtt` 포함)
   - 예시: `wss://your-cluster-id.s1.region.hivemq.cloud:8884/mqtt`
   - **TLS MQTT URL** (포트 8883)은 사용하지 마세요

2. **인증 정보 확인**
   - 사용자 이름과 비밀번호가 정확한지 확인
   - 클러스터가 활성 상태인지 확인

3. **네트워크 확인**
   - 방화벽이 WebSocket 연결을 차단하지 않는지 확인
   - 프록시 설정 확인

4. **로그 확인**
   - Next.js 서버 로그에서 MQTT 연결 오류 메시지 확인
   - HiveMQ Cloud 대시보드의 연결 로그 확인

## 8. 참고 자료

- [HiveMQ Cloud 공식 문서](https://www.hivemq.com/docs/hivemq-cloud/)
- [HiveMQ Cloud 대시보드](https://console.hivemq.cloud/)
- [MQTT 프로토콜 사양](https://mqtt.org/)
