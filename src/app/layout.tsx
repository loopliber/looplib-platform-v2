import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header'; // Add this import

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header /> {/* Add this line - this is the key change */}
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