import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Music Samples & Loops | Download Royalty-Free Sounds | LoopLib',
  description: 'Download thousands of free music samples and loops. Trap, R&B, Soul, and more genres. High-quality WAV files with commercial licenses available.',
  keywords: 'free samples, music loops, royalty free samples, trap samples, rnb samples, soul samples, music production, beats',
};

export default function SamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}