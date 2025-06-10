'use client';

import GenrePageTemplate, { GenrePageConfig } from '@/components/GenrePageTemplate';
import { Heart, Music, Mic } from 'lucide-react';

const soulConfig: GenrePageConfig = {
  genre: 'Soul',
  genreSlug: 'soul',
  title: 'Free Soul Samples & Loops',
  subtitle: 'Vintage soul melodies • 70-110 BPM • Instant download',
  metaDescription: 'Download free soul melody samples and loops. Vintage keys, gospel chords, and warm melodies for soul music production. Royalty-free with commercial licenses.',
  bpmRanges: [
    { id: 'all', label: 'All BPMs', min: 0, max: 999 },
    { id: '70-80', label: '70-80 BPM', min: 70, max: 80 },
    { id: '80-90', label: '80-90 BPM', min: 80, max: 90 },
    { id: '90-110', label: '90-110 BPM', min: 90, max: 110 },
  ],
  commonTags: ['soul', 'melodic', 'mellow', 'smooth', 'soulful', 'hip-hop'],
  heroGradient: 'from-pink-900/20',
  icon: Heart,
  educationalContent: {
    essentialElements: {
      icon: Music,
      title: 'Essential Soul Melody Elements',
      items: [
        '• Warm vintage keyboard sounds',
        '• Gospel-inspired chord progressions',
        '• Smooth melodic basslines',
        '• Organic harmonic movements',
      ],
    },
    productionTips: {
      icon: Mic,
      title: 'Soul Melody Production Tips',
      items: [
        '• Use analog warmth and saturation',
        '• Layer multiple keyboard parts',
        '• Add subtle vintage character',
        '• Keep arrangements spacious and organic',
      ],
    },
    description: [
      'Soul melodies focus on creating warm, emotional soundscapes that touch the heart. Our free soul melody samples feature authentic vintage instruments and timeless harmonic progressions.',
      'When producing soul melodies, prioritize feel over technical perfection. Use warm analog sounds, gospel-inspired chord progressions, and leave space for the music to breathe naturally.',
    ],
  },
};

export default function SoulSamplesPage() {
  return <GenrePageTemplate config={soulConfig} initialSamples={[]} />;
}