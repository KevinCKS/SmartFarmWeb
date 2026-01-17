# 테스트 가이드

## 1. 환경 변수 설정 확인

먼저 `.env.local` 파일이 있는지 확인하고, 필요한 환경 변수가 설정되어 있는지 확인하세요.

```bash
# web 디렉토리에서
cat .env.local
```

필요한 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MQTT_BROKER_URL` (선택사항)

## 2. 개발 서버 실행

```bash
cd web
npm run dev
```

서버가 시작되면 다음 메시지가 표시됩니다:
```
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000
```

## 3. 브라우저에서 접속

1. **홈 페이지**: http://localhost:3000
   - 대시보드로 이동 링크 확인
   - API 엔드포인트 링크 확인

2. **대시보드**: http://localhost:3000/dashboard
   - 센서 데이터 카드 확인
   - 차트 확인
   - 액츄에이터 제어 UI 확인
   - 시스템 상태 확인

## 4. 기능별 테스트

### 4.1 센서 데이터 표시 테스트

1. 대시보드 페이지 접속
2. 다음 항목 확인:
   - 온도, 습도, EC, pH 카드가 표시되는지
   - 실시간 데이터가 업데이트되는지 (Supabase Realtime)
   - 로딩 상태가 표시되는지
   - 에러 발생 시 에러 메시지가 표시되는지

### 4.2 차트 테스트

1. 각 센서별 차트 확인:
   - 온도 추이 차트
   - 습도 추이 차트
   - EC 추이 차트
   - pH 추이 차트

2. 시간 범위 선택 테스트:
   - "1시간" 버튼 클릭
   - "24시간" 버튼 클릭
   - "7일" 버튼 클릭
   - 각 범위에 맞는 데이터가 표시되는지 확인

### 4.3 액츄에이터 제어 테스트

1. LED 제어:
   - "켜기" 버튼 클릭 → LED가 켜지는지 확인
   - 밝기 슬라이더 조절 → 밝기가 변경되는지 확인
   - "끄기" 버튼 클릭 → LED가 꺼지는지 확인

2. 펌프 제어:
   - "켜기" 버튼 클릭 → 펌프가 켜지는지 확인
   - "끄기" 버튼 클릭 → 펌프가 꺼지는지 확인

3. 팬 제어:
   - 팬1, 팬2 각각 테스트
   - "켜기"/"끄기" 버튼 동작 확인

### 4.4 시스템 상태 테스트

1. 시스템 상태 카드 확인:
   - MQTT 연결 상태
   - 데이터베이스 연결 상태
   - 실시간 업데이트 상태

## 5. API 엔드포인트 테스트

### 5.1 센서 데이터 API

```bash
# 모든 센서 데이터 조회
curl http://localhost:3000/api/sensors/all

# 특정 센서 데이터 조회
curl http://localhost:3000/api/sensors/temperature?limit=10

# 최신 센서 데이터 조회
curl http://localhost:3000/api/sensors/latest?type=temperature
```

### 5.2 액츄에이터 API

```bash
# 액츄에이터 상태 조회
curl http://localhost:3000/api/actuators/status

# LED 켜기
curl -X POST http://localhost:3000/api/actuators \
  -H "Content-Type: application/json" \
  -d '{"actuator_type":"led","action":"on"}'

# LED 밝기 설정
curl -X POST http://localhost:3000/api/actuators \
  -H "Content-Type: application/json" \
  -d '{"actuator_type":"led","action":"set","value":80}'

# 펌프 켜기
curl -X POST http://localhost:3000/api/actuators \
  -H "Content-Type: application/json" \
  -d '{"actuator_type":"pump","action":"on"}'
```

### 5.3 MQTT 상태 확인

```bash
curl http://localhost:3000/api/mqtt/status
```

## 6. 실시간 업데이트 테스트

### 6.1 Supabase Realtime 테스트

1. 대시보드 페이지를 열어둡니다
2. 다른 터미널에서 센서 데이터를 직접 DB에 삽입:
   ```sql
   -- Supabase SQL Editor에서 실행
   INSERT INTO sensor_data (sensor_type, value, unit, device_id)
   VALUES ('temperature', 25.5, '°C', 'arduino-uno-r4');
   ```

3. 대시보드에서 실시간으로 데이터가 업데이트되는지 확인

### 6.2 MQTT를 통한 실시간 업데이트

1. MQTT 브로커가 실행 중인지 확인
2. MQTT 클라이언트로 센서 데이터 발행:
   ```bash
   # mosquitto_pub 사용 예시
   mosquitto_pub -h localhost -t "smartfarm/sensors/temperature" \
     -m '{"sensor":"temperature","value":26.0,"unit":"°C","timestamp":1234567890}'
   ```

3. 대시보드에서 데이터가 자동으로 업데이트되는지 확인

## 7. 브라우저 개발자 도구 활용

### 7.1 콘솔 확인

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭에서 에러 메시지 확인
3. Network 탭에서 API 요청/응답 확인

### 7.2 네트워크 모니터링

1. Network 탭 열기
2. 대시보드 페이지 새로고침
3. 다음 요청 확인:
   - `/api/sensors/all` - 센서 데이터 조회
   - `/api/actuators/status` - 액츄에이터 상태 조회
   - Supabase Realtime WebSocket 연결

## 8. 문제 해결

### 8.1 빌드 오류

```bash
# 타입 체크만 실행
npx tsc --noEmit

# 린터 실행
npm run lint
```

### 8.2 환경 변수 오류

- `.env.local` 파일이 있는지 확인
- 환경 변수 값이 올바른지 확인
- 서버 재시작 필요

### 8.3 Supabase 연결 오류

- Supabase 프로젝트가 활성화되어 있는지 확인
- Realtime이 활성화되어 있는지 확인 (Supabase 대시보드 > Database > Replication)
- RLS 정책이 올바르게 설정되어 있는지 확인

### 8.4 MQTT 연결 오류

- MQTT 브로커가 실행 중인지 확인
- `MQTT_BROKER_URL` 환경 변수가 올바른지 확인
- 방화벽 설정 확인

## 9. 성능 테스트

### 9.1 로딩 시간 확인

1. 개발자 도구 > Network 탭
2. 페이지 새로고침
3. 로딩 시간 확인 (목표: < 2초)

### 9.2 실시간 업데이트 지연 확인

1. 센서 데이터 삽입 시간 기록
2. 대시보드 업데이트 시간 기록
3. 지연 시간 확인 (목표: < 500ms)

## 10. 반응형 디자인 테스트

1. 브라우저 개발자 도구 > 디바이스 모드
2. 다양한 화면 크기로 테스트:
   - 모바일 (375px)
   - 태블릿 (768px)
   - 데스크톱 (1920px)
3. 레이아웃이 올바르게 표시되는지 확인
