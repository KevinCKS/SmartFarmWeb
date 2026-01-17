# MQTT 코드 테스트 가이드

MQTT 클라이언트 및 API를 테스트하는 방법입니다.

## 사전 준비

### 1. 환경 변수 설정 확인

`web/.env.local` 파일이 올바르게 설정되어 있는지 확인:

```env
# HiveMQ Cloud 설정
MQTT_BROKER_URL=wss://your-cluster-id.s1.region.hivemq.cloud:8884/mqtt
MQTT_USERNAME=your-cluster-username
MQTT_PASSWORD=your-cluster-password
MQTT_CLIENT_ID=smartfarm-web-client

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. 필요한 패키지 설치

```bash
cd web
npm install mqtt
npm install --save-dev @types/mqtt
```

### 3. Next.js 개발 서버 실행

```bash
cd web
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 테스트 방법

### 방법 1: API 엔드포인트를 통한 테스트

#### 1.1 MQTT 연결 상태 확인

```bash
# PowerShell
curl http://localhost:3000/api/mqtt/status

# 또는 브라우저에서
# http://localhost:3000/api/mqtt/status
```

**예상 응답:**
```json
{
  "connected": false,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 1.2 MQTT 클라이언트 연결

```bash
# PowerShell
curl -X POST http://localhost:3000/api/mqtt/connect
```

**예상 응답 (성공):**
```json
{
  "success": true,
  "message": "MQTT 클라이언트가 연결되었습니다.",
  "connected": true
}
```

**예상 응답 (실패):**
```json
{
  "error": "MQTT 연결에 실패했습니다.",
  "details": "환경 변수가 설정되지 않았습니다.",
  "connected": false
}
```

#### 1.3 연결 상태 재확인

```bash
curl http://localhost:3000/api/mqtt/status
```

이제 `"connected": true`가 표시되어야 합니다.

#### 1.4 MQTT 메시지 발행 테스트

센서 데이터 발행:
```bash
# PowerShell
$body = @{
    topic = "smartfarm/sensors/temperature"
    message = @{
        sensor = "temperature"
        value = 25.5
        unit = "°C"
        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    } | ConvertTo-Json -Compress
} | ConvertTo-Json

curl -X POST http://localhost:3000/api/mqtt/publish `
  -H "Content-Type: application/json" `
  -d $body
```

액츄에이터 제어 명령 발행:
```bash
$body = @{
    topic = "smartfarm/actuators/led"
    message = @{
        state = $true
    } | ConvertTo-Json -Compress
} | ConvertTo-Json

curl -X POST http://localhost:3000/api/mqtt/publish `
  -H "Content-Type: application/json" `
  -d $body
```

#### 1.5 센서 데이터 조회 테스트

```bash
# 모든 센서 데이터 조회
curl http://localhost:3000/api/sensors

# 특정 센서 데이터 조회
curl http://localhost:3000/api/sensors?type=temperature&limit=10

# 최신 센서 데이터 조회
curl http://localhost:3000/api/sensors/latest?type=temperature

# 모든 센서의 최신 데이터 조회
curl http://localhost:3000/api/sensors/all
```

#### 1.6 액츄에이터 제어 테스트

```bash
# 액츄에이터 제어 명령 발행
$body = @{
    actuator_type = "led"
    action = "on"
} | ConvertTo-Json

curl -X POST http://localhost:3000/api/actuators `
  -H "Content-Type: application/json" `
  -d $body

# 액츄에이터 상태 조회
curl http://localhost:3000/api/actuators/status

# 액츄에이터 제어 이력 조회
curl http://localhost:3000/api/actuators?type=led&limit=10
```

### 방법 2: MQTTX를 사용한 통합 테스트

#### 2.1 MQTTX 설치

