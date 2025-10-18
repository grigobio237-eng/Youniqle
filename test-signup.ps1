# Youniqle 회원가입 테스트 스크립트
# PowerShell에서 실행: .\test-signup.ps1

Write-Host "🧪 Youniqle 회원가입 테스트 시작..." -ForegroundColor Green
Write-Host ""

# 1. 정상 회원가입 테스트
Write-Host "1. 정상 회원가입 테스트" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/signup" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test2@example.com", "password": "Test123!", "name": "테스트 사용자2", "phone": "010-1234-5678"}'
    Write-Host "✅ 성공: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "응답: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 실패: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 2. 중복 이메일 테스트
Write-Host "2. 중복 이메일 테스트" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/signup" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test2@example.com", "password": "Test123!", "name": "중복 테스트"}'
    Write-Host "❌ 예상치 못한 성공: $($response.StatusCode)" -ForegroundColor Red
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errorContent = $reader.ReadToEnd()
    Write-Host "✅ 예상된 실패: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    Write-Host "에러 메시지: $errorContent" -ForegroundColor Cyan
}
Write-Host ""

# 3. 잘못된 이메일 형식 테스트
Write-Host "3. 잘못된 이메일 형식 테스트" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/signup" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "invalid-email", "password": "Test123!", "name": "잘못된 이메일"}'
    Write-Host "❌ 예상치 못한 성공: $($response.StatusCode)" -ForegroundColor Red
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errorContent = $reader.ReadToEnd()
    Write-Host "✅ 예상된 실패: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    Write-Host "에러 메시지: $errorContent" -ForegroundColor Cyan
}
Write-Host ""

# 4. 필수 필드 누락 테스트
Write-Host "4. 필수 필드 누락 테스트" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/signup" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test3@example.com", "password": "Test123!"}'
    Write-Host "❌ 예상치 못한 성공: $($response.StatusCode)" -ForegroundColor Red
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errorContent = $reader.ReadToEnd()
    Write-Host "✅ 예상된 실패: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    Write-Host "에러 메시지: $errorContent" -ForegroundColor Cyan
}
Write-Host ""

# 5. 짧은 비밀번호 테스트
Write-Host "5. 짧은 비밀번호 테스트" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/signup" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test4@example.com", "password": "123", "name": "짧은 비밀번호"}'
    Write-Host "❌ 예상치 못한 성공: $($response.StatusCode)" -ForegroundColor Red
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errorContent = $reader.ReadToEnd()
    Write-Host "✅ 예상된 실패: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    Write-Host "에러 메시지: $errorContent" -ForegroundColor Cyan
}
Write-Host ""

Write-Host "🎉 회원가입 테스트 완료!" -ForegroundColor Green












