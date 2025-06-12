// components/SampleGridView.tsx
'use client';

import React, { useState } from 'react';
import { Sample } from '@/types';
import SampleCardWithArtwork from './SampleCardWithArtwork';
import { Grid3x3, List, Loader2 } from 'lucide-react';

interface SampleWithArtwork extends Sample {
  artwork_url?: string;
  pack_name?: string;
  pack_slug?: string;
}

interface SampleGridViewProps {
  samples: SampleWithArtwork[];
  likedSamples: Set<string>;
  playingId: string | null;
  downloadingId: string | null;
  onPlayPause: (sampleId: string) => void;
  onLike: (sampleId: string) => void;
  onDownload: (sample: Sample) => void;
  onLicense: (sample: Sample) => void;
  loading?: boolean;
}

export default function SampleGridView({
  samples,
  likedSamples,
  playingId,
  downloadingId,
  onPlayPause,
  onLike,
  onDownload,
  onLicense,
  loading = false
}: SampleGridViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div>
      {/* View mode toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {samples.length} Samples Found
        </h2>
        <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center space-x-2 ${
              viewMode === 'list' 
                ? 'bg-orange-500 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="text-sm">List</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center space-x-2 ${
              viewMode === 'grid' 
                ? 'bg-orange-500 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            <span className="text-sm">Grid</span>
          </button>
        </div>
      </div>

      {/* Samples display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {samples.map((sample) => (
            <SampleCardWithArtwork
              key={sample.id}
              sample={sample}
              isPlaying={playingId === sample.id}
              isLiked={likedSamples.has(sample.id)}
              isDownloading={downloadingId === sample.id}
              onPlayPause={() => onPlayPause(sample.id)}
              onLike={() => onLike(sample.id)}
              onDownload={() => onDownload(sample)}
              onLicense={() => onLicense(sample)}
              variant="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {samples.map((sample) => (
            <SampleCardWithArtwork
              key={sample.id}
              sample={sample}
              isPlaying={playingId === sample.id}
              isLiked={likedSamples.has(sample.id)}
              isDownloading={downloadingId === sample.id}
              onPlayPause={() => onPlayPause(sample.id)}
              onLike={() => onLike(sample.id)}
              onDownload={() => onDownload(sample)}
              onLicense={() => onLicense(sample)}
              variant="default"
            />
          ))}
        </div>
      )}
    </div>
  );
}