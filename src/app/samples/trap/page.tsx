'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import GenrePageTemplate, { GenrePageConfig } from '@/components/GenrePageTemplate';
import SampleSkeleton from '@/components/SampleSkeleton';
import { Zap, Target, Gauge } from 'lucide-react';
import { Sample } from '@/types';

const trapConfig: GenrePageConfig = {
  genre: 'Trap',
  genreSlug: 'trap',
  title: 'Free Trap Samples & Loops',
  subtitle: 'Professional trap melodies • 140-170 BPM • Instant download',
  metaDescription: 'Download free trap melody samples and loops. Dark atmospheric melodies, haunting leads, and modern chord progressions for trap music production. Royalty-free with commercial licenses.',
  bpmRanges: [
    { id: 'all', label: 'All BPMs', min: 0, max: 999 },
    { id: '140-150', label: '140-150 BPM', min: 140, max: 150 },
    { id: '150-160', label: '150-160 BPM', min: 150, max: 160 },
    { id: '160-170', label: '160-170 BPM', min: 160, max: 170 },
  ],
  commonTags: ['melody', 'dark', 'atmospheric', 'lead', 'chord', 'synth', 'piano', 'ambient'],
  heroGradient: 'from-orange-900/20',
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
  const [initialSamples, setInitialSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Only fetch if we haven't already fetched
    if (hasFetched) return;

    const fetchTrapSamples = async () => {
      try {
        const { data, error } = await supabase
          .from('samples')
          .select(`
            *,
            artist:artists(*)
          `)
          .eq('genre', 'trap')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInitialSamples(data || []);
        setHasFetched(true); // Mark as fetched
      } catch (error) {
        console.error('Error fetching trap samples:', error);
        // Retry after delay only if we haven't fetched yet
        if (!hasFetched) {
          setTimeout(fetchTrapSamples, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    // Add small delay to ensure client is ready
    const timer = setTimeout(fetchTrapSamples, 100);
    return () => clearTimeout(timer);
  }, [hasFetched, supabase]);

  if (loading) {
    return <SampleSkeleton />;
  }

  return <GenrePageTemplate config={trapConfig} initialSamples={initialSamples} />;
}