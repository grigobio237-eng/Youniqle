'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  
  // 로그인 페이지는 레이아웃에서 제외
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}
