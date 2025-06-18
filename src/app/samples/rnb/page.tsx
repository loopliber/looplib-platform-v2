'use client';

import GenrePageTemplate, { GenrePageConfig } from '@/components/GenrePageTemplate';
import { Sparkles, Headphones, Sliders } from 'lucide-react';

const rnbConfig: GenrePageConfig = {
  genre: 'R&B',
  genreSlug: 'rnb',
  title: 'Royalty Free R&B Samples & Loops',
  subtitle: 'Smooth R&B melodies • 60-100 BPM • Instant download',
  metaDescription: 'Download free R&B melody samples and loops. Smooth melodies, modern chords, and silky leads for R&B music production. Royalty-free with commercial licenses.',
  heroImage: 'https://cdn.shopify.com/s/files/1/0816/1257/0973/files/hero-keys.jpg', // Add hero image (you'll want to use an R&B-specific image)
  bpmRanges: [
    { id: 'all', label: 'All BPMs', min: 0, max: 999 },
    { id: '60-70', label: '60-70 BPM', min: 60, max: 70 },
    { id: '70-80', label: '70-80 BPM', min: 70, max: 80 },
    { id: '80-100', label: '80-100 BPM', min: 80, max: 100 },
  ],
  commonTags: ['rnb', 'deep', 'soft', 'melodic', 'melancholy', 'smooth'],
  heroGradient: 'bg-gradient-to-br from-purple-700 via-purple-700 to-indigo-900',
  icon: Sparkles,
  educationalContent: {
    essentialElements: {
      icon: Headphones,
      title: 'Essential R&B Melody Elements',
      items: [
        '• Smooth chord progressions (7ths, 9ths)',
        '• Silky lead melodies and runs',
        '• Modern harmonic extensions',
        '• Lush ambient textures',
      ],
    },
    productionTips: {
      icon: Sliders,
      title: 'R&B Melody Production Tips',
      items: [
        '• Use stereo width on melodies',
        '• Apply gentle compression to keys',
        '• Add subtle pitch modulation',
        '• Create space with reverb sends',
      ],
    },
    description: [
      'Modern R&B melodies blend traditional soul elements with contemporary production techniques. Our free R&B melody samples capture the essence of artists like The Weeknd, SZA, and Frank Ocean.',
      'When creating R&B melodies, focus on smooth chord progressions and silky lead lines. Use extended chords, lush pads, and modern harmonic progressions to create that signature R&B feel.',
    ],
  },
};

export default function RnBSamplesPage() {
  return <GenrePageTemplate config={rnbConfig} initialSamples={[]} />;
}