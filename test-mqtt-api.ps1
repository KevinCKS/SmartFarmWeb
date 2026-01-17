# MQTT API 테스트 스크립트
# 사용법: .\test-mqtt-api.ps1

# 한글 출력 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$baseUrl = "http://localhost:3000"

Write-Host "=== MQTT API 테스트 ===" -ForegroundColor Cyan

# 1. 연결 상태 확인
Write-Host "`n1. 연결 상태 확인..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/api/mqtt/status" -Method Get
    Write-Host "연결 상태: $($status.connected)" -ForegroundColor $(if ($status.connected) { "Green" } else { "Yellow" })
} catch {
    Write-Host "상태 확인 실패: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. MQTT 연결
Write-Host "`n2. MQTT 연결 시도..." -ForegroundColor Yellow
try {
    $connect = Invoke-RestMethod -Uri "$baseUrl/api/mqtt/connect" -Method Post
    Write-Host "연결 성공: $($connect.message)" -ForegroundColor Green
} catch {
    Write-Host "연결 실패: $($_.Exception.Message)" -ForegroundColor Red
    
    # 상세 오류 정보 표시
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $errorObj = $responseBody | ConvertFrom-Json
            
            if ($errorObj.error) {
                Write-Host "`n오류 상세:" -ForegroundColor Yellow
                Write-Host "  오류: $($errorObj.error)" -ForegroundColor Red
                if ($errorObj.details) {
                    Write-Host "  상세: $($errorObj.details)" -ForegroundColor Red
                }
                if ($errorObj.missing) {
                    Write-Host "`n누락된 환경 변수:" -ForegroundColor Yellow
                    foreach ($var in $errorObj.missing) {
                        Write-Host "  - $var" -ForegroundColor Red
                    }
                }
            } else {
                Write-Host "응답: $responseBody" -ForegroundColor Gray
            }
        } catch {
            Write-Host "오류 응답을 파싱할 수 없습니다." -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n환경 변수 설정을 확인하세요:" -ForegroundColor Yellow
    Write-Host "  1. web\.env.local 파일이 존재하는지 확인" -ForegroundColor White
    Write-Host "  2. 다음 환경 변수가 설정되어 있는지 확인:" -ForegroundColor White
    Write-Host "     - MQTT_BROKER_URL" -ForegroundColor Gray
    Write-Host "     - MQTT_USERNAME" -ForegroundColor Gray
    Write-Host "     - MQTT_PASSWORD" -ForegroundColor Gray
    Write-Host "  3. Next.js 서버를 재시작했는지 확인" -ForegroundColor White
    Write-Host "`n자세한 내용은 docs/hivemq-cloud-setup.md를 참고하세요." -ForegroundColor Yellow
    exit 1
}

# 3. 메시지 발행 테스트 (모든 센서 데이터)
Write-Host "`n3. 테스트 메시지 발행 (모든 센서)..." -ForegroundColor Yellow

# 3-1. 온도 센서
Write-Host "  3-1. 온도 센서 데이터 발행..." -ForegroundColor Gray
$tempMessage = @{
    topic = "smartfarm/sensors/temperature"
    message = @{
        sensor = "temperature"
        value = 25.5
        unit = "°C"
        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    }
} | ConvertTo-Json -Depth 10

try {
    $publish = Invoke-RestMethod -Uri "$baseUrl/api/mqtt/publish" -Method Post -Body $tempMessage -ContentType "application/json"
    Write-Host "    ✅ 온도 발행 성공" -ForegroundColor Green
} catch {
    Write-Host "    ❌ 온도 발행 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Milliseconds 500

# 3-2. 습도 센서
Write-Host "  3-2. 습도 센서 데이터 발행..." -ForegroundColor Gray
$humidityMessage = @{
    topic = "smartfarm/sensors/humidity"
    message = @{
        sensor = "humidity"
        value = 60.0
        unit = "%"
        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    }
} | ConvertTo-Json -Depth 10

try {
    $publish = Invoke-RestMethod -Uri "$baseUrl/api/mqtt/publish" -Method Post -Body $humidityMessage -ContentType "application/json"
    Write-Host "    ✅ 습도 발행 성공" -ForegroundColor Green
} catch {
    Write-Host "    ❌ 습도 발행 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Milliseconds 500

# 3-3. EC 센서
Write-Host "  3-3. EC 센서 데이터 발행..." -ForegroundColor Gray
$ecMessage = @{
    topic = "smartfarm/sensors/ec"
    message = @{
        sensor = "ec"
        value = 1.2
        unit = "mS/cm"
        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    }
} | ConvertTo-Json -Depth 10

try {
    $publish = Invoke-RestMethod -Uri "$baseUrl/api/mqtt/publish" -Method Post -Body $ecMessage -ContentType "application/json"
    Write-Host "    ✅ EC 발행 성공" -ForegroundColor Green
} catch {
    Write-Host "    ❌ EC 발행 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Milliseconds 500

# 3-4. pH 센서
Write-Host "  3-4. pH 센서 데이터 발행..." -ForegroundColor Gray
$phMessage = @{
    topic = "smartfarm/sensors/ph"
    message = @{
        sensor = "ph"
        value = 6.5
        unit = "pH"
        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    }
} | ConvertTo-Json -Depth 10

try {
    $publish = Invoke-RestMethod -Uri "$baseUrl/api/mqtt/publish" -Method Post -Body $phMessage -ContentType "application/json"
    Write-Host "    ✅ pH 발행 성공" -ForegroundColor Green
} catch {
    Write-Host "    ❌ pH 발행 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Milliseconds 500

# 3-5. 통합 센서 데이터 (선택사항)
Write-Host "  3-5. 통합 센서 데이터 발행 (선택사항)..." -ForegroundColor Gray
$allSensorsMessage = @{
    topic = "smartfarm/sensors/all"
    message = @{
        temperature = 25.5
        humidity = 60.0
        ec = 1.2
        ph = 6.5
        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    }
} | ConvertTo-Json -Depth 10

try {
    $publish = Invoke-RestMethod -Uri "$baseUrl/api/mqtt/publish" -Method Post -Body $allSensorsMessage -ContentType "application/json"
    Write-Host "    ✅ 통합 센서 데이터 발행 성공" -ForegroundColor Green
} catch {
    Write-Host "    ❌ 통합 센서 데이터 발행 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. 센서 데이터 조회 (DB 저장 확인)
Write-Host "`n4. 센서 데이터 조회 (DB 저장 확인)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3  # DB 저장 대기

$sensorTypes = @("temperature", "humidity", "ec", "ph")
foreach ($sensorType in $sensorTypes) {
    try {
        $sensors = Invoke-RestMethod -Uri "$baseUrl/api/sensors/latest?type=$sensorType" -Method Get
        if ($sensors.data) {
            Write-Host "  ✅ $sensorType : $($sensors.data.value) $($sensors.data.unit)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $sensorType : 데이터 없음" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ $sensorType : 조회 실패" -ForegroundColor Red
    }
}

# 모든 센서 데이터 조회
Write-Host "`n  모든 센서 최신 데이터:" -ForegroundColor Cyan
try {
    $allSensors = Invoke-RestMethod -Uri "$baseUrl/api/sensors/all" -Method Get
    if ($allSensors.data) {
        if ($allSensors.data.temperature) {
            Write-Host "    온도: $($allSensors.data.temperature.value) $($allSensors.data.temperature.unit)" -ForegroundColor Gray
        }
        if ($allSensors.data.humidity) {
            Write-Host "    습도: $($allSensors.data.humidity.value) $($allSensors.data.humidity.unit)" -ForegroundColor Gray
        }
        if ($allSensors.data.ec) {
            Write-Host "    EC: $($allSensors.data.ec.value) $($allSensors.data.ec.unit)" -ForegroundColor Gray
        }
        if ($allSensors.data.ph) {
            Write-Host "    pH: $($allSensors.data.ph.value) $($allSensors.data.ph.unit)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  모든 센서 데이터 조회 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. 액츄에이터 제어 테스트
Write-Host "`n5. 액츄에이터 제어 테스트..." -ForegroundColor Yellow
$actuatorCommand = @{
    actuator_type = "led"
    action = "on"
} | ConvertTo-Json

try {
    $actuator = Invoke-RestMethod -Uri "$baseUrl/api/actuators" -Method Post -Body $actuatorCommand -ContentType "application/json"
    Write-Host "제어 명령 성공: $($actuator.message)" -ForegroundColor Green
    Write-Host "  액츄에이터: $($actuator.actuator_type)" -ForegroundColor Gray
    Write-Host "  액션: $($actuator.action)" -ForegroundColor Gray
} catch {
    Write-Host "제어 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. 액츄에이터 상태 조회
Write-Host "`n6. 액츄에이터 상태 조회..." -ForegroundColor Yellow
try {
    $actuatorStatus = Invoke-RestMethod -Uri "$baseUrl/api/actuators/status" -Method Get
    Write-Host "상태 조회 성공!" -ForegroundColor Green
    Write-Host "  LED: $($actuatorStatus.data.led.enabled)" -ForegroundColor Gray
    Write-Host "  펌프: $($actuatorStatus.data.pump.enabled)" -ForegroundColor Gray
    Write-Host "  팬1: $($actuatorStatus.data.fan1.enabled)" -ForegroundColor Gray
    Write-Host "  팬2: $($actuatorStatus.data.fan2.enabled)" -ForegroundColor Gray
} catch {
    Write-Host "상태 조회 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 테스트 완료 ===" -ForegroundColor Cyan
Write-Host "Next.js 서버 로그를 확인하여 MQTT 메시지 수신 및 DB 저장을 확인하세요." -ForegroundColor Yellow
