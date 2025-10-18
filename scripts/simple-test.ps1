Write-Host "API 테스트 시작" -ForegroundColor Green

# 1. 관리자 로그인
$loginBody = @{
    email = "admin@youniqle.com"
    password = "admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $adminToken = $loginData.token
    
    Write-Host "관리자 로그인 성공: $($loginResponse.StatusCode)" -ForegroundColor Green
    Write-Host "토큰: $($adminToken.Substring(0,20))..." -ForegroundColor Cyan
} catch {
    Write-Host "관리자 로그인 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 상품 목록 조회
try {
    $productsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products?page=1&limit=5" -Method GET
    $productsData = $productsResponse.Content | ConvertFrom-Json
    
    Write-Host "상품 목록 조회 성공: $($productsResponse.StatusCode)" -ForegroundColor Green
    Write-Host "상품 개수: $($productsData.products.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "상품 목록 조회 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "API 테스트 완료" -ForegroundColor Green












