# 액츄에이터 상태 관리 설명

## 현재 문제 상황

### 현재 동작 방식
1. **웹에서 제어 명령 발송**
   - 사용자가 "끄기" 버튼 클릭
   - `/api/actuators` POST 요청
   - MQTT로 명령 발행 (`smartfarm/actuators/led` 등)
   - DB에 제어 이력 저장 (`actuator_control` 테이블)

2. **상태 조회**
   - `/api/actuators/status`에서 DB의 가장 최근 제어 이력을 조회
   - `action === 'on'`이면 `enabled = true`
   - `action === 'off'`이면 `enabled = false`

3. **문제점**
   - **아두이노가 없으면**: MQTT로 명령만 보내고 실제 상태 피드백을 받지 못함
   - **DB 기반 추정**: DB에 저장된 제어 이력만으로 상태를 추정
   - **실제 상태와 불일치**: 아두이노의 실제 상태와 웹 UI 상태가 다를 수 있음

## 아두이노 연결 시 예상 동작

### 정상 동작 흐름
1. **웹에서 제어 명령 발송**
   ```
   웹 → MQTT 브로커 → 아두이노
   ```

2. **아두이노가 명령 실행 후 상태 피드백**
   ```
   아두이노 → MQTT 브로커 → 웹 서버
   ```
   - 아두이노가 `smartfarm/actuators/led` 토픽에 상태 메시지 발행
   - 예: `{ "state": false }` (끄기 완료)

3. **MQTT 클라이언트가 상태 수신**
   - `web/src/lib/mqtt/client.ts`의 `handleActuatorMessage()` 호출
   - DB에 상태 저장 (`actuator_control` 테이블에 INSERT)

4. **Supabase Realtime으로 프론트엔드 업데이트**
   - `useActuatorControl` 훅이 Realtime 구독
   - DB 변경 감지 → `fetchStatus()` 호출 → UI 업데이트

## 해결 방안

### 1. 현재 (아두이노 없을 때)
- DB 기반 상태 추정으로 동작
- 제어 명령 후 약간의 지연 후 상태 조회
- Realtime으로 DB 변경 감지

### 2. 아두이노 연결 후
- 아두이노가 상태 피드백을 MQTT로 보내면 자동으로 동기화됨
- 실제 하드웨어 상태와 웹 UI 상태가 일치

## 아두이노에서 보내야 할 메시지 형식

### 액츄에이터 상태 피드백
**토픽**: `smartfarm/actuators/{actuator_type}`
- `led`: `smartfarm/actuators/led`
- `pump`: `smartfarm/actuators/pump`
- `fan1`: `smartfarm/actuators/fan1`
- `fan2`: `smartfarm/actuators/fan2`

**메시지 형식**:
```json
{
  "state": false  // true = ON, false = OFF
}
```

또는 LED의 경우:
```json
{
  "brightness": 50  // 0-100
}
```

## 테스트 방법

### 현재 (아두이노 없을 때)
1. 브라우저 개발자 도구(F12) → Console 탭
2. 액츄에이터 제어 버튼 클릭
3. 콘솔에서 로그 확인:
   - `[useActuatorControl] 제어 명령 성공`
   - `[useActuatorControl] 상태 업데이트`

### 아두이노 연결 후
1. 아두이노가 MQTT로 상태 피드백을 보내는지 확인
2. 웹 서버 로그에서 MQTT 메시지 수신 확인
3. DB에 상태가 저장되는지 확인
4. 웹 UI가 자동으로 업데이트되는지 확인

## 결론

**현재 문제**: 아두이노가 없어서 MQTT 상태 피드백을 받지 못함
**해결**: 아두이노와 연결하면 정상 동작할 것으로 예상됨

**확인 사항**:
- 아두이노가 제어 명령을 받는지
- 아두이노가 상태 피드백을 MQTT로 보내는지
- MQTT 클라이언트가 메시지를 수신하는지
- DB에 상태가 저장되는지
- Realtime으로 프론트엔드가 업데이트되는지
