import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider, AuthProvider, SmoothScrollProvider } from '@/lib/providers';
import { Toaster } from 'sonner';
import { VisitorTracker } from '@/components/analytics/VisitorTracker';

// Optimized font loading with swap display
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'Fullstack NNP Template - Production-Ready Enterprise Stack',
  description:
    'The ultimate fullstack template: NestJS + Next.js 16 + PostgreSQL. Built for AI coding agents with 1000+ lines of instructions. Production-ready with RBAC, authentication, testing, and comprehensive documentation.',
  keywords: [
    'fullstack template',
    'NestJS',
    'Next.js 16',
    'React 19',
    'PostgreSQL',
    'TypeScript',
    'production-ready',
    'enterprise template',
    'AI-optimized',
    'RBAC',
    'authentication',
  ],
  authors: [{ name: 'Kaundal', url: 'https://github.com/k-kaundal' }],
  creator: 'Kaundal',
  publisher: 'Kaundal',
  metadataBase: new URL('https://fullstack-nnp-template.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fullstack-nnp-template.vercel.app',
    title: 'Fullstack NNP Template - Production-Ready Enterprise Stack',
    description:
      'The ultimate fullstack template: NestJS + Next.js 16 + PostgreSQL. Built for AI coding agents. Production-ready with RBAC, authentication, and comprehensive features.',
    siteName: 'Fullstack NNP Template',
    images: [
      {
        url: '/homepage-preview.png',
        width: 1200,
        height: 630,
        alt: 'Fullstack NNP Template - Production-Ready Enterprise Stack',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fullstack NNP Template - Production-Ready Enterprise Stack',
    description:
      'NestJS + Next.js 16 + PostgreSQL. Built for AI agents. Production-ready with RBAC, auth, testing & docs.',
    images: ['/homepage-preview.png'],
    creator: '@k_k_kaundal', // Update with your Twitter handle
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full ${inter.variable}`}>
      <body className="antialiased h-full font-sans">
        <ThemeProvider>
          <AuthProvider>
            <SmoothScrollProvider>
              <VisitorTracker />
              {children}
              <Toaster position="top-right" expand={false} richColors closeButton duration={4000} />
            </SmoothScrollProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
