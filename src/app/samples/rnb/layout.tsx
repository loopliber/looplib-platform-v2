import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free R&B Samples & Loops | Download R&B Sounds | LoopLib',
  description: 'Download royalty free R&B samples and loops. Smooth melodies, modern chords, and silky vocals for R&B music production. Royalty-free with commercial licenses.',
  keywords: 'free rnb samples, r&b loops, smooth samples, melodic samples, modern r&b, r&b production, chill samples, vocal samples',
};

export default function RnBSamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}