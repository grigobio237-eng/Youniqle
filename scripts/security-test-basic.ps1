# 기본 보안 테스트 PowerShell 스크립트
Write-Host "🛡️ 보안 테스트 시작" -ForegroundColor Yellow
Write-Host "=" * 60

$baseUrl = "http://localhost:3000"
$results = @()

# 1. SQL Injection 테스트
Write-Host "`n💉 1. SQL Injection 테스트" -ForegroundColor Yellow

$sqlPayloads = @("OR 1=1", "admin'--", "UNION SELECT", "DROP TABLE")

foreach ($payload in $sqlPayloads) {
    try {
        $url = "$baseUrl/api/products?search=$payload"
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        
        $isVulnerable = $response.Content -match "error" -and $response.Content -match "sql"
        $results += [PSCustomObject]@{
            Test = "SQL Injection"
            Payload = $payload
            StatusCode = $response.StatusCode
            Vulnerable = $isVulnerable
        }
        
        if ($isVulnerable) {
            Write-Host "  ❌ 취약점 발견: $payload" -ForegroundColor Red
        } else {
            Write-Host "  ✅ 안전: $payload" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️ 테스트 실패: $payload" -ForegroundColor Yellow
        $results += [PSCustomObject]@{
            Test = "SQL Injection"
            Payload = $payload
            StatusCode = 0
            Vulnerable = $false
        }
    }
}

# 2. XSS 테스트
Write-Host "`n🚨 2. XSS 테스트" -ForegroundColor Yellow

$xssPayloads = @("<script>alert('XSS')</script>", "<img src=x onerror=alert('XSS')>", "javascript:alert('XSS')")

foreach ($payload in $xssPayloads) {
    try {
        $url = "$baseUrl/api/products?search=$payload"
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        
        $isVulnerable = $response.Content -match [regex]::Escape($payload)
        $results += [PSCustomObject]@{
            Test = "XSS"
            Payload = $payload
            StatusCode = $response.StatusCode
            Vulnerable = $isVulnerable
        }
        
        if ($isVulnerable) {
            Write-Host "  ❌ 취약점 발견: $payload" -ForegroundColor Red
        } else {
            Write-Host "  ✅ 안전: $payload" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️ 테스트 실패: $payload" -ForegroundColor Yellow
        $results += [PSCustomObject]@{
            Test = "XSS"
            Payload = $payload
            StatusCode = 0
            Vulnerable = $false
        }
    }
}

# 3. 인증 테스트
Write-Host "`n🔐 3. 인증 테스트" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/users" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    $isVulnerable = $response.StatusCode -eq 200
    $results += [PSCustomObject]@{
        Test = "인증 - 토큰 없이 관리자 API 접근"
        Payload = "None"
        StatusCode = $response.StatusCode
        Vulnerable = $isVulnerable
    }
    
    if ($isVulnerable) {
        Write-Host "  ❌ 취약점 발견: 토큰 없이 관리자 API 접근 가능" -ForegroundColor Red
    } else {
        Write-Host "  ✅ 안전: 토큰 없이 관리자 API 접근 차단됨" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️ 테스트 실패: $($_.Exception.Message)" -ForegroundColor Yellow
    $results += [PSCustomObject]@{
        Test = "인증 - 토큰 없이 관리자 API 접근"
        Payload = "None"
        StatusCode = 0
        Vulnerable = $false
    }
}

# 4. 입력 검증 테스트
Write-Host "`n📝 4. 입력 검증 테스트" -ForegroundColor Yellow

$inputTests = @("A" * 1000, "!@#$%^&*()", "SELECT * FROM users", "")

foreach ($test in $inputTests) {
    try {
        $url = "$baseUrl/api/products?search=$test"
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        
        $isVulnerable = $response.StatusCode -eq 200 -and $response.Content -notmatch "error"
        $results += [PSCustomObject]@{
            Test = "입력 검증"
            Payload = $test.Substring(0, [Math]::Min(20, $test.Length))
            StatusCode = $response.StatusCode
            Vulnerable = $isVulnerable
        }
        
        if ($isVulnerable) {
            Write-Host "  ❌ 취약점 발견: $($test.Substring(0, 20))" -ForegroundColor Red
        } else {
            Write-Host "  ✅ 안전: $($test.Substring(0, 20))" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️ 테스트 실패: $($test.Substring(0, 20))" -ForegroundColor Yellow
        $results += [PSCustomObject]@{
            Test = "입력 검증"
            Payload = $test.Substring(0, [Math]::Min(20, $test.Length))
            StatusCode = 0
            Vulnerable = $false
        }
    }
}

# 결과 출력
Write-Host "`n📊 보안 테스트 결과" -ForegroundColor Yellow
Write-Host "=" * 60

$vulnerableTests = $results | Where-Object { $_.Vulnerable -eq $true }
$totalTests = $results.Count

Write-Host "`n📈 테스트 통계:"
Write-Host "  - 총 테스트: $totalTests 개"
Write-Host "  - 취약점 발견: $($vulnerableTests.Count) 개"
Write-Host "  - 안전한 테스트: $($totalTests - $vulnerableTests.Count) 개"

if ($vulnerableTests.Count -gt 0) {
    Write-Host "`n🚨 발견된 취약점:" -ForegroundColor Red
    $i = 1
    $vulnerableTests | ForEach-Object {
        Write-Host "  $i. $($_.Test)" -ForegroundColor Red
        $i++
    }
} else {
    Write-Host "`n✅ 발견된 취약점이 없습니다!" -ForegroundColor Green
}

Write-Host "`n💡 보안 권장사항:"
Write-Host "  - 입력 검증 강화"
Write-Host "  - 출력 인코딩 적용"
Write-Host "  - CSRF 토큰 구현"
Write-Host "  - Rate Limiting 적용"
Write-Host "  - 보안 헤더 설정"
Write-Host "  - JWT 토큰 검증 강화"

Write-Host "`n✅ 보안 테스트 완료" -ForegroundColor Green

# 결과를 CSV 파일로 저장
$results | Export-Csv -Path "security-test-results.csv" -NoTypeInformation
Write-Host "📄 결과가 security-test-results.csv에 저장되었습니다." -ForegroundColor Cyan














