# 스마트팜 시스템 - Arduino UNO R4 WiFi 스케치

## 개요

스마트팜 웹서비스와 연동되는 Arduino UNO R4 WiFi 기반 하드웨어 제어 스케치입니다.

## 하드웨어 구성

### 센서
- **DHT11 (온도/습도)**: 2번 핀 (실제 연결됨)
- **TDS Meter (EC)**: A0 핀 (현재 연결 안 됨, 랜덤 데이터 생성)
- **pH 센서**: A1 핀 (현재 연결 안 됨, 랜덤 데이터 생성)

### 액추에이터
- **LED**: 3번 핀
- **Pump**: 4번 핀
- **Fan1**: 5번 핀
- **Fan2**: 6번 핀

## 필요한 라이브러리

Arduino IDE에서 다음 라이브러리를 설치해야 합니다:

1. **PubSubClient** (MQTT 클라이언트)
   - 라이브러리 관리자에서 "PubSubClient" 검색하여 설치
   - 또는: `스케치` → `라이브러리 포함하기` → `라이브러리 관리...` → "PubSubClient" 검색

2. **DHT sensor library**
   - 라이브러리 관리자에서 "DHT sensor library" 검색하여 설치
   - 또는: `스케치` → `라이브러리 포함하기` → `라이브러리 관리...` → "DHT sensor library" 검색

3. **ArduinoJson** (JSON 파싱)
   - 라이브러리 관리자에서 "ArduinoJson" 검색하여 설치
   - 버전: 6.x 권장

4. **WiFiS3** (Arduino R4 WiFi에 내장됨)
   - 별도 설치 불필요

## 설정

스케치를 업로드하기 전에 다음 설정을 수정해야 합니다:

### 1. WiFi 설정

```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

### 2. MQTT 브로커 설정

```cpp
const char* mqtt_server = "your-cluster-id.s1.region.hivemq.cloud";
const int mqtt_port = 8883;  // TLS 포트
const char* mqtt_username = "YOUR_MQTT_USERNAME";
const char* mqtt_password = "YOUR_MQTT_PASSWORD";
const char* mqtt_client_id = "arduino-uno-r4-smartfarm";
```

**참고**: 
- HiveMQ Cloud의 **TLS MQTT URL**을 사용합니다 (포트 8883)
- Arduino IDE에서 `WiFiClientSecure`를 사용하여 TLS 연결을 지원합니다
- `wifiClient.setInsecure()`는 테스트용으로 인증서 검증을 비활성화합니다 (프로덕션 환경에서는 인증서 검증 권장)

### 3. 센서 데이터 읽기 주기

```cpp
const unsigned long sensorInterval = 5000;  // 5초 (밀리초 단위)
```

## 기능

### 센서 데이터 발행

스케치는 정기적으로 다음 센서 데이터를 MQTT로 발행합니다:

- **개별 토픽**:
  - `smartfarm/sensors/temperature` - 온도 (°C)
  - `smartfarm/sensors/humidity` - 습도 (%)
  - `smartfarm/sensors/ec` - EC (mS/cm)
  - `smartfarm/sensors/ph` - pH

- **통합 토픽**:
  - `smartfarm/sensors/all` - 모든 센서 데이터

### 액추에이터 제어 구독

스케치는 다음 MQTT 토픽을 구독하여 액추에이터를 제어합니다:

- `smartfarm/actuators/led` - LED 제어
- `smartfarm/actuators/pump` - 펌프 제어
- `smartfarm/actuators/fan1` - 팬1 제어
- `smartfarm/actuators/fan2` - 팬2 제어
- `smartfarm/actuators/all` - 모든 액추에이터 일괄 제어

### 메시지 형식

#### 센서 메시지 (개별)

```json
{
  "sensor": "temperature",
  "value": 25.5,
  "unit": "°C",
  "timestamp": 1234567890
}
```

#### 센서 메시지 (통합)

```json
{
  "temperature": 25.5,
  "humidity": 60.0,
  "ec": 1.2,
  "ph": 6.5,
  "timestamp": 1234567890
}
```

#### 액추에이터 제어 메시지

LED 제어:
```json
{
  "state": true
}
```
또는
```json
{
  "brightness": 128
}
```

펌프/팬 제어:
```json
{
  "state": true
}
```

모든 액추에이터 일괄 제어:
```json
{
  "led": {
    "enabled": true,
    "brightness": 128
  },
  "pump": {
    "enabled": false
  },
  "fan1": {
    "enabled": true
  },
  "fan2": {
    "enabled": false
  }
}
```

## EC 및 pH 센서 연결

현재 EC와 pH 센서는 연결되어 있지 않아 랜덤 데이터를 생성합니다. 실제 센서를 연결할 때는 스케치에서 다음 부분의 주석을 해제하세요:

### EC 센서 (A0 핀)

```cpp
// 실제 센서 연결 시 아래 주석 해제
/*
int ecRaw = analogRead(EC_PIN);
float ecVoltage = ecRaw * (5.0 / 1024.0);
float ec = (ecVoltage * 2.0) / 1000.0;  // TDS 값을 EC로 변환
*/
```

그리고 랜덤 데이터 생성 부분을 주석 처리:
```cpp
// float ec = 0.8 + (random(0, 80) / 100.0);  // 주석 처리
```

### pH 센서 (A1 핀)

```cpp
// 실제 센서 연결 시 아래 주석 해제
/*
int phRaw = analogRead(PH_PIN);
float phVoltage = phRaw * (5.0 / 1024.0);
float ph = 3.3 * phVoltage;  // pH 센서 보정 공식 (센서에 따라 다름)
*/
```

그리고 랜덤 데이터 생성 부분을 주석 처리:
```cpp
// float ph = 5.5 + (random(0, 30) / 10.0);  // 주석 처리
```

**참고**: 실제 센서 보정 공식은 사용하는 센서 모델에 따라 다를 수 있습니다. 센서 제조사의 문서를 참조하세요.

## 업로드 방법

1. Arduino IDE를 엽니다
2. `스케치` → `라이브러리 포함하기` → `라이브러리 관리...`에서 필요한 라이브러리 설치
3. 보드를 `도구` → `보드` → `Arduino UNO R4 Boards` → `Arduino UNO R4 WiFi`로 선택
4. 포트를 `도구` → `포트`에서 선택
5. 스케치의 WiFi 및 MQTT 설정 수정
6. `스케치` → `업로드` 클릭

## 시리얼 모니터

업로드 후 `도구` → `시리얼 모니터`를 열어 동작을 확인할 수 있습니다. 보드레이트는 115200으로 설정되어 있습니다.

## 문제 해결

### WiFi 연결 실패
- SSID와 비밀번호가 올바른지 확인
- WiFi 신호 강도 확인
- 방화벽 설정 확인

### MQTT 연결 실패
- MQTT 브로커 주소, 포트, 사용자 이름, 비밀번호 확인
- 네트워크 연결 상태 확인
- HiveMQ Cloud 클러스터가 활성 상태인지 확인

### 센서 데이터 읽기 실패
- DHT11 센서 연결 확인 (2번 핀)
- 센서 핀 연결 상태 확인
- 전원 공급 확인

## 참고 자료

- [Arduino UNO R4 WiFi 공식 문서](https://docs.arduino.cc/hardware/uno-r4-wifi)
- [PubSubClient 라이브러리](https://github.com/knolleary/pubsubclient)
- [DHT 센서 라이브러리](https://github.com/adafruit/DHT-sensor-library)
- [ArduinoJson 라이브러리](https://arduinojson.org/)
