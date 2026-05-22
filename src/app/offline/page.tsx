'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RotateCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const [mounted, setMounted] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    
    // 네트워크 재접속 시도 (0.8초의 인위적인 대기 시간으로 고급스러운 인터랙션 제공)
    setTimeout(() => {
      if (window.navigator.onLine) {
        window.location.href = '/';
      } else {
        setIsRetrying(false);
        // 여전히 오프라인인 경우 피드백 (진동 등)
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
      }
    }, 800);
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center bg-[#0B0D10] px-6 text-center text-white">
      {/* 장식용 은은한 골드 백그라운드 글로우 효과 */}
      <div className="absolute top-1/4 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#D4AF37]/5 blur-[80px]" />

      <div className="relative z-10 max-w-md space-y-8">
        
        {/* 와이파이 단절 시각 요소 */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-neutral-900 border border-neutral-800 shadow-inner">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-[#D4AF37]/10 to-transparent opacity-50" />
          <WifiOff className="h-10 w-10 text-[#D4AF37] animate-pulse" />
        </div>

        {/* 안내 텍스트 */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            네트워크 연결이 끊겼습니다
          </h1>
          <p className="text-sm leading-relaxed text-neutral-400">
            유니클은 오프라인에서도 사용자의 건강한 회복을 응원합니다. <br />
            인터넷 연결 상태를 점검하신 뒤 아래 버튼을 눌러주세요.
          </p>
        </div>

        {/* 인터랙티브 제어 그룹 */}
        <div className="flex flex-col space-y-3.5 pt-2">
          {/* 재시도 버튼 */}
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex w-full items-center justify-center space-x-2 rounded-[20px] bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] py-4 text-sm font-semibold text-[#0B0D10] transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            <RotateCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? '연결을 확인하는 중...' : '다시 연결 시도'}</span>
          </button>

          {/* 메인 홈 버튼 (네비게이션 보조) */}
          <Link
            href="/"
            className="flex w-full items-center justify-center space-x-2 rounded-[20px] border border-neutral-800 bg-neutral-900/60 py-4 text-sm font-semibold text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            <span>메인 화면으로 이동</span>
          </Link>
        </div>

        {/* 웰니스 마이크로 코멘트 */}
        <p className="text-[11px] text-neutral-600">
          오프라인 상태가 유지되더라도, 연결 복구 시 즉시 맞춤 데이터가 동기화됩니다.
        </p>

      </div>
    </div>
  );
}
