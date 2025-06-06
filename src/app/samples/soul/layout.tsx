import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Soul Samples & Loops | Download Soul Sounds | LoopLib',
  description: 'Download 300+ free soul samples and loops. Vintage vocals, warm bass lines, and classic soul rhythms. 60-120 BPM. Royalty-free.',
  keywords: 'free soul samples, soul loops, vintage vocals, soul drums, motown samples, classic soul, soul music production',
  openGraph: {
    title: 'Free Soul Samples & Loops - LoopLib',
    description: 'Professional soul samples for music producers. Download free vintage vocals, warm bass, and classic rhythms.',
    url: 'https://looplib.com/samples/soul',
  },
  alternates: {
    canonical: 'https://looplib.com/samples/soul',
  },
};

export default function SoulSamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}