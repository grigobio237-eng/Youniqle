import Link from 'next/link';
import { BellOff, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-background">
      <div className="bg-surface p-6 rounded-full shadow-sm mb-8 border border-line">
        <BellOff className="w-16 h-16 text-primary/70" />
      </div>
      
      <h1 className="text-3xl font-serif-display font-bold text-foreground mb-4">
        알림 또는 페이지를 찾을 수 없습니다
      </h1>
      
      <p className="text-foreground/70 mb-10 max-w-md text-lg">
        존재하지 않는 주소를 입력하셨거나,<br />
        푸시 알림을 통해 접속하셨다면 이미 삭제되었거나 만료된 알림일 수 있습니다.
      </p>
      
      <Link 
        href="/"
        className="btn-primary flex items-center justify-center gap-2 w-full max-w-[240px] mx-auto"
      >
        <Home className="w-5 h-5" />
        <span>홈으로 돌아가기</span>
      </Link>
    </div>
  );
}
