// components/SampleCardWithArtwork.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Sample } from '@/types';
import { Play, Pause, Download, Heart, Music } from 'lucide-react';
import dynamic from 'next/dynamic';

const WaveformPlayer = dynamic(() => import('./WaveformPlayer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-12 bg-neutral-800 rounded animate-pulse" />
  )
});

interface SampleWithArtwork extends Sample {
  artwork_url?: string;
  pack_name?: string;
  pack_slug?: string;
}

interface SampleCardProps {
  sample: SampleWithArtwork;
  isPlaying: boolean;
  isLiked: boolean;
  isDownloading: boolean;
  onPlayPause: () => void;
  onLike: () => void;
  onDownload: () => void;
  onLicense: () => void;
  variant?: 'default' | 'compact' | 'grid';
}

export default function SampleCardWithArtwork({
  sample,
  isPlaying,
  isLiked,
  isDownloading,
  onPlayPause,
  onLike,
  onDownload,
  onLicense,
  variant = 'default'
}: SampleCardProps) {
  
  if (variant === 'grid') {
    // Grid variant with prominent artwork (like WAVS)
    return (
      <div className="group bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden hover:bg-neutral-900/70 hover:border-neutral-700 transition-all">
        {/* Artwork */}
        <div className="relative aspect-square bg-neutral-800">
          {sample.artwork_url ? (
            <Image
              src={sample.artwork_url}
              alt={sample.pack_name || sample.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-12 h-12 text-neutral-600" />
            </div>
          )}
          
          {/* Play button overlay */}
          <button
            onClick={onPlayPause}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-6 h-6 text-black" />
              ) : (
                <Play className="w-6 h-6 text-black ml-1" />
              )}
            </div>
          </button>
          
          {/* Like button */}
          <button
            onClick={onLike}
            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        </div>
        
        {/* Sample info */}
        <div className="p-4">
          <h3 className="font-medium text-white text-sm mb-1 truncate">{sample.name}</h3>
          <p className="text-xs text-neutral-400 mb-2 truncate">
            {sample.artist?.name || 'LoopLib'} • {sample.bpm} BPM • {sample.key}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {sample.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-neutral-800 text-xs rounded text-neutral-400">
                {tag}
              </span>
            ))}
            {sample.has_stems && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded font-medium">
                STEMS
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="flex-1 px-3 py-1.5 bg-neutral-800 text-white hover:bg-neutral-700 rounded text-xs transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Free'
              )}
            </button>
            <button
              onClick={onLicense}
              className="flex-1 px-3 py-1.5 bg-orange-500 text-white hover:bg-orange-600 rounded text-xs transition-colors"
            >
              License
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Default horizontal variant with small artwork
  return (
    <div className="group bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-900/70 hover:border-neutral-700 transition-all">
      <div className="flex items-center gap-4">
        {/* Small artwork */}
        <div className="relative w-16 h-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
          {sample.artwork_url ? (
            <Image
              src={sample.artwork_url}
              alt={sample.pack_name || sample.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-6 h-6 text-neutral-600" />
            </div>
          )}
        </div>
        
        {/* Sample details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-medium text-white text-sm truncate">{sample.name}</h3>
              <p className="text-xs text-neutral-400">
                {sample.artist?.name || 'LoopLib'} • {sample.bpm} BPM • {sample.key}
              </p>
            </div>
            <button
              onClick={onLike}
              className={`p-2 rounded-md transition-colors ${
                isLiked
                  ? 'bg-red-500/20 text-red-500' 
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          {/* Waveform */}
          <div className="mb-3">
            <WaveformPlayer
              url={sample.file_url}
              isPlaying={isPlaying}
              onPlayPause={onPlayPause}
              height={48}
              waveColor="#525252"
              progressColor="#f97316"
            />
          </div>
          
          {/* Tags and actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {sample.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-1 bg-neutral-800 text-xs rounded text-neutral-400">
                  {tag}
                </span>
              ))}
              {sample.has_stems && (
                <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded font-medium">
                  STEMS
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onDownload}
                disabled={isDownloading}
                className="px-3 py-1.5 bg-neutral-800 text-white hover:bg-neutral-700 rounded-md text-xs transition-colors disabled:opacity-50"
              >
                {isDownloading ? (
                  <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Free'
                )}
              </button>
              <button
              onClick={onLicense}
              className="flex-1 px-3 py-1.5 bg-orange-500 text-white hover:bg-orange-600 rounded text-xs transition-colors"
            >
              Terms
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}