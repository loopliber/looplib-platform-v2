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
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

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
          responsive: true,
          normalize: true,
        });

        wavesurferRef.current = wavesurfer;

        wavesurfer.on('ready', () => {
          setLoading(false);
          setDuration(wavesurfer.getDuration());
        });

        wavesurfer.on('audioprocess', () => {
          setCurrentTime(wavesurfer.getCurrentTime());
        });

        wavesurfer.on('seek', () => {
          setCurrentTime(wavesurfer.getCurrentTime());
        });

        wavesurfer.on('finish', () => {
          onPlayPause(); // Stop playing when finished
        });

        wavesurfer.on('error', (error: any) => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

        {/* Time display */}
        {!loading && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs text-neutral-400 bg-black/50 px-2 py-1 rounded">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        )}
      </div>
    </div>
  );
}