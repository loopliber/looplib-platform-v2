import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
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
  // Get GA ID from environment variables
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        {/* Your new Google Analytics - add this section */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=GT-M69HVS83"
        />
        <Script
          id="gtag-init-new"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GT-M69HVS83');
            `,
          }}
        />

        {/* Keep existing Google Analytics - Only load in production with valid GA_ID */}
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
      <body className={inter.className}>
        <Header />
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#171717',
              color: '#fff',
              border: '1px solid #262626',
            },
          }}
        />
      </body>
    </html>
  );
}