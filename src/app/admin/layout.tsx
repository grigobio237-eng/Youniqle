'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ServerErrorBoundary from '@/components/ServerErrorBoundary';
import { Toaster } from 'sonner';

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
    <ServerErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Admin Layout Error:', error, errorInfo);
      }}
    >
      <AdminLayout>
        {children}
      </AdminLayout>
      <Toaster position="top-center" />
    </ServerErrorBoundary>
  );
}
