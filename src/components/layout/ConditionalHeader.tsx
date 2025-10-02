'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();

  // 파트너 페이지와 관리자 페이지에서는 헤더를 숨김
  const shouldHideHeader = pathname.startsWith('/partner') || pathname.startsWith('/admin');

  if (shouldHideHeader) {
    return null;
  }

  return <Header />;
}
