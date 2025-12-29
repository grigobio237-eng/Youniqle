import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ConditionalHeader from '@/components/layout/ConditionalHeader';
import Footer from '@/components/layout/Footer';
import SessionProvider from '@/components/providers/SessionProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
// 모니터링 시스템 초기화는 서버 사이드에서만 실행
// Vercel 환경에서는 필요시에만 활성화
if (typeof window === 'undefined' && process.env.ENABLE_MONITORING === 'true') {
  try {
    const { initializeMonitoring } = require('@/lib/initializeMonitoring');
    initializeMonitoring();
  } catch (error) {
    // 모니터링 초기화 실패해도 앱은 계속 실행
    console.warn('모니터링 시스템 초기화 실패:', error);
  }
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Youniqle - 당신의 회복을 설계하는 라이프 네비게이터',
  description: '당신의 회복을 설계하는 라이프 네비게이터, Youniqle에서 데이터 기반의 맞춤형 회복 솔루션을 경험해보세요.',
  keywords: ['쇼핑몰', '온라인쇼핑', '유니클', 'youniqle'],
  authors: [{ name: 'Youniqle Team' }],
  creator: 'Youniqle',
  publisher: 'Youniqle',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://grigobio.co.kr',
    title: 'Youniqle - 당신의 회복을 설계하는 라이프 네비게이터',
    description: '당신의 회복을 설계하는 라이프 네비게이터, Youniqle',
    siteName: 'Youniqle',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Youniqle - 당신의 회복을 설계하는 라이프 네비게이터',
    description: '당신의 회복을 설계하는 라이프 네비게이터, Youniqle',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <SessionProvider>
          <LanguageProvider>
            <ConditionalHeader />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

