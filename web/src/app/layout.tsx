import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: {
    default: 'SmartFarm Web Service',
    template: '%s | SmartFarm',
  },
  description: '실시간 스마트팜 모니터링 시스템 - 온도, 습도, EC, pH 센서 데이터 모니터링 및 액츄에이터 원격 제어',
  keywords: ['스마트팜', 'SmartFarm', 'IoT', '센서', '모니터링', '농업', '온도', '습도', 'EC', 'pH'],
  authors: [{ name: 'SmartFarm Team' }],
  creator: 'SmartFarm Team',
  publisher: 'SmartFarm Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://smartfarm-web.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    title: 'SmartFarm Web Service',
    description: '실시간 스마트팜 모니터링 시스템 - 온도, 습도, EC, pH 센서 데이터 모니터링 및 액츄에이터 원격 제어',
    siteName: 'SmartFarm Web Service',
    images: [
      {
        url: '/images/og-image.png', // 추후 추가 가능
        width: 1200,
        height: 630,
        alt: 'SmartFarm Web Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartFarm Web Service',
    description: '실시간 스마트팜 모니터링 시스템',
    images: ['/images/og-image.png'], // 추후 추가 가능
  },
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
