// app/type/[style]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sample } from '@/types';
import { notFound } from 'next/navigation';
import GenrePageTemplate from '@/components/GenrePageTemplate';
import { Zap, Music, Headphones } from 'lucide-react';

// Configuration for different artist styles
const styleConfigs: Record<string, any> = {
  'travis-scott': {
    name: 'Travis Scott',
    description: 'Dark, atmospheric trap beats with psychedelic elements',
    keywords: ['dark', 'atmospheric', 'psychedelic', 'auto-tune', 'ambient'],
    relatedArtists: ['Don Toliver', 'Gunna', 'Young Thug'],
    bpmRange: { min: 130, max: 160 },
    popularKeys: ['F Minor', 'G Minor', 'A♭ Major'],
    soundCharacteristics: [
      'Heavy 808s with distortion',
      'Reversed vocals and atmospheric pads',
      'Psychedelic synth melodies',
      'Dark minor chord progressions'
    ],
    productionTips: [
      'Use heavy reverb on melodies',
      'Layer ambient textures',
      'Add vinyl crackle for atmosphere',
      'Pitch vocals down for effect'
    ]
  },
  'metro-boomin': {
    name: 'Metro Boomin',
    description: 'Dark trap beats with orchestral elements and haunting melodies',
    keywords: ['orchestral', 'dark', 'cinematic', 'horror', 'dramatic'],
    relatedArtists: ['21 Savage', 'Future', 'Southside'],
    bpmRange: { min: 120, max: 150 },
    popularKeys: ['C Minor', 'D Minor', 'E♭ Minor'],
    soundCharacteristics: [
      'Orchestral string arrangements',
      'Horror movie-inspired melodies',
      'Booming 808 patterns',
      'Cinematic sound design'
    ],
    productionTips: [
      'Layer orchestral VSTs',
      'Use half-time drum patterns',
      'Add subtle horror effects',
      'Create space with reverb'
    ]
  },
  'the-weeknd': {
    name: 'The Weeknd',
    description: 'Dark R&B with 80s synthwave influences and moody atmospheres',
    keywords: ['dark-rnb', 'synthwave', '80s', 'moody', 'atmospheric'],
    relatedArtists: ['Drake', 'Bryson Tiller', 'Frank Ocean'],
    bpmRange: { min: 80, max: 120 },
    popularKeys: ['A Minor', 'F Minor', 'C Minor'],
    soundCharacteristics: [
      '80s-inspired synth sounds',
      'Dark, moody chord progressions',
      'Analog warmth and saturation',
      'Atmospheric pad layers'
    ],
    productionTips: [
      'Use analog synth emulations',
      'Add tape saturation',
      'Layer multiple reverbs',
      'Sidechain compression on pads'
    ]
  },
  'drake': {
    name: 'Drake',
    description: 'Melodic trap and R&B fusion with emotional melodies',
    keywords: ['melodic', 'emotional', 'trap-soul', 'ambient', 'moody'],
    relatedArtists: ['PartyNextDoor', 'The Weeknd', '40'],
    bpmRange: { min: 70, max: 140 },
    popularKeys: ['B♭ Minor', 'E♭ Major', 'F Minor'],
    soundCharacteristics: [
      'Emotional piano melodies',
      'Ambient atmospheric textures',
      'Trap-influenced hi-hats',
      'Smooth R&B chord progressions'
    ],
    productionTips: [
      'Use ambient room reverbs',
      'Layer soft piano sounds',
      'Add subtle vocal chops',
      'Create bounce with swing'
    ]
  }
};

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { style: string } }) {
  const config = styleConfigs[params.style];
  
  if (!config) {
    return {
      title: 'Style Not Found | LoopLib',
      description: 'The requested style page could not be found.',
    };
  }

  return {
    title: `Free ${config.name} Type Samples & Loops | ${config.name} Style Beats | LoopLib`,
    description: `Download free ${config.name} type samples and loops. ${config.description}. High-quality sounds for ${config.name} style production. 100% royalty-free.`,
    keywords: `${config.name} type samples, ${config.name} type beats, ${config.name} samples free, ${config.name} loops, ${config.keywords.join(', ')}`,
    openGraph: {
      title: `Free ${config.name} Type Samples & Loops`,
      description: config.description,
      images: [`/og/${params.style}-samples.jpg`],
    }
  };
}

