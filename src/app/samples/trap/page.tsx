'use client';

import GenrePageTemplate, { GenrePageConfig } from '@/components/GenrePageTemplate';
import { Zap, Target, Gauge } from 'lucide-react';

const trapConfig: GenrePageConfig = {
  genre: 'Trap',
  genreSlug: 'trap',
  title: 'Free Trap Samples & Loops',
  subtitle: '89+ professional trap sounds • 140-170 BPM • Instant download',
  metaDescription: 'Download free trap samples and loops. Hard-hitting 808s, hi-hats, and dark melodies for trap music production. Royalty-free with commercial licenses.',
  bpmRanges: [
    { id: 'all', label: 'All BPMs', min: 0, max: 999 },
    { id: '140-150', label: '140-150 BPM', min: 140, max: 150 },
    { id: '150-160', label: '150-160 BPM', min: 150, max: 160 },
    { id: '160-170', label: '160-170 BPM', min: 160, max: 170 },
  ],
  commonTags: ['808', 'hi-hat', 'dark', 'hard', 'melodic', 'drill', 'rage', 'ambient'],
  heroGradient: 'from-orange-900/20',
  icon: Zap,
  educationalContent: {
    essentialElements: {
      icon: Target,
      title: 'Essential Trap Elements',
      items: [
        '• Heavy 808 bass lines (20-60 Hz)',
        '• Rapid hi-hat patterns and rolls',
        '• Dark atmospheric melodies',
        '• Punchy snare on 3rd beat',
      ],
    },
    productionTips: {
      icon: Gauge,
      title: 'Trap Production Tips',
      items: [
        '• Layer multiple hi-hat patterns',
        '• Use sidechain compression on 808s',
        '• Add reverb to melodic elements',
        '• Keep kick patterns simple but hard',
      ],
    },
    description: [
      'Trap music production has evolved significantly since its origins in the Southern United States. Our free trap samples are designed to give you the authentic sound that defines modern trap music.',
      'When producing trap beats, the key is finding the right balance between hard-hitting drums and atmospheric melodies. Start with a solid 808 pattern as your foundation.',
    ],
  },
};

export default function TrapSamplesPage() {
  return <GenrePageTemplate config={trapConfig} />;
}