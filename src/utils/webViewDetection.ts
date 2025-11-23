/**
 * WebView 감지 유틸리티
 * Google OAuth가 WebView에서 차단되는 문제를 해결하기 위한 유틸리티
 */

/**
 * 현재 환경이 WebView인지 확인합니다.
 * Google은 보안상의 이유로 WebView에서 OAuth 요청을 차단합니다.
 */
export const isWebView = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // WebView 감지 패턴
  const webViewPatterns = [
    /wv/i, // Android WebView
    /WebView/i,
    /(iPhone|iPod|iPad)(?!.*Safari\/)/i, // iOS WebView (Safari가 아닌 경우)
    /Android.*(wv|\.0\.0\.0)/i,
    /FBAN|FBAV/i, // Facebook in-app browser
    /Line/i, // LINE in-app browser
    /NAVER/i, // Naver in-app browser
    /KAKAOTALK/i, // KakaoTalk in-app browser
  ];
  
  return webViewPatterns.some(pattern => pattern.test(userAgent));
};

/**
 * WebView 환경에서 OAuth 로그인을 처리합니다.
 * 외부 브라우저로 열기를 시도합니다.
 */
export const handleWebViewOAuth = async (
  provider: string,
  callbackUrl: string = '/'
): Promise<boolean> => {
  if (!isWebView()) {
    return false; // WebView가 아니면 일반 처리
  }

  const shouldContinue = window.confirm(
    '현재 앱 내 브라우저에서 접속 중입니다.\n\n' +
    'Google 로그인은 보안상의 이유로 시스템 브라우저(Chrome, Safari 등)에서만 가능합니다.\n\n' +
    '계속하시겠습니까? (권장: 브라우저에서 직접 열기)'
  );

  if (!shouldContinue) {
    return true; // 사용자가 취소함
  }

  // 외부 브라우저로 열기 시도
  try {
    const baseUrl = window.location.origin;
    const encodedCallbackUrl = encodeURIComponent(`${baseUrl}${callbackUrl}`);
    const authUrl = `${baseUrl}/api/auth/signin/${provider}?callbackUrl=${encodedCallbackUrl}`;
    
    // 모바일에서 외부 브라우저로 열기
    window.open(authUrl, '_blank', 'noopener,noreferrer');
    return true; // 외부 브라우저로 열기 성공
  } catch (error) {
    console.error('Failed to open in external browser:', error);
    return false;
  }
};


