import { sendVerificationEmail } from '../lib/email';

async function testEmail() {
  try {
    console.log('이메일 발송 테스트 시작...');
    
    // 환경변수 직접 설정 (테스트용)
    process.env.SMTP_HOST = 'smtps.hiworks.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'suchwawa@sapienet.com';
    process.env.SMTP_PASS = 'BOWThAvYpjArHiqoTTNk';
    process.env.EMAIL_FROM = 'suchwawa@sapienet.com';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
    
    console.log('환경변수 설정 완료');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    
    const result = await sendVerificationEmail(
      'test@example.com', // 테스트 이메일 주소
      'test-token-123',
      '테스트 사용자'
    );
    
    if (result.success) {
      console.log('✅ 이메일 발송 성공!');
    } else {
      console.log('❌ 이메일 발송 실패:', result.error);
    }
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

testEmail();
