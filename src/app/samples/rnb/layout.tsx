import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free R&B Samples & Loops | Download R&B Sounds | LoopLib',
  description: 'Download 400+ free R&B samples and loops. Smooth vocals, jazzy chords, and soulful melodies for R&B music production. 70-140 BPM. Royalty-free.',
  keywords: 'free r&b samples, r&b loops, smooth vocals, jazz chords, r&b drums, neo soul samples, contemporary r&b, r&b production',
  openGraph: {
    title: 'Free R&B Samples & Loops - LoopLib',
    description: 'Professional R&B samples for music producers. Download free smooth vocals, jazzy chords, and soulful melodies.',
    url: 'https://looplib.com/samples/rnb',
  },
  alternates: {
    canonical: 'https://looplib.com/samples/rnb',
  },
};

export default function RnBSamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}