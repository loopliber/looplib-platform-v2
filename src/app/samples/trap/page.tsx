'use client';

import { useEffect } from 'react';
import GenrePageTemplate, { GenrePageConfig } from '@/components/GenrePageTemplate';
import SampleBrowser from '@/components/SampleBrowser';
import { Heart, Music, Mic } from 'lucide-react';

const soulConfig: GenrePageConfig = {
  genre: 'Trap',
  genreSlug: 'trap',
  title: 'Free Trap Samples & Loops',
  subtitle: '70+ vintage soul sounds • 70-110 BPM • Instant download',
  metaDescription: 'Download free trap samples and loops. Dark keys, gospel chords, and warm basslines for soul music production. Royalty-free with commercial licenses.',
  bpmRanges: [
    { id: 'all', label: 'All BPMs', min: 0, max: 999 },
    { id: '70-80', label: '70-80 BPM', min: 70, max: 80 },
    { id: '80-90', label: '80-90 BPM', min: 80, max: 90 },
    { id: '90-110', label: '90-110 BPM', min: 90, max: 110 },
  ],
  commonTags: ['vintage', 'gospel', 'warm', 'classic', 'piano', 'strings', 'brass', 'choir'],
  heroGradient: 'from-pink-900/20',
  icon: Heart,
  educationalContent: {
    essentialElements: {
      icon: Music,
      title: 'Essential Soul Elements',
      items: [
        '• Warm analog basslines',
        '• Gospel-inspired chord progressions',
        '• Live drum grooves with swing',
        '• Vintage keyboard sounds (Rhodes, Wurlitzer)',
      ],
    },
    productionTips: {
      icon: Mic,
      title: 'Soul Production Tips',
      items: [
        '• Add tape saturation for warmth',
        '• Use vintage compressor emulations',
        '• Layer strings for richness',
        '• Keep the mix warm and mid-focused',
      ],
    },
    description: [
      'Soul music production is all about capturing emotion and warmth. Our free soul samples are inspired by the golden era of Motown, Stax, and Philadelphia soul, featuring authentic vintage sounds.',
      'When producing soul beats, focus on creating a warm, inviting mix with plenty of mid-range frequencies. Start with a solid drum groove that has a human feel, then layer in basslines that complement the rhythm section.',
    ],
  },
};

export default function TrapSamplesPage() {
  // Force re-render when component mounts
  useEffect(() => {
    // This ensures the component re-initializes when navigating
  }, []);

  return (
    <SampleBrowser 
      key="trap" // Add this key to force re-render
      initialGenre="trap"
      pageTitle="Royalty-Free Trap Loops"
      pageSubtitle="Free Download on All Samples and Loops"
      accentColor="orange"
    />
  );
}