[MQTTX 다운로드](https://mqttx.app/)

#### 2.2 MQTTX에서 연결 설정

1. MQTTX 실행
2. **New Connection** 클릭
3. 연결 정보 입력:
   - **Name**: `SmartFarm Test`
   - **Host**: `b0ac673e3e77419584a63901db184810.s1.eu.hivemq.cloud` (URL 필드 값)
   - **Port**: `8884`
   - **Protocol**: `WebSocket`
   - **Path**: `/mqtt`
   - **Username**: 클러스터 사용자 이름
   - **Password**: 클러스터 비밀번호
   - **Client ID**: `mqttx-test-client`

4. **Connect** 클릭

#### 2.3 메시지 구독

1. **New Subscription** 클릭
2. 토픽 입력: `smartfarm/sensors/+` (모든 센서 토픽 구독)
3. 또는 개별 토픽:
   - `smartfarm/sensors/temperature`
   - `smartfarm/sensors/humidity`
   - `smartfarm/sensors/ec`
   - `smartfarm/sensors/ph`
   - `smartfarm/sensors/all`

#### 2.4 메시지 발행 테스트

1. **New Message** 클릭
2. 토픽 입력: `smartfarm/sensors/temperature`
3. 메시지 입력:
```json
{
  "sensor": "temperature",
  "value": 25.5,
  "unit": "°C",
  "timestamp": 1704067200
}
```
4. **Publish** 클릭

5. Next.js 서버 로그 확인:
   - `[MQTT] 메시지 처리 성공` 메시지 확인
   - `[DB] 센서 데이터 저장 성공` 메시지 확인

6. 데이터베이스 확인:
```bash
curl http://localhost:3000/api/sensors/latest?type=temperature
```

### 방법 3: Node.js 스크립트를 사용한 테스트

테스트 스크립트 생성:

```javascript
// web/scripts/test-mqtt.js
const mqtt = require('mqtt');
require('dotenv').config({ path: '.env.local' });

const brokerUrl = process.env.MQTT_BROKER_URL;
const username = process.env.MQTT_USERNAME;
const password = process.env.MQTT_PASSWORD;

if (!brokerUrl || !username || !password) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const client = mqtt.connect(brokerUrl, {
  username,
  password,
  clientId: 'test-client-' + Date.now(),
});

client.on('connect', () => {
  console.log('✅ MQTT 연결 성공');
  
  // 토픽 구독
  client.subscribe('smartfarm/sensors/+', (err) => {
    if (err) {
      console.error('구독 실패:', err);
    } else {
      console.log('✅ 토픽 구독 성공: smartfarm/sensors/+');
    }
  });
  
  // 테스트 메시지 발행
  const testMessage = {
    sensor: 'temperature',
    value: 25.5,
    unit: '°C',
    timestamp: Math.floor(Date.now() / 1000),
  };
  
  client.publish('smartfarm/sensors/temperature', JSON.stringify(testMessage), (err) => {
    if (err) {
      console.error('발행 실패:', err);
    } else {
      console.log('✅ 메시지 발행 성공:', testMessage);
    }
  });
});

client.on('message', (topic, message) => {
  console.log('📨 메시지 수신:');
  console.log('  토픽:', topic);
  console.log('  내용:', message.toString());
});

client.on('error', (error) => {
  console.error('❌ MQTT 오류:', error);
});

client.on('close', () => {
  console.log('연결 종료');
  process.exit(0);
});

// 5초 후 종료
setTimeout(() => {
  client.end();
}, 5000);
```

실행:
```bash
cd web
node scripts/test-mqtt.js
```

## 데이터베이스 확인

### Supabase 대시보드에서 확인

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Table Editor** → `sensor_data` 테이블 확인
4. 새로 저장된 데이터 확인

### API를 통한 확인

```bash
# 최근 10개 센서 데이터 조회
curl http://localhost:3000/api/sensors?limit=10

# 온도 센서 데이터만 조회
curl http://localhost:3000/api/sensors?type=temperature&limit=10
```

## 문제 해결

### 연결 실패

1. **환경 변수 확인**
   ```bash
   # PowerShell
   Get-Content web\.env.local
   ```

2. **URL 형식 확인**
   - `wss://` 프로토콜 사용
   - 포트 번호: `8884`
   - 경로: `/mqtt` 포함

3. **인증 정보 확인**
   - Username과 Password가 정확한지 확인
   - HiveMQ Cloud 대시보드에서 재확인

### 메시지가 DB에 저장되지 않음

1. **서버 로그 확인**
   - Next.js 서버 콘솔에서 오류 메시지 확인
   - `[DB] 센서 데이터 저장 실패` 메시지 확인

2. **Supabase 연결 확인**
   - `SUPABASE_SERVICE_ROLE_KEY`가 올바른지 확인
   - Supabase 프로젝트가 활성 상태인지 확인

3. **테이블 존재 확인**
   - Supabase 대시보드에서 `sensor_data` 테이블이 존재하는지 확인

### 메시지를 받지 못함

1. **토픽 구독 확인**
   - MQTT 클라이언트가 올바른 토픽을 구독하고 있는지 확인
   - 와일드카드 사용: `smartfarm/sensors/+`

2. **메시지 형식 확인**
   - JSON 형식이 올바른지 확인
   - 필수 필드가 포함되어 있는지 확인

## 자동화된 테스트 스크립트

PowerShell 테스트 스크립트:

```powershell
# test-mqtt-api.ps1
$baseUrl = "http://localhost:3000"

Write-Host "=== MQTT API 테스트 ===" -ForegroundColor Cyan

# 1. 연결 상태 확인
Write-Host "`n1. 연결 상태 확인..." -ForegroundColor Yellow
$status = Invoke-RestMethod -Uri "$baseUrl/api/mqtt/status" -Method Get
Write-Host "연결 상태: $($status.connected)" -ForegroundColor $(if ($status.connected) { "Green" } else { "Red" })

# 2. MQTT 연결
Write-Host "`n2. MQTT 연결 시도..." -ForegroundColor Yellow
try {
    $connect = Invoke-RestMethod -Uri "$baseUrl/api/mqtt/connect" -Method Post
    Write-Host "연결 성공: $($connect.message)" -ForegroundColor Green
} catch {
    Write-Host "연결 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 메시지 발행
Write-Host "`n3. 테스트 메시지 발행..." -ForegroundColor Yellow
$message = @{
    topic = "smartfarm/sensors/temperature"
    message = @{
        sensor = "temperature"
        value = 25.5
        unit = "°C"
        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    }
} | ConvertTo-Json -Depth 10

try {
    $publish = Invoke-RestMethod -Uri "$baseUrl/api/mqtt/publish" -Method Post -Body $message -ContentType "application/json"
    Write-Host "발행 성공: $($publish.message)" -ForegroundColor Green
} catch {
    Write-Host "발행 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. 센서 데이터 조회
Write-Host "`n4. 센서 데이터 조회..." -ForegroundColor Yellow
Start-Sleep -Seconds 2  # DB 저장 대기
try {
    $sensors = Invoke-RestMethod -Uri "$baseUrl/api/sensors/latest?type=temperature" -Method Get
    if ($sensors.data) {
        Write-Host "데이터 조회 성공: $($sensors.data.value) $($sensors.data.unit)" -ForegroundColor Green
    } else {
        Write-Host "데이터 없음" -ForegroundColor Yellow
    }
} catch {
    Write-Host "조회 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 테스트 완료 ===" -ForegroundColor Cyan
```

실행:
```powershell
.\test-mqtt-api.ps1
```

## 체크리스트

- [ ] 환경 변수 설정 완료
- [ ] Next.js 서버 실행 중
- [ ] MQTT 연결 성공 (`/api/mqtt/connect`)
- [ ] 메시지 발행 성공 (`/api/mqtt/publish`)
- [ ] 메시지 수신 확인 (서버 로그)
- [ ] DB 저장 확인 (`/api/sensors`)
- [ ] 액츄에이터 제어 테스트 (`/api/actuators`)
