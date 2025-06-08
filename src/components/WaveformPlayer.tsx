// components/WaveformPlayer.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface WaveformPlayerProps {
  url: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  backgroundColor?: string;
}

export default function WaveformPlayer({
  url,
  isPlaying,
  onPlayPause,
  height = 60,
  waveColor = '#666666',
  progressColor = '#f97316',
  backgroundColor = 'transparent'
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initWaveSurfer = async () => {
      if (!containerRef.current || !url) return;

      try {
        const WaveSurfer = (await import('wavesurfer.js')).default;

        // Clean up existing instance
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }

        // Create new instance
        const wavesurfer = WaveSurfer.create({
          container: containerRef.current,
          waveColor,
          progressColor,
          height,
          barWidth: 2,
          barGap: 1,
          normalize: true,
        });

        wavesurferRef.current = wavesurfer;

        wavesurfer.on('ready', () => {
          setLoading(false);
        });

        wavesurfer.on('finish', () => {
          onPlayPause(); // Stop playing when finished
        });

        // Fix: Change error handler to accept Error object
        wavesurfer.on('error', (error: Error) => {
          console.error('WaveSurfer error:', error);
          setLoading(false);
        });

        await wavesurfer.load(url);

      } catch (error) {
        console.error('Error initializing WaveSurfer:', error);
        setLoading(false);
      }
    };

    initWaveSurfer();

    // Cleanup function
    return () => {
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
          wavesurferRef.current = null;
        } catch (error) {
          console.error('Error destroying WaveSurfer:', error);
        }
      }
    };
  }, [url, waveColor, progressColor, backgroundColor, height]);

  // Handle play/pause from parent
  useEffect(() => {
    if (!wavesurferRef.current || loading) return;

    try {
      if (isPlaying) {
        wavesurferRef.current.play();
      } else {
        wavesurferRef.current.pause();
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
    }
  }, [isPlaying, loading]);

  const handlePlayPause = () => {
    if (!wavesurferRef.current || loading) return;
    onPlayPause();
  };

  return (
    <div className="relative w-full group">
      {/* Play/Pause Button */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={handlePlayPause}
          disabled={loading}
          className="w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 text-white ml-0.5" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>
      </div>

      {/* Waveform Container */}
      <div className="ml-14 relative">
        <div 
          ref={containerRef} 
          className="w-full cursor-pointer"
          style={{ 
            backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined, 
            minHeight: height 
          }}
        />
        
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-800/50 rounded">
            <span className="text-xs text-neutral-400">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}