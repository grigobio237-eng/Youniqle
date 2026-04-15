import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ConditionalHeader from '@/components/layout/ConditionalHeader';
import Footer from '@/components/layout/Footer';
import SessionProvider from '@/components/providers/SessionProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import NudgeFeaturesProvider from '@/components/providers/NudgeFeaturesProvider';
import { ToastProvider } from '@/components/ui/toast';
import AiManagerChat from '@/components/chat/AiManagerChat';
import MandatoryConsentModal from '@/components/auth/MandatoryConsentModal';

const inter = Inter({ subsets: ['latin'] });


export const metadata: Metadata = {
  title: 'Youniqle - 번아웃 극복을 위한 유니클 맞춤 회복 솔루션',
  description: '60초 진단으로 나만의 회복 점수를 확인하고, 1만+ 사용자가 검증한 데이터 기반 맞춤형 회복 프로토콜을 경험하세요.',
  keywords: ['번아웃', '회복', '유니클 진단', '웰니스', '맞춤 솔루션', 'youniqle', '리커버리', '스트레스 관리', '수면 개선', '피로 해소'],
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
    title: 'Youniqle - 번아웃 극복을 위한 유니클 맞춤 회복 솔루션',
    description: '60초 진단으로 데이터 기반 맞춤 회복 솔루션을 경험하세요',
    siteName: 'Youniqle',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Youniqle - 번아웃 극복을 위한 유니클 맞춤 회복 솔루션',
    description: '60초 진단으로 데이터 기반 맞춤 회복 솔루션을 경험하세요',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Youniqle',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/character/youniqle-1.png' },
      { url: '/character/youniqle-1.png', sizes: '192x192', type: 'image/png' },
      { url: '/character/youniqle-1.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/character/youniqle-1.png',
    apple: [
      { url: '/character/youniqle-1.png' },
      { url: '/character/youniqle-1.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

import { RecoveryProvider } from '@/contexts/RecoveryContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('--- RootLayout Rendering ---');
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <SessionProvider>
          <LanguageProvider>
            <NudgeFeaturesProvider>
              <ToastProvider>
                <RecoveryProvider>
                  <ConditionalHeader />
                  <main className="flex-1 pt-16">
                    {children}
                  </main>
                  <Footer />
                  <AiManagerChat />
                  <MandatoryConsentModal />
                </RecoveryProvider>
              </ToastProvider>
            </NudgeFeaturesProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
