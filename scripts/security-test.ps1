# 보안 테스트 PowerShell 스크립트
Write-Host "🛡️ 보안 테스트 시작 (PowerShell)" -ForegroundColor Yellow
Write-Host "=" * 60

$baseUrl = "http://localhost:3000"
$results = @()

# 1. SQL Injection 테스트
Write-Host "`n💉 1. SQL Injection 테스트" -ForegroundColor Yellow

$sqlPayloads = @(
    "' OR 1=1 --",
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "admin'/*"
)

foreach ($payload in $sqlPayloads) {
    try {
        $url = "$baseUrl/api/products?search=$([System.Web.HttpUtility]::UrlEncode($payload))"
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        
        $isVulnerable = $response.Content -match "error" -and $response.Content -match "sql"
        $results += [PSCustomObject]@{
            Test = "SQL Injection - 상품 검색"
            Payload = $payload
            StatusCode = $response.StatusCode
            Vulnerable = $isVulnerable
            Details = $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
        }
        
        if ($isVulnerable) {
            Write-Host "  ❌ 취약점 발견: $payload" -ForegroundColor Red
        } else {
            Write-Host "  ✅ 안전: $payload" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️ 테스트 실패: $payload - $($_.Exception.Message)" -ForegroundColor Yellow
        $results += [PSCustomObject]@{
            Test = "SQL Injection - 상품 검색"
            Payload = $payload
            StatusCode = 0
            Vulnerable = $false
            Details = $_.Exception.Message
        }
    }
}

# 2. XSS 테스트
Write-Host "`n🚨 2. XSS 테스트" -ForegroundColor Yellow

$xssPayloads = @(
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')",
    "<svg onload=alert('XSS')>",
    "<iframe src=`"javascript:alert('XSS')`"></iframe>"
)

foreach ($payload in $xssPayloads) {
    try {
        $url = "$baseUrl/api/products?search=$([System.Web.HttpUtility]::UrlEncode($payload))"
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        
        $isVulnerable = $response.Content -match [regex]::Escape($payload) -and $response.Content -notmatch "&lt;" -and $response.Content -notmatch "&gt;"
        $results += [PSCustomObject]@{
            Test = "XSS - 상품 검색"
            Payload = $payload
            StatusCode = $response.StatusCode
            Vulnerable = $isVulnerable
            Details = $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
        }
        
        if ($isVulnerable) {
            Write-Host "  ❌ 취약점 발견: $payload" -ForegroundColor Red
        } else {
            Write-Host "  ✅ 안전: $payload" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️ 테스트 실패: $payload - $($_.Exception.Message)" -ForegroundColor Yellow
        $results += [PSCustomObject]@{
            Test = "XSS - 상품 검색"
            Payload = $payload
            StatusCode = 0
            Vulnerable = $false
            Details = $_.Exception.Message
        }
    }
}

# 3. 인증 테스트
Write-Host "`n🔐 3. 인증 테스트" -ForegroundColor Yellow

# 토큰 없이 보호된 API 접근
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/users" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    $isVulnerable = $response.StatusCode -eq 200
    $results += [PSCustomObject]@{
        Test = "인증 - 토큰 없이 관리자 API 접근"
        Payload = "None"
        StatusCode = $response.StatusCode
        Vulnerable = $isVulnerable
        Details = $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
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
        Details = $_.Exception.Message
    }
}

# 4. 입력 검증 테스트
Write-Host "`n📝 4. 입력 검증 테스트" -ForegroundColor Yellow

$inputTests = @(
    @{ Name = "매우 긴 입력값"; Value = "A" * 1000 },
    @{ Name = "특수 문자 입력"; Value = "!@#$%^&*()_+{}|:`"<>?[]\;',./" },
    @{ Name = "SQL 키워드 입력"; Value = "SELECT * FROM users" },
    @{ Name = "빈 문자열"; Value = "" }
)

foreach ($test in $inputTests) {
    try {
        $url = "$baseUrl/api/products?search=$([System.Web.HttpUtility]::UrlEncode($test.Value))"
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        
        $isVulnerable = $response.StatusCode -eq 200 -and $response.Content -notmatch "error"
        $results += [PSCustomObject]@{
            Test = "입력 검증 - $($test.Name)"
            Payload = $test.Value
            StatusCode = $response.StatusCode
            Vulnerable = $isVulnerable
            Details = $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
        }
        
        if ($isVulnerable) {
            Write-Host "  ❌ 취약점 발견: $($test.Name)" -ForegroundColor Red
        } else {
            Write-Host "  ✅ 안전: $($test.Name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️ 테스트 실패: $($test.Name) - $($_.Exception.Message)" -ForegroundColor Yellow
        $results += [PSCustomObject]@{
            Test = "입력 검증 - $($test.Name)"
            Payload = $test.Value
            StatusCode = 0
            Vulnerable = $false
            Details = $_.Exception.Message
        }
    }
}

# 5. 보안 헤더 테스트
Write-Host "`n🔒 5. 보안 헤더 테스트" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/products" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    
    $securityHeaders = @{
        'X-Content-Type-Options' = $response.Headers['X-Content-Type-Options']
        'X-Frame-Options' = $response.Headers['X-Frame-Options']
        'X-XSS-Protection' = $response.Headers['X-XSS-Protection']
        'Strict-Transport-Security' = $response.Headers['Strict-Transport-Security']
        'Content-Security-Policy' = $response.Headers['Content-Security-Policy']
    }
    
    $missingHeaders = $securityHeaders.GetEnumerator() | Where-Object { -not $_.Value }
    $isVulnerable = $missingHeaders.Count -gt 0
    
    $results += [PSCustomObject]@{
        Test = "보안 헤더"
        Payload = "None"
        StatusCode = $response.StatusCode
        Vulnerable = $isVulnerable
        Details = ($securityHeaders | ConvertTo-Json -Compress)
    }
    
    if ($isVulnerable) {
        Write-Host "  ❌ 취약점 발견: 누락된 보안 헤더" -ForegroundColor Red
        foreach ($header in $missingHeaders) {
            Write-Host "    - $($header.Key)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ✅ 안전: 모든 보안 헤더 설정됨" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️ 테스트 실패: $($_.Exception.Message)" -ForegroundColor Yellow
    $results += [PSCustomObject]@{
        Test = "보안 헤더"
        Payload = "None"
        StatusCode = 0
        Vulnerable = $false
        Details = $_.Exception.Message
    }
}

# 6. Rate Limiting 테스트
Write-Host "`n⏱️ 6. Rate Limiting 테스트" -ForegroundColor Yellow

$successCount = 0
$failureCount = 0

for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@youniqle.com","password":"wrongpassword"}' -TimeoutSec 5 -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 200) {
            $successCount++
        } elseif ($response.StatusCode -eq 429) {
            $failureCount++
        }
    } catch {
        $failureCount++
    }
}

$isVulnerable = $successCount -gt 5
$results += [PSCustomObject]@{
    Test = "Rate Limiting"
    Payload = "10 rapid requests"
    StatusCode = 200
    Vulnerable = $isVulnerable
    Details = "성공: $successCount, 실패: $failureCount"
}

if ($isVulnerable) {
    Write-Host "  ❌ 취약점 발견: Rate Limiting 없음" -ForegroundColor Red
} else {
    Write-Host "  ✅ 안전: Rate Limiting 적용됨" -ForegroundColor Green
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
    $vulnerableTests | ForEach-Object { $i = 1 } {
        Write-Host "  $i. $($_.Test)" -ForegroundColor Red
        Write-Host "     상세: $($_.Details)" -ForegroundColor Gray
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










