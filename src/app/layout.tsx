// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import AnnouncementBar from '@/components/AnnouncementBar';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://looplib.com' 
  : 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'LoopLib - Free Samples & Loops for Music Producers',
  description: 'Download thousands of free samples and loops. Trap, R&B, Soul and more. Royalty-free with commercial licenses available.',
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: 'LoopLib - Free Samples & Loops',
    description: 'Download thousands of free samples and loops for music production.',
    url: baseUrl,
    siteName: 'LoopLib',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Keep existing GA_ID logic
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        {/* Fixed Google Analytics - replace the existing Script components with regular script tags */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GT-M69HVS83"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GT-M69HVS83');
            `,
          }}
        />

        {/* Keep your existing conditional Google Analytics setup */}
        {GA_ID && process.env.NODE_ENV === 'production' && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', {
                    anonymize_ip: true,
                    cookie_flags: 'SameSite=None;Secure'
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      {/* Keep everything else exactly the same */}
      <body className={inter.className}>
        <AnnouncementBar />
        <Header />
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
          }}
        />
      </body>
    </html>
  );
}