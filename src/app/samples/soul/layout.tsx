import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Soul Samples & Loops | Download Soul Sounds | LoopLib',
  description: 'Download royalty free soul samples and loops. Vintage keys, gospel chords, and warm basslines for soul music production. Royalty-free with commercial licenses.',
  keywords: 'free soul samples, soul loops, gospel samples, vintage samples, soul music, motown samples, soul production, warm samples',
};

export default function SoulSamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}