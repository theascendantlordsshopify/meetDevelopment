import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'CalendlyClone - Smart Scheduling Made Simple',
    template: '%s | CalendlyClone',
  },
  description:
    'Streamline your scheduling with our intelligent booking platform. Connect calendars, automate workflows, and provide seamless booking experiences.',
  keywords: [
    'scheduling',
    'calendar',
    'booking',
    'appointments',
    'meetings',
    'automation',
    'workflow',
  ],
  authors: [{ name: 'CalendlyClone Team' }],
  creator: 'CalendlyClone',
  publisher: 'CalendlyClone',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'CalendlyClone',
    title: 'CalendlyClone - Smart Scheduling Made Simple',
    description:
      'Streamline your scheduling with our intelligent booking platform. Connect calendars, automate workflows, and provide seamless booking experiences.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CalendlyClone - Smart Scheduling Made Simple',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalendlyClone - Smart Scheduling Made Simple',
    description:
      'Streamline your scheduling with our intelligent booking platform.',
    images: ['/og-image.png'],
    creator: '@calendlyclone',
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}