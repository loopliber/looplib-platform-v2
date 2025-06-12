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
  const [downloadingAll, setDownloadingAll] = useState(false);
  
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

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    try {
      // Download samples sequentially with delay
      for (let i = 0; i < samples.length; i++) {
        await downloadSample(samples[i], pack?.genre);
        // Add delay between downloads
        if (i < samples.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      toast.success(`Downloaded all ${samples.length} samples!`);
    } catch (error) {
      toast.error('Some downloads failed');
    } finally {
      setDownloadingAll(false);
    }
  };

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
                  <>
                    <Image
                      src={pack.cover_art_url}
                      alt={pack.name}
                      fill
                      className="object-cover"
                      priority
                      onError={(e) => {
                        console.error('Cover art failed to load:', pack.cover_art_url);
                        console.error('Error:', e);
                      }}
                      onLoad={() => {
                        console.log('Cover art loaded successfully:', pack.cover_art_url);
                      }}
                    />
                    {/* Debug info - remove after testing */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-2 truncate">
                      {pack.cover_art_url}
                    </div>
                  </>
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
              
              {/* Download All Button */}
              <button
                onClick={handleDownloadAll}
                disabled={downloadingAll}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                {downloadingAll ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download All Samples</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Samples List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">Samples in this Pack</h2>
        
        <div className="space-y-4">
          {samples.map((sample, index) => (
            <div
              key={sample.id}
              className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-900/70 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Track Number */}
                <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                
                {/* Sample Info */}
                <div className="flex-1">
                  <h3 className="font-medium text-white">{sample.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-neutral-400 mt-1">
                    <span>{sample.bpm} BPM</span>
                    <span>{sample.key}</span>
                    {sample.has_stems && (
                      <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded">
                        STEMS
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Waveform */}
                <div className="flex-1 max-w-md">
                  <WaveformPlayer
                    url={sample.file_url}
                    isPlaying={playingId === sample.id}
                    onPlayPause={() => setPlayingId(playingId === sample.id ? null : sample.id)}
                    height={40}
                    waveColor="#525252"
                    progressColor="#f97316"
                  />
                </div>
                
                {/* Download Button */}
                <button
                  onClick={() => handleDownloadSample(sample)}
                  disabled={downloadingId === sample.id}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {downloadingId === sample.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}