export default function StylePage({ params }: { params: { style: string } }) {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  const config = styleConfigs[params.style];
  
  if (!config) {
    notFound();
  }

  useEffect(() => {
    fetchStyleSamples();
  }, []);

  const fetchStyleSamples = async () => {
    try {
      // Fetch samples that match the style keywords
      const { data, error } = await supabase
        .from('samples')
        .select('*, artist:artists(*)')
        .or(config.keywords.map((k: string) => `tags.cs.{${k}}`).join(','))
        .gte('bpm', config.bpmRange.min)
        .lte('bpm', config.bpmRange.max)
        .limit(50);

      if (error) throw error;
      setSamples(data || []);
    } catch (error) {
      console.error('Error fetching samples:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-purple-900/20 to-black py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Free {config.name} Type Samples & Loops
            </h1>
            <p className="text-xl text-neutral-300 mb-8">
              {config.description}
            </p>
            
            {/* Quick Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">{samples.length}</p>
                <p className="text-sm text-neutral-400">Samples Available</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">{config.bpmRange.min}-{config.bpmRange.max}</p>
                <p className="text-sm text-neutral-400">BPM Range</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">100%</p>
                <p className="text-sm text-neutral-400">Royalty Free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-12 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Sound Characteristics */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Music className="w-6 h-6 mr-2 text-purple-400" />
                {config.name} Sound Characteristics
              </h2>
              <ul className="space-y-3">
                {config.soundCharacteristics.map((char: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span className="text-neutral-300">{char}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Production Tips */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Headphones className="w-6 h-6 mr-2 text-purple-400" />
                Production Tips for {config.name} Style
              </h2>
              <ul className="space-y-3">
                {config.productionTips.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span className="text-neutral-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Popular Keys & Related Artists */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-3">Popular Keys for {config.name} Beats</h3>
                <div className="flex flex-wrap gap-2">
                  {config.popularKeys.map((key: string) => (
                    <span key={key} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {key}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3">Similar Artists</h3>
                <div className="flex flex-wrap gap-2">
                  {config.relatedArtists.map((artist: string) => (
                    <a
                      key={artist}
                      href={`/type/${artist.toLowerCase().replace(' ', '-')}`}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-full text-sm transition-colors"
                    >
                      {artist}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Long-form SEO Content */}
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4">
              How to Make {config.name} Type Beats: Complete Guide
            </h2>
            <p className="text-neutral-300 mb-4">
              Creating {config.name} type beats requires understanding the unique sonic signature that defines their sound. 
              Our collection of free {config.name} type samples provides you with the exact sounds used in their biggest hits.
            </p>
            
            <h3 className="text-xl font-bold mb-3 mt-8">Essential Elements of {config.name} Production</h3>
            <p className="text-neutral-300 mb-4">
              {config.name}'s production style has influenced countless producers worldwide. The key to capturing this sound 
              lies in the combination of {config.keywords.slice(0, 3).join(', ')} elements that create their signature atmosphere.
            </p>

            <h3 className="text-xl font-bold mb-3 mt-8">Best DAWs and Plugins for {config.name} Beats</h3>
            <p className="text-neutral-300 mb-4">
              While any DAW can create {config.name} style beats, producers often use FL Studio, Ableton Live, or Logic Pro. 
              Essential plugins include analog emulations for warmth, spatial effects for atmosphere, and creative processing tools
              for that distinctive {config.keywords[0]} sound.
            </p>

            <h3 className="text-xl font-bold mb-3 mt-8">Mixing {config.name} Type Beats</h3>
            <p className="text-neutral-300 mb-4">
              The mixing process for {config.name} style production emphasizes {config.soundCharacteristics[0].toLowerCase()}. 
              Pay special attention to the low-end frequencies between {config.bpmRange.min}-{config.bpmRange.max} BPM, ensuring 
              your 808s and kicks work together harmoniously.
            </p>
          </div>
        </div>
      </section>

      {/* Samples Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">
            {config.name} Type Samples ({samples.length} Available)
          </h2>
          
          {/* Use your existing sample grid component here */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-neutral-400">Loading {config.name} samples...</p>
            </div>
          ) : samples.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Render samples using your existing sample card component */}
              <p className="text-neutral-400">Sample grid would go here</p>
            </div>
          ) : (
            <p className="text-center text-neutral-400 py-20">
              No samples found for this style. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* Related Searches */}
      <section className="py-12 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-xl font-bold mb-6">Related Searches</h3>
          <div className="flex flex-wrap gap-3">
            {[
              `${config.name} drum kit`,
              `${config.name} melody loops`,
              `${config.name} 808 samples`,
              `${config.name} vocal samples`,
              `free ${config.name} sounds`,
              `${config.name} type beat tutorial`
            ].map((term) => (
              <a
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
              >
                {term}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}