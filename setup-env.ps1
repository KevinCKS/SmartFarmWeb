# 환경 변수 파일 설정 스크립트
# 사용법: .\setup-env.ps1

# 한글 출력 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$envExample = "web\.env.local.example"
$envFile = "web\.env.local"

Write-Host "=== 환경 변수 파일 설정 ===" -ForegroundColor Cyan

if (Test-Path $envFile) {
    Write-Host "`n⚠️  .env.local 파일이 이미 존재합니다." -ForegroundColor Yellow
    $overwrite = Read-Host "덮어쓰시겠습니까? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "취소되었습니다." -ForegroundColor Yellow
        exit 0
    }
}

if (Test-Path $envExample) {
    Copy-Item $envExample $envFile
    Write-Host "`n✅ .env.local 파일이 생성되었습니다!" -ForegroundColor Green
    Write-Host "`n다음 단계:" -ForegroundColor Yellow
    Write-Host "1. web\.env.local 파일을 열어서 실제 값으로 수정하세요" -ForegroundColor White
    Write-Host "2. HiveMQ Cloud 설정 값은 docs/hivemq-cloud-setup.md를 참고하세요" -ForegroundColor White
    Write-Host "3. Supabase 설정 값은 docs/supabase-keys-guide.md를 참고하세요" -ForegroundColor White
    Write-Host "4. 환경 변수 설정 후 Next.js 서버를 재시작하세요" -ForegroundColor White
} else {
    Write-Host "`n❌ .env.local.example 파일을 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "수동으로 web\.env.local 파일을 생성하고 다음 내용을 추가하세요:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "# HiveMQ Cloud 설정" -ForegroundColor Gray
    Write-Host "MQTT_BROKER_URL=wss://your-cluster-id.s1.region.hivemq.cloud:8884/mqtt" -ForegroundColor Gray
    Write-Host "MQTT_USERNAME=your-cluster-username" -ForegroundColor Gray
    Write-Host "MQTT_PASSWORD=your-cluster-password" -ForegroundColor Gray
    Write-Host "MQTT_CLIENT_ID=smartfarm-web-client" -ForegroundColor Gray
    Write-Host "" -ForegroundColor Gray
    Write-Host "# Supabase 설정" -ForegroundColor Gray
    Write-Host "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" -ForegroundColor Gray
    Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key" -ForegroundColor Gray
    Write-Host "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key" -ForegroundColor Gray
}
