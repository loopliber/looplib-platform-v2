'use client';

import GenrePageTemplate, { GenrePageConfig } from '@/components/GenrePageTemplate';
import { Zap, Target, Gauge } from 'lucide-react';

const trapConfig: GenrePageConfig = {
  genre: 'Trap',
  genreSlug: 'trap',
  title: 'Royalty Free Trap Samples & Loops',
  subtitle: 'Hard-hitting trap melodies • 130-160 BPM • Instant download',
  metaDescription: 'Download free trap melody samples and loops. Dark melodies, hard 808s, and modern trap sounds for hip-hop production. Royalty-free with commercial licenses.',
  bpmRanges: [
    { id: 'all', label: 'All BPMs', min: 0, max: 999 },
    { id: '130-140', label: '130-140 BPM', min: 130, max: 140 },
    { id: '140-150', label: '140-150 BPM', min: 140, max: 150 },
    { id: '150-160', label: '150-160 BPM', min: 150, max: 160 },
  ],
  commonTags: ['trap', 'dark', 'uptempo', 'drill', 'aggressive', 'melodic'],
  heroGradient: 'from-red-600/50 via-purple-800/40 to-red-950/50',
  icon: Zap,
  educationalContent: {
    essentialElements: {
      icon: Target,
      title: 'Essential Trap Melody Elements',
      items: [
        '• Dark atmospheric chord progressions',
        '• Haunting lead melodies and arpeggios',
        '• Minor scales and dissonant intervals',
        '• Ambient textures and pad sounds',
      ],
    },
    productionTips: {
      icon: Gauge,
      title: 'Trap Melody Production Tips',
      items: [
        '• Layer melodies with reverb and delay',
        '• Use minor scales for darker vibes',
        '• Add subtle pitch bends to leads',
        '• Create space with ambient textures',
      ],
    },
    description: [
      'Trap melodies are the soul of modern trap music, creating the dark atmospheric foundation that defines the genre. Our free trap melody samples capture the haunting, emotional essence that makes trap beats so captivating.',
      'When layering trap melodies, focus on creating contrast between bright leads and deep atmospheric pads. Use minor scales and experiment with dissonant intervals to achieve that signature dark trap sound.',
    ],
  },
};

export default function TrapSamplesPage() {
  return <GenrePageTemplate config={trapConfig} initialSamples={[]} />;
}