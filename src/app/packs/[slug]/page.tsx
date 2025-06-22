// src/app/packs/[slug]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Pack, Sample } from '@/types';
import { Download, Play, Pause, Heart, Music, Calendar, User, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { downloadSample } from '@/lib/download-utils';

const WaveformPlayer = dynamic(() => import('@/components/WaveformPlayer'), { 
  ssr: false 
});

export default function PackPage({ params }: { params: { slug: string } }) {
  const [pack, setPack] = useState<Pack | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Pagination state
  const [displayedSampleCount, setDisplayedSampleCount] = useState(10);
  const SAMPLES_PER_PAGE = 10;
  
  const supabase = createClient();

  useEffect(() => {
    fetchPackData();
  }, [params.slug]);

  const fetchPackData = async () => {
    try {
      // Fetch pack details
      const { data: packData, error: packError } = await supabase
        .from('packs')
        .select(`
          *,
          artist:artists(*)
        `)
        .eq('slug', params.slug)
        .single();

      if (packError || !packData) {
        notFound();
        return;
      }

      setPack(packData);

      // Fetch pack samples
      const { data: packSamples, error: samplesError } = await supabase
        .from('pack_samples')
        .select(`
          position,
          samples(
            *,
            artist:artists(*)
          )
        `)
        .eq('pack_id', packData.id)
        .order('position', { ascending: true });

      if (samplesError) throw samplesError;

      // Fix: Add proper type annotation for the filter parameter
      const orderedSamples = packSamples
        ?.map((ps: { position: number; samples: Sample | null }) => ps.samples)
        .filter((sample: Sample | null): sample is Sample => sample !== null) || [];

      setSamples(orderedSamples);
    } catch (error) {
      console.error('Error fetching pack:', error);
      toast.error('Failed to load pack');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = async (sample: Sample) => {
    setDownloadingId(sample.id);
    try {
      await downloadSample(sample, pack?.genre);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  // Get displayed samples
  const displayedSamples = samples.slice(0, displayedSampleCount);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!pack) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Pack Header */}
      <section className="relative">
        <div className="absolute inset-0 h-96 overflow-hidden">
          <Image
            src={pack.cover_art_url}
            alt={pack.name}
            fill
            className="object-cover opacity-30 blur-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cover Art */}
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
                {pack.cover_art_url ? (
                  <div className="relative">
                    <img
                      src={pack.cover_art_url}
                      alt={pack.name}
                      className="w-full max-w-sm rounded-lg shadow-2xl"
                      onError={(e) => {
                        console.log('Image failed to load:', pack.cover_art_url);
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fallback && fallback.style) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <Music className="w-16 h-16 text-neutral-600" />
                    <div className="absolute bottom-2 text-white text-xs">No cover art URL</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Pack Info */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">{pack.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-neutral-400 mb-6">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {pack.artist?.name || 'Various Artists'}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(pack.release_date).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Music className="w-4 h-4 mr-2" />
                  {samples.length} Samples
                </span>
                {pack.genre && (
                  <span className="px-3 py-1 bg-neutral-800 rounded-full text-sm">
                    {pack.genre}
                  </span>
                )}
              </div>
              
              {pack.description && (
                <p className="text-neutral-300 mb-6">{pack.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Samples List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Samples in this Pack</h2>
          <span className="text-neutral-400">
            Showing {displayedSamples.length} of {samples.length} samples
          </span>
        </div>
        
        <div className="space-y-4">
          {displayedSamples.map((sample, index) => (
            <div 
              key={sample.id} 
              className="group bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-900/70 hover:border-neutral-700 transition-all"
            >
              {/* Add artwork section like homepage */}
              <div className="flex gap-3 mb-3">
                {/* Track Number */}
                <div className="flex-shrink-0 w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-xs font-medium text-neutral-400">
                  {index + 1}
                </div>

                {/* Album artwork */}
                <div className="flex-shrink-0">
                  {pack.cover_art_url ? (
                    <img 
                      src={pack.cover_art_url} 
                      alt={pack.name}
                      className="w-16 h-16 rounded-lg object-cover bg-neutral-800"
                      onError={(e) => {
                        console.log('Image failed to load:', pack.cover_art_url);
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fallback && fallback.style) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                      <Music className="w-6 h-6 text-neutral-500" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header with BPM, Key and Like button */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-neutral-400">{sample.bpm} BPM</span>
                      <span className="text-sm text-neutral-500">•</span>
                      <span className="text-sm text-neutral-400">{sample.key}</span>
                      {sample.has_stems && (
                        <>
                          <span className="text-sm text-neutral-500">•</span>
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded">
                            STEMS
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => {/* Add like functionality if needed */}}
                      className="p-2 rounded-md transition-colors bg-neutral-800 text-neutral-400 hover:text-white"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Title and artist */}
                  <h3 className="font-medium text-white text-base mb-1 truncate">{sample.name}</h3>
                  <p className="text-sm text-neutral-400 mb-3 truncate">{sample.artist?.name || 'LoopLib'}</p>
                </div>
              </div>
              
              {/* Waveform - moved outside the flex container */}
              <div className="mb-4 h-16">
                <WaveformPlayer
                  url={sample.file_url}
                  isPlaying={playingId === sample.id}
                  onPlayPause={() => setPlayingId(playingId === sample.id ? null : sample.id)}
                  height={64}
                  waveColor="#666666"
                  progressColor="#f97316"
                />
              </div>
              
              {/* Tags and Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                <div className="flex flex-wrap gap-1">
                  {sample.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-neutral-800 text-xs rounded text-neutral-400">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadSample(sample)}
                    disabled={downloadingId === sample.id}
                    className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 rounded-md transition-colors flex items-center justify-center space-x-1 text-sm disabled:opacity-50 font-medium"
                  >
                    {downloadingId === sample.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Free Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {displayedSampleCount < samples.length && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setDisplayedSampleCount(prev => prev + SAMPLES_PER_PAGE)}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
            >
              Load More Samples ({samples.length - displayedSampleCount} remaining)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}