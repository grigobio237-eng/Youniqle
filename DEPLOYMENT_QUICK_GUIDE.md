# Youniqle 배포 빠른 가이드 🚀

**마지막 업데이트**: 2025년 10월 1일

## 📋 배포 현황

| 항목 | 상태 | URL/정보 |
|------|------|----------|
| **프로덕션 도메인** | ✅ 완료 | https://www.grigobio.co.kr |
| **Vercel 도메인** | ✅ 완료 | https://youniqle.vercel.app |
| **MongoDB** | ✅ 연결됨 | MongoDB Atlas |
| **Google OAuth** | ✅ 작동 | 리디렉션 URI 설정 완료 |
| **Kakao OAuth** | ⏳ 대기 | 승인 신청 전 |
| **Naver OAuth** | ⏳ 대기 | 승인 신청 전 |

---

## 🔧 Vercel 환경변수 (19개)

### 1. 데이터베이스
```
MONGODB_URI=mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 2. 사이트 URL
```
NEXT_PUBLIC_SITE_URL=https://www.grigobio.co.kr
NEXTAUTH_URL=https://www.grigobio.co.kr
```

### 3. JWT & Auth Secrets
```
JWT_SECRET=40de04570e0fa2776d13d4c5d76e15e3f738d4fcc2bb5910ebb0efe61ed190ff56d0de3ce1240116f77e412420bf0ecd8795df0e079a4fac61fe54048e611c09
NEXTAUTH_SECRET=b3ad62d24028fbc9ddd3bac5ba894096880bbff1dcd554da2841c7d4a2b573be
```

### 4. Google OAuth ✅
```
GOOGLE_CLIENT_ID=102136527081-vljs45ri64p6vaigc756p0fe6nu9gkkg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### 5. Kakao OAuth ⏳
```
KAKAO_CLIENT_ID=292bb80723d61732ae9237403465cf55
KAKAO_CLIENT_SECRET=LwpDIEckWdudxToHMzBHMElccfIGSZNB
```

### 6. Naver OAuth ⏳
```
NAVER_CLIENT_ID=qB5siBSLu7NhKmwNgNEd
NAVER_CLIENT_SECRET=A28fSF1SlH
```

### 7. Nicepay 결제
```
NICEPAY_MERCHANT_ID=grigobio1m
NICEPAY_MERCHANT_KEY=r7cCZeIK/YVD8Fw04T1NbUC8twGKSoUnEo72V680RwCxC+WQVQ8OG4mmRv8SPuXKtuQBcoHdMWBfDYd0zNU1+A==
NICEPAY_RETURN_URL=https://www.grigobio.co.kr/api/payment/result
NICEPAY_CANCEL_RETURN_URL=https://www.grigobio.co.kr/api/payment/cancel
```

### 8. Vercel Blob Storage
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_QhlswIWiISfSeRTa_k0z1OGdbKZHGOVWjXz9unBz4sO4hsd
```

### 9. 이메일 (Hiworks)
```
SMTP_HOST=smtps.hiworks.com
SMTP_PORT=465
SMTP_USER=suchwawa@sapienet.com
SMTP_PASS=BOWThAvYpjArHiqoTTNk
EMAIL_FROM=suchwawa@sapienet.com
```

---

## 🔗 OAuth 리디렉션 URI 설정

### ✅ Google OAuth (설정 완료)

**Google Cloud Console**: https://console.cloud.google.com/

1. "API 및 서비스" → "사용자 인증 정보"
2. OAuth 2.0 클라이언트 ID 선택
3. 추가:
   - **승인된 자바스크립트 원본**: `https://www.grigobio.co.kr`
   - **승인된 리디렉션 URI**: `https://www.grigobio.co.kr/api/auth/callback/google`

### ⏳ Kakao OAuth (추후 설정)

**Kakao Developers**: https://developers.kakao.com/

**승인 후 설정**:
1. "앱 설정" → "플랫폼" → Web 플랫폼 등록
2. **사이트 도메인**: `https://www.grigobio.co.kr`
3. "제품 설정" → "카카오 로그인" → Redirect URI
4. **Redirect URI**: `https://www.grigobio.co.kr/api/auth/callback/kakao`
5. 동의항목: 닉네임, 이메일 (필수)

### ⏳ Naver OAuth (추후 설정)

**Naver Developers**: https://developers.naver.com/

**승인 후 설정**:
1. "API 설정" 탭
2. **서비스 URL**: `https://www.grigobio.co.kr`
3. **Callback URL**: `https://www.grigobio.co.kr/api/auth/callback/naver`
4. 제공 정보: 이름, 이메일 (필수)

---

## 🔄 재배포 방법

1. Vercel Dashboard → **Deployments** 탭
2. 최신 배포의 **"..."** 메뉴 클릭
3. **"Redeploy"** 클릭
4. "Use existing Build Cache" **체크 해제** (권장)
5. **"Redeploy"** 버튼 클릭

---

## 🆘 문제 해결

### 환경변수가 반영 안 될 때
1. Vercel에서 환경변수 확인
2. **Production** 환경에 체크 확인
3. 재배포 (Build Cache 사용 안 함)

### OAuth 로그인 실패 시
1. 리디렉션 URI 정확히 일치하는지 확인
2. `NEXTAUTH_URL` 올바른지 확인
3. OAuth 제공자 콘솔에서 앱 상태 확인

### 도메인 연결 문제
1. DNS 설정 확인 (전파 24-48시간)
2. Vercel 도메인 상태 확인
3. HTTPS 인증서 발급 확인

---

## 📝 JWT_SECRET 생성 방법

PowerShell에서 실행:
```powershell
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

**⚠️ 주의**: 
- 기본 예제 값 절대 사용 금지
- 64바이트(128자) 이상 랜덤 문자열
- 외부 노출 금지

---

## ✅ 체크리스트

### 완료된 항목
- [x] MongoDB Atlas 연결
- [x] 도메인 구입 (grigobio.co.kr)
- [x] Vercel 도메인 연동
- [x] DNS 설정
- [x] JWT_SECRET 생성
- [x] Vercel 환경변수 설정 (19개)
- [x] Google OAuth 설정
- [x] 프로덕션 배포

### 추후 진행
- [ ] Kakao OAuth 승인 및 설정
- [ ] Naver OAuth 승인 및 설정
- [ ] 카카오 로그인 테스트
- [ ] 네이버 로그인 테스트
- [ ] 이메일 인증 테스트 (프로덕션)
- [ ] Nicepay 결제 테스트 (프로덕션)

---

## 📚 상세 가이드

더 자세한 정보는 다음 문서를 참조하세요:
- **전체 가이드**: [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) - "Vercel 배포 가이드" 섹션
- **프로젝트 개요**: [README.md](./README.md) - 배포 섹션
- **검증 가이드**: [VERIFICATION_GUIDE.md](./VERIFICATION_GUIDE.md)

---

**작성**: AI Assistant  
**최종 수정**: 2025년 10월 1일  
**상태**: Vercel 프로덕션 배포 완료 ✅

