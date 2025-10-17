# API 테스트 스크립트
# PowerShell용 API 테스트 스크립트

Write-Host "🧪 API 테스트 시작..." -ForegroundColor Green

# 환경 변수 설정
$baseUrl = "http://localhost:3000"
$adminEmail = "admin@youniqle.com"
$adminPassword = "admin123!"
$userEmail = "user@youniqle.com"
$userPassword = "user123!"

# 토큰 저장 변수
$adminToken = $null
$userToken = $null

# 1. 관리자 로그인 테스트
Write-Host "`n1. 관리자 로그인 테스트" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $adminEmail
        password = $adminPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $adminToken = $loginData.token
    
    Write-Host "✅ 관리자 로그인 성공: $($loginResponse.StatusCode)" -ForegroundColor Green
    Write-Host "토큰: $($adminToken.Substring(0,20))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ 관리자 로그인 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 사용자 로그인 테스트
Write-Host "`n2. 사용자 로그인 테스트" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $userEmail
        password = $userPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $userToken = $loginData.token
    
    Write-Host "✅ 사용자 로그인 성공: $($loginResponse.StatusCode)" -ForegroundColor Green
    Write-Host "토큰: $($userToken.Substring(0,20))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ 사용자 로그인 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 상품 목록 조회 테스트
Write-Host "`n3. 상품 목록 조회 테스트" -ForegroundColor Yellow
try {
    $productsUrl = "$baseUrl/api/products?page=1`&limit=5"
    $productsResponse = Invoke-WebRequest -Uri $productsUrl -Method GET
    $productsData = $productsResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ 상품 목록 조회 성공: $($productsResponse.StatusCode)" -ForegroundColor Green
    Write-Host "상품 개수: $($productsData.products.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 상품 목록 조회 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. 장바구니 테스트 (사용자 토큰 필요)
if ($userToken) {
    Write-Host "`n4. 장바구니 테스트" -ForegroundColor Yellow
    try {
        # 장바구니 조회
        $cartResponse = Invoke-WebRequest -Uri "$baseUrl/api/cart" -Method GET -Headers @{"Authorization"="Bearer $userToken"}
        $cartData = $cartResponse.Content | ConvertFrom-Json
        
        Write-Host "✅ 장바구니 조회 성공: $($cartResponse.StatusCode)" -ForegroundColor Green
        Write-Host "장바구니 아이템 수: $($cartData.cart.items.Count)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ 장바구니 조회 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. 주문 내역 테스트 (사용자 토큰 필요)
if ($userToken) {
    Write-Host "`n5. 주문 내역 테스트" -ForegroundColor Yellow
    try {
        $ordersResponse = Invoke-WebRequest -Uri "$baseUrl/api/orders" -Method GET -Headers @{"Authorization"="Bearer $userToken"}
        $ordersData = $ordersResponse.Content | ConvertFrom-Json
        
        Write-Host "✅ 주문 내역 조회 성공: $($ordersResponse.StatusCode)" -ForegroundColor Green
        Write-Host "주문 개수: $($ordersData.orders.Count)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ 주문 내역 조회 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. 알림 목록 테스트 (사용자 토큰 필요)
if ($userToken) {
    Write-Host "`n6. 알림 목록 테스트" -ForegroundColor Yellow
    try {
        $notificationsResponse = Invoke-WebRequest -Uri "$baseUrl/api/notifications" -Method GET -Headers @{"Authorization"="Bearer $userToken"}
        $notificationsData = $notificationsResponse.Content | ConvertFrom-Json
        
        Write-Host "✅ 알림 목록 조회 성공: $($notificationsResponse.StatusCode)" -ForegroundColor Green
        Write-Host "알림 개수: $($notificationsData.notifications.Count)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ 알림 목록 조회 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 7. 분석 데이터 테스트 (관리자 토큰 필요)
if ($adminToken) {
    Write-Host "`n7. 분석 데이터 테스트" -ForegroundColor Yellow
    try {
        $analyticsUrl = "$baseUrl/api/admin/analytics?startDate=2024-01-01`&endDate=2024-12-31"
        $analyticsResponse = Invoke-WebRequest -Uri $analyticsUrl -Method GET
        $analyticsData = $analyticsResponse.Content | ConvertFrom-Json
        
        Write-Host "✅ 분석 데이터 조회 성공: $($analyticsResponse.StatusCode)" -ForegroundColor Green
        Write-Host "총 사용자 수: $($analyticsData.overview.totalUsers)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ 분석 데이터 조회 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 8. Rate Limiting 테스트
Write-Host "`n8. Rate Limiting 테스트" -ForegroundColor Yellow
$rateLimitCount = 0
for ($i = 1; $i -le 6; $i++) {
    try {
        $rateLimitBody = @{
            email = $adminEmail
            password = "wrongpassword"
        } | ConvertTo-Json

        $rateLimitResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $rateLimitBody
        Write-Host "시도 $i : 상태 $($rateLimitResponse.StatusCode)" -ForegroundColor Cyan
    } catch {
        $rateLimitCount++
        Write-Host "시도 $i : 상태 $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

if ($rateLimitCount -gt 0) {
    Write-Host "✅ Rate Limiting 작동 중: $rateLimitCount 개의 요청이 차단됨" -ForegroundColor Green
} else {
    Write-Host "⚠️ Rate Limiting이 작동하지 않을 수 있음" -ForegroundColor Yellow
}

Write-Host "`n✅ API 테스트 완료!" -ForegroundColor Green