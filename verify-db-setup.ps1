# DB 구현 검증 스크립트
Write-Host "=== DB Implementation Verification ===" -ForegroundColor Cyan

# 1. 파일 존재 확인
Write-Host "`n[1] Checking file existence" -ForegroundColor Yellow
$files = @(
    "supabase\migrations\001_initial_schema.sql",
    "supabase\migrations\002_add_indexes.sql",
    "supabase\migrations\003_add_rls_policies.sql",
    "supabase\seed.sql",
    "web\src\lib\supabase\client.ts",
    "web\src\lib\supabase\server.ts",
    "web\src\types\database.ts",
    "web\src\types\sensor.ts",
    "web\src\types\actuator.ts",
    "web\src\types\mqtt.ts"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $file (not found)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# 2. 환경 변수 파일 확인
Write-Host "`n[2] Checking environment variable files" -ForegroundColor Yellow
if (Test-Path "web\.env.local.example") {
    Write-Host "  [OK] web\.env.local.example exists" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] web\.env.local.example not found" -ForegroundColor Red
}

if (Test-Path "web\.env.local") {
    Write-Host "  [OK] web\.env.local exists" -ForegroundColor Green
    $envContent = Get-Content "web\.env.local" -Raw -ErrorAction SilentlyContinue
    if ($envContent) {
        if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
            Write-Host "  [OK] NEXT_PUBLIC_SUPABASE_URL is set" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] NEXT_PUBLIC_SUPABASE_URL not set" -ForegroundColor Yellow
        }
        if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
            Write-Host "  [OK] NEXT_PUBLIC_SUPABASE_ANON_KEY is set" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] NEXT_PUBLIC_SUPABASE_ANON_KEY not set" -ForegroundColor Yellow
        }
        if ($envContent -match "SUPABASE_SERVICE_ROLE_KEY") {
            Write-Host "  [OK] SUPABASE_SERVICE_ROLE_KEY is set" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] SUPABASE_SERVICE_ROLE_KEY not set" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  [WARN] web\.env.local not found (needs to be created)" -ForegroundColor Yellow
    Write-Host "    Run: Copy-Item web\.env.local.example web\.env.local" -ForegroundColor Gray
}

# 3. 마이그레이션 파일 내용 확인
Write-Host "`n[3] Checking migration file contents" -ForegroundColor Yellow
if (Test-Path "supabase\migrations\001_initial_schema.sql") {
    $migration1 = Get-Content "supabase\migrations\001_initial_schema.sql" -Raw
    if ($migration1 -match "CREATE TABLE.*sensor_data") {
        Write-Host "  [OK] sensor_data table definition exists" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] sensor_data table definition not found" -ForegroundColor Red
    }
    
    if ($migration1 -match "CREATE TABLE.*actuator_control") {
        Write-Host "  [OK] actuator_control table definition exists" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] actuator_control table definition not found" -ForegroundColor Red
    }
    
    if ($migration1 -match "CREATE TABLE.*system_settings") {
        Write-Host "  [OK] system_settings table definition exists" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] system_settings table definition not found" -ForegroundColor Red
    }
} else {
    Write-Host "  [FAIL] Migration file not found" -ForegroundColor Red
}

# 4. 디렉토리 구조 확인
Write-Host "`n[4] Checking directory structure" -ForegroundColor Yellow
$dirs = @(
    "supabase\migrations",
    "supabase\functions",
    "web\src\lib\supabase",
    "web\src\types",
    "web\src\app",
    "web\src\components"
)

foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Write-Host "  [OK] $dir" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] $dir not found" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Verification Complete ===" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Run migrations in Supabase Dashboard" -ForegroundColor White
Write-Host "2. Add actual key values to web\.env.local file" -ForegroundColor White
Write-Host "3. Verify table creation in Supabase Dashboard" -ForegroundColor White
Write-Host "`nFor details, see docs/database-verification.md" -ForegroundColor Gray
