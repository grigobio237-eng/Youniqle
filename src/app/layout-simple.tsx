import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Youniqle - 프리미엄 온라인 쇼핑몰',
  description: '고품질 상품을 합리적인 가격으로 제공하는 온라인 쇼핑몰 Youniqle에서 특별한 쇼핑 경험을 만나보세요.',
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
    url: 'http://localhost:3000',
    title: 'Youniqle - 프리미엄 온라인 쇼핑몰',
    description: '고품질 상품을 합리적인 가격으로 제공하는 온라인 쇼핑몰',
    siteName: 'Youniqle',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Youniqle - 프리미엄 온라인 쇼핑몰',
    description: '고품질 상품을 합리적인 가격으로 제공하는 온라인 쇼핑몰',
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
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

