'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import GenrePageTemplate, { GenrePageConfig } from '@/components/GenrePageTemplate';
import SampleSkeleton from '@/components/SampleSkeleton';
import { Sparkles, Headphones, Sliders } from 'lucide-react';
import { Sample } from '@/types';

const rnbConfig: GenrePageConfig = {
  genre: 'R&B',
  genreSlug: 'rnb',
  title: 'Free R&B Samples & Loops',
  subtitle: '80+ smooth R&B sounds • 60-100 BPM • Instant download',
  metaDescription: 'Download free R&B samples and loops. Smooth melodies, modern chords, and silky vocals for R&B music production. Royalty-free with commercial licenses.',
  bpmRanges: [
    { id: 'all', label: 'All BPMs', min: 0, max: 999 },
    { id: '60-70', label: '60-70 BPM', min: 60, max: 70 },
    { id: '70-80', label: '70-80 BPM', min: 70, max: 80 },
    { id: '80-100', label: '80-100 BPM', min: 80, max: 100 },
  ],
  commonTags: ['smooth', 'melodic', 'modern', 'chill', 'vocal', 'keys', 'guitar', 'synth'],
  heroGradient: 'from-purple-900/20',
  icon: Sparkles,
  educationalContent: {
    essentialElements: {
      icon: Headphones,
      title: 'Essential R&B Elements',
      items: [
        '• Smooth chord progressions (7ths, 9ths)',
        '• Silky lead melodies',
        '• Modern trap-influenced drums',
        '• Lush reverbs and delays',
      ],
    },
    productionTips: {
      icon: Sliders,
      title: 'R&B Production Tips',
      items: [
        '• Use stereo width on melodies',
        '• Apply gentle compression',
        '• Add subtle pitch modulation',
        '• Create space with reverb sends',
      ],
    },
    description: [
      'Modern R&B production blends traditional soul elements with contemporary production techniques. Our free R&B samples capture the essence of artists like The Weeknd, SZA, and Frank Ocean.',
      'When creating R&B beats, focus on creating a spacious mix with plenty of room for vocals. Use extended chords, smooth basslines, and modern drum patterns to create that signature R&B feel.',
    ],
  },
};

export default function RnBSamplesPage() {
  const [initialSamples, setInitialSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRnBSamples = async () => {
      try {
        const { data, error } = await supabase
          .from('samples')
          .select(`
            *,
            artist:artists(*)
          `)
          .eq('genre', 'rnb')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInitialSamples(data || []);
      } catch (error) {
        console.error('Error fetching R&B samples:', error);
        // Retry after delay
        setTimeout(fetchRnBSamples, 2000);
      } finally {
        setLoading(false);
      }
    };

    // Add small delay to ensure client is ready
    const timer = setTimeout(fetchRnBSamples, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SampleSkeleton />;
  }

  return <GenrePageTemplate config={rnbConfig} initialSamples={initialSamples} />;
}