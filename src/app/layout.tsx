import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LoopLib - Free Samples & Loops for Music Producers',
  description: 'Download free samples and loops. Purchase licenses when you\'re ready to release.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
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