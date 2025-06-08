// components/OptimizedAudioPlayer.tsx
import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface OptimizedAudioPlayerProps {
  previewUrl: string;
  waveformData: number[];
  onPlayPause: () => void;
  isPlaying: boolean;
}

export default function OptimizedAudioPlayer({
  previewUrl,
  waveformData,
  onPlayPause,
  isPlaying
}: OptimizedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Aggressive preloading for instant playback
    audio.preload = 'auto';
    
    const updateProgress = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const updateBuffered = () => {
      if (audio.buffered.length > 0 && audio.duration) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        setBuffered(bufferedEnd / audio.duration);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('progress', updateBuffered);
    audio.addEventListener('loadeddata', updateBuffered);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('progress', updateBuffered);
      audio.removeEventListener('loadeddata', updateBuffered);
    };
  }, [previewUrl]);

  // Draw waveform with progress
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = 3;
    const barGap = 1;
    const barCount = waveformData.length;

    ctx.clearRect(0, 0, width, height);

    // Draw waveform
    for (let i = 0; i < barCount; i++) {
      const barHeight = waveformData[i] * height * 0.8;
      const x = (i / barCount) * width;
      const y = (height - barHeight) / 2;

      // Color based on progress and buffering
      if (i / barCount < progress) {
        ctx.fillStyle = '#f97316'; // Orange for played
      } else if (i / barCount < buffered) {
        ctx.fillStyle = '#525252'; // Gray for buffered
      } else {
        ctx.fillStyle = '#323232'; // Dark gray for unbuffered
      }

      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [waveformData, progress, buffered]);

  return (
    <div className="relative group">
      <audio 
        ref={audioRef} 
        src={previewUrl} 
        preload="auto"
        crossOrigin="anonymous"
      />
      
      <button
        onClick={onPlayPause}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      
      <div className="ml-14">
        <canvas
          ref={canvasRef}
          width={800}
          height={60}
          className="w-full h-[60px] cursor-pointer"
          onClick={(e) => {
            const rect = canvasRef.current!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const progress = x / rect.width;
            if (audioRef.current) {
              audioRef.current.currentTime = progress * audioRef.current.duration;
            }
          }}
        />
      </div>
    </div>
  );
}