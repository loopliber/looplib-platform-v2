import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Trap Samples & Loops | Download Trap Sounds | LoopLib',
  description: 'Download royalty free trap samples and loops. Hard-hitting 808s, hi-hats, and dark melodies for trap music production. Royalty-free with commercial licenses.',
  keywords: 'free trap samples, trap loops, 808 samples, hi-hat samples, trap beats, trap production, dark melodies, hard samples',
};

export default function TrapSamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}