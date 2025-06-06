import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free R&B Samples & Loops | Download R&B Sounds | LoopLib',
  description: 'Download 80+ free R&B samples and loops. Smooth melodies, modern chords, and silky sounds for R&B music production. Royalty-free with commercial licenses.',
  keywords: 'free rnb samples, r&b loops, rnb sounds, smooth samples, modern rnb, rnb production, contemporary r&b',
};

export default function RnBSamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}