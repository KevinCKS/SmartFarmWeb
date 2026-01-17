# 환경 변수 확인 스크립트
# 사용법: .\check-env.ps1

# 한글 출력 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$envFile = "web\.env.local"

Write-Host "=== 환경 변수 확인 ===" -ForegroundColor Cyan

if (-not (Test-Path $envFile)) {
    Write-Host "`n❌ .env.local 파일이 없습니다!" -ForegroundColor Red
    Write-Host "`n다음 단계를 따라주세요:" -ForegroundColor Yellow
    Write-Host "1. web\.env.local 파일을 생성하세요" -ForegroundColor White
    Write-Host "2. 다음 환경 변수를 설정하세요:" -ForegroundColor White
    Write-Host ""
    Write-Host "   # HiveMQ Cloud 설정" -ForegroundColor Gray
    Write-Host "   MQTT_BROKER_URL=wss://your-cluster-id.s1.region.hivemq.cloud:8884/mqtt" -ForegroundColor Gray
    Write-Host "   MQTT_USERNAME=your-cluster-username" -ForegroundColor Gray
    Write-Host "   MQTT_PASSWORD=your-cluster-password" -ForegroundColor Gray
    Write-Host "   MQTT_CLIENT_ID=smartfarm-web-client" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   # Supabase 설정" -ForegroundColor Gray
    Write-Host "   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" -ForegroundColor Gray
    Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key" -ForegroundColor Gray
    Write-Host "   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key" -ForegroundColor Gray
    Write-Host ""
    Write-Host "자세한 내용은 다음 문서를 참고하세요:" -ForegroundColor Yellow
    Write-Host "  - docs/hivemq-cloud-setup.md" -ForegroundColor White
    Write-Host "  - docs/supabase-keys-guide.md" -ForegroundColor White
    exit 1
}

Write-Host "`n✅ .env.local 파일 발견" -ForegroundColor Green

# 환경 변수 로드
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

Write-Host "`n환경 변수 확인:" -ForegroundColor Yellow

$requiredVars = @(
    @{Name="MQTT_BROKER_URL"; Description="HiveMQ Cloud WebSocket URL"},
    @{Name="MQTT_USERNAME"; Description="HiveMQ Cloud Username"},
    @{Name="MQTT_PASSWORD"; Description="HiveMQ Cloud Password"},
    @{Name="NEXT_PUBLIC_SUPABASE_URL"; Description="Supabase Project URL"},
    @{Name="NEXT_PUBLIC_SUPABASE_ANON_KEY"; Description="Supabase Anon Key"},
    @{Name="SUPABASE_SERVICE_ROLE_KEY"; Description="Supabase Service Role Key"}
)

$allSet = $true

foreach ($var in $requiredVars) {
    $value = [Environment]::GetEnvironmentVariable($var.Name, "Process")
    if ($value) {
        $displayValue = if ($var.Name -like "*PASSWORD*" -or $var.Name -like "*KEY*") {
            "***" + $value.Substring([Math]::Max(0, $value.Length - 4))
        } else {
            $value
        }
        Write-Host "  ✅ $($var.Name): $displayValue" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($var.Name): 설정되지 않음" -ForegroundColor Red
        Write-Host "     ($($var.Description))" -ForegroundColor Gray
        $allSet = $false
    }
}

if ($allSet) {
    Write-Host "`n✅ 모든 필수 환경 변수가 설정되었습니다!" -ForegroundColor Green
    Write-Host "`n참고: Next.js 서버를 재시작해야 환경 변수가 적용됩니다." -ForegroundColor Yellow
} else {
    Write-Host "`n❌ 일부 환경 변수가 설정되지 않았습니다." -ForegroundColor Red
    Write-Host "위의 누락된 환경 변수를 .env.local 파일에 추가하세요." -ForegroundColor Yellow
    exit 1
}
