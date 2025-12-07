import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MainLayout } from '@/components/layout/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '쿠팡 소싱 도우미',
  description: 'AI 기반 트렌드 예측 플랫폼 - 데이터 기반으로 유망 상품을 발굴하세요',
  keywords: ['쿠팡', '소싱', '트렌드', 'AI', '키워드 분석', '마진 계산기'],
  authors: [{ name: 'Coupang Sourcing Assistant' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '쿠팡 소싱 도우미',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased`}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
